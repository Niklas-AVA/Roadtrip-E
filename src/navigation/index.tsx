import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { TripScreen } from '../screens/TripScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Resa"
          component={TripScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧭</Text>,
          }}
        />
        <Tab.Screen
          name="Karta"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
          }}
        />
        <Tab.Screen
          name="Platser"
          component={PlacesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📍</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
