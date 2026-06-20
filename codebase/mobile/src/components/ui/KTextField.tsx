import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { KText } from '@/components/ui/KText';
import { colors, radius } from '@/theme/tokens';

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Labeled, icon-prefixed text field — ported from KTextField in AuthView.swift. */
export function KTextField({ label, icon, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <KText variant="label" color={colors.textMuted}>
        {label}
      </KText>
      <View style={styles.field}>
        {icon ? <Ionicons name={icon} size={18} color={colors.textSoft} style={styles.icon} /> : null}
        <TextInput
          placeholderTextColor={colors.textSoft}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.hairline,
  },
  icon: { width: 18 },
  input: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
});
