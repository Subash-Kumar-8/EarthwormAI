import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';

import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import FertilizerRecommendationScreen from '../screens/FertilizerRecommendationScreen';
import WeatherAdvisoryScreen from '../screens/WeatherAdvisoryScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* Splash & Onboarding */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />

        {/* Authentication Stack */}
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />

        {/* Main Application Bottom Tabs */}
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />

        {/* Sub-screens & Camera Diagnosis */}
        <Stack.Screen name="DiseaseDetectionScreen" component={DiseaseDetectionScreen} />
        <Stack.Screen name="WeatherAdvisory" component={WeatherAdvisoryScreen} />
        <Stack.Screen name="FertilizerRecommendation" component={FertilizerRecommendationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
