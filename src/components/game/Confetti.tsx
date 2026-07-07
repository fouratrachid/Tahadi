import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const PALETTE = [
  Colors.accent,
  Colors.amber,
  Colors.player1,
  Colors.player2,
  Colors.warn,
  '#A78BFA',
];

const COUNT = 44;

function Piece({ screenW, screenH }: { screenW: number; screenH: number }) {
  const startX = Math.random() * screenW;
  const size = 6 + Math.random() * 8;
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  const fallDuration = 2400 + Math.random() * 2200;
  const delay = Math.random() * 1500;
  const drift = (Math.random() - 0.5) * 80;

  const y = useSharedValue(-40);
  const rot = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(screenH + 60, { duration: fallDuration, easing: Easing.linear }), -1, false),
    );
    rot.value = withRepeat(
      withTiming(360, { duration: 1200 + Math.random() * 1200, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          width: size,
          height: size * 0.6,
          marginStart: drift,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** Lightweight celebratory confetti — no third-party dependency. */
export function Confetti() {
  const { width, height } = useWindowDimensions();
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Piece key={i} screenW={width} screenH={height} />
      ))}
    </Animated.View>
  );
}
