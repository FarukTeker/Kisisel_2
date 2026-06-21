import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { hydrateAuth, useAuth } from '@/features/auth/store';
import { useAppStore } from '@/features/store/appStore';
import { colors } from '@/theme/tokens';

const paperNavTheme: typeof DefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.paper,
    card: colors.surface,
    text: colors.ink,
    border: colors.hairline,
  },
};

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);
  const hydrateLocal = useAppStore((s) => s.hydrateLocal);
  const bootstrapForUser = useAppStore((s) => s.bootstrapForUser);
  const resetForLogout = useAppStore((s) => s.resetForLogout);

  useEffect(() => {
    void hydrateAuth();
    void hydrateLocal();
  }, [hydrateLocal]);

  useEffect(() => {
    if (status === 'authenticated') void bootstrapForUser();
    if (status === 'unauthenticated') resetForLogout();
  }, [status, bootstrapForUser, resetForLogout]);

  if (status === 'loading' || !hydrated) return <Splash />;

  const isAuthed = status === 'authenticated';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && !isAuthed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && isAuthed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="newspaper/[slug]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-widget" options={{ presentation: 'modal' }} />
        <Stack.Screen name="widget-settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="share" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-source" options={{ presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={paperNavTheme}>
      <RootNavigator />
    </ThemeProvider>
  );
}
