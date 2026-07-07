import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { Colors, FontSize } from '@/constants/theme';
import { toAr } from '@/i18n/ar';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 1 → 0 remaining fraction (UI-thread shared value). */
  progress: SharedValue<number>;
  seconds: number;
  size?: number;
}

/** Circular countdown that depletes and shifts green → yellow → red. */
export function CountdownRing({ progress, seconds, size = 190 }: Props) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const animatedProps = useAnimatedProps(() => {
    const p = Math.max(0, Math.min(1, progress.value));
    return {
      strokeDashoffset: circumference * (1 - p),
      stroke: interpolateColor(
        p,
        [0, 0.33, 0.66],
        [Colors.timerRed, Colors.timerYellow, Colors.timerGreen],
      ),
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={Colors.surfaceAlt}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText weight="black" size={FontSize.display} center>
        {toAr(seconds)}
      </AppText>
    </View>
  );
}
