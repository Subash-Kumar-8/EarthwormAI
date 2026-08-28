import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Header from '../components/Header';
import ScreenWrapper from '../components/ScreenWrapper';
import { DISEASE_DETECTION_SAMPLE } from '../constants/mockData';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const DiseaseDetectionScreen = ({ navigation }) => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('chemical');
  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Earthworm AI requires camera access to scan crop leaves for disease detection.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
        setResult(DISEASE_DETECTION_SAMPLE);
      }
    } catch (err) {
      console.error('Camera Launch Error:', err);
      Alert.alert('Camera Error', 'Could not open device camera. Please try again.');
    }
  };
  const handleLaunchGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Earthworm AI requires photo library access to pick crop leaf images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
        setResult(DISEASE_DETECTION_SAMPLE);
      }
    } catch (err) {
      console.error('Gallery Launch Error:', err);
      Alert.alert('Gallery Error', 'Could not access photo gallery. Please try again.');
    }
  };

  // 3. Confirm Photo & Redirect directly to AI Chat Assistant
  const handleConfirmAndGoToChat = () => {
    if (!selectedImageUri) return;
    // Navigate straight to VoiceMicTab (AI Chat Assistant) with attached image payload!
    navigation.navigate('MainApp', {
      screen: 'VoiceMicTab',
      params: { attachedImage: selectedImageUri },
    });
  };

  return (
    <ScreenWrapper>
      <Header
        title="Crop Disease Scanner"
        subtitle="AI Vision Diagnostic Tool"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons Row: Camera & Gallery */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="Take Camera Photo"
            icon="camera"
            variant="primary"
            size="md"
            style={styles.actionBtn}
            onPress={handleLaunchCamera}
          />
          <View style={{ width: 12 }} />
          <Button
            title="Choose from Gallery"
            icon="image-plus"
            variant="outline"
            size="md"
            style={styles.actionBtn}
            onPress={handleLaunchGallery}
          />
        </View>

        {/* Photo Preview & Confirmation Frame (Tick ✔ / Retake ✖) */}
        <Card variant="elevated" style={styles.previewCard} padding={0}>
          <View style={styles.imageContainer}>
            {selectedImageUri ? (
              <Image source={{ uri: selectedImageUri }} style={styles.capturedPhoto} resizeMode="cover" />
            ) : (
              <View style={styles.mockLeafView}>
                <MaterialCommunityIcons name="camera-iris" size={80} color={COLORS.primary} />
                <Text style={styles.mockLeafText}>Tap Camera or Gallery button above to scan leaf</Text>
              </View>
            )}

            {/* Scan Framing Corner Overlays */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* User Confirmation Buttons: Tick (✔) & Retake (✖) */}
          {selectedImageUri ? (
            <View style={styles.confirmActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.retakeBtn}
                onPress={() => setSelectedImageUri(null)}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.white} />
                <Text style={styles.retakeBtnText}>Retake (✖)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.confirmBtn, SHADOWS.medium]}
                onPress={handleConfirmAndGoToChat}
              >
                <MaterialCommunityIcons name="check-bold" size={24} color={COLORS.white} />
                <Text style={styles.confirmBtnText}>Confirm (✔) & Ask AI</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewFooter}>
              <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.previewFooterText}>
                Ensure leaf is well-lit & in clear focus for best accuracy
              </Text>
            </View>
          )}
        </Card>

        {/* Diagnosis Results Card */}
        {result && (
          <View style={styles.resultSection}>
            <Card variant="elevated" accentColor={COLORS.danger} padding={SPACING.lg}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <Badge label="Diagnostic Preview" variant="danger" size="sm" />
                  <Text style={styles.diseaseTitle}>{result.diseaseName}</Text>
                  <Text style={styles.scientificName}>{result.scientificName}</Text>
                </View>
                <View style={styles.confidenceCircle}>
                  <Text style={styles.confidenceNumber}>{result.confidence}%</Text>
                  <Text style={styles.confidenceLabel}>Match</Text>
                </View>
              </View>

              <Text style={styles.symptomsHeader}>Identified Symptoms:</Text>
              {result.symptoms.map((symptom, idx) => (
                <View key={idx} style={styles.symptomRow}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.warning} />
                  <Text style={styles.symptomText}>{symptom}</Text>
                </View>
              ))}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.chatRedirectCardBtn}
                onPress={handleConfirmAndGoToChat}
              >
                <MaterialCommunityIcons name="forum" size={20} color={COLORS.white} />
                <Text style={styles.chatRedirectCardText}>Get Full AI ChatGPT Treatment Guide (✔)</Text>
              </TouchableOpacity>
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
    height: 240,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  capturedPhoto: {
    width: '100%',
    height: '100%',
  },
  mockLeafView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  mockLeafText: {
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
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
  confirmActionRow: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.xs + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: 8,
  },
  retakeBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginLeft: 4,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs + 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: 6,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm + 1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  confidenceLabel: {
    fontSize: 8,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  symptomsHeader: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
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
  chatRedirectCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.md,
  },
  chatRedirectCardText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.xs + 1,
    marginLeft: 6,
  },
});

export default DiseaseDetectionScreen;
