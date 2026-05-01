import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { medicinesApi } from '../../api/medicines.api';
import type { MainTabProps } from '../../navigation/types';

type Medicine = { id: string; name: string; genericName: string; genericPrice: number; mrp: number; category: string };

export default function SearchScreen({ navigation }: MainTabProps<'Search'>) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Medicine[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await medicinesApi.getAll(q.trim());
      setResults(res.data?.medicines ?? []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search medicines, generics…"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => search(query)}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity style={styles.btn} onPress={() => search(query)} activeOpacity={0.8}>
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 32 }} color="#01696f" />}

      {!loading && searched && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No medicines found for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.85}
            onPress={() => (navigation as any).navigate('MedicineDetail', { medicineId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.generic}>{item.genericName} · {item.category}</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.price}>₹{item.genericPrice.toFixed(2)}</Text>
              <Text style={styles.mrp}>MRP ₹{item.mrp.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#f7f6f2' },
  searchBar: { flexDirection: 'row', padding: 16, paddingTop: 56, gap: 10 },
  input:     { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, borderWidth: 1, borderColor: '#dcd9d5' },
  btn:       { backgroundColor: '#01696f', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  btnText:   { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty:     { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#7a7974', fontSize: 15 },
  row:       { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  name:      { fontSize: 15, fontWeight: '600', color: '#28251d' },
  generic:   { fontSize: 12, color: '#7a7974', marginTop: 2 },
  priceCol:  { alignItems: 'flex-end' },
  price:     { fontSize: 16, fontWeight: '700', color: '#01696f' },
  mrp:       { fontSize: 11, color: '#bab9b4', textDecorationLine: 'line-through' },
  sep:       { height: 8 },
});
