import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { prescriptionsApi, notificationsApi } from '@/services/api';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

interface MenuRow {
  label: string;
  icon:  string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn:  () => prescriptionsApi.list().then((r) => r.data.data ?? []),
  });

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn:  () => notificationsApi.unreadCount().then((r) => r.data.data?.unreadCount ?? 0),
    refetchInterval: 60_000,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => {
          logout();
          router.replace('/(auth)/welcome');
        }},
      ],
    );
  };

  const menuSections: { title: string; rows: MenuRow[] }[] = [
    {
      title: 'Orders & Prescriptions',
      rows: [
        { label: 'My Orders',        icon: '📦', onPress: () => router.push('/(tabs)/orders') },
        { label: 'My Prescriptions', icon: '📋', onPress: () => router.push('/prescription/list') },
        { label: 'Upload Prescription', icon: '📤', onPress: () => router.push('/prescription/upload') },
      ],
    },
    {
      title: 'Account',
      rows: [
        {
          label: `Notifications${unread ? ` (${unread})` : ''}`,
          icon: '🔔',
          onPress: () => router.push('/notifications'),
        },
        { label: 'Saved Addresses',  icon: '📍', onPress: () => router.push('/addresses') },
        { label: 'Help & Support',   icon: '💬', onPress: () => {} },
      ],
    },
    {
      title: '',
      rows: [
        { label: 'Sign out', icon: '🚪', onPress: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : user?.phone?.slice(-2) ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name ?? 'VaidyaMarg User'}</Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
        </View>

        {/* Prescription summary */}
        {prescriptions && prescriptions.length > 0 && (
          <View style={styles.rxSummary}>
            <Text style={styles.rxSummaryText}>
              {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} on file
            </Text>
            <TouchableOpacity onPress={() => router.push('/prescription/list')}>
              <Text style={styles.rxSummaryLink}>View all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, si) => (
            <View key={si} style={styles.menuSection}>
              {section.title ? (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              ) : null}
              <Card style={styles.menuCard}>
                {section.rows.map((row, ri) => (
                  <View key={row.label}>
                    <TouchableOpacity
                      style={styles.menuRow}
                      onPress={row.onPress}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.menuIcon}>{row.icon}</Text>
                      <Text style={[
                        styles.menuLabel,
                        row.danger && styles.menuLabelDanger,
                      ]}>
                        {row.label}
                      </Text>
                      <Text style={styles.menuChevron}>›</Text>
                    </TouchableOpacity>
                    {ri < section.rows.length - 1 && <View style={styles.menuDivider} />}
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </View>

        <Text style={styles.version}>VaidyaMarg v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  userCard: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            SPACING.lg,
    padding:        SPACING.xl,
    paddingBottom:  SPACING.md,
  },
  avatar: {
    width:           56,
    height:          56,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText:       { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.white },
  userName:         { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  userPhone:        { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 },
  rxSummary: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    marginHorizontal: SPACING.xl,
    backgroundColor:  COLORS.primaryHighlight,
    borderRadius:     RADIUS.md,
    padding:          SPACING.md,
    marginBottom:     SPACING.md,
  },
  rxSummaryText:    { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500' },
  rxSummaryLink:    { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },
  menuContainer:    { padding: SPACING.xl, gap: SPACING.lg },
  menuSection:      { gap: SPACING.sm },
  sectionTitle:     { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  menuCard:         { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection:    'row',
    alignItems:       'center',
    padding:          SPACING.lg,
    gap:              SPACING.md,
  },
  menuIcon:         { fontSize: 20, width: 28, textAlign: 'center' },
  menuLabel:        { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.text },
  menuLabelDanger:  { color: COLORS.error },
  menuChevron:      { fontSize: FONT_SIZE.lg, color: COLORS.textFaint },
  menuDivider:      { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.xl + 28 },
  version:          { fontSize: FONT_SIZE.xs, color: COLORS.textFaint, textAlign: 'center', paddingVertical: SPACING.xl },
});
