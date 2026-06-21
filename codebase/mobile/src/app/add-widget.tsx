import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { WIDGET_KIND_META, type WidgetKind } from '@/features/store/types';
import { colors, radius, spacing } from '@/theme/tokens';

const KINDS: WidgetKind[] = ['news', 'editorial', 'popular', 'random'];

export default function AddWidgetModal() {
  const router = useRouter();
  const baseSources = useAppStore((s) => s.sources);
  const customSources = useAppStore((s) => s.customSources);
  const sources = useMemo(() => [...baseSources, ...customSources], [baseSources, customSources]);
  const addWidget = useAppStore((s) => s.addWidget);

  const [kind, setKind] = useState<WidgetKind>('news');
  const [sourceId, setSourceId] = useState<string | undefined>(sources[0]?.id);

  const canAdd = kind !== 'news' || !!sourceId;

  const add = () => {
    addWidget(kind, kind === 'news' ? sourceId : undefined);
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <KText variant="button" color={colors.textMuted}>
            Cancel
          </KText>
        </Pressable>
        <KText variant="h3">Add widget</KText>
        <Pressable onPress={add} disabled={!canAdd} hitSlop={8}>
          <KText variant="button" color={canAdd ? colors.accent : colors.textSoft}>
            Add
          </KText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <KText variant="label" color={colors.textMuted}>
          WIDGET TYPE
        </KText>
        {KINDS.map((k) => {
          const active = kind === k;
          const meta = WIDGET_KIND_META[k];
          return (
            <Pressable
              key={k}
              onPress={() => {
                setKind(k);
                if (k === 'news' && !sourceId) setSourceId(sources[0]?.id);
              }}
              style={[styles.option, active && styles.optionActive]}>
              <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={22} color={active ? colors.accent : colors.textMuted} />
              <View style={{ flex: 1 }}>
                <KText variant="h3">{meta.label}</KText>
                <KText variant="caption" color={colors.textMuted}>
                  {meta.description}
                </KText>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}
            </Pressable>
          );
        })}

        {kind === 'news' ? (
          <>
            <KText variant="label" color={colors.textMuted} style={{ marginTop: spacing.three }}>
              SOURCE
            </KText>
            {sources.map((s) => {
              const active = sourceId === s.id;
              return (
                <Pressable key={s.id} onPress={() => setSourceId(s.id)} style={[styles.option, active && styles.optionActive]}>
                  <View style={{ flex: 1 }}>
                    <KText variant="h3">{s.name}</KText>
                    <KText variant="caption" color={colors.textMuted}>
                      {s.category ?? '—'}
                    </KText>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}
                </Pressable>
              );
            })}
          </>
        ) : null}
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
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.two },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.three,
    padding: spacing.three,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.inkBorder,
  },
  optionActive: { borderColor: colors.accent },
});
