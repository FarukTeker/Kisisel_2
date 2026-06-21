import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
  edges?: Edge[];
};

/** SafeArea + paper background wrapper used by every screen. */
export function Screen({ children, padded = true, edges = ['top'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.root}>
      <View style={[styles.body, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  body: { flex: 1 },
  padded: { paddingHorizontal: spacing.four },
});
