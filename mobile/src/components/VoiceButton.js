import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const VoiceButton = ({
  onPress,
  isListening = false,
  size = 58,
  showLabel = false,
  label = 'Ask Voice Assistant',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: isListening ? COLORS.accent : COLORS.primaryLight,
            transform: [{ scale: pulseAnim }],
            opacity: isListening ? 0.4 : 0.2,
          },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.micButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isListening ? COLORS.accent : COLORS.primary,
          },
          SHADOWS.medium,
        ]}
      >
        <MaterialCommunityIcons
          name={isListening ? 'microphone' : 'microphone-outline'}
          size={size * 0.52}
          color={isListening ? COLORS.text : COLORS.white}
        />
      </TouchableOpacity>

      {showLabel && (
        <Text style={[styles.label, isListening && { color: COLORS.accent }]}>
          {isListening ? 'Listening...' : label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
  },
  micButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
  },
});

export default VoiceButton;
