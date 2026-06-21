import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { KCard } from '@/components/ui/KCard';
import { KEyebrow } from '@/components/ui/KEyebrow';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { colors, radius, spacing } from '@/theme/tokens';
import type { DiscoverItem } from '@/lib/types';

export function DiscoverCard({ item }: { item: DiscoverItem }) {
  const router = useRouter();
  const isFollowing = useAppStore((s) => s.isFollowing(item.slug));

  const editorialCount = item.widgets.filter((w) => w.kind === 'editorial').length;
  const discoveryCount = item.widgets.filter((w) => w.kind === 'popular' || w.kind === 'random').length;
  const mix =
    editorialCount > 0 && discoveryCount > 0
      ? 'Editorial + discovery mix'
      : editorialCount > 0
        ? 'Includes curator notes'
        : discoveryCount > 0
          ? 'Includes discovery picks'
          : 'Source-led reading stack';

  return (
    <Pressable onPress={() => router.push({ pathname: '/newspaper/[slug]', params: { slug: item.slug } })}>
      <KCard>
        <View style={styles.inner}>
          <View style={styles.head}>
            <View style={{ flex: 1, gap: 4 }}>
              <KEyebrow text={mix} />
              <KText variant="h2">{item.name}</KText>
              {item.curator ? (
                <KText variant="caption" color={colors.textMuted}>
                  Curated by {item.curator}
                </KText>
              ) : null}
            </View>
            {isFollowing ? (
              <View style={styles.followingPill}>
                <KText variant="pill" color={colors.accent}>
                  FOLLOWING
                </KText>
              </View>
            ) : null}
          </View>

          <View style={styles.statRow}>
            <Stat icon="grid-outline" label={`${item.widgetCount} widgets`} />
          </View>

          <View style={styles.cta}>
            <KText variant="caption" color={colors.accent} style={{ fontWeight: '700' }}>
              Open newspaper
            </KText>
            <Ionicons name="arrow-forward" size={13} color={colors.accent} />
          </View>
        </View>
      </KCard>
    </Pressable>
  );
}

function Stat({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={13} color={colors.textSoft} />
      <KText variant="caption" color={colors.textSoft}>
        {label}
      </KText>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { padding: spacing.four, gap: spacing.three },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.three },
  followingPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
  },
  statRow: { flexDirection: 'row', gap: spacing.four },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
});
