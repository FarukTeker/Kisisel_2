import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  selected?: boolean;
  editing?: boolean;
  style?: ViewStyle;
};

/**
 * Card surface — ported from KCardBackground in DesignSystem.swift.
 * selected → solid accent 2.5px; editing → dashed accent; else hairline.
 */
export function KCard({ children, selected = false, editing = false, style }: Props) {
  const borderColor = selected ? colors.accent : editing ? 'rgba(38,71,214,0.55)' : colors.inkBorder;
  const borderWidth = selected ? 2.5 : editing ? 2 : 1.2;
  return (
    <View
      style={[
        styles.card,
        {
          borderColor,
          borderWidth,
          borderStyle: editing && !selected ? 'dashed' : 'solid',
          shadowOpacity: selected ? 0.12 : 0.06,
          shadowRadius: selected ? 10 : 6,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
