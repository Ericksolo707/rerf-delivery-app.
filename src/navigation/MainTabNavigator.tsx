import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { WarehouseScreen } from '../screens/warehouse/WarehouseScreen';
import { ContactSupportScreen } from '../screens/support/ContactSupportScreen';
import { AiChatScreen } from '../screens/support/AiChatScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'InicioTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'BodegaTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          } else if (route.name === 'ContactoTab') {
            iconName = focused ? 'call' : 'call-outline';
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
        options={{ tabBarLabel: 'Inicio' }} 
      />
      <Tab.Screen 
        name="BodegaTab" 
        component={WarehouseScreen} 
        options={{ tabBarLabel: 'Mi Bodega' }} 
      />
      <Tab.Screen 
        name="ChatTab" 
        component={AiChatScreen} 
        options={{ tabBarLabel: 'Chat IA' }} 
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
