import { Redirect, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CanvasBoard } from '@/components/CanvasBoard';
import { Paywall, type PaywallReason } from '@/components/Paywall';
import { PresencePill } from '@/components/PresencePill';
import { ReplayBar } from '@/components/ReplayBar';
import { ViewTabs, type CanvasView } from '@/components/ViewTabs';
import { useToast } from '@/components/Toast';
import { Toolbar } from '@/components/Toolbar';
import { Button, Loading, Screen, Wordmark } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useSharedCanvas } from '@/hooks/useSharedCanvas';
import { useStreak } from '@/hooks/useStreak';
import { countPoints, replayPool, sliceStrokes } from '@/lib/replay';
import { BRUSHES } from '@/lib/brushes';
import { playBuzz, primeBuzz, releaseBuzz } from '@/lib/buzz';
import { useEntitlement } from '@/lib/entitlements';
import { configureIap } from '@/lib/iap';
import { registerPushToken } from '@/lib/notifications';
import { publishWidgetUrl } from '@/lib/widget';
import { colors, radius, swatches } from '@/theme/tokens';
import type { Brush } from '@/types';

export default function CanvasScreen() {
  const { session, loading } = useAuth();
  const { membership, loading: coupleLoading, refresh } = useCouple(session?.user.id);

  if (loading || coupleLoading) return <Loading />;
  if (!session) return <Redirect href="/sign-in" />;
  if (!membership || !membership.canvasId) return <Redirect href="/pair" />;

  return (
    <SharedCanvas
      userId={session.user.id}
      coupleId={membership.coupleId}
      canvasId={membership.canvasId}
      displayName={membership.displayName}
      inviteCode={membership.inviteCode}
      partnerName={membership.partnerName}
      refreshMembership={refresh}
    />
  );
}

function SharedCanvas({
  userId,
  coupleId,
  canvasId,
  displayName,
  inviteCode,
  partnerName,
  refreshMembership,
}: {
  userId: string;
  coupleId: string;
  canvasId: string;
  displayName: string;
  inviteCode: string;
  partnerName: string | null;
  refreshMembership: () => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [brush, setBrush] = useState<Brush>('marker');
  const [color, setColor] = useState<string>(swatches[0]);
  const { status, refresh: refreshTier } = useEntitlement();
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const [revealing, setRevealing] = useState(false);
  // Ring lights up once you've finished a trace — buzz them to something
  // waiting, not to an empty canvas.
  const [ringReady, setRingReady] = useState(false);
  const [ringCooldown, setRingCooldown] = useState(0);
  const [view, setView] = useState<CanvasView>('all');
  const { streak, refresh: refreshStreak } = useStreak(coupleId);
  const [replay, setReplay] = useState<{ pos: number; total: number; playing: boolean } | null>(
    null
  );

  const {
    strokes,
    liveStrokes,
    partnerDrawing,
    partnerOnline,
    connection,
    beginStroke,
    addPoint,
    endStroke,
    sendBuzz,
    undoLast,
    clearCanvas,
    canUndo,
  } = useSharedCanvas({
    coupleId,
    canvasId,
    userId,
    displayName,
    onTierRejected: useCallback(() => {
      void refreshTier();
      setBrush('marker');
      setPaywall('brush');
    }, [refreshTier]),
    onBuzz: useCallback(() => {
      void playBuzz();
      toast.show('❤️ they’re thinking about you');
    }, [toast]),
  });

  useEffect(() => {
    registerPushToken(userId);
    publishWidgetUrl(userId);
    // the Supabase user id IS the RevenueCat app user id — that's how the
    // webhook maps a purchase back to this couple
    void configureIap(userId);
    primeBuzz(); // load the ring before the first one arrives
    return () => {
      void releaseBuzz();
    };
  }, [userId]);

  // cooldown ticker — the server decides the length, this just counts it down
  useEffect(() => {
    if (ringCooldown <= 0) return;
    const t = setTimeout(() => setRingCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [ringCooldown]);

  async function onRing() {
    if (ringCooldown > 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRingReady(false);
    const res = await sendBuzz();
    if (res.sent) {
      setRingCooldown(120);
      toast.show(`ringing ${partnerName ?? 'them'}…`);
    } else if (res.retryAfter) {
      setRingCooldown(res.retryAfter);
      toast.show(`give them a moment — ${res.retryAfter}s`);
    } else if (res.reason === 'partner has no push token') {
      // the in-app broadcast still went out; only the push couldn't
      toast.show('rang their app — their phone can’t be reached yet');
    } else {
      toast.show('couldn’t reach them just now');
    }
  }

  // a locked brush can only be selected once the couple is actually Pro
  useEffect(() => {
    if (!status.isPro && brush !== 'marker' && brush !== 'chalk') setBrush('marker');
  }, [status.isPro, brush]);

  // never leave a secret on screen
  useEffect(() => {
    if (!revealing) return;
    const t = setTimeout(() => setRevealing(false), 6000);
    return () => clearTimeout(t);
  }, [revealing]);

  const hasSecrets = strokes.some((s) => s.brush === 'invisible');

  // A streak takes both of you, so it can change when THEY draw as well —
  // watch the stroke count rather than only your own finger lifting. Debounced
  // so a fast exchange doesn't fire a query per stroke.
  useEffect(() => {
    const t = setTimeout(() => void refreshStreak(), 2000);
    return () => clearTimeout(t);
  }, [strokes.length, refreshStreak]);

  /* ---------- what the board is actually showing ---------- */

  // Views are a lens on one canvas, not three canvases.
  const inView = useCallback(
    (authorId: string) =>
      view === 'all' ? true : view === 'mine' ? authorId === userId : authorId !== userId,
    [view, userId]
  );

  // Replay skips invisible ink for the same reason the widget does — and free
  // couples replay only their recent history.
  const pool = React.useMemo(
    () => replayPool(strokes, inView, status.replayDays),
    [strokes, inView, status.replayDays]
  );
  const replayTotal = React.useMemo(() => countPoints(pool), [pool]);

  const shownStrokes = React.useMemo(() => {
    if (!replay) return strokes.filter((s) => inView(s.authorId));
    return sliceStrokes(pool, replay.pos);
  }, [replay, strokes, pool, inView]);

  // playback clock
  useEffect(() => {
    if (!replay?.playing) return;
    const SPEED = 220; // points per second, same feel as the web
    const started = Date.now();
    const from = replay.pos;
    const t = setInterval(() => {
      const next = from + ((Date.now() - started) / 1000) * SPEED;
      setReplay((r) => {
        if (!r) return r;
        if (next >= replayTotal) return { ...r, pos: replayTotal, playing: false };
        return { ...r, pos: next };
      });
    }, 60);
    return () => clearInterval(t);
    // restarting on every pos change would reset the clock, so this intentionally
    // depends only on the play/pause edge
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replay?.playing, replayTotal]);

  function openReplay() {
    if (!replayTotal) {
      toast.show(
        status.replayDays != null && strokes.length
          ? `nothing in the last ${status.replayDays} days`
          : 'nothing to replay yet — draw something first'
      );
      if (status.replayDays != null && strokes.length) setPaywall('replay');
      return;
    }
    setReplay({ pos: 0, total: replayTotal, playing: true });
  }

  // the moment the partner first shows up, celebrate + load their name
  const partnerSeenRef = useRef(false);
  useEffect(() => {
    if (partnerOnline && !partnerSeenRef.current) {
      partnerSeenRef.current = true;
      if (!partnerName) {
        refreshMembership();
        toast.show(`${partnerOnline} is here ✏️`);
      }
    }
  }, [partnerOnline, partnerName, refreshMembership, toast]);

  function shareCode() {
    Share.share({
      message: `Leave me a trace ❤️ Get the Trace app and join our canvas with code ${inviteCode}`,
    }).catch(() => {});
  }

  function confirmClear() {
    Alert.alert('Clear the canvas?', 'This erases it for both of you.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCanvas() },
    ]);
  }

  // long-press the wordmark for account settings — name, password, leaving,
  // deleting, signing out
  function onWordmarkLongPress() {
    router.push('/account');
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onLongPress={onWordmarkLongPress}>
          <Wordmark />
        </Pressable>
        <Pressable
          style={[styles.streakChip, streak > 0 && styles.streakChipOn]}
          onPress={() =>
            toast.show(
              streak > 0
                ? `${streak}-day streak — you both drew ${streak} day${streak > 1 ? 's' : ''} in a row`
                : 'draw on the same day as your person to start a streak'
            )
          }
        >
          <Text style={[styles.streakText, streak > 0 && { color: colors.gold }]}>
            🔥 {streak}
          </Text>
        </Pressable>
        {!status.isPro && (
          <Pressable style={styles.tierChip} onPress={() => setPaywall('info')}>
            <Text style={styles.tierChipText}>unlock</Text>
          </Pressable>
        )}
        {partnerDrawing ? (
          <PresencePill name={partnerDrawing} />
        ) : partnerName || partnerOnline ? (
          <View style={styles.withRow}>
            <View
              style={[
                styles.presenceDot,
                { backgroundColor: partnerOnline ? colors.glow : colors.muted },
              ]}
            />
            <Text style={styles.partner}>with {partnerName ?? partnerOnline}</Text>
          </View>
        ) : (
          <Pressable style={styles.codeChip} onPress={shareCode}>
            <Text style={styles.codeChipText}>code {inviteCode} · tap to share</Text>
          </Pressable>
        )}
      </View>

      {connection !== 'live' && (
        <View style={styles.connBanner}>
          <Text style={styles.connText}>
            {connection === 'connecting' ? 'connecting…' : 'reconnecting…'}
          </Text>
        </View>
      )}

      <ViewTabs view={view} partnerName={partnerName ?? 'them'} onChange={setView} />

      <CanvasBoard
        strokes={shownStrokes}
        liveStrokes={replay ? {} : liveStrokes}
        brush={brush}
        color={color}
        brushWidth={BRUSHES[brush].width}
        onBegin={beginStroke}
        onPoint={addPoint}
        onEnd={(id) => {
          void endStroke(id);
          setRingReady(true); // you left something — now you can ring them to it
        }}
        revealing={revealing}
        disabled={!!replay}
      />

      {replay && (
        <ReplayBar
          position={replay.pos}
          total={replayTotal}
          playing={replay.playing}
          onScrub={(pos) => setReplay((r) => (r ? { ...r, pos, playing: false } : r))}
          onTogglePlay={() =>
            setReplay((r) =>
              r ? { ...r, playing: !r.playing, pos: r.pos >= replayTotal ? 0 : r.pos } : r
            )
          }
          onClose={() => setReplay(null)}
        />
      )}

      <Toolbar
        brush={brush}
        color={color}
        isPro={status.isPro}
        onBrush={setBrush}
        onColor={setColor}
        onLocked={() => setPaywall('brush')}
      />

      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <Button title="Clear" variant="ghost" onPress={confirmClear} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="↺ Undo" variant="ghost" onPress={undoLast} disabled={!canUndo} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="⟲ Replay" variant="ghost" onPress={openReplay} disabled={!!replay} />
        </View>
        {hasSecrets && (
          <Pressable
            onPressIn={() => setRevealing(true)}
            onPressOut={() => setRevealing(false)}
            style={[styles.reveal, revealing && styles.revealOn]}
          >
            <Text style={[styles.revealText, revealing && { color: colors.gold }]}>
              {revealing ? 'reading…' : 'hold to read'}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onRing}
          disabled={ringCooldown > 0}
          style={[
            styles.ring,
            ringReady && ringCooldown === 0 && styles.ringReady,
            ringCooldown > 0 && styles.ringSpent,
          ]}
        >
          <Text
            style={[
              styles.ringText,
              ringReady && ringCooldown === 0 && { color: colors.gold },
            ]}
          >
            {ringCooldown > 0 ? `${ringCooldown}s` : '🔔 Ring'}
          </Text>
        </Pressable>
      </View>

      <Paywall
        visible={paywall !== null}
        reason={paywall ?? 'info'}
        onClose={() => setPaywall(null)}
        onUnlocked={refreshTier}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  withRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  presenceDot: { width: 8, height: 8, borderRadius: 4 },
  partner: { color: colors.muted, fontSize: 13 },
  codeChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  codeChipText: { color: colors.muted, fontSize: 12 },
  connBanner: {
    alignSelf: 'center',
    backgroundColor: colors.inkSoft,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  connText: { color: '#ffb9c2', fontSize: 12, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  tierChip: {
    borderWidth: 1,
    borderColor: 'rgba(244,198,107,0.45)',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  tierChipText: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  streakChip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  streakChipOn: { borderColor: 'rgba(244,198,107,0.45)' },
  streakText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  reveal: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    borderRadius: radius.button,
    paddingHorizontal: 14,
  },
  revealOn: { borderColor: 'rgba(244,198,107,0.55)', backgroundColor: 'rgba(244,198,107,0.14)' },
  revealText: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 78,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    borderRadius: radius.button,
    paddingHorizontal: 14,
  },
  ringReady: {
    borderColor: 'rgba(244,198,107,0.55)',
    backgroundColor: 'rgba(244,198,107,0.14)',
  },
  ringSpent: { opacity: 0.5 },
  ringText: { color: colors.muted, fontSize: 12.5, fontWeight: '600' },
});
