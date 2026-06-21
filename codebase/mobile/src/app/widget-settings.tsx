import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KText } from '@/components/ui/KText';
import { Segmented } from '@/components/ui/Segmented';
import { useAppStore } from '@/features/store/appStore';
import { CATEGORIES, WIDGET_SIZES } from '@/features/store/types';
import { colors, radius, spacing } from '@/theme/tokens';

export default function WidgetSettingsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const widget = useAppStore((s) => s.myNewspaper.widgets.find((w) => w.id === id));
  const resizeWidget = useAppStore((s) => s.resizeWidget);
  const setCategoryFilter = useAppStore((s) => s.setCategoryFilter);
  const setEditorialBody = useAppStore((s) => s.setEditorialBody);
  const removeWidget = useAppStore((s) => s.removeWidget);

  if (!widget) {
    return (
      <SafeAreaView edges={['top']} style={styles.root}>
        <Bar title="Widget" onDone={() => router.back()} />
        <View style={styles.content}>
          <KText variant="body" color={colors.textMuted}>
            Widget not found.
          </KText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <Bar title={widget.title} onDone={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <KText variant="label" color={colors.textMuted}>
          LAYOUT SIZE
        </KText>
        <Segmented
          variant="group"
          value={widget.size}
          onChange={(size) => resizeWidget(widget.id, size)}
          options={WIDGET_SIZES.map((s) => ({ value: s.value, label: s.label }))}
        />

        {widget.kind === 'news' ? (
          <>
            <KText variant="label" color={colors.textMuted} style={{ marginTop: spacing.three }}>
              CATEGORY FILTER
            </KText>
            <View style={styles.chips}>
              <Chip label="All" active={!widget.categoryFilter} onPress={() => setCategoryFilter(widget.id, undefined)} />
              {CATEGORIES.map((c) => (
                <Chip key={c} label={c} active={widget.categoryFilter === c} onPress={() => setCategoryFilter(widget.id, c)} />
              ))}
            </View>
          </>
        ) : null}

        {widget.kind === 'editorial' ? (
          <>
            <KText variant="label" color={colors.textMuted} style={{ marginTop: spacing.three }}>
              EDITORIAL NOTE
            </KText>
            <TextInput
              value={widget.editorialBody ?? ''}
              onChangeText={(t) => setEditorialBody(widget.id, t)}
              multiline
              placeholder="Write your editorial note…"
              placeholderTextColor={colors.textSoft}
              style={styles.editor}
            />
            <KText variant="caption" color={colors.textMuted}>
              Visible to anyone who reads or follows this newspaper once published.
            </KText>
          </>
        ) : null}

        <Pressable
          onPress={() => {
            removeWidget(widget.id);
            router.back();
          }}
          style={styles.remove}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <KText variant="button" color={colors.danger}>
            Remove this widget
          </KText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bar({ title, onDone }: { title: string; onDone: () => void }) {
  return (
    <View style={styles.bar}>
      <View style={{ width: 50 }} />
      <KText variant="h3" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
        {title}
      </KText>
      <Pressable onPress={onDone} hitSlop={8} style={{ width: 50, alignItems: 'flex-end' }}>
        <KText variant="button" color={colors.accent}>
          Done
        </KText>
      </Pressable>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? 'transparent' : colors.inkBorderStrong },
      ]}>
      <KText variant="label" color={active ? colors.surface : colors.ink}>
        {label}
      </KText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.three,
  },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.two },
  chip: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.2 },
  editor: {
    minHeight: 140,
    padding: spacing.three,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.hairline,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  remove: { flexDirection: 'row', alignItems: 'center', gap: spacing.two, marginTop: spacing.five },
});
