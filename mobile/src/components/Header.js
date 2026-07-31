import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const Header = ({
  title,
  subtitle,
  onBackPress,
  rightIcon,
  onRightPress,
  isDashboard = false,
  farmerName = 'Ramesh',
  location = 'Ludhiana, PB',
}) => {
  if (isDashboard) {
    return (
      <View style={styles.dashboardContainer}>
        <View style={styles.leftSection}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={24} color={COLORS.white} />
          </View>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greetingText}>Namaste, {farmerName} 👋</Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={onRightPress}
        >
          <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.text} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.standardContainer}>
      {onBackPress ? (
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBackPress}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderButton} />
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.rightButton}
          activeOpacity={0.7}
          onPress={onRightPress}
        >
          <MaterialCommunityIcons name={rightIcon} size={22} color={COLORS.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderButton} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.transparent,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  standardContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.transparent,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderButton: {
    width: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default Header;
