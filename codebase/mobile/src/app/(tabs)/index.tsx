import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WidgetCard } from '@/components/WidgetCard';
import { KButton } from '@/components/ui/KButton';
import { KText } from '@/components/ui/KText';
import { Segmented } from '@/components/ui/Segmented';
import { useAppStore } from '@/features/store/appStore';
import { READING_MODES } from '@/features/store/types';
import { colors, radius, spacing } from '@/theme/tokens';

export default function NewspaperScreen() {
  const router = useRouter();
  const newspaper = useAppStore((s) => s.myNewspaper);
  const editMode = useAppStore((s) => s.editMode);
  const toggleEditMode = useAppStore((s) => s.toggleEditMode);
  const setReadingMode = useAppStore((s) => s.setReadingMode);

  const widgets = [...newspaper.widgets].sort((a, b) => a.order - b.order);
  const detail = READING_MODES.find((m) => m.value === newspaper.readingMode)?.detail ?? '';

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      {/* top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.push('/share')} hitSlop={8}>
          <Ionicons name="share-outline" size={22} color={colors.ink} />
        </Pressable>
        <KText variant="h2" numberOfLines={1} style={styles.topTitle}>
          {newspaper.name}
        </KText>
        <Pressable onPress={toggleEditMode} hitSlop={8}>
          <KText variant="button" color={editMode ? colors.accent : colors.ink}>
            {editMode ? 'Done' : 'Edit'}
          </KText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* reading mode strip */}
        <View style={styles.modeStrip}>
          <KText variant="label" color={colors.textMuted}>
            Reading mode
          </KText>
          <Segmented
            value={newspaper.readingMode}
            onChange={setReadingMode}
            options={READING_MODES.map((m) => ({
              value: m.value,
              label: m.label,
              icon: m.icon as keyof typeof Ionicons.glyphMap,
            }))}
          />
          <KText variant="caption" color={colors.textSoft}>
            {detail}
          </KText>
        </View>

        {widgets.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={34} color={colors.textSoft} />
            <KText variant="h2">Your newspaper is empty</KText>
            <KText variant="body" color={colors.textMuted} style={styles.emptyText}>
              Turn on editing and add your first widget — a news source, an editorial note, or a discovery feed.
            </KText>
            <KButton title="Start editing" icon="pencil" onPress={() => !editMode && toggleEditMode()} style={{ maxWidth: 220 }} />
          </View>
        ) : (
          <View style={{ gap: spacing.four }}>
            {widgets.map((w) => (
              <WidgetCard key={w.id} widget={w} isEditable />
            ))}
          </View>
        )}

        {editMode ? (
          <Pressable style={styles.addBtn} onPress={() => router.push('/add-widget')}>
            <Ionicons name="add-circle" size={20} color={colors.accent} />
            <KText variant="button" color={colors.accent}>
              Add widget
            </KText>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
    gap: spacing.three,
  },
  topTitle: { flex: 1, textAlign: 'center' },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.four },
  modeStrip: { gap: spacing.two },
  empty: { alignItems: 'center', gap: spacing.three, paddingVertical: spacing.six },
  emptyText: { textAlign: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.two,
    paddingVertical: spacing.four,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    borderWidth: 1.4,
    borderColor: 'rgba(38,71,214,0.4)',
    borderStyle: 'dashed',
  },
});
