import { KText } from '@/components/ui/KText';
import { colors } from '@/theme/tokens';

/** Uppercase tracked eyebrow label — ported from KEyebrow in DesignSystem.swift. */
export function KEyebrow({ text, color = colors.accent }: { text: string; color?: string }) {
  return (
    <KText variant="caption" color={color} style={{ fontWeight: '800', letterSpacing: 1.1 }}>
      {text.toUpperCase()}
    </KText>
  );
}
