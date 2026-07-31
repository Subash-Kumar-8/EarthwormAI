import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

const getWeatherIcon = (condition) => {
  switch (condition?.toLowerCase()) {
    case "clear":
      return "weather-sunny";

    case "clouds":
      return "weather-cloudy";

    case "rain":
      return "weather-rainy";

    case "drizzle":
      return "weather-partly-rainy";

    case "thunderstorm":
      return "weather-lightning-rainy";

    case "snow":
      return "weather-snowy";

    case "mist":
    case "fog":
    case "haze":
      return "weather-fog";

    default:
      return "weather-partly-cloudy";
  }
};

export const WeatherAdvisoryScreen = ({ navigation }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);
  const loadWeather = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `http://192.168.137.198:3001/api/weather?lat=${latitude}&lon=${longitude}`
        ),
        fetch(
          `http://192.168.137.198:3001/api/weather/forecast?lat=${latitude}&lon=${longitude}`
        ),
      ]);
      const current = await currentRes.json();
      const forecastData = await forecastRes.json();
      if (current.success) {
        setWeather(current.weather);
      }
      if (forecastData.success) {
        setForecast(forecastData.forecast);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Forecast</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={[styles.todayCard, SHADOWS.small]}>
          <MaterialCommunityIcons
            name={getWeatherIcon(weather?.condition)}
            size={80}
            color="#FF9800"
          />
          <Text style={styles.todayTempText}>
            {weather?.temperature?.toFixed(0)}°
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {weather?.description}
          </Text>
          <Text
            style={{
              marginTop: 6,
              color: "#666",
            }}
          >
            Humidity: {weather?.humidity}%   Wind: {weather?.wind_speed} m/s
          </Text>
        </View>
        <View style={styles.listSection}>
          {forecast.map((item, index) => (
            <View key={index} style={styles.forecastListItem}>
              <View style={styles.itemLeftCol}>
                <Text style={styles.dayText}>
                  {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                  })}
                </Text>
                <Text style={styles.minTempText}>
                  {item.min_temp}° / {item.max_temp}°
                </Text>
              </View>
              <MaterialCommunityIcons
                name={getWeatherIcon(item.condition)}
                size={24}
                color="#FF9800"
              />
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.maxTempText}>
                    {item.condition}
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        color: "#777",
                    }}
                >
                    🌧 {item.rain_probability}%
                </Text>
              </View>
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
