import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'outline' | 'text'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.divider;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.secondary;
      case 'accent': return COLORS.accent;
      case 'outline': return COLORS.transparent;
      case 'text': return COLORS.transparent;
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.text;
      case 'accent': return COLORS.text;
      case 'outline': return COLORS.primary;
      case 'text': return COLORS.primary;
      default: return COLORS.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? COLORS.border : COLORS.primary;
    }
    return COLORS.transparent;
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const containerPadding = isSmall
    ? { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.sm + 4 }
    : isLarge
    ? { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl }
    : { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg };

  const fontSize = isSmall
    ? TYPOGRAPHY.fontSize.sm
    : isLarge
    ? TYPOGRAPHY.fontSize.lg
    : TYPOGRAPHY.fontSize.md;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        containerPadding,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={fontSize + 2}
              color={getTextColor()}
              style={styles.iconLeft}
            />
          )}
          {title ? (
            <Text
              style={[
                styles.text,
                { color: getTextColor(), fontSize },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={fontSize + 2}
              color={getTextColor()}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.xs + 2,
  },
  iconRight: {
    marginLeft: SPACING.xs + 2,
  },
});

export default Button;
