import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { Button, Input, Loading, Screen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import {
  changePassword,
  deleteAccount,
  leaveCouple,
  setDisplayName,
} from '@/lib/account';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme/tokens';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { session, loading } = useAuth();
  const { membership, loading: coupleLoading, refresh } = useCouple(session?.user.id);

  const [name, setName] = useState<string | null>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState<null | 'name' | 'password' | 'leave' | 'delete'>(null);

  if (loading || coupleLoading) return <Loading />;
  if (!session) {
    router.replace('/sign-in');
    return <Loading />;
  }

  const email = session.user.email ?? '';
  const displayName = name ?? membership?.displayName ?? '';

  async function onSaveName() {
    setBusy('name');
    const res = await setDisplayName(displayName);
    setBusy(null);
    if (!res.ok) return Alert.alert('Name', res.message);
    await refresh();
    toast.show('name updated');
  }

  async function onChangePassword() {
    setBusy('password');
    const res = await changePassword(email, currentPw, newPw);
    setBusy(null);
    if (!res.ok) return Alert.alert('Password', res.message);
    setCurrentPw('');
    setNewPw('');
    toast.show('password changed');
  }

  function onLeave() {
    Alert.alert(
      'Leave this canvas?',
      'Your drawings are removed. Theirs stay. You can pair again with a new code afterwards.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setBusy('leave');
            const res = await leaveCouple();
            setBusy(null);
            if (!res.ok) return Alert.alert('Leave', res.message);
            await refresh();
            router.replace('/pair');
          },
        },
      ]
    );
  }

  // Two prompts on purpose. This is the one action in the app that cannot be
  // undone, so it should be harder to do by accident than anything else.
  function onDelete() {
    Alert.alert(
      'Delete your account?',
      'This erases your login and your drawings for good. It cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Really delete?',
              membership
                ? 'Your ink disappears from your shared canvas. Your partner keeps theirs.'
                : 'There is no way to get this account back.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete forever',
                  style: 'destructive',
                  onPress: async () => {
                    setBusy('delete');
                    const res = await deleteAccount();
                    setBusy(null);
                    if (!res.ok) return Alert.alert('Delete', res.message);
                    router.replace('/sign-in');
                  },
                },
              ]
            ),
        },
      ]
    );
  }

  function onSignOut() {
    supabase.auth.signOut().then(() => router.replace('/sign-in'));
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
          </View>

          <Text style={styles.h1}>Your account</Text>
          <Text style={styles.email}>{email}</Text>

          <Section title="Your name">
            <Text style={styles.help}>This is what your person sees.</Text>
            <Input
              value={displayName}
              onChangeText={setName}
              maxLength={24}
              placeholder="your name"
              autoCapitalize="words"
            />
            <View style={{ height: 10 }} />
            <Button
              title="Save name"
              variant="ghost"
              onPress={onSaveName}
              loading={busy === 'name'}
              disabled={!displayName.trim() || displayName === membership?.displayName}
            />
          </Section>

          <Section title="Password">
            <Input
              value={currentPw}
              onChangeText={setCurrentPw}
              placeholder="current password"
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={{ height: 10 }} />
            <Input
              value={newPw}
              onChangeText={setNewPw}
              placeholder="new password"
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={{ height: 10 }} />
            <Button
              title="Change password"
              variant="ghost"
              onPress={onChangePassword}
              loading={busy === 'password'}
              disabled={!currentPw || newPw.length < 6}
            />
          </Section>

          {membership && (
            <Section title="Your canvas">
              <Text style={styles.help}>
                {membership.partnerName
                  ? `Paired with ${membership.partnerName}. Leaving removes your drawings and keeps theirs.`
                  : `Nobody has joined yet. Your code is ${membership.inviteCode}.`}
              </Text>
              <Button
                title="Leave this canvas"
                variant="ghost"
                onPress={onLeave}
                loading={busy === 'leave'}
              />
            </Section>
          )}

          <Section title="Signing out">
            <Button title="Sign out" variant="ghost" onPress={onSignOut} />
          </Section>

          <View style={styles.danger}>
            <Text style={styles.dangerTitle}>Delete account</Text>
            <Text style={styles.help}>
              Erases your login, your drawings and your streak, permanently. Your partner keeps
              their own ink.
            </Text>
            <Pressable
              onPress={onDelete}
              disabled={busy === 'delete'}
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.deleteText}>
                {busy === 'delete' ? 'Deleting…' : 'Delete my account'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingBottom: 6 },
  back: { color: colors.muted, fontSize: 15 },
  h1: { color: colors.text, fontSize: 26, fontWeight: '600', marginTop: 6 },
  email: { color: colors.muted, fontSize: 13.5, marginTop: 4, marginBottom: 8 },
  section: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  help: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  danger: {
    marginTop: 26,
    borderWidth: 1,
    borderColor: 'rgba(226,51,67,0.35)',
    backgroundColor: 'rgba(226,51,67,0.06)',
    borderRadius: radius.button,
    padding: 16,
  },
  dangerTitle: { color: '#ffb9c2', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  deleteBtn: {
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(226,51,67,0.55)',
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteText: { color: '#ff9aa6', fontSize: 14.5, fontWeight: '600' },
});
