import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { usersApi } from '@/api/users.api';

/**
 * useNotifications
 *
 * Call this ONCE from the root authenticated navigator.
 * It:
 *   1. Requests notification permission on physical devices.
 *   2. Obtains the Expo push token (and native FCM token on Android).
 *   3. PATCHes /users/me/fcm-token so the backend can push to this device.
 *   4. Sets up a foreground notification handler (banner + sound).
 *   5. Sets up a response handler for tapping a notification
 *      (navigates to the right screen via navigationRef — optional, wired below).
 *
 * Dependencies:
 *   expo-notifications, expo-device
 *   npm install expo-notifications expo-device
 *
 * app.json / app.config.js:
 *   "plugins": ["expo-notifications"],
 *   "android": { "googleServicesFile": "./google-services.json" },
 *   "ios": { "googleServicesFile": "./GoogleService-Info.plist" }
 */

// Show banners + play sound when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export function useNotifications() {
  const token     = useAuthStore((s) => s.token);
  const registered = useRef(false);

  useEffect(() => {
    if (!token || registered.current) return;

    (async () => {
      try {
        // Only real devices can receive push notifications
        if (!Device.isDevice) {
          console.log('[Push] Skipping — not a physical device');
          return;
        }

        // Request permission
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;

        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[Push] Permission denied — push notifications disabled');
          return;
        }

        // Android: create notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('vaidyamarg_orders', {
            name:        'Order Updates',
            importance:  Notifications.AndroidImportance.HIGH,
            sound:       'default',
            vibrationPattern: [0, 250, 250, 250],
            lightColor:  '#0d9488',
          });
        }

        // Get Expo push token (works for Expo Go + bare workflow)
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID ?? undefined,
        });

        // Register with our backend
        await usersApi.registerFcmToken(expoPushToken.data);
        registered.current = true;
        console.log('[Push] Registered:', expoPushToken.data.slice(0, 30) + '...');
      } catch (err: any) {
        console.warn('[Push] Registration failed:', err?.message ?? err);
      }
    })();

    // Foreground notification tap handler
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string>;
      console.log('[Push] Notification tapped:', data);
      // Optional: add navigation here, e.g.
      // if (data.orderId) navigationRef.navigate('OrderTracking', { orderId: data.orderId });
    });

    return () => { responseSub.remove(); };
  }, [token]);
}
