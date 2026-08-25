import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LocationProvider } from '../context/locationContext';

import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';

import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import FertilizerRecommendationScreen from '../screens/FertilizerRecommendationScreen';
import WeatherAdvisoryScreen from '../screens/WeatherAdvisoryScreen';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  console.log("loading:", loading);
  console.log("isAuthenticated:", isAuthenticated);
  if (loading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp">
              {() => (
                <LocationProvider>
                  <BottomTabNavigator />
                </LocationProvider>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="DiseaseDetectionScreen"
              component={DiseaseDetectionScreen}
            />
            <Stack.Screen
              name="WeatherAdvisory"
              component={WeatherAdvisoryScreen}
            />
            <Stack.Screen
              name="FertilizerRecommendation"
              component={FertilizerRecommendationScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
            />
            <Stack.Screen
              name="LanguageSelection"
              component={LanguageSelectionScreen}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
