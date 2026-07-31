import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export const ScreenWrapper = ({
  children,
  style,
  backgroundColor = COLORS.background,
  statusBarStyle = 'dark',
  withPadding = true,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      <StatusBar style={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={[styles.content, withPadding && styles.padding]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 16,
  },
});

export default ScreenWrapper;
