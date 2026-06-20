import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { KButton } from '@/components/ui/KButton';
import { KText } from '@/components/ui/KText';
import { KTextField } from '@/components/ui/KTextField';
import { signIn, signUp } from '@/features/auth/store';
import { colors, radius, spacing } from '@/theme/tokens';
import { ApiError } from '@/lib/api/client';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (mode === 'register' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <KText variant="display">{mode === 'login' ? 'Welcome back' : 'Create your account'}</KText>
          <KText variant="body" color={colors.textMuted} style={styles.lead}>
            {mode === 'login'
              ? 'Log in to open your personal newspaper.'
              : 'Register to start composing your own front page.'}
          </KText>
        </View>

        <View style={styles.switcher}>
          {(['login', 'register'] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                style={[styles.switchTab, active && styles.switchTabActive]}>
                <KText variant="button" color={active ? colors.surface : colors.textMuted}>
                  {m === 'login' ? 'Log in' : 'Register'}
                </KText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          {mode === 'register' ? (
            <KTextField label="Full name" icon="person-outline" value={name} onChangeText={setName} autoCapitalize="words" />
          ) : null}
          <KTextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <KTextField label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry />
          {mode === 'register' ? (
            <KTextField label="Confirm password" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} secureTextEntry />
          ) : null}
        </View>

        {error ? (
          <KText variant="label" color={colors.danger}>
            {error}
          </KText>
        ) : null}

        <KButton title={mode === 'login' ? 'Log in' : 'Create account'} onPress={submit} loading={busy} />

        <Pressable onPress={() => switchMode(mode === 'login' ? 'register' : 'login')} style={styles.toggle}>
          <KText variant="label" color={colors.accent}>
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in'}
          </KText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.five, paddingVertical: spacing.six },
  header: { alignItems: 'center', gap: 6 },
  lead: { textAlign: 'center' },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.pill,
    padding: 4,
  },
  switchTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.pill },
  switchTabActive: { backgroundColor: colors.ink },
  form: { gap: spacing.three },
  toggle: { alignSelf: 'center', padding: spacing.two },
});
