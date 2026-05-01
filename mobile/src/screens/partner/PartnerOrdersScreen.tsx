import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { partnersApi } from '@/api/partners.api';

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string; phone: string };
  items: { medicineName: string; quantity: number }[];
};

type Tab = 'PENDING' | 'PROCESSING' | 'ALL';

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
  DELIVERED:  '#10b981',
  CANCELLED:  '#ef4444',
};

const TABS: Tab[] = ['PENDING', 'PROCESSING', 'ALL'];

export function PartnerOrdersScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab]       = useState<Tab>('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (status: Tab) => {
    try {
      const res = await partnersApi.getOrders(status === 'ALL' ? undefined : status);
      setOrders(res.data?.orders ?? res.data ?? []);
    } catch { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { setLoading(true); load(tab); }, [tab]);

  const onRefresh = () => { setRefreshing(true); load(tab); };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No orders in this tab</Text>
            </View>
          ) : (
            orders.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={styles.card}
                onPress={() => navigation.navigate('PartnerOrderDetail', { orderId: o.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{o.user.name}</Text>
                  <Text style={styles.items} numberOfLines={1}>
                    {o.items.map((i) => `${i.medicineName} ×${i.quantity}`).join(', ')}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(o.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.amount}>₹{Number(o.totalAmount).toFixed(2)}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLORS[o.status] + '22' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[o.status] }]}>
                      {o.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  tabRow:    { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16,
               paddingBottom: 8, gap: 8 },
  tabBtn:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99,
                  backgroundColor: '#e5e7eb' },
  tabBtnActive: { backgroundColor: '#0d9488' },
  tabText:      { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  tabTextActive:{ color: '#fff' },
  emptyBox:  { alignItems: 'center', padding: 40 },
  emptyText: { color: '#9ca3af', fontSize: 15 },
  card:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
               marginHorizontal: 20, marginVertical: 6, padding: 16,
               elevation: 1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6 },
  name:      { fontSize: 15, fontWeight: '700', color: '#111827' },
  items:     { fontSize: 12, color: '#6b7280', marginTop: 2, maxWidth: 200 },
  date:      { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  amount:    { fontSize: 16, fontWeight: '800', color: '#0d9488' },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});
