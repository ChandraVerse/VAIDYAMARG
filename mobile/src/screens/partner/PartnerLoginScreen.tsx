import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

export function PartnerLoginScreen() {
  const { setAuth } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      const { access_token, user } = res.data;
      if (user.role !== 'PARTNER') {
        Alert.alert('Access denied', 'This portal is for pharmacy partners only.');
        return;
      }
      setAuth(access_token, user);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Partner Portal</Text>
      <Text style={styles.subtitle}>Sign in to your pharmacy account</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="pharmacy@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={login}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: '#f0fdfa', alignItems: 'center',
                    justifyContent: 'center', padding: 24 },
  title:          { fontSize: 28, fontWeight: '800', color: '#0f766e', marginBottom: 4 },
  subtitle:       { fontSize: 14, color: '#6b7280', marginBottom: 32 },
  card:           { width: '100%', backgroundColor: '#fff', borderRadius: 16,
                    padding: 24, elevation: 2, shadowColor: '#000',
                    shadowOpacity: 0.06, shadowRadius: 8 },
  label:          { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input:          { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
                    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
                    backgroundColor: '#f9fafb', color: '#111827' },
  button:         { marginTop: 24, backgroundColor: '#0d9488', borderRadius: 10,
                    paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
