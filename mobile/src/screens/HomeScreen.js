import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import EarthwormLogo from '../components/EarthwormLogo';
import ScreenWrapper from '../components/ScreenWrapper';
import { FERTILIZER_STORES, HOME_WEATHER } from '../constants/mockData';
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

export const HomeScreen = ({ navigation }) => {
  const [locationName, setLocationName] = useState(HOME_WEATHER.location);
  const [weather, setWeather] = useState({
    temp: HOME_WEATHER.temp,
    condition: HOME_WEATHER.condition,
    description: "",
  });
  const [locationCoords, setLocationCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyShops, setNearbyShops] = useState([]);
  const handleUpdateLocation = async () => {
    setIsLocating(true);
    let latitude;
    let longitude;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Earthworm AI requires location access to fetch hyper-local weather alerts and mandi prices for your farm."
        );
        return;
      }
      console.log("✅ Location permission granted");
    } catch (err) {
      console.error("❌ Permission Error:", err);
      Alert.alert("Error", "Unable to request location permission.");
      return;
    }
    try {
      console.log("📍 Fetching current GPS location...");
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      latitude = currentPos.coords.latitude;
      longitude = currentPos.coords.longitude;
      setLocationCoords({ latitude, longitude });
      console.log(
        `✅ GPS Location: ${latitude}, ${longitude}`
      );
    } catch (err) {
      console.error("❌ GPS Error:", err);
      Alert.alert(
        "Location Error",
        "Please enable GPS and try again."
      );
      return;
    }
    try {
      console.log("🏪 Fetching nearby agri shops...");
      const response = await fetch(
        `http://192.168.137.198:3001/api/nearby/agri-shops?lat=${latitude}&lon=${longitude}`
      );
      const shops = await response.json();
      setNearbyShops(shops);
      console.log("✅ Nearby Shops:", shops);
    } catch (err) {
      console.error("❌ Nearby Shops Error:", err);
    }
    try {
      console.log("🌦 Fetching weather...");
      const weatherResponse = await fetch(
        `http://192.168.137.198:3001/api/weather?lat=${latitude}&lon=${longitude}`
      );
      const weatherData = await weatherResponse.json();
      if (weatherData.success) {
        setWeather({
          temp: Math.round(weatherData.weather.temperature),
          condition: weatherData.weather.condition,
          description: weatherData.weather.description,
        });
        console.log("✅ Weather:", weatherData.weather);
      }
    } catch (err) {
      console.error("❌ Weather API Error:", err);
    }
    try {
      console.log("🗺 Reverse geocoding...");
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const city =
          place.city ||
          place.subregion ||
          place.district ||
          "Unknown";
        const region =
          place.region ||
          place.country ||
          "India";
        setLocationName(
          `${city}, ${region} (${latitude.toFixed(
            2
          )}°, ${longitude.toFixed(2)}°)`
        );
      } else {
        setLocationName(
          `Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}°`
        );
      }
      console.log("✅ Reverse geocoding completed");
    } catch (err) {
      console.error("❌ Reverse Geocoding Error:", err);
      setLocationName(
        `Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}°`
      );
    }
    try {
      Alert.alert(
        "GPS Location Updated!",
        `Latitude: ${latitude}\nLongitude: ${longitude}`
      );
    } catch (err) {
      console.error("❌ Alert Error:", err);
    }
    setIsLocating(false);
  };

  return (
    <ScreenWrapper withPadding={false} backgroundColor={COLORS.primary}>
      <View style={styles.topHeader}>
        <View style={styles.logoTitleRow}>
          <EarthwormLogo size={36} badge={true} />
          <Text style={styles.dashboardTitle}>Dashboard</Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('WeatherTab')}
          >
            <View style={[styles.weatherCard, SHADOWS.small]}>
              <View style={styles.weatherTextCol}>
                <Text style={styles.weatherSubtitle}>Today's Weather</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </View>
              <View style={styles.weatherTempRow}>
                <Text style={styles.weatherTempText}>{weather.temp}°</Text>
                <MaterialCommunityIcons name={getWeatherIcon(weather.condition)} size={40} color="#FF9800" />
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.cameraScanCard, SHADOWS.small]}
            onPress={() => navigation.navigate('DiseaseDetectionScreen')}
          >
            <View style={styles.cameraIconBox}>
              <MaterialCommunityIcons name="camera" size={28} color={COLORS.white} />
            </View>
            <View style={styles.cameraTextCol}>
              <Text style={styles.cameraTitle}>Scan Crop Disease</Text>
              <Text style={styles.cameraSub}>Take leaf photo for AI instant prediction</Text>
            </View>
            <View style={styles.cameraArrowPill}>
              <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
          <Card variant="flat" style={styles.locationCard} padding={SPACING.md}>
            <View style={styles.locationHeaderRow}>
              <Text style={styles.locationTitle}>Update Location</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isLocating}
                style={styles.updatePillBtn}
                onPress={handleUpdateLocation}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color={COLORS.text} />
                ) : (
                  <Text style={styles.updatePillText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.locationDetailRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color={COLORS.primary} />
              <Text style={styles.locationNameText}>{locationName}</Text>
            </View>

            {locationCoords && (
              <View style={styles.coordsBadgeBox}>
                <Text style={styles.coordsText}>
                  📍 GPS Coords: Lat {locationCoords.latitude.toFixed(4)}, Lon {locationCoords.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </Card>
          <View style={styles.diagnosticsContainer}>
            <Text style={styles.diagnosticsHeaderTitle}>Fertilizer Shops Near You</Text>
            <View style={styles.diagnosticsList}>
              {nearbyShops.length === 0 ? (
                <Text>No nearby fertilizer shops found.</Text>
              ) : (
                  nearbyShops.map((shop, index) => (
                      <View key={index} style={styles.storeItemBox}>
                          <MaterialCommunityIcons
                              name="store-outline"
                              size={18}
                              color={COLORS.primaryDark}
                          />
                          <View style={styles.storeTextCol}>
                              <Text style={styles.storeNameText}>
                                  {shop.name}
                              </Text>
                              <Text style={styles.storeDescText}>
                                  {shop.address}
                              </Text>
                              <Text style={styles.storeDescText}>
                                  {shop.distance} km away
                              </Text>
                          </View>
                      </View>
                  ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm + 4,
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  weatherCard: {
    backgroundColor: COLORS.weatherPeach,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  weatherTextCol: {
    justifyContent: 'center',
  },
  weatherSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  weatherCondition: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherTempText: {
    fontSize: TYPOGRAPHY.fontSize.display - 4,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginRight: 8,
  },
  cameraScanCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cameraIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
  },
  cameraTextCol: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  cameraSub: {
    fontSize: TYPOGRAPHY.fontSize.xs - 1,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  cameraArrowPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  updatePillBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    minWidth: 64,
    alignItems: 'center',
  },
  updatePillText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationNameText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  coordsBadgeBox: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    padding: 6,
    borderRadius: RADIUS.xs,
  },
  coordsText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  diagnosticsContainer: {
    backgroundColor: COLORS.fertilizerOrange,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  diagnosticsHeaderTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  diagnosticsList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
  },
  storeItemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  storeTextCol: {
    flex: 1,
    marginLeft: SPACING.xs + 2,
  },
  storeNameText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  storeDescText: {
    fontSize: TYPOGRAPHY.fontSize.xs - 1,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;
