import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WidgetCard } from '@/components/WidgetCard';
import { KButton } from '@/components/ui/KButton';
import { KEyebrow } from '@/components/ui/KEyebrow';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { fromBackendWidget } from '@/features/store/widget-map';
import type { FeedWidget } from '@/features/store/types';
import { colors, spacing } from '@/theme/tokens';
import type { SharedNewspaper } from '@/lib/types';

export default function PublicNewspaperModal() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const openShared = useAppStore((s) => s.openShared);
  const loadArticles = useAppStore((s) => s.loadArticles);
  const isFollowing = useAppStore((s) => s.isFollowing(slug ?? ''));
  const toggleFollow = useAppStore((s) => s.toggleFollow);
  const forkNewspaper = useAppStore((s) => s.forkNewspaper);

  const [data, setData] = useState<SharedNewspaper | null>(null);
  const [widgets, setWidgets] = useState<FeedWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [forked, setForked] = useState(false);

  useEffect(() => {
    let active = true;
    if (!slug) return;
    (async () => {
      try {
        const np = await openShared(slug);
        if (!active) return;
        setData(np);
        const fw = np.widgets.map((w, i) => fromBackendWidget(w, i)).sort((a, b) => a.order - b.order);
        setWidgets(fw);
        const used = new Set(fw.map((w) => w.sourceId).filter(Boolean) as string[]);
        used.forEach((id) => void loadArticles(id));
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, openShared, loadArticles]);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <KText variant="button" color={colors.textMuted}>
            Close
          </KText>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing.six }} color={colors.ink} />
      ) : error || !data ? (
        <KText variant="body" color={colors.textMuted} style={styles.center}>
          Newspaper not found.
        </KText>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <KEyebrow text={`Curated by ${data.curator?.name ?? 'a curator'}`} />
            <KText variant="display">{data.name}</KText>
            <View style={styles.metaRow}>
              <Ionicons name="grid-outline" size={13} color={colors.textSoft} />
              <KText variant="caption" color={colors.textSoft}>
                {widgets.length} widgets
              </KText>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <KButton
                title={isFollowing ? 'Following' : 'Follow'}
                icon={isFollowing ? 'checkmark' : 'add'}
                kind={isFollowing ? 'secondary' : 'primary'}
                onPress={() => void toggleFollow(slug!)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <KButton
                title={forked ? 'Forked into yours' : 'Fork layout'}
                icon={forked ? 'checkmark' : 'git-branch-outline'}
                kind="outline"
                onPress={async () => {
                  await forkNewspaper(data);
                  setForked(true);
                }}
              />
            </View>
          </View>

          <View style={{ gap: spacing.four }}>
            {widgets.map((w) => (
              <WidgetCard key={w.id} widget={w} isEditable={false} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  bar: { paddingHorizontal: spacing.four, paddingVertical: spacing.three },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.four },
  header: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actions: { flexDirection: 'row', gap: spacing.three },
  center: { textAlign: 'center', marginTop: spacing.six },
});
