import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import Card from './Card';

export const WeatherCard = ({
  weatherData,
  onPress,
  compact = true,
}) => {
  const {
    location = 'Ludhiana, PB',
    temp = 29,
    feelsLike = 31,
    condition = 'Partly Cloudy',
    humidity = 62,
    windSpeed = '14 km/h',
    rainProbability = '15%',
    alert = 'Optimal condition for afternoon fertilizer application.',
  } = weatherData || {};

  if (compact) {
    return (
      <Card onPress={onPress} style={styles.compactCard} padding={SPACING.md}>
        <View style={styles.topRow}>
          <View style={styles.weatherLeft}>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <Text style={styles.tempText}>{temp}°C</Text>
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={56}
              color={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="water-percent" size={16} color={COLORS.primary} />
            <Text style={styles.statLabel}>Humidity: {humidity}%</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="weather-rainy" size={16} color={COLORS.info} />
            <Text style={styles.statLabel}>Rain: {rainProbability}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="weather-windy" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statLabel}>{windSpeed}</Text>
          </View>
        </View>

        {alert && (
          <View style={styles.alertBox}>
            <MaterialCommunityIcons name="shield-alert-outline" size={16} color={COLORS.warning} />
            <Text style={styles.alertText} numberOfLines={1}>
              {alert}
            </Text>
          </View>
        )}
      </Card>
    );
  }

  return (
    <Card style={styles.fullCard} padding={SPACING.lg}>
      <View style={styles.fullHeader}>
        <View>
          <Text style={styles.fullLocation}>{location}</Text>
          <Text style={styles.fullDate}>Today, Live Updates</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <MaterialCommunityIcons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.fullMainTemp}>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={72} color={COLORS.primary} />
        <View style={styles.fullTempColumn}>
          <Text style={styles.fullTempNumber}>{temp}°C</Text>
          <Text style={styles.fullCondition}>{condition}</Text>
          <Text style={styles.fullFeelsLike}>Feels like {feelsLike}°C</Text>
        </View>
      </View>

      <View style={styles.fullStatsGrid}>
        <View style={styles.fullStatBox}>
          <MaterialCommunityIcons name="water" size={20} color={COLORS.primary} />
          <Text style={styles.fullStatValue}>{humidity}%</Text>
          <Text style={styles.fullStatTitle}>Humidity</Text>
        </View>
        <View style={styles.fullStatBox}>
          <MaterialCommunityIcons name="weather-pouring" size={20} color={COLORS.info} />
          <Text style={styles.fullStatValue}>{rainProbability}</Text>
          <Text style={styles.fullStatTitle}>Rain Risk</Text>
        </View>
        <View style={styles.fullStatBox}>
          <MaterialCommunityIcons name="weather-windy" size={20} color={COLORS.textSecondary} />
          <Text style={styles.fullStatValue}>{windSpeed}</Text>
          <Text style={styles.fullStatTitle}>Wind Speed</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primaryLight,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherLeft: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tempText: {
    fontSize: TYPOGRAPHY.fontSize.display - 4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginVertical: 2,
  },
  conditionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceVariant,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    marginLeft: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    padding: SPACING.xs + 4,
    borderRadius: RADIUS.xs,
    marginTop: SPACING.sm,
  },
  alertText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.warning,
    marginLeft: 6,
    flex: 1,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  fullCard: {
    backgroundColor: COLORS.surface,
  },
  fullHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullLocation: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  fullDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  fullMainTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  fullTempColumn: {
    marginLeft: SPACING.md,
  },
  fullTempNumber: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  fullCondition: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  fullFeelsLike: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  fullStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  fullStatBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  fullStatValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: 4,
  },
  fullStatTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
});

export default WeatherCard;
