import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import ScreenWrapper from '../components/ScreenWrapper';
import { LANGUAGES } from '../constants/languages';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const LanguageSelectionScreen = ({ navigation }) => {
  const [selectedLang, setSelectedLang] = useState('en');

  const handleContinue = () => {
    navigation.navigate('Login');
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLang === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedLang(item.id)}
        style={styles.gridItem}
      >
        <Card
          variant={isSelected ? 'elevated' : 'outlined'}
          style={[
            styles.langCard,
            isSelected && styles.selectedCard,
          ]}
          padding={SPACING.md}
        >
          <Text style={styles.flag}>{item.flag}</Text>
          <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
            {item.nativeName}
          </Text>
          <Text style={[styles.name, isSelected && styles.selectedSubtext]}>
            {item.name}
          </Text>

          {isSelected && (
            <View style={styles.checkBadge}>
              <MaterialCommunityIcons name="check" size={14} color={COLORS.white} />
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons name="translate" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Select Your Language</Text>
        <Text style={styles.subtitle}>
          अपनी भाषा चुनें / ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ
        </Text>
      </View>

      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="lg"
          icon="arrow-right"
          iconPosition="right"
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: SPACING.md,
  },
  gridItem: {
    flex: 0.5,
    padding: SPACING.xs,
  },
  langCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    position: 'relative',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryLight,
  },
  flag: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  nativeName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  selectedText: {
    color: COLORS.primary,
  },
  selectedSubtext: {
    color: COLORS.primaryDark,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: SPACING.md,
  },
});

export default LanguageSelectionScreen;
