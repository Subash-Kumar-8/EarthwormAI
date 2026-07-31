import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export const Card = ({
  children,
  style,
  onPress,
  variant = 'elevated', // 'elevated' | 'outlined' | 'flat'
  padding = SPACING.md,
  borderRadius = RADIUS.md,
  accentColor,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.small,
        };
      case 'outlined':
        return {
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
        };
      case 'flat':
        return {
          backgroundColor: COLORS.surfaceVariant,
        };
      default:
        return {
          backgroundColor: COLORS.surface,
          ...SHADOWS.small,
        };
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[
        styles.card,
        getCardStyle(),
        { padding, borderRadius },
        accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        style,
      ]}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.xs,
    overflow: 'hidden',
  },
});

export default Card;
