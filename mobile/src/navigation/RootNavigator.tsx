import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MedicineDetailScreen from '../screens/medicines/MedicineDetailScreen';
import CheckoutScreen from '../screens/orders/CheckoutScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import PrescriptionUploadScreen from '../screens/prescriptions/PrescriptionUploadScreen';
import ReminderListScreen from '../screens/reminders/ReminderListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const token = useAuthStore((s) => s.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // ── Authenticated ──────────────────────────────────────────────
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="MedicineDetail"
              component={MedicineDetailScreen}
              options={{ headerShown: true, title: 'Medicine Details' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: true, title: 'Checkout' }}
            />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
              options={{ headerShown: true, title: 'Track Order' }}
            />
            <Stack.Screen
              name="PrescriptionUpload"
              component={PrescriptionUploadScreen}
              options={{ headerShown: true, title: 'Upload Prescription' }}
            />
            <Stack.Screen
              name="ReminderList"
              component={ReminderListScreen}
              options={{ headerShown: true, title: 'Reminders' }}
            />
          </>
        ) : (
          // ── Unauthenticated ────────────────────────────────────────────
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
