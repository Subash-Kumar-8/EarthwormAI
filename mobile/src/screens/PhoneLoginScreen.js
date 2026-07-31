import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { authService } from '../services/authService';

export const PhoneLoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) return;
    setLoading(true);
    try {
      await authService.requestOTP(phone);
      navigation.navigate('OTPVerification', { phoneNumber: phone });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header onBackPress={() => navigation.goBack()} title="Phone Login" />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="cellphone-sound" size={48} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Enter Mobile Number</Text>
        <Text style={styles.subtitle}>
          We will send a 4-digit verification code to log you in instantly.
        </Text>

        <View style={styles.inputCard}>
          <Input
            label="Phone Number"
            placeholder="10-digit mobile number"
            icon="phone-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Button
            title="Send OTP Code"
            onPress={handleSendOTP}
            loading={loading}
            disabled={!phone || phone.length < 10}
            size="lg"
            icon="message-processing-outline"
            iconPosition="right"
            style={styles.btn}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: SPACING.md,
  },
  inputCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  btn: {
    marginTop: SPACING.md,
  },
});

export default PhoneLoginScreen;
