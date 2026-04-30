import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  FlatList, TouchableOpacity, ActivityIndicator,
  StatusBar, Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../src/theme/colors';
import { medicinesApi } from '../../src/api/medicines.api';
import { MedicineCard } from '../../src/components/ui/MedicineCard';
import { EmptyState } from '../../src/components/ui/EmptyState';

const POPULAR = [
  'Paracetamol', 'Amoxicillin', 'Metformin',
  'Atorvastatin', 'Omeprazole', 'Cetirizine',
];

export default function SearchScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams<{ q?: string }>();

  const [query,    setQuery]    = useState(params.q || '');
  const [debouncedQ, setDebounced] = useState(query);
  const inputRef = useRef<TextInput>(null);

  // Debounce 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Pre-fill from navigation params
  useEffect(() => {
    if (params.q) { setQuery(params.q); setDebounced(params.q); }
  }, [params.q]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey:  ['medicines-search', debouncedQ],
    queryFn:   () => medicinesApi.search(debouncedQ).then((r) => r.data.data),
    enabled:   debouncedQ.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  const medicines: any[] = data?.medicines || [];
  const showLoading = (isLoading || isFetching) && debouncedQ.length >= 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* ── Search Header ───────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search medicines, brands, generics…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); inputRef.current?.focus(); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Results / States ────────────────────────────────── */}
      {showLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Searching medicines…</Text>
        </View>

      ) : debouncedQ.length < 2 ? (
        // Popular searches
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular searches</Text>
          <View style={styles.chips}>
            {POPULAR.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.chip}
                onPress={() => setQuery(term)}
              >
                <Text style={styles.chipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.popularTitle, { marginTop: 24 }]}>💡 How we save you money</Text>
          <View style={styles.howCard}>
            <Text style={styles.howText}>
              Every branded medicine has a{' '}
              <Text style={{ fontWeight: '700', color: Colors.primary }}>cheaper generic equivalent</Text>
              {' '}— same molecule, same dosage, same effect. We show you both so you can choose.
            </Text>
          </View>
        </View>

      ) : medicines.length === 0 ? (
        <EmptyState
          emoji="💊"
          title="No medicines found"
          message={`No results for "${debouncedQ}". Try a generic name like "paracetamol" or brand name like "Crocin".`}
        />

      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MedicineCard
              id={item.id}
              name={item.name}
              genericName={item.genericName}
              brandPrice={item.mrp}
              genericPrice={item.price}
              category={item.category}
              unit={item.unit}
              inStock={item.inStock}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {medicines.length} result{medicines.length !== 1 ? 's' : ''} for "{debouncedQ}"
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  header:         { paddingTop: (StatusBar.currentHeight || 44) + 8,
                    paddingHorizontal: 16, paddingBottom: 12,
                    backgroundColor: Colors.surface,
                    borderBottomWidth: 1, borderBottomColor: Colors.divider },
  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 10,
                    backgroundColor: Colors.surfaceOffset, borderRadius: 14,
                    paddingHorizontal: 14, paddingVertical: 12,
                    borderWidth: 1, borderColor: Colors.border },
  searchIcon:     { fontSize: 15 },
  input:          { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  clearBtn:       { fontSize: 13, color: Colors.textMuted, padding: 4 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:    { fontSize: 14, color: Colors.textMuted },
  list:           { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  resultCount:    { fontSize: 13, color: Colors.textMuted, marginBottom: 12, fontWeight: '500' },
  popularSection: { padding: 20 },
  popularTitle:   { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { backgroundColor: Colors.surface, borderRadius: 20,
                    borderWidth: 1, borderColor: Colors.border,
                    paddingHorizontal: 14, paddingVertical: 8 },
  chipText:       { fontSize: 13, color: Colors.text, fontWeight: '500' },
  howCard:        { backgroundColor: Colors.primary + '0f', borderRadius: 14,
                    borderWidth: 1, borderColor: Colors.primaryLight,
                    padding: 16 },
  howText:        { fontSize: 14, color: Colors.text, lineHeight: 22 },
});
