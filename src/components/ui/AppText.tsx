import { Text, type TextProps } from 'react-native';

import { Colors, Fonts, FontSize } from '@/constants/theme';

type Weight = keyof typeof Fonts;

interface Props extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
  center?: boolean;
}

/** App-wide text: Cairo font, RTL writing direction, sensible defaults. */
export function AppText({
  weight = 'regular',
  size = FontSize.md,
  color = Colors.text,
  center = false,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: Fonts[weight],
          fontSize: size,
          color,
          writingDirection: 'rtl',
          textAlign: center ? 'center' : 'right',
        },
        style,
      ]}
    />
  );
}
