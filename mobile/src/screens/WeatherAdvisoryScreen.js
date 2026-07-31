import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { HOME_WEATHER, WEATHER_FORECAST } from '../constants/mockData';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const WeatherAdvisoryScreen = ({ navigation }) => {
  return (
    <ScreenWrapper>
      {/* Back Navigation Header matching Figma */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Forecast</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Today Main Card */}
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={[styles.todayCard, SHADOWS.small]}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={80} color="#FF9800" />
          <Text style={styles.todayTempText}>{HOME_WEATHER.temp}°</Text>
        </View>

        {/* Daily Forecast List Items matching Figma */}
        <View style={styles.listSection}>
          {WEATHER_FORECAST.map((item, index) => (
            <View key={index} style={styles.forecastListItem}>
              <View style={styles.itemLeftCol}>
                <Text style={styles.dayText}>{item.day}</Text>
                <Text style={styles.minTempText}>Min: {item.minTemp}</Text>
              </View>
              <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#FF9800" />
              <Text style={styles.maxTempText}>{item.maxTemp}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  todayCard: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  todayTempText: {
    fontSize: TYPOGRAPHY.fontSize.display + 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  listSection: {
    marginTop: SPACING.md,
  },
  forecastListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemLeftCol: {
    flex: 1,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  minTempText: {
    fontSize: TYPOGRAPHY.fontSize.xs - 1,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  maxTempText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
});

export default WeatherAdvisoryScreen;
