import { Text, type TextProps } from 'react-native';

import { colors, type as typeScale } from '@/theme/tokens';

type Variant = keyof typeof typeScale;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
};

/** Themed text — maps the archive's Font.kisisel* scale to RN. */
export function KText({ variant = 'body', color = colors.ink, style, ...rest }: Props) {
  return <Text style={[typeScale[variant], { color }, style]} {...rest} />;
}
