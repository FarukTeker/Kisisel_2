import { StyleSheet, View } from 'react-native';

import { KText } from '@/components/ui/KText';
import { categoryBg, categoryFg, radius } from '@/theme/tokens';

/** Uppercase category pill — ported from KCategoryPill in DesignSystem.swift. */
export function KCategoryPill({ category }: { category: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: categoryBg(category) }]}>
      <KText variant="pill" color={categoryFg(category)}>
        {category.toUpperCase()}
      </KText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
