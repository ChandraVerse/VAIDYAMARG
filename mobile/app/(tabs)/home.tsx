import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/auth.store';
import { usersApi } from '../../src/api/users.api';
import { ordersApi } from '../../src/api/orders.api';

const CATEGORIES = [
  { label: 'Diabetes',      emoji: '🩸', query: 'metformin' },
  { label: 'Heart',         emoji: '❤️', query: 'atenolol' },
  { label: 'Antibiotics',   emoji: '🦠', query: 'amoxicillin' },
  { label: 'Vitamins',      emoji: '💊', query: 'vitamin' },
  { label: 'Pain Relief',   emoji: '🩹', query: 'ibuprofen' },
  { label: 'Stomach',       emoji: '🫃', query: 'omeprazole' },
  { label: 'Skin',          emoji: '🧴', query: 'betamethasone' },
  { label: 'Eye & Ear',     emoji: '👁️', query: 'ciprofloxacin' },
];

const SAVINGS_FACTS = [
  { brand: 'Crocin 500mg',    generic: 'Paracetamol 500mg', save: '₹18', pct: '72%' },
  { brand: 'Augmentin 625',   generic: 'Amox+Clav 625mg',  save: '₹145', pct: '68%' },
  { brand: 'Pantop 40',       generic: 'Pantoprazole 40mg', save: '₹52', pct: '64%' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);

  const { data: dashboard, refetch, isRefetching } = useQuery({
    queryKey: ['user-dashboard'],
    queryFn:  () => usersApi.dashboard().then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn:  () => ordersApi.history().then((r) => r.data.data?.slice(0, 2)),
  });

  const onRefresh = useCallback(() => { refetch(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* ── Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{user?.name?.split(' ')[0] || 'there'} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
        >
          <Text style={{ fontSize: 22 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/(tabs)/search')}
        activeOpacity={0.85}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search medicines, brands…</Text>
      </TouchableOpacity>

      {/* ── Savings Banner ────────────────────────────────────── */}
      {dashboard?.totalSavings > 0 && (
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsEmoji}>💰</Text>
          <View>
            <Text style={styles.savingsLabel}>Total savings with generics</Text>
            <Text style={styles.savingsAmount}>₹{dashboard.totalSavings.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      )}

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {[
            { emoji: '📷', label: 'Upload\nPrescription', route: '/(tabs)/prescription' },
            { emoji: '🛒', label: 'My\nOrders',          route: '/orders' },
            { emoji: '💊', label: 'Refill\nReminder',    route: '/reminders' },
            { emoji: '🏥', label: 'Health\nRecords',     route: '/profile' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Browse Categories ─────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.catCard}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: cat.query } })}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 26, marginBottom: 4 }}>{cat.emoji}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Did You Know ──────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Switch & Save</Text>
        {SAVINGS_FACTS.map((fact) => (
          <TouchableOpacity
            key={fact.brand}
            style={styles.savingsCard}
            onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: fact.brand } })}
            activeOpacity={0.85}
          >
            <View style={styles.savingsCardLeft}>
              <Text style={styles.savingsBrand}>{fact.brand}</Text>
              <Text style={styles.savingsGeneric}>→ {fact.generic}</Text>
            </View>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsPillText}>Save {fact.pct}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Recent Orders ─────────────────────────────────────── */}
      {recentOrders?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order: any) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/order/${order.id}`)}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.bg },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
                      paddingTop: (StatusBar.currentHeight || 44) + 12,
                      paddingHorizontal: 20, paddingBottom: 16 },
  greeting:         { fontSize: 14, color: Colors.textMuted },
  name:             { fontSize: 24, fontWeight: '700', color: Colors.text },
  notifBtn:         { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface,
                      borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  searchBar:        { flexDirection: 'row', alignItems: 'center', gap: 10,
                      marginHorizontal: 20, marginBottom: 16,
                      backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.border,
                      paddingHorizontal: 16, paddingVertical: 14 },
  searchIcon:       { fontSize: 16 },
  searchPlaceholder:{ fontSize: 15, color: Colors.textMuted },
  savingsBanner:    { flexDirection: 'row', alignItems: 'center', gap: 12,
                      marginHorizontal: 20, marginBottom: 16,
                      backgroundColor: Colors.primary + '18', borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.primaryLight,
                      paddingHorizontal: 16, paddingVertical: 12 },
  savingsEmoji:     { fontSize: 28 },
  savingsLabel:     { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  savingsAmount:    { fontSize: 22, fontWeight: '800', color: Colors.primary },
  section:          { paddingHorizontal: 20, marginBottom: 24 },
  sectionRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:     { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  seeAll:           { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  quickGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:        { flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
                      borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
                      padding: 16, alignItems: 'center' },
  quickLabel:       { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, fontWeight: '500' },
  catGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard:          { width: '22%', aspectRatio: 1, backgroundColor: Colors.surface,
                      borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
                      justifyContent: 'center', alignItems: 'center' },
  catLabel:         { fontSize: 10, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  savingsCard:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.border,
                      paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  savingsCardLeft:  { flex: 1 },
  savingsBrand:     { fontSize: 14, fontWeight: '600', color: Colors.text },
  savingsGeneric:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  savingsPill:      { backgroundColor: Colors.success + '20', borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 4 },
  savingsPillText:  { fontSize: 12, color: Colors.success, fontWeight: '700' },
  orderCard:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: Colors.surface, borderRadius: 14,
                      borderWidth: 1, borderColor: Colors.border,
                      paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  orderId:          { fontSize: 14, fontWeight: '600', color: Colors.text },
  orderDate:        { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusPill:       { backgroundColor: Colors.primary + '18', borderRadius: 8,
                      paddingHorizontal: 10, paddingVertical: 4 },
  statusText:       { fontSize: 11, color: Colors.primary, fontWeight: '600' },
});
