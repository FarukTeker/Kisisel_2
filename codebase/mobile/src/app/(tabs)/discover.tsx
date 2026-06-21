import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiscoverCard } from '@/components/DiscoverCard';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { colors, radius, spacing } from '@/theme/tokens';

export default function DiscoverScreen() {
  const discover = useAppStore((s) => s.discover);
  const followedSlugs = useAppStore((s) => s.followedSlugs);
  const [query, setQuery] = useState('');
  const [followingOnly, setFollowingOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = discover
    .filter((n) => (followingOnly ? followedSlugs.includes(n.slug) : true))
    .filter((n) =>
      !q
        ? true
        : n.name.toLowerCase().includes(q) || (n.curator ?? '').toLowerCase().includes(q),
    );

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <KText variant="h1">Newspapers worth a look</KText>
          <KText variant="body" color={colors.textMuted}>
            Curated front pages from people you may not already follow — open one, follow its author,
            or fork its layout as your own starting point.
          </KText>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textSoft} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or curator"
            placeholderTextColor={colors.textSoft}
            autoCapitalize="none"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filters}>
          <FilterPill label="All" active={!followingOnly} onPress={() => setFollowingOnly(false)} />
          <FilterPill
            label={`Following (${followedSlugs.length})`}
            active={followingOnly}
            onPress={() => setFollowingOnly(true)}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search" size={30} color={colors.textSoft} />
            <KText variant="h3">{emptyTitle(q, followingOnly)}</KText>
            <KText variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
              {emptySubtitle(q, followingOnly)}
            </KText>
          </View>
        ) : (
          <View style={{ gap: spacing.four }}>
            {filtered.map((n) => (
              <DiscoverCard key={n.slug} item={n} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? 'transparent' : colors.inkBorderStrong },
      ]}>
      <KText variant="label" color={active ? colors.surface : colors.ink}>
        {label}
      </KText>
    </Pressable>
  );
}

function emptyTitle(q: string, following: boolean): string {
  if (q) return `Nothing matches "${q}"`;
  return following ? "You're not following anyone yet" : 'No newspapers published yet';
}
function emptySubtitle(q: string, following: boolean): string {
  if (q) return 'Try another name or curator.';
  return following ? 'Open a newspaper and tap Follow to add it here.' : 'Check back soon — curators are still composing.';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.four, paddingBottom: spacing.six, gap: spacing.four },
  header: { gap: 6 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.two,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.hairline,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
  filters: { flexDirection: 'row', gap: spacing.two },
  filterPill: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.2 },
  empty: { alignItems: 'center', gap: spacing.two, paddingVertical: spacing.six },
});
