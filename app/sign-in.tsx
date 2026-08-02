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
import { sendPasswordReset } from '@/lib/account';
import { EDGE_FUNCTIONS } from '@/lib/backend';
import { supabase } from '@/lib/supabase';
import { colors, fonts } from '@/theme/tokens';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

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
      let { error } = await supabase.auth.signInWithPassword({ email: target, password });
      if (error) {
        // No account yet? Create one (pre-confirmed) and sign straight in.
        const { error: fnError } = await supabase.functions.invoke(EDGE_FUNCTIONS.signup, {
          body: { email: target, password },
        });
        if (fnError) {
          const status = (fnError as { context?: { status?: number } }).context?.status;
          Alert.alert(
            status === 409 ? 'Welcome back' : 'Could not sign up',
            status === 409
              ? 'That email already has an account — check the password.'
              : 'Try again in a moment.'
          );
          return;
        }
        ({ error } = await supabase.auth.signInWithPassword({ email: target, password }));
        if (error) {
          Alert.alert('Almost', 'Account created — tap Enter once more to sign in.');
          return;
        }
      }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  }

  // Recovery lands on the web app, which is where the new password is set —
  // that avoids a deep-link round trip that can't be tested without a build.
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
