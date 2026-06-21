import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KTextField } from '@/components/ui/KTextField';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { CATEGORIES } from '@/features/store/types';
import { colors, radius, spacing } from '@/theme/tokens';

export default function AddSourceModal() {
  const router = useRouter();
  const addCustomSource = useAppStore((s) => s.addCustomSource);
  const sourceAddError = useAppStore((s) => s.sourceAddError);

  const [name, setName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [localError, setLocalError] = useState<string | null>(null);

  const add = async () => {
    setLocalError(null);
    if (!name.trim()) {
      setLocalError('Give your source a name.');
      return;
    }
    if (await addCustomSource(name, feedUrl, category)) router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <KText variant="button" color={colors.textMuted}>
            Cancel
          </KText>
        </Pressable>
        <KText variant="h3">Add source</KText>
        <Pressable onPress={add} hitSlop={8}>
          <KText variant="button" color={colors.accent}>
            Add
          </KText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <KTextField label="Publisher name" value={name} onChangeText={setName} autoCapitalize="words" />
        <KTextField
          label="Feed URL (https://…)"
          value={feedUrl}
          onChangeText={setFeedUrl}
          keyboardType="url"
          icon="link-outline"
        />

        <KText variant="label" color={colors.textMuted}>
          CATEGORY
        </KText>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? 'transparent' : colors.inkBorderStrong },
                ]}>
                <KText variant="label" color={active ? colors.surface : colors.ink}>
                  {c}
                </KText>
              </Pressable>
            );
          })}
        </View>

        {(localError || sourceAddError) ? (
          <KText variant="label" color={colors.danger}>
            {localError ?? sourceAddError}
          </KText>
        ) : null}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSoft} />
          <KText variant="caption" color={colors.textMuted} style={{ flex: 1 }}>
            Custom sources are saved on this device. Live article fetching for custom feeds is coming
            soon — built-in publishers stream live now.
          </KText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
  },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.three },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.two },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.2 },
  note: {
    flexDirection: 'row',
    gap: spacing.two,
    padding: spacing.three,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    marginTop: spacing.two,
  },
});
