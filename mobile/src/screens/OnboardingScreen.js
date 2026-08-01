import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { ONBOARDING_SLIDES } from '../constants/mockData';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      navigation.replace('LanguageSelection');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <MaterialCommunityIcons
              name={item.iconName}
              size={84}
              color={COLORS.primary}
            />
          </View>
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.tagline}>{item.tagline}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper withPadding={false}>
      <View style={styles.headerRow}>
        <Text style={styles.logoText}>Earthworm AI</Text>

        {currentIndex < ONBOARDING_SLIDES.length - 1 && (
          <Button
            title="Skip"
            variant="text"
            size="sm"
            fullWidth={false}
            onPress={handleSkip}
          />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footerContainer}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={
              currentIndex === ONBOARDING_SLIDES.length - 1
                ? 'Get Started'
                : 'Next'
            }
            onPress={handleNext}
            size="lg"
            icon={
              currentIndex === ONBOARDING_SLIDES.length - 1
                ? 'check-circle-outline'
                : 'arrow-right'
            }
            iconPosition="right"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },

  logoText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },

  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },

  illustrationContainer: {
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },

  outerCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerCircle: {
    width: width * 0.48,
    height: width * 0.48,
    borderRadius: (width * 0.48) / 2,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },

  textContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  tagline: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },

  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  footerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },

  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.border,
  },

  buttonContainer: {
    width: '100%',
  },
});

export default OnboardingScreen;