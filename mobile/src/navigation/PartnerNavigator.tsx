import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PartnerDashboardScreen } from '@/screens/partner/PartnerDashboardScreen';
import { PartnerOrdersScreen }    from '@/screens/partner/PartnerOrdersScreen';
import { PartnerEarningsScreen }  from '@/screens/partner/PartnerEarningsScreen';
import { PartnerProfileScreen }   from '@/screens/partner/PartnerProfileScreen';

export type PartnerTabParamList = {
  PartnerDashboard: undefined;
  PartnerOrders:    undefined;
  PartnerEarnings:  undefined;
  PartnerProfile:   undefined;
};

const Tab = createBottomTabNavigator<PartnerTabParamList>();

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  PartnerDashboard: 'home-outline',
  PartnerOrders:    'receipt-outline',
  PartnerEarnings:  'wallet-outline',
  PartnerProfile:   'person-outline',
};

const LABELS: Record<string, string> = {
  PartnerDashboard: 'Home',
  PartnerOrders:    'Orders',
  PartnerEarnings:  'Earnings',
  PartnerProfile:   'Profile',
};

export function PartnerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        tabBarLabel: LABELS[route.name],
        tabBarActiveTintColor:   '#0d9488',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor:  '#f3f4f6',
          paddingBottom:   4,
        },
      })}
    >
      <Tab.Screen name="PartnerDashboard" component={PartnerDashboardScreen} />
      <Tab.Screen name="PartnerOrders"    component={PartnerOrdersScreen} />
      <Tab.Screen name="PartnerEarnings"  component={PartnerEarningsScreen} />
      <Tab.Screen name="PartnerProfile"   component={PartnerProfileScreen} />
    </Tab.Navigator>
  );
}
