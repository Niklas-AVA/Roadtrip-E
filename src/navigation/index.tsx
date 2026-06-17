import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { TripScreen } from '../screens/TripScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlacesScreen } from '../screens/PlacesScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[styles.iconBubble, focused && styles.iconBubbleFocused]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
  );
}

export function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Resa"
          component={TripScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🧭" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Karta"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Platser"
          component={PlacesScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon="🌻" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    height: 82,
    paddingTop: 10,
    borderTopWidth: 0,
    shadowColor: colors.secondary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tabBarItem: {
    paddingTop: 2,
  },
  tabBarLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleFocused: {
    backgroundColor: `${colors.primary}22`,
  },
});
