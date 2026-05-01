import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Input, Card } from '@/components/ui';
import { medicinesApi } from '@/services/api';
import { useCartStore } from '@/stores/cart.store';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/constants';

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useState(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  });
  return debounced;
}

export default function SearchScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState(category ?? '');
  const debouncedQuery    = useDebounce(query, 400);
  const addItem           = useCartStore((s) => s.addItem);

  const { data, isFetching } = useQuery({
    queryKey:  ['medicines', 'search', debouncedQuery],
    queryFn:   () => medicinesApi.search(debouncedQuery).then((r) => r.data.data ?? []),
    enabled:   debouncedQuery.length >= 2,
    staleTime: 1000 * 30,
  });

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/medicine/${item.id}`)}
      activeOpacity={0.82}
    >
      <Card style={styles.resultCard}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.medicineName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.manufacturer} numberOfLines={1}>{item.manufacturer}</Text>
            <Text style={styles.form}>{item.form} · {item.strength}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.price}>₹{item.price?.toFixed(2)}</Text>
            {item.mrp && item.mrp > item.price && (
              <Text style={styles.mrp}>MRP ₹{item.mrp?.toFixed(2)}</Text>
            )}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={(e) => {
                e.stopPropagation();
                addItem({
                  medicineId:           item.id,
                  name:                 item.name,
                  price:                item.price,
                  imageUrl:             item.imageUrl ?? null,
                  requiresPrescription: item.requiresPrescription ?? false,
                });
              }}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        {item.requiresPrescription && (
          <View style={styles.rxTag}>
            <Text style={styles.rxTagText}>Rx Required</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  ), [addItem]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search input */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Search Medicines</Text>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Medicine name, salt, brand…"
          autoFocus={!category}
          containerStyle={styles.input}
          rightIcon={
            isFetching
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : undefined
          }
        />
      </View>

      {/* Results */}
      {debouncedQuery.length < 2 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Search for any medicine by name, brand, or active ingredient.</Text>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !isFetching
              ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>💊</Text>
                  <Text style={styles.emptyText}>No results for "{debouncedQuery}"</Text>
                </View>
              )
              : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  searchHeader: { padding: SPACING.xl, gap: SPACING.md },
  title:        { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  input:        {},
  list:         { padding: SPACING.xl, gap: SPACING.sm },
  resultCard:   { padding: SPACING.md },
  cardRow:      { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
  cardLeft:     { flex: 1, gap: 2 },
  cardRight:    { alignItems: 'flex-end', gap: SPACING.xs },
  medicineName: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.text },
  manufacturer: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  form:         { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  price:        { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.primary },
  mrp: {
    fontSize:         FONT_SIZE.xs,
    color:            COLORS.textFaint,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical:  4,
    borderRadius:    RADIUS.sm,
  },
  addBtnText: { fontSize: FONT_SIZE.xs, color: COLORS.white, fontWeight: '600' },
  rxTag: {
    marginTop:        SPACING.xs,
    alignSelf:        'flex-start',
    backgroundColor:  COLORS.warning + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical:  2,
    borderRadius:     RADIUS.sm,
  },
  rxTagText:  { fontSize: FONT_SIZE.xs, color: COLORS.warning, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxxl, gap: SPACING.md },
  emptyIcon:  { fontSize: 48 },
  emptyText:  { fontSize: FONT_SIZE.base, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
