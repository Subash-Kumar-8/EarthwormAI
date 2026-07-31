import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/theme';

export const AudioWave = ({ isListening = true, height = 24, color = COLORS.primary }) => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.8)).current;
  const anim3 = useRef(new Animated.Value(0.5)).current;
  const anim4 = useRef(new Animated.Value(0.9)).current;
  const anim5 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isListening) {
      const createWaveAnimation = (anim, duration, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration, useNativeDriver: true }),
          ])
        );
      };

      const animation = Animated.parallel([
        createWaveAnimation(anim1, 300, 0),
        createWaveAnimation(anim2, 350, 80),
        createWaveAnimation(anim3, 280, 160),
        createWaveAnimation(anim4, 400, 40),
        createWaveAnimation(anim5, 320, 120),
      ]);

      animation.start();

      return () => animation.stop();
    }
  }, [isListening]);

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: anim1 }] }]} />
      <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: anim2 }] }]} />
      <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: anim3 }] }]} />
      <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: anim4 }] }]} />
      <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY: anim5 }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 3.5,
    height: '100%',
    borderRadius: 2,
    marginHorizontal: 2.5,
  },
});

export default AudioWave;
