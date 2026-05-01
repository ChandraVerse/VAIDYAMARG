import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { medicinesApi, ordersApi } from '@/services/api';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

const CATEGORIES = [
  { label: 'Fever & Pain',    icon: '🌡️' },
  { label: 'Diabetes',        icon: '💉' },
  { label: 'Heart Care',      icon: '❤️' },
  { label: 'Vitamins',        icon: '💊' },
  { label: 'Skin Care',       icon: '🧴' },
  { label: 'Digestive',       icon: '🫀' },
  { label: 'Eye & Ear',       icon: '👁️' },
  { label: 'Antibiotics',     icon: '🦠' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();

  const { data: recentOrders, isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn:  () => ordersApi.list(1).then((r) => r.data.data?.slice(0, 3) ?? []),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={ordersLoading} onRefresh={refetch}
            tintColor={COLORS.primary} colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name ?? 'there'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar (tappable, routes to search tab) */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.75}
        >
          <Text style={styles.searchPlaceholder}>🔍  Search medicines, brands…</Text>
        </TouchableOpacity>

        {/* Upload prescription banner */}
        <TouchableOpacity
          style={styles.rxBanner}
          onPress={() => router.push('/prescription/upload')}
          activeOpacity={0.85}
        >
          <View>
            <Text style={styles.rxTitle}>Have a prescription?</Text>
            <Text style={styles.rxSub}>Upload it and we handle the rest.</Text>
          </View>
          <Text style={{ fontSize: 32 }}>📋</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Browse by category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryCard}
              onPress={() => router.push({
                pathname: '/(tabs)/search',
                params: { category: cat.label },
              })}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent orders */}
        {recentOrders && recentOrders.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent orders</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order: any) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <Card style={styles.orderCard}>
                  <View style={styles.orderRow}>
                    <View>
                      <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                      <Text style={styles.orderMeta}>
                        {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
                        {' · '}₹{order.totalAmount?.toFixed(2)}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor(order.status) + '22' },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: statusColor(order.status) },
                      ]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    PENDING:    COLORS.warning,
    CONFIRMED:  COLORS.primary,
    DISPATCHED: COLORS.primary,
    DELIVERED:  COLORS.success,
    CANCELLED:  COLORS.error,
  };
  return map[status] ?? COLORS.textMuted;
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.xl, paddingBottom: SPACING.md },
  greeting:        { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  userName:        { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  notifBtn:        { padding: SPACING.sm },
  searchBar: {
    marginHorizontal: SPACING.xl,
    backgroundColor:  COLORS.surface,
    borderRadius:     RADIUS.full,
    borderWidth:      1,
    borderColor:      COLORS.border,
    paddingVertical:  SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom:     SPACING.lg,
  },
  searchPlaceholder: { fontSize: FONT_SIZE.base, color: COLORS.textFaint },
  rxBanner: {
    marginHorizontal: SPACING.xl,
    backgroundColor:  COLORS.primary,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.lg,
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    marginBottom:     SPACING.xl,
  },
  rxTitle:         { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.white },
  rxSub:           { fontSize: FONT_SIZE.sm, color: COLORS.primaryHighlight, marginTop: 2 },
  sectionTitle:    { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  sectionRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: SPACING.xl },
  seeAll:          { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500' },
  categoryGrid: {
    flexDirection:    'row',
    flexWrap:         'wrap',
    paddingHorizontal: SPACING.lg,
    gap:              SPACING.sm,
    marginBottom:     SPACING.xl,
  },
  categoryCard: {
    width:            '22%',
    alignItems:       'center',
    backgroundColor:  COLORS.surface,
    borderRadius:     RADIUS.md,
    padding:          SPACING.sm,
    borderWidth:      1,
    borderColor:      COLORS.border,
    gap:              SPACING.xs,
  },
  categoryIcon:    { fontSize: 24 },
  categoryLabel:   { fontSize: FONT_SIZE.xs, color: COLORS.text, textAlign: 'center', fontWeight: '500' },
  orderCard:       { marginHorizontal: SPACING.xl, marginBottom: SPACING.sm },
  orderRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId:         { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text },
  orderMeta:       { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBadge:     { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText:      { fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'capitalize' },
});
