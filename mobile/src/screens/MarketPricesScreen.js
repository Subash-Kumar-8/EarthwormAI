import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Alert } from "react-native";

export const MarketPricesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Food Crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState("All");
  const [marketData, setMarketData] = useState({
    foodCrops: [],
    cashCrops: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketPrices();
  }, []);

  const fetchMarketPrices = async () => {
    try {
      const response = await fetch(
        "http://192.168.137.198:3001/api/market"
      );

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));

      if (data.success) {
        setMarketData({
          foodCrops: data.foodCrops,
          cashCrops: data.cashCrops,
        });
      }
    } catch (error) {
      console.log(error);
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
      const matchesFilter =
        filterType === "All"
          ? true
          : filterType === "Increased"
          ? crop.changeType === "up"
          : crop.changeType === "down";
      return matchesSearch && matchesFilter;
    });

    const openFilter = () => {
      Alert.alert(
        "Filter Market Prices",
        "Choose one",
        [
          {
            text: "All",
            onPress: () => setFilterType("All")
          },
          {
            text: "Increased",
            onPress: () => setFilterType("Increased")
          },
          {
            text: "Decreased",
            onPress: () => setFilterType("Decreased")
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    };
    filteredCrops.forEach((item) => {
      console.log(item.id, item.name);
    });
  return (
    <ScreenWrapper>
      {/* Back Header matching Figma */}
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
        {/* Title & Filter Button Row */}
        <View style={styles.titleFilterRow}>
          <Text style={styles.pageTitle}>Market Prices</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.filterPillBtn} onPress={openFilter}>
            <MaterialCommunityIcons name="tune-variant" size={16} color={COLORS.text} style={{ marginRight: 4 }} />
            <Text style={styles.filterPillText}>{filterType}</Text>
          </TouchableOpacity>
        </View>

        {/* Category Pills matching Figma */}
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

        {/* Search Input matching Figma */}
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

        {/* Crop Cards List matching Figma */}
        <View style={styles.cropList}>
          {filteredCrops.map((item) => (
            <View key={item.id} style={styles.cropCardItem}>
              <Text style={styles.cropName}>{item.name}</Text>
              <View style={styles.cropRightCol}>
                <Text style={styles.cropPriceText}>₹{item.todayPrice} ({item.unit})</Text>
                <View
                  style={[
                    styles.changeBadge,
                    {
                      backgroundColor:
                        item.changeType === "up"
                          ? COLORS.primaryLight
                          : item.changeType === "down"
                          ? COLORS.dangerLight
                          : "#EEEEEE",
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.changeBadgeText,
                      {
                        color:
                          item.changeType === "up"
                            ? COLORS.primary
                            : item.changeType === "down"
                            ? COLORS.danger
                            : COLORS.textSecondary,
                      }
                    ]}
                  >
                    {item.changeType === "up"
                      ? `▲ ₹${item.change}`
                      : item.changeType === "down"
                      ? `▼ ₹${Math.abs(item.change)}`
                      : "No Change"
                    }
                  </Text>
                </View>
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
    backgroundColor: '#C2E5D0', // Light green filter pill from Figma
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
