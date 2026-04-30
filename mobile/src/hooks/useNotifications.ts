import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { usersApi } from '../api/users.api';
import apiClient from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener     = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications();

    // Handle foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Push received:', notification.request.content.title);
      },
    );

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        // Navigate based on notification type
        console.log('Notification tapped, data:', data);
      },
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}

async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vaidyamarg_orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#01696f',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  // Register with backend
  await apiClient.post('/notifications/fcm-token', { token }).catch(() => {});
}
