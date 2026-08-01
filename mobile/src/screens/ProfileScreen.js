import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { USER_PROFILE } from '../constants/mockData';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  console.log("Current User:", user);
  const activeFarmer = user || USER_PROFILE;

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteAccount = async () => {
    await logout();
  };

  return (
    <ScreenWrapper withPadding={false} backgroundColor={COLORS.primary}>
      {/* Top Green Background Section */}
      <View style={styles.topGreenHeader}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Main Profile Body Container */}
      <View style={styles.bodyContainer}>
        {/* Dynamic User Card Container matching Figma ("Hi, Subash") */}
        <View style={[styles.userCard, SHADOWS.small]}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account-outline" size={44} color={COLORS.text} />
          </View>
          <Text style={styles.greetingText}>Hi, {activeFarmer.name}</Text>

          {/* Action Buttons Row matching Figma: Orange Logout & Red Delete Account */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={18} color={COLORS.text} style={{ marginRight: 4 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.deleteBtn}
              onPress={handleDeleteAccount}
            >
              <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topGreenHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  userCard: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.fertilizerOrange,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.sm,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.xs,
  },
  deleteText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
});

export default ProfileScreen;
