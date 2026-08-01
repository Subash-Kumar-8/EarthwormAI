import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EarthwormLogo from '../components/EarthwormLogo';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    setErrorMessage('');
    if (
      !name.trim() ||
      !mobileNo.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        phone: mobileNo.trim(),
        email: email.trim(),
        password,
      });
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMessage('This email is already registered.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setErrorMessage('Password should be at least 6 characters.');
          break;
        default:
          setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={COLORS.primary}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.logoRow}>
            <EarthwormLogo size={42} badge={true} />
            <Text style={styles.headerTitle}>Sign up</Text>
          </View>
        </View>
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        <View style={styles.formSection}>
          <View style={styles.inputBox}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              value={mobileNo}
              onChangeText={setMobileNo}
              placeholder="Mobile No"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="phone-pad"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputBox}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-Mail"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="email-address"
              style={styles.textInput}
            />
          </View>
          <View style={[styles.inputBox, styles.passwordBox]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry={!showPassword}
              style={[styles.textInput, { flex: 1 }]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputBox, styles.passwordBox]}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="ConfirmPassword"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              secureTextEntry={!showConfirmPassword}
              style={[styles.textInput, { flex: 1 }]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeBtn}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCreateAccount}
            disabled={loading}
            style={styles.createPillButton}
          >
            <Text style={styles.createPillText}>
              {loading ? 'Creating...' : 'Create account'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.alreadyText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm + 4,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 235, 238, 0.9)',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  inputBox: {
    backgroundColor: COLORS.inputDark,
    borderRadius: RADIUS.md,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    marginVertical: 6,
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
  eyeBtn: {
    padding: 4,
  },
  createPillButton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  createPillText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  alreadyText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
