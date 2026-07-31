import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { authService } from '../services/authService';

export const OTPVerificationScreen = ({ route, navigation }) => {
  const phoneNumber = route.params?.phoneNumber || '+91 98765 43210';
  const [otp, setOtp] = useState(['5', '2', '8', '0']);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChangeText = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await authService.verifyOTP(phoneNumber, otp.join(''));
      navigation.replace('MainApp');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header onBackPress={() => navigation.goBack()} title="Verify OTP" />

      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="shield-check-outline" size={48} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent to{' '}
          <Text style={styles.phoneHighlight}>{phoneNumber}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend code in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendBtn}>Resend OTP Code</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          size="lg"
          style={styles.verifyBtn}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  phoneHighlight: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: SPACING.xl,
  },
  otpInput: {
    width: 56,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  resendRow: {
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  resendBtn: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  verifyBtn: {
    width: '100%',
  },
});

export default OTPVerificationScreen;
