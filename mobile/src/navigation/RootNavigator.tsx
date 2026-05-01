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

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  // Register FCM push token as soon as the user is authenticated.
  // useNotifications is a no-op when there is no token.
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
        </>
      )}
    </Stack.Navigator>
  );
}
