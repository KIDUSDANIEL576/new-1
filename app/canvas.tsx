import { Redirect, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CanvasBoard } from '@/components/CanvasBoard';
import { Paywall, type PaywallReason } from '@/components/Paywall';
import { PresencePill } from '@/components/PresencePill';
import { useToast } from '@/components/Toast';
import { Toolbar } from '@/components/Toolbar';
import { Button, Loading, Screen, Wordmark } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useSharedCanvas } from '@/hooks/useSharedCanvas';
import { BRUSHES } from '@/lib/brushes';
import { playBuzz, primeBuzz, releaseBuzz } from '@/lib/buzz';
import { useEntitlement } from '@/lib/entitlements';
import { configureIap } from '@/lib/iap';
import { registerPushToken } from '@/lib/notifications';
import { publishWidgetUrl } from '@/lib/widget';
import { supabase } from '@/lib/supabase';
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

  function onWordmarkLongPress() {
    Alert.alert('Sign out?', undefined, [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut().then(() => router.replace('/sign-in')),
      },
    ]);
  }

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onLongPress={onWordmarkLongPress}>
          <Wordmark />
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

      <CanvasBoard
        strokes={strokes}
        liveStrokes={liveStrokes}
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
      />

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
