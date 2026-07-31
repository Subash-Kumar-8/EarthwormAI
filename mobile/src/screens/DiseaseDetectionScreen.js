import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import ScreenWrapper from '../components/ScreenWrapper';
import { DISEASE_DETECTION_SAMPLE } from '../constants/mockData';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { cropService } from '../services/cropService';

export const DiseaseDetectionScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80'
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(DISEASE_DETECTION_SAMPLE);
  const [activeTab, setActiveTab] = useState('chemical'); // 'chemical' | 'organic' | 'preventive'

  const handleSimulateScan = async (source) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await cropService.diagnoseDiseaseImage(`mock://${source}_image.jpg`);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Crop Disease Detection"
        subtitle="AI Vision Diagnostic Tool"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons Row: Camera & Upload */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="Take Camera Photo"
            icon="camera"
            variant="primary"
            size="md"
            style={styles.actionBtn}
            onPress={() => handleSimulateScan('camera')}
          />
          <View style={{ width: 12 }} />
          <Button
            title="Upload Gallery Image"
            icon="image-plus"
            variant="outline"
            size="md"
            style={styles.actionBtn}
            onPress={() => handleSimulateScan('gallery')}
          />
        </View>

        {/* Preview Frame with Scan Overlay */}
        <Card variant="elevated" style={styles.previewCard} padding={0}>
          <View style={styles.imageContainer}>
            {/* Styled leaf scan placeholder image view */}
            <View style={styles.mockLeafView}>
              <MaterialCommunityIcons name="leaf" size={100} color={COLORS.primary} />
              <Text style={styles.mockLeafText}>Sample Affected Crop Leaf</Text>
            </View>

            {/* Scan Framing Corner Overlays */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {analyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.analyzingText}>AI analyzing leaf symptoms...</Text>
              </View>
            )}
          </View>

          <View style={styles.previewFooter}>
            <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.previewFooterText}>
              Ensure leaf is well-lit & in clear focus for best accuracy
            </Text>
          </View>
        </Card>

        {/* Diagnosis Results Card */}
        {result && (
          <View style={styles.resultSection}>
            <Card variant="elevated" accentColor={COLORS.danger} padding={SPACING.lg}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Badge label="Diagnostic Result" variant="danger" size="sm" />
                  <Text style={styles.diseaseTitle}>{result.diseaseName}</Text>
                  <Text style={styles.scientificName}>{result.scientificName}</Text>
                </View>
                <View style={styles.confidenceCircle}>
                  <Text style={styles.confidenceNumber}>{result.confidence}%</Text>
                  <Text style={styles.confidenceLabel}>Match</Text>
                </View>
              </View>

              {/* Progress Bar for Confidence */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${result.confidence}%` }]} />
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Severity Level</Text>
                  <Badge label={result.severity} variant="warning" size="sm" />
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Affected Region</Text>
                  <Text style={styles.metaValue}>{result.affectedArea}</Text>
                </View>
              </View>

              {/* Symptoms Checklist */}
              <Text style={styles.symptomsHeader}>Key Identified Symptoms:</Text>
              {result.symptoms.map((symptom, idx) => (
                <View key={idx} style={styles.symptomRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.warning} />
                  <Text style={styles.symptomText}>{symptom}</Text>
                </View>
              ))}
            </Card>

            {/* Treatment Recommendations Section */}
            <View style={styles.treatmentHeader}>
              <Text style={styles.treatmentSectionTitle}>Recommended Treatment</Text>
              <Text style={styles.treatmentSub}>Verified by Agricultural Scientists</Text>
            </View>

            {/* Treatment Segmented Tab Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'chemical' && styles.activeTab]}
                onPress={() => setActiveTab('chemical')}
              >
                <MaterialCommunityIcons
                  name="flask"
                  size={16}
                  color={activeTab === 'chemical' ? COLORS.white : COLORS.text}
                />
                <Text style={[styles.tabText, activeTab === 'chemical' && styles.activeTabText]}>
                  Chemical
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'organic' && styles.activeTab]}
                onPress={() => setActiveTab('organic')}
              >
                <MaterialCommunityIcons
                  name="sprout"
                  size={16}
                  color={activeTab === 'organic' ? COLORS.white : COLORS.text}
                />
                <Text style={[styles.tabText, activeTab === 'organic' && styles.activeTabText]}>
                  Organic
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'preventive' && styles.activeTab]}
                onPress={() => setActiveTab('preventive')}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={activeTab === 'preventive' ? COLORS.white : COLORS.text}
                />
                <Text style={[styles.tabText, activeTab === 'preventive' && styles.activeTabText]}>
                  Preventive
                </Text>
              </TouchableOpacity>
            </View>

            {/* Treatment Items */}
            {activeTab === 'chemical' &&
              result.treatments.chemical.map((item, idx) => (
                <Card key={idx} variant="outlined" style={styles.treatmentCard} padding={SPACING.md}>
                  <View style={styles.treatmentTitleRow}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.treatmentName}>{item.name}</Text>
                  </View>
                  <Text style={styles.treatmentDetail}>Dosage: {item.dosage}</Text>
                  <Text style={styles.treatmentDetail}>Schedule: {item.schedule}</Text>
                </Card>
              ))}

            {activeTab === 'organic' &&
              result.treatments.organic.map((item, idx) => (
                <Card key={idx} variant="outlined" style={styles.treatmentCard} padding={SPACING.md}>
                  <View style={styles.treatmentTitleRow}>
                    <MaterialCommunityIcons name="sprout" size={20} color={COLORS.secondary} />
                    <Text style={styles.treatmentName}>{item.name}</Text>
                  </View>
                  <Text style={styles.treatmentDetail}>Dosage: {item.dosage}</Text>
                  <Text style={styles.treatmentDetail}>Schedule: {item.schedule}</Text>
                </Card>
              ))}

            {activeTab === 'preventive' &&
              result.treatments.preventive.map((item, idx) => (
                <Card key={idx} variant="outlined" style={styles.treatmentCard} padding={SPACING.md}>
                  <View style={styles.treatmentTitleRow}>
                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={COLORS.info} />
                    <Text style={styles.treatmentName}>{item}</Text>
                  </View>
                </Card>
              ))}
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
  actionButtonsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  previewCard: {
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 220,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mockLeafView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockLeafText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.accent,
  },
  topLeft: { top: 12, left: 12, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 12, right: 12, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 12, left: 12, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 12, right: 12, borderBottomWidth: 4, borderRightWidth: 4 },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingText: {
    color: COLORS.white,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs + 4,
    backgroundColor: COLORS.surface,
  },
  previewFooterText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  resultSection: {
    marginTop: SPACING.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diseaseTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: 4,
  },
  scientificName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  confidenceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  confidenceLabel: {
    fontSize: 9,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 4,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  symptomsHeader: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  symptomText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text,
    marginLeft: 6,
    flex: 1,
  },
  treatmentHeader: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  treatmentSectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  treatmentSub: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: RADIUS.md,
    padding: 4,
    marginVertical: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.white,
  },
  treatmentCard: {
    marginVertical: SPACING.xs,
  },
  treatmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  treatmentName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginLeft: 6,
  },
  treatmentDetail: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginLeft: 26,
    marginTop: 2,
  },
});

export default DiseaseDetectionScreen;
