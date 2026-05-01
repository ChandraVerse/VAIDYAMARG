import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { usersApi } from '../api/users.api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

/**
 * Bootstrap Expo / FCM push notifications.
 * Call once inside the authenticated root component.
 * Registers the device token with the backend via PATCH /users/me/fcm-token.
 */
export function useNotifications() {
  useEffect(() => {
    (async () => {
      if (!Device.isDevice) return; // simulators can't receive push

      const { status: existing } = await Notifications.getPermissionsAsync();
      const finalStatus =
        existing === 'granted'
          ? existing
          : (await Notifications.requestPermissionsAsync()).status;

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const fcmToken  = tokenData.data;

      // Register with backend
      await usersApi.updateFcmToken(fcmToken).catch(() => { /* non-fatal */ });
    })();
  }, []);
}
