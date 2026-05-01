import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/cart.store';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/medicines/SearchScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<string, { focused: string; default: string }> = {
  Home:    { focused: 'home',              default: 'home-outline' },
  Search:  { focused: 'search',            default: 'search-outline' },
  Cart:    { focused: 'cart',              default: 'cart-outline' },
  Orders:  { focused: 'receipt',           default: 'receipt-outline' },
  Profile: { focused: 'person',            default: 'person-outline' },
};

export default function MainTabs() {
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const name = focused
            ? ICONS[route.name]?.focused
            : ICONS[route.name]?.default;
          return <Ionicons name={name as any} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#01696f',
        tabBarInactiveTintColor: '#7a7974',
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Search"  component={SearchScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen name="Orders"  component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
