import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Screen } from '@/components/screen';
import { KButton } from '@/components/ui/KButton';
import { KText } from '@/components/ui/KText';
import { useAppStore } from '@/features/store/appStore';
import { colors, spacing } from '@/theme/tokens';

const { width } = Dimensions.get('window');

type Page = { icon: keyof typeof Ionicons.glyphMap; title: string; body: string };

const PAGES: Page[] = [
  {
    icon: 'grid-outline',
    title: 'Compose your own front page',
    body: 'Add, move, and resize widgets to build a newspaper that reflects exactly what you care about.',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI summaries, real sources',
    body: 'Every story pairs an AI-generated preview with clear publisher attribution — skim fast, verify deeper.',
  },
  {
    icon: 'shuffle-outline',
    title: 'Designed serendipity',
    body: 'Popular and Random widgets pull you outside your usual interests on purpose — no filter bubble by default.',
  },
  {
    icon: 'people-outline',
    title: 'Share, follow, and remix',
    body: 'Publish your layout, follow curators you trust, and fork any newspaper as a starting point for your own.',
  },
];

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Page>>(null);
  const isLast = index === PAGES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (isLast) void completeOnboarding();
    else listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <Screen padded={false}>
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(p) => p.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={46} color={colors.accent} />
            </View>
            <KText variant="h1" style={styles.title}>
              {item.title}
            </KText>
            <KText variant="body" color={colors.textMuted} style={styles.body}>
              {item.body}
            </KText>
          </View>
        )}
      />

      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View key={p.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <KButton title={isLast ? 'Get started' : 'Continue'} onPress={next} />
        {!isLast ? (
          <Pressable onPress={() => void completeOnboarding()} style={styles.skip}>
            <KText variant="label" color={colors.textMuted}>
              Skip
            </KText>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.six, gap: spacing.five },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center' },
  body: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: spacing.four },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.inkBorderStrong },
  dotActive: { backgroundColor: colors.ink, width: 18 },
  footer: { paddingHorizontal: spacing.six, paddingBottom: spacing.six, gap: spacing.three },
  skip: { alignSelf: 'center', padding: spacing.two },
});
