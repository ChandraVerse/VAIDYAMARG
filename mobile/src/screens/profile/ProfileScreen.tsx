import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import type { MainTabProps } from '../../navigation/types';

export default function ProfileScreen({ navigation }: MainTabProps<'Profile'>) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const rows = [
    { label: 'Upload Prescription', icon: '📋', screen: 'PrescriptionUpload' },
    { label: 'My Orders',           icon: '📦', screen: 'Orders' },
    { label: 'Reminders',           icon: '🔔', screen: 'ReminderList' },
  ];

  return (
    <ScrollView style={styles.root}>
      {/* Avatar + name */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.phone}>{user?.phone ?? ''}</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
      </View>

      {/* Menu rows */}
      <View style={styles.section}>
        {rows.map(({ label, icon, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.row}
            onPress={() => (navigation as any).navigate(screen)}
            activeOpacity={0.8}
          >
            <Text style={styles.rowIcon}>{icon}</Text>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f7f6f2' },
  hero:        { alignItems: 'center', paddingTop: 60, paddingBottom: 28, backgroundColor: '#fff' },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: '#cedcd8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 28, fontWeight: '700', color: '#01696f' },
  name:        { fontSize: 20, fontWeight: '700', color: '#28251d', marginBottom: 4 },
  phone:       { fontSize: 14, color: '#7a7974' },
  email:       { fontSize: 13, color: '#bab9b4', marginTop: 2 },
  section:     { backgroundColor: '#fff', marginTop: 16 },
  row:         { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f3f0ec' },
  rowIcon:     { fontSize: 20, marginRight: 14 },
  rowLabel:    { flex: 1, fontSize: 15, color: '#28251d' },
  rowArrow:    { fontSize: 20, color: '#bab9b4' },
  logoutBtn:   { margin: 16, marginTop: 24, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e0ced7' },
  logoutText:  { color: '#a12c7b', fontWeight: '700', fontSize: 16 },
});
