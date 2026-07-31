import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { buyForever, getPrice, isPurchaseAvailable, restorePurchases } from '@/lib/iap';
import { colors, fonts, radius } from '@/theme/tokens';

export type PaywallReason = 'brush' | 'photo' | 'replay' | 'info';

const WHY: Record<PaywallReason, string> = {
  brush: 'That brush is part of Trace Forever.',
  photo: "You've used today's free photo. Trace Forever lifts the limit.",
  replay: 'Free replay goes back 7 days. Trace Forever replays everything.',
  info: 'One payment. Both of you. Forever.',
};

const PERKS = [
  'Every brush — glow, neon, and invisible ink',
  'Unlimited photos, not one a day',
  'Your whole story in Replay, back to day one',
  'Unlocks for your person at the same moment',
];

interface Props {
  visible: boolean;
  reason: PaywallReason;
  onClose: () => void;
  /** Re-reads entitlement from the server; the purchase itself proves nothing. */
  onUnlocked: () => Promise<unknown>;
}

export function Paywall({ visible, reason, onClose, onUnlocked }: Props) {
  const [price, setPrice] = useState('$29.99');
  const [busy, setBusy] = useState<null | 'buy' | 'restore'>(null);
  const [note, setNote] = useState<string | null>(null);
  const [canBuy, setCanBuy] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setNote(null);
    void getPrice().then(setPrice);
    void isPurchaseAvailable().then(setCanBuy);
  }, [visible]);

  // RevenueCat tells the server, the server tells us. Poll briefly: the webhook
  // usually lands in well under a second, but the purchase shouldn't feel stuck
  // if it doesn't.
  async function settle() {
    for (let i = 0; i < 6; i++) {
      const status = (await onUnlocked()) as { isPro?: boolean } | undefined;
      if (status?.isPro) return true;
      await new Promise((r) => setTimeout(r, 800));
    }
    return false;
  }

  async function onBuy() {
    setBusy('buy');
    setNote(null);
    const res = await buyForever();
    if (!res.ok) {
      setBusy(null);
      if (!res.cancelled) setNote(res.message);
      return;
    }
    const unlocked = await settle();
    setBusy(null);
    if (unlocked) onClose();
    else setNote("Payment went through — we're still unlocking. Give it a moment.");
  }

  async function onRestore() {
    setBusy('restore');
    setNote(null);
    await restorePurchases();
    const unlocked = await settle();
    setBusy(null);
    if (unlocked) onClose();
    else setNote('No purchase found on this account yet.');
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={busy ? undefined : onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.kicker}>
            trace <Text style={{ color: colors.ink }}>forever</Text>
          </Text>
          <Text style={styles.price}>{price} once</Text>
          <Text style={styles.priceSub}>one purchase unlocks both of you</Text>
          <Text style={styles.why}>{WHY[reason]}</Text>

          <View style={styles.perks}>
            {PERKS.map((p) => (
              <View key={p} style={styles.perkRow}>
                <Text style={styles.tick}>♥</Text>
                <Text style={styles.perk}>{p}</Text>
              </View>
            ))}
          </View>

          {note ? <Text style={styles.note}>{note}</Text> : null}

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.ink} />
              <Text style={styles.busyText}>
                {busy === 'buy' ? 'unlocking for both of you…' : 'checking your purchases…'}
              </Text>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 16 }}>
                <Button
                  title={canBuy ? 'Unlock Trace Forever' : 'Not available in this build'}
                  onPress={onBuy}
                  disabled={!canBuy}
                />
              </View>
              <Pressable onPress={onRestore} style={styles.linkWrap}>
                <Text style={styles.link}>I already bought this</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.linkWrap}>
                <Text style={styles.link}>Not now</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,5,8,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.card,
    padding: 22,
  },
  kicker: {
    fontFamily: fonts.handwriting,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
  },
  price: { color: colors.gold, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  priceSub: { color: colors.muted, fontSize: 12.5, textAlign: 'center', marginTop: 3 },
  why: { color: colors.muted, fontSize: 13.5, textAlign: 'center', marginTop: 14, lineHeight: 20 },
  perks: { marginTop: 16, gap: 10 },
  perkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tick: { color: colors.gold, fontSize: 13, marginTop: 1 },
  perk: { color: colors.text, fontSize: 14, flex: 1, lineHeight: 19 },
  note: { color: '#ffb9c2', fontSize: 12.5, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  busy: { alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 8 },
  busyText: { color: colors.muted, fontSize: 13 },
  linkWrap: { paddingVertical: 11, alignItems: 'center' },
  link: { color: colors.muted, fontSize: 13, textDecorationLine: 'underline' },
});
