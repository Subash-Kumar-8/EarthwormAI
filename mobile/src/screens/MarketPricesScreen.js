import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useLocation } from '../context/locationContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const MarketPricesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] =
    useState('Food Crops');

  const [searchQuery, setSearchQuery] = useState('');

  const [marketData, setMarketData] = useState({
    foodCrops: [],
    cashCrops: [],
  });

  const [loading, setLoading] = useState(true);

  const { locationCoords } = useLocation();

  const lastMarketLocation = useRef(null);

  useEffect(() => {
    if (!locationCoords) {
      return;
    }

    const { latitude, longitude } = locationCoords;

    // Prevent unnecessary API calls when location hasn't
    // meaningfully changed.
    if (lastMarketLocation.current) {
      const {
        latitude: lastLat,
        longitude: lastLon,
      } = lastMarketLocation.current;

      const latDiff = Math.abs(latitude - lastLat);
      const lonDiff = Math.abs(longitude - lastLon);

      if (latDiff < 0.001 && lonDiff < 0.001) {
        return;
      }
    }

    lastMarketLocation.current = {
      latitude,
      longitude,
    };

    fetchMarketPrices(latitude, longitude);

  }, [locationCoords]);

  const fetchMarketPrices = async (latitude, longitude) => {
    try {
      if (
        latitude === undefined ||
        longitude === undefined ||
        latitude === null ||
        longitude === null
      ) {
        console.log("📍 Location not available yet");
        return;
      }

      console.log(
        "📡 Fetching market prices:",
        latitude,
        longitude
      );

      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/market?lat=${latitude}&lon=${longitude}&limit=50`
      );

      const data = await response.json();

      console.log(
        "📊 Market API Response:",
        JSON.stringify(data, null, 2)
      );

      if (data.success) {
        setMarketData({
          foodCrops: data.foodCrops || [],
          cashCrops: data.cashCrops || [],
        });

        console.log(
          "🍚 Food crops:",
          data.foodCrops?.length || 0
        );

        console.log(
          "💰 Cash crops:",
          data.cashCrops?.length || 0
        );

      } else {
        console.log(
          "❌ Market API Error:",
          data.message
        );

        setMarketData({
          foodCrops: [],
          cashCrops: [],
        });
      }

    } catch (error) {
      console.error(
        "❌ Market Fetch Error:",
        error
      );

      setMarketData({
        foodCrops: [],
        cashCrops: [],
      });

    } finally {
      setLoading(false);
    }
  };

  /*
   * Select Food Crops / Cash Crops
   */
  const crops =
    selectedCategory === "Food Crops"
      ? marketData.foodCrops
      : marketData.cashCrops;

  /*
   * Search only.
   *
   * Previous-day comparison and increase/decrease
   * filtering have been completely removed.
   */
  const filteredCrops = crops.filter((crop) =>
    (crop.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenWrapper>

      {/* Header */}
      <View style={styles.headerRow}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Market Prices
        </Text>

      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading Market Prices...
          </Text>
        </View>
      ) : (

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Page Title */}
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>
              Market Prices
            </Text>
          </View>

          {/* Category Pills */}
          <View style={styles.categoriesRow}>

            <TouchableOpacity
              style={[
                styles.categoryPill,
                selectedCategory === 'Food Crops' &&
                  styles.activeCategoryPill,
              ]}
              onPress={() =>
                setSelectedCategory('Food Crops')
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'Food Crops' &&
                    styles.activeCategoryText,
                ]}
              >
                Food Crops
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryPill,
                selectedCategory === 'Cash Crops' &&
                  styles.activeCategoryPill,
              ]}
              onPress={() =>
                setSelectedCategory('Cash Crops')
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'Cash Crops' &&
                    styles.activeCategoryText,
                ]}
              >
                Cash Crops
              </Text>
            </TouchableOpacity>

          </View>

          {/* Search */}
          <View style={styles.searchBarBox}>

            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={COLORS.textMuted}
            />

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search the crops..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />

          </View>

          {/* Results Count */}
          <Text style={styles.resultsText}>
            {filteredCrops.length} crops available
          </Text>

          {/* Crop List */}
          <View style={styles.cropList}>

            {filteredCrops.length === 0 ? (

              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="leaf-off"
                  size={40}
                  color={COLORS.textMuted}
                />

                <Text style={styles.emptyText}>
                  No crops found
                </Text>
              </View>

            ) : (

              filteredCrops.map((item) => (

                <View
                  key={item.id}
                  style={styles.cropCardItem}
                >

                  {/* Crop Name */}
                  <View style={styles.cropLeftCol}>

                    <Text style={styles.cropName}>
                      {item.name}
                    </Text>

                    <Text style={styles.marketName}>
                      {item.market}
                    </Text>

                  </View>

                  {/* Price */}
                  <View style={styles.cropRightCol}>

                    <Text style={styles.cropPriceText}>
                      ₹{item.todayPrice}
                    </Text>

                    <Text style={styles.unitText}>
                      per {item.unit}
                    </Text>

                  </View>

                </View>

              ))

            )}

          </View>

        </ScrollView>

      )}

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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },

  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  titleRow: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  pageTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },

  categoriesRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },

  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: SPACING.xs + 2,
  },

  activeCategoryPill: {
    backgroundColor: COLORS.primary,
  },

  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },

  activeCategoryText: {
    color: COLORS.white,
  },

  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    height: 46,
    marginBottom: SPACING.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: 6,
  },

  resultsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },

  cropList: {
    marginTop: SPACING.xs,
  },

  cropCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cropLeftCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  cropName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },

  marketName: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  cropRightCol: {
    alignItems: 'flex-end',
  },

  cropPriceText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },

  unitText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  emptyText: {
    marginTop: 10,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textMuted,
  },

});

export default MarketPricesScreen;