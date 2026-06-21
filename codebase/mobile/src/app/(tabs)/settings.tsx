import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KCard } from '@/components/ui/KCard';
import { KText } from '@/components/ui/KText';
import { Segmented } from '@/components/ui/Segmented';
import { signOut, useAuth } from '@/features/auth/store';
import { useAppStore } from '@/features/store/appStore';
import { READING_MODES } from '@/features/store/types';
import { colors, spacing } from '@/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const readingMode = useAppStore((s) => s.myNewspaper.readingMode);
  const setReadingMode = useAppStore((s) => s.setReadingMode);
  const sources = useAppStore((s) => s.sources);
  const customSources = useAppStore((s) => s.customSources);
  const removeCustomSource = useAppStore((s) => s.removeCustomSource);

  const initials = (user?.name ?? 'Guest')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Log out of Kişisel?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => void signOut() },
    ]);

  const confirmRemove = (id: string, name: string) =>
    Alert.alert(`Remove ${name}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void removeCustomSource(id) },
    ]);

  const detail = READING_MODES.find((m) => m.value === readingMode)?.detail ?? '';

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <KText variant="display">Settings</KText>

        {/* Account */}
        <Section title="Account">
          <View style={styles.account}>
            <View style={styles.avatar}>
              <KText variant="h3" color={colors.accent}>
                {initials}
              </KText>
            </View>
            <View style={{ flex: 1 }}>
              <KText variant="h3">{user?.name ?? 'Guest reader'}</KText>
              <KText variant="caption" color={colors.textMuted}>
                {user?.email ?? '—'}
              </KText>
            </View>
          </View>
          <Pressable onPress={confirmLogout} style={styles.logout}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <KText variant="button" color={colors.danger}>
              Log out
            </KText>
          </Pressable>
        </Section>

        {/* Reading */}
        <Section title="Reading">
          <Segmented
            value={readingMode}
            onChange={setReadingMode}
            options={READING_MODES.map((m) => ({ value: m.value, label: m.label, icon: m.icon as keyof typeof Ionicons.glyphMap }))}
          />
          <KText variant="caption" color={colors.textMuted}>
            {detail}
          </KText>
        </Section>

        {/* Sources */}
        <Section title="Sources">
          {[...sources, ...customSources].map((s) => {
            const custom = 'isCustom' in s;
            return (
              <View key={s.id} style={styles.sourceRow}>
                <View style={{ flex: 1 }}>
                  <KText variant="h3">{s.name}</KText>
                  <KText variant="caption" color={colors.textMuted} numberOfLines={1}>
                    {s.category ?? '—'}
                  </KText>
                </View>
                {custom ? (
                  <Pressable onPress={() => confirmRemove(s.id, s.name)} hitSlop={8} style={styles.customTag}>
                    <KText variant="pill" color={colors.accent}>
                      CUSTOM
                    </KText>
                    <Ionicons name="trash-outline" size={14} color={colors.danger} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
          <Pressable onPress={() => router.push('/add-source')} style={styles.addSource}>
            <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
            <KText variant="button" color={colors.accent}>
              Add a custom source
            </KText>
          </Pressable>
        </Section>

        <Section title="About">
          <Row label="App" value="Kişisel" />
          <Row label="Version" value="1.0 (prototype)" />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.two }}>
      <KText variant="label" color={colors.textMuted}>
        {title.toUpperCase()}
      </KText>
      <KCard>
        <View style={styles.sectionBody}>{children}</View>
      </KCard>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <KText variant="body" color={colors.textMuted}>
        {label}
      </KText>
      <KText variant="body">{value}</KText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.five },
  sectionBody: { padding: spacing.four, gap: spacing.three },
  account: { flexDirection: 'row', alignItems: 'center', gap: spacing.three },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logout: { flexDirection: 'row', alignItems: 'center', gap: spacing.two },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.three },
  customTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addSource: { flexDirection: 'row', alignItems: 'center', gap: spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
