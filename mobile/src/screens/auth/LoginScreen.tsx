import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import type { RootStackProps } from '../../navigation/types';

export default function LoginScreen({ navigation }: RootStackProps<'Login'>) {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading }    = useAuthStore();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter phone and password.');
      return;
    }
    try {
      await login(phone.trim(), password);
      // RootNavigator automatically switches to Main when token is set
    } catch (err: any) {
      Alert.alert('Login failed', err?.message ?? 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>VaidyaMarg</Text>
        <Text style={styles.tagline}>Your trusted generic pharmacy</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Sign in</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.link}
        >
          <Text style={styles.linkText}>Don\'t have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f7f6f2', justifyContent: 'center', padding: 24 },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 28, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  logo:        { fontSize: 28, fontWeight: '700', color: '#01696f', textAlign: 'center', marginBottom: 4 },
  tagline:     { fontSize: 13, color: '#7a7974', textAlign: 'center', marginBottom: 28 },
  input:       { borderWidth: 1, borderColor: '#dcd9d5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 14, backgroundColor: '#f9f8f5' },
  btn:         { backgroundColor: '#01696f', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: '600', fontSize: 16 },
  link:        { marginTop: 18, alignItems: 'center' },
  linkText:    { color: '#01696f', fontSize: 14 },
});
