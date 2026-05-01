import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { medicinesApi } from '../../api/medicines.api';
import type { MainTabProps } from '../../navigation/types';

type Medicine = { id: string; name: string; genericName: string; genericPrice: number; category: string };

export default function HomeScreen({ navigation }: MainTabProps<'Home'>) {
  const user                      = useAuthStore((s) => s.user);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (quiet = false) => {
    !quiet && setLoading(true);
    try {
      const res = await medicinesApi.getAll();
      setMedicines((res.data?.medicines ?? []).slice(0, 10));
    } catch { /* handled silently */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const renderCard = ({ item }: { item: Medicine }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => (navigation as any).navigate('MedicineDetail', { medicineId: item.id })}
    >
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText}>{item.category}</Text>
      </View>
      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardGeneric} numberOfLines={1}>{item.genericName}</Text>
      <Text style={styles.cardPrice}>₹{item.genericPrice.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.root}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.subtitle}>Find affordable generics</Text>
        </View>
        <TouchableOpacity
          style={styles.rxBtn}
          onPress={() => (navigation as any).navigate('PrescriptionUpload')}
        >
          <Text style={styles.rxBtnText}>📋 Upload Rx</Text>
        </TouchableOpacity>
      </View>

      {/* Medicines */}
      <Text style={styles.sectionTitle}>Featured medicines</Text>
      {loading
        ? <ActivityIndicator style={{ marginTop: 32 }} color="#01696f" />
        : <FlatList
            data={medicines}
            renderItem={renderCard}
            keyExtractor={(m) => m.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          />
      }

      {/* Quick links */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickRow}>
        {[
          { label: '🔔 Reminders', screen: 'ReminderList' },
          { label: '📦 My Orders',  screen: 'Orders' },
        ].map(({ label, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.quickCard}
            onPress={() => (navigation as any).navigate(screen)}
          >
            <Text style={styles.quickLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#f7f6f2' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  greeting:      { fontSize: 22, fontWeight: '700', color: '#28251d' },
  subtitle:      { fontSize: 13, color: '#7a7974', marginTop: 2 },
  rxBtn:         { backgroundColor: '#01696f', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  rxBtnText:     { color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', color: '#28251d', marginLeft: 16, marginTop: 20, marginBottom: 10 },
  card:          { width: 150, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardBadge:     { backgroundColor: '#cedcd8', alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8 },
  cardBadgeText: { fontSize: 10, color: '#01696f', fontWeight: '600', textTransform: 'uppercase' },
  cardName:      { fontSize: 13, fontWeight: '600', color: '#28251d', marginBottom: 2 },
  cardGeneric:   { fontSize: 11, color: '#7a7974', marginBottom: 8 },
  cardPrice:     { fontSize: 15, fontWeight: '700', color: '#01696f' },
  quickRow:      { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 4 },
  quickCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  quickLabel:    { fontSize: 14, fontWeight: '600', color: '#28251d' },
});
