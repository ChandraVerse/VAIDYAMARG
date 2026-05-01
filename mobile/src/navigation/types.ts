import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  // Auth
  Login:    undefined;
  Register: undefined;
  // Main (hosts tabs)
  Main: undefined;
  // Detail screens (above tabs)
  MedicineDetail:      { medicineId: string };
  Checkout:            undefined;
  OrderTracking:       { orderId: string };
  PrescriptionUpload:  undefined;
  ReminderList:        undefined;
  ReminderCreate:      undefined;   // ← new
};

export type MainTabParamList = {
  Home:    undefined;
  Search:  undefined;
  Cart:    undefined;
  Orders:  undefined;
  Profile: undefined;
};

export type RootStackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
