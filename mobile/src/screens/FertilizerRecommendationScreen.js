import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import Input from '../components/Input';
import ScreenWrapper from '../components/ScreenWrapper';
import { FERTILIZER_CROPS, FERTILIZER_SOIL_TYPES, SAMPLE_FERTILIZER_RESULT } from '../constants/mockData';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const FertilizerRecommendationScreen = ({ navigation }) => {
  const [selectedCrop, setSelectedCrop] = useState(FERTILIZER_CROPS[0]);
  const [selectedSoil, setSelectedSoil] = useState(FERTILIZER_SOIL_TYPES[0]);
  const [landArea, setLandArea] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(SAMPLE_FERTILIZER_RESULT);

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        ...SAMPLE_FERTILIZER_RESULT,
        cropName: selectedCrop,
        landArea: `${landArea || '5'} Acres`,
        soilType: selectedSoil,
      });
      setLoading(false);
    }, 600);
  };

  return (
    <ScreenWrapper>
      <Header
        title="Fertilizer Advisory"
        subtitle="Soil-specific N-P-K Calculator"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Form Inputs Card */}
        <Card variant="elevated" style={styles.formCard} padding={SPACING.lg}>
          <Text style={styles.formSectionTitle}>1. Select Target Crop</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {FERTILIZER_CROPS.map((crop) => (
              <TouchableOpacity
                key={crop}
                style={[styles.chip, selectedCrop === crop && styles.activeChip]}
                onPress={() => setSelectedCrop(crop)}
              >
                <Text style={[styles.chipText, selectedCrop === crop && styles.activeChipText]}>
                  {crop}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.formSectionTitle, { marginTop: SPACING.md }]}>2. Select Soil Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {FERTILIZER_SOIL_TYPES.map((soil) => (
              <TouchableOpacity
                key={soil}
                style={[styles.chip, selectedSoil === soil && styles.activeChip]}
                onPress={() => setSelectedSoil(soil)}
              >
                <Text style={[styles.chipText, selectedSoil === soil && styles.activeChipText]}>
                  {soil}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="3. Farm Size (Acres)"
                placeholder="e.g. 5"
                icon="image-filter-hdr"
                keyboardType="numeric"
                value={landArea}
                onChangeText={setLandArea}
              />
            </View>
          </View>

          <Button
            title="Calculate Fertilizer Schedule"
            onPress={handleCalculate}
            loading={loading}
            icon="calculator"
            size="lg"
            style={styles.calcBtn}
          />
        </Card>

        {/* Calculated Result Section */}
        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended Dosage Plan</Text>
              <Badge label="Customized Plan" variant="success" size="sm" />
            </View>

            {/* Overview Summary Box */}
            <Card variant="flat" style={styles.summaryBox} padding={SPACING.md}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Crop & Acreage</Text>
                  <Text style={styles.summaryVal}>
                    {result.cropName} ({result.landArea})
                  </Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Soil Profile</Text>
                  <Text style={styles.summaryVal}>{result.soilType}</Text>
                </View>
              </View>
            </Card>

            {/* Individual Nutrient Bags Cards */}
            {result.recommendations.map((item, idx) => (
              <Card key={idx} variant="elevated" accentColor={COLORS.primary} style={styles.nutCard} padding={SPACING.md}>
                <View style={styles.nutHeader}>
                  <View>
                    <Badge label={item.nutrient} variant="info" size="sm" />
                    <Text style={styles.fertName}>{item.fertilizer}</Text>
                  </View>
                  <View style={styles.qtyBox}>
                    <Text style={styles.totalQty}>{item.totalQuantity}</Text>
                    <Text style={styles.perAcreQty}>({item.perAcre})</Text>
                  </View>
                </View>

                {/* Application Schedule Timeline */}
                <Text style={styles.scheduleTitle}>Application Split Schedule:</Text>
                {item.schedule.map((sch, sIdx) => (
                  <View key={sIdx} style={styles.scheduleRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.stageText}>{sch.stage}:</Text>
                    <Text style={styles.stageQty}>{sch.qty}</Text>
                  </View>
                ))}
              </Card>
            ))}

            {/* Eco-Friendly / Bio Alternatives Card */}
            <Card variant="outlined" style={styles.bioCard} padding={SPACING.md}>
              <View style={styles.bioHeader}>
                <MaterialCommunityIcons name="leaf" size={22} color={COLORS.primary} />
                <Text style={styles.bioTitle}>Bio-Fertilizer Alternatives</Text>
              </View>

              {result.bioAlternatives.map((alt, idx) => (
                <View key={idx} style={styles.bioRow}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.primary} />
                  <Text style={styles.bioText}>{alt}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  formCard: {
    marginBottom: SPACING.md,
  },
  formSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  horizontalScroll: {
    marginBottom: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  activeChipText: {
    color: COLORS.white,
  },
  row: {
    marginTop: SPACING.xs,
  },
  calcBtn: {
    marginTop: SPACING.md,
  },
  resultContainer: {
    marginTop: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  summaryBox: {
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surfaceVariant,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: 2,
  },
  nutCard: {
    marginVertical: SPACING.xs,
  },
  nutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fertName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: 4,
  },
  qtyBox: {
    alignItems: 'flex-end',
  },
  totalQty: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  perAcreQty: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  scheduleTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  stageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginLeft: 6,
  },
  stageQty: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primaryDark,
    marginLeft: 4,
  },
  bioCard: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.secondary,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bioTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primaryDark,
    marginLeft: 6,
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bioText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    marginLeft: 6,
    flex: 1,
  },
});

export default FertilizerRecommendationScreen;
