import { StyleSheet, View } from 'react-native';

import { KText } from '@/components/ui/KText';
import { radius } from '@/theme/tokens';

export type AiStatus = { kind: 'loading' } | { kind: 'live' } | { kind: 'preview'; label: string };

/** AI-summary status pill — ported from KAiStatusPill in DesignSystem.swift. */
export function KAiStatusPill({ status }: { status: AiStatus }) {
  const s = styleFor(status);
  return (
    <View style={[styles.pill, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <KText variant="caption" color={s.fg} style={styles.label}>
        {s.label}
      </KText>
    </View>
  );
}

function styleFor(status: AiStatus) {
  switch (status.kind) {
    case 'loading':
      return { label: 'Generating…', dot: '#D1D5DB', bg: '#F9FAFB', fg: '#9CA3AF', border: '#E5E7EB' };
    case 'live':
      return { label: 'AI summary', dot: '#059669', bg: '#F0FDF4', fg: '#15803D', border: '#BBF7D0' };
    case 'preview':
      return { label: status.label, dot: '#2563EB', bg: '#EFF6FF', fg: '#2563EB', border: '#BFDBFE' };
  }
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontWeight: '700' },
});
