import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Input, Screen, Wordmark } from '@/components/ui';
import {
  isUnverifiedError,
  resendVerification,
  sendPasswordReset,
  signUpWithEmail,
} from '@/lib/account';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/theme/tokens';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  // set once an account exists but the emailed link hasn't been clicked yet
  const [awaitingEmail, setAwaitingEmail] = useState<string | null>(null);

  async function enter() {
    const target = email.trim().toLowerCase();
    if (!target.includes('@')) {
      Alert.alert('Enter your email', "That's your account name.");
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password', 'Pick a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: target,
        password,
      });

      if (!error) {
        router.replace('/');
        return;
      }

      // The account exists but the address was never confirmed. Not a failure —
      // just an unfinished step.
      if (isUnverifiedError(error.message)) {
        setAwaitingEmail(target);
        return;
      }

      // No account yet? Make one. Whether they're let straight in or have to
      // confirm first is Supabase's "Confirm email" setting, not ours.
      const res = await signUpWithEmail(target, password);
      if (res.alreadyRegistered) {
        Alert.alert('Welcome back', 'That email already has an account — check the password.');
        return;
      }
      if (!res.ok) {
        Alert.alert('Could not sign up', res.message ?? 'Try again in a moment.');
        return;
      }
      if (res.needsVerification) {
        setAwaitingEmail(target);
        return;
      }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  }

  async function forgot() {
    const target = email.trim().toLowerCase();
    if (!target.includes('@')) {
      Alert.alert('Which account?', 'Type your email above first, then tap this.');
      return;
    }
    setBusy(true);
    const res = await sendPasswordReset(target);
    setBusy(false);
    Alert.alert(
      res.ok ? 'Check your email' : 'Hmm',
      res.ok
        ? `If ${target} has an account, a reset link is on its way. Open it, choose a new password, then come back and sign in.`
        : res.message
    );
  }

  if (awaitingEmail) {
    return (
      <CheckInbox
        email={awaitingEmail}
        onDifferentEmail={() => {
          setAwaitingEmail(null);
          setPassword('');
        }}
        onDone={() => setAwaitingEmail(null)}
      />
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
      >
        <View style={{ marginBottom: 8 }}>
          <Wordmark size={34} />
        </View>
        <Text style={styles.h1}>
          Leave me{'\n'}a <Text style={{ color: colors.ink }}>trace.</Text>
        </Text>
        <Text style={styles.sub}>
          Whatever one of you draws appears on the other&apos;s phone — stroke by stroke, in
          real time.
        </Text>
        <View style={{ height: 28 }} />
        <Input
          placeholder="your email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={{ height: 12 }} />
        <Input
          placeholder="your password"
          autoCapitalize="none"
          autoComplete="current-password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={enter}
        />
        <View style={{ height: 12 }} />
        <Button title="Enter" onPress={enter} loading={busy} />
        <Text style={styles.hint}>
          First time? Enter creates your account. Coming back? It signs you in.
        </Text>
        <Pressable onPress={forgot} hitSlop={10} style={styles.forgotWrap}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Shown when an account exists but its address hasn't been confirmed yet. */
function CheckInbox({
  email,
  onDifferentEmail,
  onDone,
}: {
  email: string;
  onDifferentEmail: () => void;
  onDone: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    setSending(true);
    const res = await resendVerification(email);
    setSending(false);
    if (!res.ok) {
      Alert.alert('Hmm', res.message);
      return;
    }
    setSent(true);
  }

  return (
    <Screen>
      <View style={styles.center}>
        <View style={{ marginBottom: 8 }}>
          <Wordmark size={34} />
        </View>
        <Text style={styles.h1}>
          check your{'\n'}
          <Text style={{ color: colors.ink }}>inbox.</Text>
        </Text>
        <Text style={styles.sub}>
          We sent a confirmation link to <Text style={{ color: colors.text }}>{email}</Text>. Open
          it, then come back and sign in.
        </Text>
        <Text style={styles.sub}>
          Confirming your address is what makes a forgotten password recoverable — without it,
          there&apos;s nowhere to send a reset.
        </Text>
        <View style={{ height: 24 }} />
        <Button
          title={sent ? 'Sent — check again' : 'Resend the link'}
          variant="ghost"
          onPress={resend}
          loading={sending}
        />
        <View style={{ height: 10 }} />
        <Button title="I've confirmed — sign in" onPress={onDone} />
        <Pressable onPress={onDifferentEmail} hitSlop={10} style={styles.forgotWrap}>
          <Text style={styles.forgot}>Wrong address? Use a different one</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  h1: {
    fontFamily: fonts.handwriting,
    fontSize: 56,
    lineHeight: 58,
    color: colors.text,
  },
  sub: { color: colors.muted, fontSize: 15.5, marginTop: 12, maxWidth: 320 },
  hint: { color: colors.muted, fontSize: 12.5, marginTop: 16, textAlign: 'center' },
  forgotWrap: { marginTop: 14, alignItems: 'center' },
  forgot: {
    color: colors.muted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
