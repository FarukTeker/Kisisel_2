import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { KText } from '@/components/ui/KText';
import { colors, radius, spacing } from '@/theme/tokens';

type Kind = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

type Props = {
  title: string;
  onPress: () => void;
  kind?: Kind;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

/** Pill-shaped action button — ported from KBtn in DesignSystem.swift. */
export function KButton({ title, onPress, kind = 'primary', icon, disabled, loading, style }: Props) {
  const fg = foreground(kind);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        kind === 'ghost' ? styles.ghost : styles.full,
        { backgroundColor: background(kind) },
        borderFor(kind),
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={15} color={fg} /> : null}
          <KText variant="button" color={fg}>
            {title}
          </KText>
        </View>
      )}
    </Pressable>
  );
}

function background(kind: Kind): string {
  switch (kind) {
    case 'primary':
      return colors.ink;
    case 'secondary':
    case 'destructive':
      return colors.surface;
    default:
      return 'transparent';
  }
}
function foreground(kind: Kind): string {
  switch (kind) {
    case 'primary':
      return colors.surface;
    case 'ghost':
      return colors.accent;
    case 'destructive':
      return colors.danger;
    default:
      return colors.ink;
  }
}
function borderFor(kind: Kind): ViewStyle {
  if (kind === 'outline' || kind === 'secondary') return { borderWidth: 1.5, borderColor: colors.ink };
  if (kind === 'destructive') return { borderWidth: 1.5, borderColor: colors.danger };
  return {};
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { paddingHorizontal: spacing.four, alignSelf: 'stretch' },
  ghost: { paddingHorizontal: spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
