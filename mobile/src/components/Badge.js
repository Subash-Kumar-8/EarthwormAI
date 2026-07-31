import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const Badge = ({
  label,
  variant = 'success', // 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral'
  icon,
  size = 'md', // 'sm' | 'md'
  style,
  textStyle,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: COLORS.primaryLight, text: COLORS.primary };
      case 'warning':
        return { bg: COLORS.warningLight, text: COLORS.warning };
      case 'danger':
        return { bg: COLORS.dangerLight, text: COLORS.danger };
      case 'info':
        return { bg: COLORS.infoLight, text: COLORS.info };
      case 'accent':
        return { bg: COLORS.accentLight, text: COLORS.accent };
      case 'neutral':
        return { bg: COLORS.surfaceVariant, text: COLORS.textSecondary };
      default:
        return { bg: COLORS.primaryLight, text: COLORS.primary };
    }
  };

  const colors = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingVertical: isSmall ? 2 : SPACING.xs,
          paddingHorizontal: isSmall ? SPACING.xs + 2 : SPACING.sm,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={isSmall ? 12 : 14}
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? TYPOGRAPHY.fontSize.xs - 1 : TYPOGRAPHY.fontSize.xs,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
  },
  icon: {
    marginRight: 3,
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default Badge;
