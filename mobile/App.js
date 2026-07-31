import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { VoiceProvider } from './src/context/VoiceContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VoiceProvider>
          <RootNavigator />
        </VoiceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
