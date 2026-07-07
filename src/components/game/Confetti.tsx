import { useEffect, useState } from 'react';
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

interface PieceConfig {
  startX: number;
  size: number;
  color: string;
  fallDuration: number;
  spinDuration: number;
  delay: number;
  drift: number;
}

function randomPiece(screenW: number): PieceConfig {
  return {
    startX: Math.random() * screenW,
    size: 6 + Math.random() * 8,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    fallDuration: 2400 + Math.random() * 2200,
    spinDuration: 1200 + Math.random() * 1200,
    delay: Math.random() * 1500,
    drift: (Math.random() - 0.5) * 80,
  };
}

function Piece({ screenW, screenH }: { screenW: number; screenH: number }) {
  const [{ startX, size, color, fallDuration, spinDuration, delay, drift }] = useState(() =>
    randomPiece(screenW),
  );

  const y = useSharedValue(-40);
  const rot = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(screenH + 60, { duration: fallDuration, easing: Easing.linear }), -1, false),
    );
    rot.value = withRepeat(
      withTiming(360, { duration: spinDuration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [y, rot, delay, screenH, fallDuration, spinDuration]);

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
