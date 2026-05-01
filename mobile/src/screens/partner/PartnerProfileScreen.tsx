import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Switch, StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useAuthStore }    from '@/store/auth.store';
import { usePartnerStore } from '@/store/partner.store';
import { partnersApi }     from '@/api/partners.api';

export function PartnerProfileScreen() {
  const { logout }            = useAuthStore();
  const { profile, setProfile, toggleActive } = usePartnerStore();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await partnersApi.getProfile();
      setProfile(res.data?.pharmacy ?? res.data);
    } catch { /* keep stale */ }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleToggle = async () => {
    if (!profile) return;
    const next = !profile.isActive;
    toggleActive();
    try {
      await partnersApi.updateProfile({ isActive: next });
    } catch {
      toggleActive(); // rollback
      Alert.alert('Error', 'Could not update status');
    }
  };

  const signOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  if (!profile) return (
    <View style={styles.center}>
      <Text style={styles.empty}>Loading profile…</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {/* Avatar + name */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.pharmacyName}>{profile.name}</Text>
          <Text style={styles.ownerName}>{profile.ownerName}</Text>
        </View>
      </View>

      {/* Status badge */}
      <View style={[
        styles.statusBadge,
        profile.status === 'APPROVED' ? styles.statusApproved : styles.statusOther,
      ]}>
        <Text style={styles.statusText}>{profile.status}</Text>
      </View>

      {/* Info grid */}
      <View style={styles.card}>
        {[
          ['Phone',           profile.phone],
          ['City',            profile.city],
          ['Delivery Radius', `${profile.deliveryRadius} km`],
          ['Commission',      `${profile.commissionRate}%`],
          ['Operating Hours', profile.operatingHours ?? '—'],
        ].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Active toggle */}
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleTitle}>Accept Orders</Text>
            <Text style={styles.toggleSub}>Toggle off to pause incoming orders</Text>
          </View>
          <Switch
            value={profile.isActive}
            onValueChange={handleToggle}
            trackColor={{ false: '#e5e7eb', true: '#99f6e4' }}
            thumbColor={profile.isActive ? '#0d9488' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f0fdfa', padding: 20 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:          { color: '#9ca3af', fontSize: 15 },
  avatarRow:      { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar:         { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0d9488',
                    alignItems: 'center', justifyContent: 'center' },
  avatarText:     { color: '#fff', fontSize: 28, fontWeight: '800' },
  pharmacyName:   { fontSize: 20, fontWeight: '800', color: '#111827' },
  ownerName:      { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge:    { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
                    borderRadius: 99, marginBottom: 20 },
  statusApproved: { backgroundColor: '#d1fae5' },
  statusOther:    { backgroundColor: '#fee2e2' },
  statusText:     { fontSize: 12, fontWeight: '700', color: '#065f46' },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 16,
                    marginBottom: 14, elevation: 1,
                    shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between',
                    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  infoLabel:      { fontSize: 13, color: '#9ca3af' },
  infoValue:      { fontSize: 13, fontWeight: '600', color: '#111827' },
  toggleRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle:    { fontSize: 15, fontWeight: '700', color: '#111827' },
  toggleSub:      { fontSize: 12, color: '#9ca3af', marginTop: 2, maxWidth: 220 },
  signOutBtn:     { backgroundColor: '#fee2e2', borderRadius: 14, paddingVertical: 14,
                    alignItems: 'center', marginTop: 8, marginBottom: 40 },
  signOutText:    { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
