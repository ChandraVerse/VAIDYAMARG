import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { Colors } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/auth.store';
import { usersApi } from '../../src/api/users.api';

export default function ProfileScreen() {
  const router       = useRouter();
  const queryClient  = useQueryClient();
  const { user, logout } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [name,     setName]     = useState(user?.name || '');
  const [email,    setEmail]    = useState(user?.email || '');

  const { data: dashboard } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn:  () => usersApi.dashboard().then((r) => r.data.data),
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => usersApi.getAddresses().then((r) => r.data.data),
  });

  const { data: healthRecords } = useQuery({
    queryKey: ['health-records'],
    queryFn:  () => usersApi.getHealthRecords().then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-dashboard'] });
      setEditMode(false);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    },
  });

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={styles.editBtn}>{editMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Avatar & Stats ───────────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          {editMode ? (
            <View style={styles.editFields}>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor={Colors.textFaint}
              />
              <TextInput
                style={styles.editInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={Colors.textFaint}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                title="Save Changes"
                onPress={() => updateMutation.mutate({ name, email })}
                loading={updateMutation.isPending}
                size="sm"
                style={{ marginTop: 4 }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user?.name || 'Add your name'}</Text>
              <Text style={styles.userPhone}>+91 {user?.phone}</Text>
              {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
            </>
          )}
        </View>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders',   value: dashboard?.totalOrders     || '0', emoji: '🛒' },
            { label: 'Saved',    value: `₹${dashboard?.totalSavings || 0}`, emoji: '💰' },
            { label: 'Rx',       value: dashboard?.totalPrescriptions || '0', emoji: '📝' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={{ fontSize: 22 }}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Addresses ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>📍 Delivery Addresses</Text>
            <TouchableOpacity onPress={() => router.push('/add-address')}>
              <Text style={styles.addLink}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {addresses?.length === 0 ? (
            <Text style={styles.emptyHint}>No addresses saved yet.</Text>
          ) : (
            addresses?.map((addr: any) => (
              <View key={addr.id} style={styles.addrCard}>
                <View style={styles.addrLeft}>
                  <Text style={styles.addrName}>{addr.label || addr.fullName}</Text>
                  <Text style={styles.addrLine}>{addr.line1}, {addr.city} {addr.pincode}</Text>
                </View>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* ── Health Records ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Health Records</Text>
          {healthRecords?.length === 0 ? (
            <TouchableOpacity
              style={styles.addRecordCard}
              onPress={() => router.push('/add-health-record')}
            >
              <Text style={styles.addRecordText}>+ Add blood group, allergies, chronic conditions</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.healthGrid}>
              {healthRecords?.map((rec: any) => (
                <View key={rec.id} style={styles.healthCard}>
                  <Text style={styles.healthType}>{rec.type?.replace(/_/g, ' ')}</Text>
                  <Text style={styles.healthValue}>{rec.value}</Text>
                  {rec.note && <Text style={styles.healthNote}>{rec.note}</Text>}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Menu Items ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More</Text>
          {[
            { emoji: '🛒', label: 'My Orders',          route: '/orders' },
            { emoji: '📝', label: 'My Prescriptions',   route: '/(tabs)/prescription' },
            { emoji: '🔔', label: 'Notification Settings', route: '/notifications' },
            { emoji: '🔒', label: 'Privacy & Security',  route: '/privacy' },
            { emoji: '❓', label: 'Help & Support',      route: '/support' },
            { emoji: 'ℹ️', label: 'About VaidyaMarg',   route: '/about' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="ghost"
            fullWidth
            style={{ borderColor: Colors.error }}
            textStyle={{ color: Colors.error }}
          />
          <Text style={styles.version}>VaidyaMarg v1.0.0 · CDSCO Compliant</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                   paddingTop: (StatusBar.currentHeight || 44) + 12,
                   paddingHorizontal: 20, paddingBottom: 16,
                   backgroundColor: Colors.surface,
                   borderBottomWidth: 1, borderBottomColor: Colors.divider },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: Colors.text },
  editBtn:       { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  profileCard:   { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
                   backgroundColor: Colors.surface,
                   borderBottomWidth: 1, borderBottomColor: Colors.divider },
  avatar:        { width: 80, height: 80, borderRadius: 40,
                   backgroundColor: Colors.primary,
                   justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { fontSize: 34, fontWeight: '700', color: Colors.white },
  userName:      { fontSize: 20, fontWeight: '700', color: Colors.text },
  userPhone:     { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  userEmail:     { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
  editFields:    { width: '100%', gap: 10 },
  editInput:     { backgroundColor: Colors.surfaceOffset, borderRadius: 12,
                   borderWidth: 1, borderColor: Colors.border,
                   paddingHorizontal: 14, paddingVertical: 12,
                   fontSize: 15, color: Colors.text },
  statsRow:      { flexDirection: 'row', gap: 10, padding: 16 },
  statCard:      { flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
                   borderWidth: 1, borderColor: Colors.border,
                   padding: 14, alignItems: 'center', gap: 4 },
  statValue:     { fontSize: 18, fontWeight: '800', color: Colors.text },
  statLabel:     { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  section:       { paddingHorizontal: 16, marginBottom: 8 },
  sectionRow:    { flexDirection: 'row', justifyContent: 'space-between',
                   alignItems: 'center', marginBottom: 10, marginTop: 8 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 8 },
  addLink:       { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  emptyHint:     { fontSize: 13, color: Colors.textMuted, paddingVertical: 12 },
  addrCard:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                   backgroundColor: Colors.surface, borderRadius: 14,
                   borderWidth: 1, borderColor: Colors.border,
                   padding: 14, marginBottom: 8 },
  addrLeft:      { flex: 1 },
  addrName:      { fontSize: 13, fontWeight: '600', color: Colors.text },
  addrLine:      { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  defaultBadge:  { backgroundColor: Colors.primary + '18', borderRadius: 6,
                   paddingHorizontal: 8, paddingVertical: 3 },
  defaultText:   { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  addRecordCard: { backgroundColor: Colors.surface, borderRadius: 14,
                   borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed',
                   padding: 16, alignItems: 'center' },
  addRecordText: { fontSize: 13, color: Colors.primary, fontWeight: '500', textAlign: 'center' },
  healthGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  healthCard:    { backgroundColor: Colors.surface, borderRadius: 12,
                   borderWidth: 1, borderColor: Colors.border,
                   padding: 12, minWidth: '45%' },
  healthType:    { fontSize: 10, color: Colors.textMuted, fontWeight: '600',
                   textTransform: 'uppercase', letterSpacing: 0.5 },
  healthValue:   { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 2 },
  healthNote:    { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  menuItem:      { flexDirection: 'row', alignItems: 'center', gap: 14,
                   backgroundColor: Colors.surface, borderRadius: 14,
                   borderWidth: 1, borderColor: Colors.border,
                   paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  menuEmoji:     { fontSize: 18 },
  menuLabel:     { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  menuChevron:   { fontSize: 18, color: Colors.textFaint },
  version:       { textAlign: 'center', fontSize: 11, color: Colors.textFaint,
                   marginTop: 14, fontStyle: 'italic' },
});
