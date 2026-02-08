/**
 * Main Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { CouponsScreen } from '../screens/Coupons/CouponsScreen';
import { StoresScreen } from '../screens/Stores/StoresScreen';
import { FavoritesScreen } from '../screens/Favorites/FavoritesScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0070f3',
        tabBarInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: '#0070f3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Coupons" 
        component={CouponsScreen}
        options={{
          title: 'Coupons',
          tabBarIcon: ({ color }) => <CouponIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Stores" 
        component={StoresScreen}
        options={{
          title: 'Stores',
          tabBarIcon: ({ color }) => <StoreIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <HeartIcon color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon components (replace with react-native-vector-icons)
const HomeIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 24, color }}>🏠</Text>
);

const CouponIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 24, color }}>🎫</Text>
);

const StoreIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 24, color }}>🏪</Text>
);

const HeartIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 24, color }}>❤️</Text>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Text style={{ fontSize: 24, color }}>👤</Text>
);

import { Text } from 'react-native';
