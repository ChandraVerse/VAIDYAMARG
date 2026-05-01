import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Root redirect:
 * - Authenticated users  → main tabs
 * - Unauthenticated users → auth flow
 */
export default function Index() {
  const { user } = useAuthStore();
  return <Redirect href={user ? '/(tabs)/home' : '/(auth)/welcome'} />;
}
