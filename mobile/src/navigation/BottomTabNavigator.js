import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigationState } from '@react-navigation/native';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useVoiceContext } from '../context/VoiceContext';

import AIAssistantScreen from '../screens/AIAssistantScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WeatherAdvisoryScreen from '../screens/WeatherAdvisoryScreen';

const Tab = createBottomTabNavigator();

// Custom Center Button Component connected to VoiceContext
const CustomCenterButton = ({ onPress }) => {
  const { isListening, toggleListening } = useVoiceContext();

  // Directly subscribe to current tab route name for accurate icon updates
  const currentRouteName = useNavigationState((state) => {
    if (!state || !state.routes || state.index === undefined) return 'HomeTab';
    const activeRoute = state.routes[state.index];
    return activeRoute ? activeRoute.name : 'HomeTab';
  });

  const isChatScreen = currentRouteName === 'VoiceMicTab';
  const iconName = isChatScreen ? (isListening ? 'microphone-off' : 'microphone') : 'message-text';

  const handleCenterPress = (e) => {
    if (isChatScreen) {
      // On Chat screen: Raised center mic button directly starts/stops voice recording!
      toggleListening();
    } else {
      // On Home or other tabs: Navigate to Chat tab
      onPress(e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.micButtonContainer}
      onPress={handleCenterPress}
    >
      <View
        style={[
          styles.micButton,
          isListening && styles.micButtonListening,
          SHADOWS.medium,
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={26}
          color={COLORS.white}
        />
      </View>
    </TouchableOpacity>
  );
};

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={26}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Tab 2: Sun-Behind-Cloud Weather Icon matching Figma */}
      <Tab.Screen
        name="WeatherTab"
        component={WeatherAdvisoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'weather-partly-cloudy' : 'weather-partly-cloudy'}
              size={28}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Dynamic Floating Center Button (Chat Icon on Home -> Mic Voice Recording Button on Chat Screen) */}
      <Tab.Screen
        name="VoiceMicTab"
        component={AIAssistantScreen}
        options={{
          tabBarButton: (props) => (
            <CustomCenterButton onPress={props.onPress} />
          ),
        }}
      />

      <Tab.Screen
        name="MarketTab"
        component={MarketPricesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chart-bar' : 'chart-line'}
              size={26}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account-circle' : 'account-circle-outline'}
              size={26}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 64,
    position: 'relative',
    elevation: 8,
  },
  micButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  micButtonListening: {
    backgroundColor: COLORS.danger, // Pulsing Red when recording voice
  },
});

export default BottomTabNavigator;
