import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { KText } from '@/components/ui/KText';
import { colors, radius } from '@/theme/tokens';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 'pill' = separate capsule buttons (reading mode); 'group' = joined segmented (size). */
  variant?: 'pill' | 'group';
};

export function Segmented<T extends string>({ options, value, onChange, variant = 'pill' }: Props<T>) {
  if (variant === 'group') {
    return (
      <View style={styles.group}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.groupItem, active && styles.groupItemActive]}>
              <KText variant="label" color={active ? colors.ink : colors.textMuted}>
                {opt.label}
              </KText>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.pillRow}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.pill,
              { backgroundColor: active ? colors.ink : colors.surface, borderColor: active ? 'transparent' : colors.inkBorderStrong },
            ]}>
            {opt.icon ? <Ionicons name={opt.icon} size={13} color={active ? colors.surface : colors.ink} /> : null}
            <KText variant="label" color={active ? colors.surface : colors.ink}>
              {opt.label}
            </KText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.2,
  },
  group: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.sm,
    padding: 3,
    gap: 3,
  },
  groupItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.sm - 2,
  },
  groupItemActive: { backgroundColor: colors.surface },
});
