import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { partnersApi } from '@/api/partners.api';
import { usePartnerStore, PartnerEarning } from '@/store/partner.store';

export function PartnerEarningsScreen() {
  const { earnings, setEarnings } = usePartnerStore();
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await partnersApi.getEarnings();
      setEarnings(res.data?.earnings ?? res.data ?? []);
    } catch { /* keep stale */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const total      = earnings.reduce((s, e) => s + Number(e.netEarning), 0);
  const unsettled  = earnings.filter((e) => !e.settledAt).reduce((s, e) => s + Number(e.netEarning), 0);

  const renderItem = ({ item: e }: { item: PartnerEarning }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.orderId}>Order #{e.orderId.slice(-6).toUpperCase()}</Text>
        <Text style={styles.date}>{new Date(e.createdAt).toLocaleDateString('en-IN')}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={styles.earning}>₹{Number(e.netEarning).toFixed(2)}</Text>
        <Text style={styles.commission}>Commission: ₹{Number(e.commission).toFixed(2)}</Text>
        {e.settledAt
          ? <Text style={styles.settled}>✓ Settled</Text>
          : <Text style={styles.unsettled}>Pending</Text>}
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#0d9488" /></View>
  );

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#0d9488' }]}>₹{total.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>₹{unsettled.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Unsettled</Text>
        </View>
      </View>

      <FlatList
        data={earnings}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No earnings yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f0fdfa' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summaryRow:   { flexDirection: 'row', gap: 12, padding: 20 },
  summaryCard:  { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16,
                  elevation: 1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
                  padding: 16, marginVertical: 6,
                  elevation: 1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  orderId:      { fontSize: 14, fontWeight: '700', color: '#111827' },
  date:         { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  earning:      { fontSize: 16, fontWeight: '800', color: '#0d9488' },
  commission:   { fontSize: 11, color: '#9ca3af' },
  settled:      { fontSize: 11, fontWeight: '700', color: '#10b981' },
  unsettled:    { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
  emptyBox:     { alignItems: 'center', padding: 40 },
  emptyText:    { color: '#9ca3af', fontSize: 15 },
});
