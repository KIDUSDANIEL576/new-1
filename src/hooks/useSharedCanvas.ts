import type { RealtimeChannel } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { coupleChannel, TABLES } from '@/lib/backend';
import { isTierError } from '@/lib/entitlements';
import { supabase } from '@/lib/supabase';
import { buzzPartner, notifyPartner, type BuzzResult } from '@/lib/notifications';
import { renderSnapshot } from '@/lib/widget';
import type {
  Brush,
  Point,
  PresenceState,
  Stroke,
  StrokeEndPayload,
  StrokePointsPayload,
  StrokeStartPayload,
  StrokeUndoPayload,
} from '@/types';

const POINT_BATCH_MS = 50; // spec: batch in-flight points every ~50ms
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;

export type ConnectionState = 'connecting' | 'live' | 'reconnecting';

interface Args {
  coupleId: string;
  canvasId: string;
  userId: string;
  displayName: string;
  /**
   * The DB owns the tiers. If it rejects a stroke (this build's idea of the
   * couple's entitlement was stale), the stroke is taken back off the canvas
   * and this fires — rather than showing ink the partner will never receive.
   */
  onTierRejected?: () => void;
  /** The partner pressed Ring while this app is open. */
  onBuzz?: () => void;
}

/**
 * Owns everything on the shared canvas:
 * - rehydration from the strokes table on mount AND on every reconnect
 *   (missed broadcasts are recovered from persistence)
 * - Broadcast (not postgres_changes) for in-flight strokes: start/points/end
 * - Presence → partner online + "…is drawing" pill
 * - auto-reconnect with exponential backoff; refetch on app foreground
 * - persistence on stroke end, daily mark, throttled partner push
 * - undo-own-stroke and clear, mirrored to the partner via broadcast
 */
export function useSharedCanvas({
  coupleId,
  canvasId,
  userId,
  displayName,
  onTierRejected,
  onBuzz,
}: Args) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [liveStrokes, setLiveStrokes] = useState<Record<string, Stroke>>({});
  const [partnerDrawing, setPartnerDrawing] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>('connecting');

  const channelRef = useRef<RealtimeChannel | null>(null);
  // held in a ref so the channel subscription (built once) always reaches the
  // current handler without tearing down and resubscribing
  const onBuzzRef = useRef(onBuzz);
  onBuzzRef.current = onBuzz;
  const currentStrokeRef = useRef<Stroke | null>(null);
  const pendingPointsRef = useRef<Point[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const send = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  const trackPresence = useCallback(
    (drawing: boolean) => {
      const state: PresenceState = { userId, name: displayName, drawing };
      channelRef.current?.track(state);
    },
    [userId, displayName]
  );

  /** Loads persisted strokes, keeping any local strokes that never persisted. */
  const refetchStrokes = useCallback(async () => {
    const { data, error } = await supabase
      .from(TABLES.strokes)
      .select('id, author_id, brush, color, width, points, created_at')
      .eq('canvas_id', canvasId)
      .order('id', { ascending: true });
    if (error || !data) return;
    const fromDb: Stroke[] = data.map((row) => ({
      id: `db-${row.id}`,
      dbId: row.id,
      authorId: row.author_id,
      brush: row.brush as Brush,
      color: row.color,
      width: row.width,
      points: row.points as Point[],
      createdAt: row.created_at as string,
    }));
    setStrokes((prev) => {
      const unpersisted = prev.filter((s) => s.dbId == null);
      return [...fromDb, ...unpersisted];
    });
  }, [canvasId]);

  // ---- realtime subscription with auto-reconnect ----
  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function connect() {
      if (disposed) return;

      // Private channels are authorized against the caller's JWT — make sure
      // the realtime socket has it before subscribing.
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      } catch {
        // subscribe below will surface any real connectivity problem
      }
      if (disposed) return;

      const channel = supabase.channel(coupleChannel(coupleId), {
        config: { private: true, broadcast: { self: false } },
      });

      channel
        .on('broadcast', { event: 'stroke:start' }, ({ payload }) => {
          const p = payload as StrokeStartPayload;
          setLiveStrokes((prev) => ({
            ...prev,
            [p.strokeId]: {
              id: p.strokeId,
              authorId: p.authorId,
              brush: p.brush,
              color: p.color,
              width: p.width,
              points: [],
            },
          }));
        })
        .on('broadcast', { event: 'stroke:points' }, ({ payload }) => {
          const p = payload as StrokePointsPayload;
          setLiveStrokes((prev) => {
            const s = prev[p.strokeId];
            if (!s) return prev;
            return { ...prev, [p.strokeId]: { ...s, points: [...s.points, ...p.pts] } };
          });
        })
        .on('broadcast', { event: 'stroke:end' }, ({ payload }) => {
          const p = payload as StrokeEndPayload;
          setLiveStrokes((prev) => {
            const s = prev[p.strokeId];
            if (!s) return prev;
            const { [p.strokeId]: _done, ...rest } = prev;
            setStrokes((list) => [...list, { ...s, dbId: p.dbId ?? undefined }]);
            return rest;
          });
          // feel the partner's stroke land
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        })
        .on('broadcast', { event: 'stroke:undo' }, ({ payload }) => {
          const p = payload as StrokeUndoPayload;
          setStrokes((list) =>
            list.filter((s) => s.id !== p.strokeId && (p.dbId == null || s.dbId !== p.dbId))
          );
        })
        .on('broadcast', { event: 'canvas:clear' }, () => {
          setStrokes([]);
          setLiveStrokes({});
        })
        // The app is open, so no push notification will fire — ring it here.
        // This is also the fast path: same sub-300ms window as strokes.
        .on('broadcast', { event: 'buzz' }, () => {
          onBuzzRef.current?.();
        })
        .on('presence', { event: 'sync' }, () => {
          const entries = Object.values(channel.presenceState<PresenceState>()).flat();
          const partner = entries.find((s) => s.userId !== userId);
          setPartnerOnline(partner ? partner.name : null);
          setPartnerDrawing(partner && partner.drawing ? partner.name : null);
        })
        .subscribe((status) => {
          if (disposed) return;
          if (status === 'SUBSCRIBED') {
            attempt = 0;
            setConnection('live');
            channel.track({ userId, name: displayName, drawing: false } satisfies PresenceState);
            // recover anything broadcast while we were away
            refetchStrokes();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnection('reconnecting');
            setPartnerOnline(null);
            setPartnerDrawing(null);
            supabase.removeChannel(channel);
            if (channelRef.current === channel) channelRef.current = null;
            const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
            attempt += 1;
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(connect, delay);
          }
        });

      channelRef.current = channel;
    }

    connect();

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') refetchStrokes();
    });

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      appState.remove();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [coupleId, canvasId, userId, displayName, refetchStrokes]);

  // ---- local drawing ----
  const beginStroke = useCallback(
    (brush: Brush, color: string, width: number): string => {
      const strokeId = Crypto.randomUUID();
      const stroke: Stroke = { id: strokeId, authorId: userId, brush, color, width, points: [] };
      currentStrokeRef.current = stroke;
      pendingPointsRef.current = [];
      setLiveStrokes((prev) => ({ ...prev, [strokeId]: stroke }));
      send('stroke:start', {
        strokeId,
        authorId: userId,
        brush,
        color,
        width,
      } satisfies StrokeStartPayload);
      trackPresence(true);

      flushTimerRef.current = setInterval(() => {
        const pts = pendingPointsRef.current;
        if (!pts.length) return;
        pendingPointsRef.current = [];
        send('stroke:points', { strokeId, pts } satisfies StrokePointsPayload);
      }, POINT_BATCH_MS);

      return strokeId;
    },
    [send, trackPresence, userId]
  );

  const addPoint = useCallback((strokeId: string, pt: Point) => {
    pendingPointsRef.current.push(pt);
    const cur = currentStrokeRef.current;
    if (cur && cur.id === strokeId) cur.points.push(pt);
    setLiveStrokes((prev) => {
      const s = prev[strokeId];
      if (!s) return prev;
      return { ...prev, [strokeId]: { ...s, points: [...s.points] } };
    });
  }, []);

  const endStroke = useCallback(
    async (strokeId: string) => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      // flush any tail points before ending
      const tail = pendingPointsRef.current;
      pendingPointsRef.current = [];
      if (tail.length) send('stroke:points', { strokeId, pts: tail } satisfies StrokePointsPayload);
      trackPresence(false);

      const finished = currentStrokeRef.current;
      currentStrokeRef.current = null;
      if (!finished || finished.id !== strokeId || finished.points.length < 2) {
        setLiveStrokes((prev) => {
          const { [strokeId]: _drop, ...rest } = prev;
          return rest;
        });
        send('stroke:end', { strokeId, dbId: null } satisfies StrokeEndPayload);
        return;
      }

      // persist, then broadcast end with the row id so both sides can undo it later
      let dbId: number | null = null;
      let tierRejected = false;
      try {
        const { data, error } = await supabase
          .from(TABLES.strokes)
          .insert({
            canvas_id: canvasId,
            author_id: userId,
            brush: finished.brush,
            color: finished.color,
            width: finished.width,
            points: finished.points,
          })
          .select('id')
          .single();
        dbId = data?.id ?? null;
        tierRejected = isTierError(error?.message);
      } catch {
        // keep the stroke locally even if persistence failed
      }

      setLiveStrokes((prev) => {
        const { [strokeId]: _done, ...rest } = prev;
        return rest;
      });

      if (tierRejected) {
        // drop it rather than leaving ink that will never sync
        send('stroke:end', { strokeId, dbId: null } satisfies StrokeEndPayload);
        send('canvas:reload', {});
        onTierRejected?.();
        return;
      }

      send('stroke:end', { strokeId, dbId } satisfies StrokeEndPayload);
      setStrokes((list) => [...list, { ...finished!, dbId: dbId ?? undefined }]);

      // streak mark + throttled partner push (both best-effort)
      const today = new Date().toISOString().slice(0, 10);
      supabase
        .from(TABLES.dailyMarks)
        .upsert(
          { couple_id: coupleId, day: today, user_id: userId },
          { onConflict: 'couple_id,day,user_id', ignoreDuplicates: true }
        )
        .then(() => {});
      notifyPartner(coupleId);
      renderSnapshot(coupleId);
    },
    [canvasId, coupleId, send, trackPresence, userId, onTierRejected]
  );

  // ---- undo own last stroke ----
  const undoLast = useCallback(async () => {
    const mine = [...strokes].reverse().find((s) => s.authorId === userId);
    if (!mine) return;
    setStrokes((list) => list.filter((s) => s.id !== mine.id));
    send('stroke:undo', { strokeId: mine.id, dbId: mine.dbId ?? null } satisfies StrokeUndoPayload);
    if (mine.dbId != null) {
      await supabase.from(TABLES.strokes).delete().eq('id', mine.dbId);
    }
    renderSnapshot(coupleId);
  }, [coupleId, send, strokes, userId]);

  // ---- ring the partner's phone ----
  // Two paths on purpose: the broadcast rings them instantly if their app is
  // open, the edge function pushes if it isn't. The server owns the rate limit
  // and its answer is what the button's cooldown follows.
  const sendBuzz = useCallback(async (): Promise<BuzzResult> => {
    send('buzz', { from: userId });
    return await buzzPartner(coupleId);
  }, [coupleId, send, userId]);

  // ---- clear the whole canvas ----
  const clearCanvas = useCallback(async () => {
    setStrokes([]);
    setLiveStrokes({});
    send('canvas:clear', {});
    await supabase.from(TABLES.strokes).delete().eq('canvas_id', canvasId);
    renderSnapshot(coupleId);
  }, [canvasId, coupleId, send]);

  return {
    strokes,
    liveStrokes,
    partnerDrawing,
    partnerOnline,
    connection,
    beginStroke,
    addPoint,
    sendBuzz,
    endStroke,
    undoLast,
    clearCanvas,
    canUndo: strokes.some((s) => s.authorId === userId),
  };
}
