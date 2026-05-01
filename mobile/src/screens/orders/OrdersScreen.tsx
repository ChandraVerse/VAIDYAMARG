import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { ordersApi } from '../../api/orders.api';
import type { MainTabProps } from '../../navigation/types';

const STATUS_COLOR: Record<string, string> = {
  PENDING:    '#d19900',
  CONFIRMED:  '#006494',
  PROCESSING: '#7a39bb',
  DISPATCHED: '#da7101',
  DELIVERED:  '#437a22',
  CANCELLED:  '#a12c7b',
};

type Order = { id: string; status: string; totalAmount: number; createdAt: string; items: any[] };

export default function OrdersScreen({ navigation }: MainTabProps<'Orders'>) {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (quiet = false) => {
    !quiet && setLoading(true);
    try {
      const res = await ordersApi.getHistory();
      setOrders(res.data?.orders ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#01696f" />;

  return (
    <View style={styles.root}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('OrderTracking', { orderId: item.id })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.items}>{item.items?.length ?? 0} item(s)</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
              <Text style={styles.amount}>₹{Number(item.totalAmount).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#f7f6f2' },
  header:    { fontSize: 20, fontWeight: '700', color: '#28251d', padding: 20, paddingTop: 56 },
  empty:     { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#7a7974', fontSize: 16 },
  card:      { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  cardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId:   { fontSize: 15, fontWeight: '700', color: '#28251d' },
  badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  items:     { fontSize: 13, color: '#7a7974', marginBottom: 10 },
  cardBottom:{ flexDirection: 'row', justifyContent: 'space-between' },
  date:      { fontSize: 12, color: '#bab9b4' },
  amount:    { fontSize: 16, fontWeight: '700', color: '#28251d' },
});
