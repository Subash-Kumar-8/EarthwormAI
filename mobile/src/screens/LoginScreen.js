import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EarthwormLogo from '../components/EarthwormLogo';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both Username and Password.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch (e) {
      setErrorMessage('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={COLORS.primary}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoRow}>
            <EarthwormLogo size={42} badge={true} />
            <Text style={styles.headerTitle}>Login</Text>
          </View>
        </View>

        {/* Error Alert Box */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View style={styles.formSection}>
          <View style={styles.inputBox}>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              style={styles.textInput}
            />
          </View>

          {/* Password Input with Eye Symbol Toggle */}
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

          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* White Pill Login Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginPillButton}
          >
            <Text style={styles.loginPillText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footerRow}>
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign up</Text>
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
    marginBottom: SPACING.xl,
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
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs + 2,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginVertical: SPACING.xs,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  loginPillButton: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginPillText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  noAccountText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signupLink: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
