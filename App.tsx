import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TripProvider } from './src/context/TripContext';
import { AppNavigation } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <TripProvider>
        <StatusBar style="auto" />
        <AppNavigation />
      </TripProvider>
    </SafeAreaProvider>
  );
}
