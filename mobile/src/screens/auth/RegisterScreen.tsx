import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import type { RootStackProps } from '../../navigation/types';

export default function RegisterScreen({ navigation }: RootStackProps<'Register'>) {
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Name, phone and password are required.');
      return;
    }
    try {
      await register({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, password });
    } catch (err: any) {
      Alert.alert('Registration failed', err?.message ?? 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.logo}>VaidyaMarg</Text>
          <Text style={styles.tagline}>Create your account</Text>

          {([['Full name', name, setName, 'name', false],
             ['Phone number', phone, setPhone, 'tel', false],
             ['Email (optional)', email, setEmail, 'email', false],
             ['Password', password, setPassword, 'password', true]] as const).map(
            ([placeholder, value, setter, autoComplete, secure]: any) => (
              <TextInput
                key={placeholder}
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={setter}
                secureTextEntry={secure}
                autoComplete={autoComplete}
                keyboardType={autoComplete === 'tel' ? 'phone-pad' : autoComplete === 'email' ? 'email-address' : 'default'}
              />
            ),
          )}

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#f7f6f2' },
  scroll:      { padding: 24, justifyContent: 'center', flexGrow: 1 },
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
