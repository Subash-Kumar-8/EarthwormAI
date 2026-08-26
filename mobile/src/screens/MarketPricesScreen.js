import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Alert } from "react-native";
import { useLocation } from '../context/locationContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const MarketPricesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Food Crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState({
    foodCrops: [],
    cashCrops: [],
  });

  const [loading, setLoading] = useState(true);

  const lastMarketLocation = useRef(null);
  useEffect(() => {
      if (!locationCoords) return;
      const { latitude, longitude } = locationCoords;
      if (lastMarketLocation.current) {
          const {
              latitude: lastLat,
              longitude: lastLon
          } = lastMarketLocation.current;
          const latDiff = Math.abs(latitude - lastLat);
          const lonDiff = Math.abs(longitude - lastLon);
          if (latDiff < 0.005 && lonDiff < 0.005) {
              return;
          }
      }
      lastMarketLocation.current = {
          latitude,
          longitude
      };
      fetchMarketPrices(latitude, longitude);
  }, [locationCoords]);

  const { locationCoords } = useLocation();
  console.log("MarketPricesScreen locationCoords:", locationCoords);

  const fetchMarketPrices = async (latitude, longitude) => {
    try {
      if (!latitude || !longitude) {
        console.log("📍 Location not available yet");
        return;
      }
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
      } else {
        console.log("❌ Market API Error:", data.message);
      }
    } catch (error) {
      console.error("❌ Market Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const crops =
    selectedCategory === "Food Crops"
      ? marketData.foodCrops
      : marketData.cashCrops;

    const filteredCrops = crops.filter((crop) => {
      const matchesSearch = crop.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });

    filteredCrops.forEach((item) => {
      console.log(item.id, item.name);
    });
  return (
    <ScreenWrapper>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Market Prices</Text>
      </View>
      {loading && (
        <ScreenWrapper>
          <View
            style={{
              flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>Loading Market Prices...</Text>
            </View>
          </ScreenWrapper>
        )
      }
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleFilterRow}>
          <Text style={styles.pageTitle}>Market Prices</Text>
        </View>
        <View style={styles.categoriesRow}>
          <TouchableOpacity
            style={[styles.categoryPill, selectedCategory === 'Food Crops' && styles.activeCategoryPill]}
            onPress={() => setSelectedCategory('Food Crops')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'Food Crops' && styles.activeCategoryText]}>
              Food Crops
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryPill, selectedCategory === 'Cash Crops' && styles.activeCategoryPill]}
            onPress={() => setSelectedCategory('Cash Crops')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'Cash Crops' && styles.activeCategoryText]}>
              Cash Crops
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBarBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search the crops..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textMuted} />
        </View>
        <View style={styles.cropList}>
          {filteredCrops.map((item) => (
            <View key={item.id} style={styles.cropCardItem}>
              <Text style={styles.cropName}>{item.name}</Text>
              <View style={styles.cropRightCol}>
                <Text style={styles.cropPriceText}>₹{item.todayPrice} ({item.unit})</Text>
                <Text style={styles.marketName}>{item.market}</Text>
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
  titleFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  pageTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  filterPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C2E5D0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: 6,
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
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  changeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

export default MarketPricesScreen;
