import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/auth.store';
import { useNotifications } from '@/hooks/useNotifications';

// Auth screens
import { LoginScreen }    from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';

// Main tabs (customer)
import { MainTabs } from './MainTabs';

// Partner navigator (role-gated)
import { PartnerNavigator } from './PartnerNavigator';

// Partner order detail (pushed onto stack from PartnerNavigator)
import { PartnerOrderDetailScreen } from '@/screens/partner/PartnerOrderDetailScreen';

// Prescription screens
import PrescriptionListScreen   from '@/screens/prescriptions/PrescriptionListScreen';
import PrescriptionDetailScreen from '@/screens/prescriptions/PrescriptionDetailScreen';

// Reminder screens
import ReminderCreateScreen from '@/screens/reminders/ReminderCreateScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER_BASE = {
  headerTintColor:     '#01696f',
  headerStyle:         { backgroundColor: '#f7f6f2' },
  headerShadowVisible: false,
  headerBackTitle:     'Back',
} as const;

export function RootNavigator() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  useNotifications();

  const isAuth    = !!token;
  const isPartner = user?.role === 'PARTNER';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuth ? (
        // ── Unauthenticated ────────────────────────────────────────────────
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : isPartner ? (
        // ── Partner (pharmacist) app ───────────────────────────────────────
        <>
          <Stack.Screen name="PartnerHome"        component={PartnerNavigator} />
          <Stack.Screen name="PartnerOrderDetail" component={PartnerOrderDetailScreen} />
        </>
      ) : (
        // ── Customer app ──────────────────────────────────────────────────
        <>
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Prescription flow */}
          <Stack.Screen
            name="PrescriptionList"
            component={PrescriptionListScreen}
            options={{ ...HEADER_BASE, headerShown: true, title: 'My Prescriptions', headerBackTitle: 'Profile' }}
          />
          <Stack.Screen
            name="PrescriptionDetail"
            component={PrescriptionDetailScreen}
            options={{ ...HEADER_BASE, headerShown: true, title: 'Prescription', headerBackTitle: 'Prescriptions' }}
          />

          {/* Reminder flow */}
          <Stack.Screen
            name="ReminderCreate"
            component={ReminderCreateScreen}
            options={{ ...HEADER_BASE, headerShown: true, title: 'New Reminder', headerBackTitle: 'Reminders' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
