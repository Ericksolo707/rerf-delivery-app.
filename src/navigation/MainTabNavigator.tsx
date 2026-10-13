
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { useApp } from '../context/AppContext';

import { HomeScreen } from '../screens/home/HomeScreen';
import { WarehouseScreen } from '../screens/warehouse/WarehouseScreen';
import { TrackingGpsScreen } from '../screens/shipments/TrackingGpsScreen';
import { ContactSupportScreen } from '../screens/support/ContactSupportScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useApp();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          backgroundColor: isDarkMode ? colors.surfaceCard : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.surfaceCardBorder,
        },
        tabBarActiveTintColor: colors.primaryYellow,
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, focused }: { color: string; size: number; focused: boolean }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'menu-outline';

          if (route.name === 'InicioTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else if (route.name === 'BodegaTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'GpsTab') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'ContactoTab') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'PerfilTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="InicioTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'App' }} 
      />
      <Tab.Screen 
        name="BodegaTab" 
        component={WarehouseScreen} 
        options={{ tabBarLabel: 'Mi bodega' }} 
      />
      <Tab.Screen 
        name="GpsTab" 
        component={TrackingGpsScreen} 
        options={{ tabBarLabel: 'GPS' }} 
      />
      <Tab.Screen 
        name="ContactoTab" 
        component={ContactSupportScreen} 
        options={{ tabBarLabel: 'Contacto' }} 
      />
      <Tab.Screen 
        name="PerfilTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Perfil' }} 
      />
    </Tab.Navigator>
  );
};
