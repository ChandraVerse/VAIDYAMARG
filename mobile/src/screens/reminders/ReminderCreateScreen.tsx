import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { remindersApi } from '../../api/reminders.api';
import { medicinesApi } from '../../api/medicines.api';
import type { RootStackProps } from '../../navigation/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type Medicine = {
  id: string;
  name: string;
  manufacturer?: string;
};

const INTERVAL_OPTIONS = [
  { label: '7 days',  value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
];

const TIME_PRESETS = [
  { label: 'Morning',   value: '08:00' },
  { label: 'Afternoon', value: '13:00' },
  { label: 'Evening',   value: '18:00' },
  { label: 'Night',     value: '21:00' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Once daily', value: 'OD' },
  { label: 'Twice daily', value: 'BD' },
  { label: 'Thrice daily', value: 'TDS' },
  { label: 'Weekly', value: 'weekly' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReminderCreateScreen({ navigation }: RootStackProps<'ReminderCreate'>) {
  // Medicine search
  const [query, setQuery]                   = useState('');
  const [results, setResults]               = useState<Medicine[]>([]);
  const [searching, setSearching]           = useState(false);
  const [selectedMedicine, setSelected]     = useState<Medicine | null>(null);

  // Form state
  const [intervalDays, setIntervalDays]     = useState(30);
  const [reminderTime, setReminderTime]     = useState('08:00');
  const [customTime, setCustomTime]         = useState('');
  const [useCustomTime, setUseCustomTime]   = useState(false);
  const [frequency, setFrequency]           = useState('OD');

  // Submission
  const [submitting, setSubmitting]         = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Search ────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
    setSelected(null);
    setResults([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await medicinesApi.search(text.trim());
        setResults(res.data?.medicines ?? res.data?.items ?? []);
      } catch {
        // silent — don't block typing on network errors
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const handleSelect = (med: Medicine) => {
    setSelected(med);
    setQuery(med.name);
    setResults([]);
  };

  // ─── Effective time ────────────────────────────────────────────────────

  const effectiveTime = (): string => {
    if (useCustomTime) {
      // Validate HH:MM format
      const match = customTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
      return match ? customTime : reminderTime;
    }
    return reminderTime;
  };

  // ─── Submit ────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!selectedMedicine) {
      Alert.alert('Medicine required', 'Please search and select a medicine first.');
      return;
    }

    const time = effectiveTime();
    if (useCustomTime && !customTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
      Alert.alert('Invalid time', 'Please enter a valid time in HH:MM format (e.g. 09:30).');
      return;
    }

    setSubmitting(true);
    try {
      await remindersApi.create({
        medicineId:   selectedMedicine.id,
        medicineName: selectedMedicine.name,
        reminderTime: time,
        frequency,
      });
      Alert.alert(
        'Reminder set ✓',
        `You'll be reminded to refill ${selectedMedicine.name} every ${intervalDays} days at ${time}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not create reminder. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section: Medicine ────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Medicine</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.input,
              selectedMedicine ? styles.inputSelected : null,
            ]}
            placeholder="Search medicine name…"
            placeholderTextColor="#bab9b4"
            value={query}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searching && (
            <ActivityIndicator
              style={styles.searchSpinner}
              size="small"
              color="#01696f"
            />
          )}
        </View>

        {/* Search results dropdown */}
        {results.length > 0 && !selectedMedicine && (
          <View style={styles.dropdown}>
            <FlatList
              data={results.slice(0, 6)}
              keyExtractor={(m) => m.id}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.dropDivider} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropName}>{item.name}</Text>
                  {item.manufacturer ? (
                    <Text style={styles.dropMfr}>{item.manufacturer}</Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {selectedMedicine && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓ {selectedMedicine.name}</Text>
            <TouchableOpacity onPress={() => { setSelected(null); setQuery(''); }}>
              <Text style={styles.clearText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Section: Frequency ──────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Frequency</Text>
        <View style={styles.chipRow}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, frequency === opt.value && styles.chipActive]}
              onPress={() => setFrequency(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                frequency === opt.value && styles.chipTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Section: Refill interval ─────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Refill every</Text>
        <View style={styles.chipRow}>
          {INTERVAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, intervalDays === opt.value && styles.chipActive]}
              onPress={() => setIntervalDays(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                intervalDays === opt.value && styles.chipTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Section: Reminder time ───────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Reminder time</Text>

        {!useCustomTime && (
          <View style={styles.chipRow}>
            {TIME_PRESETS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, reminderTime === opt.value && styles.chipActive]}
                onPress={() => setReminderTime(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.chipText,
                  reminderTime === opt.value && styles.chipTextActive,
                ]}>
                  {opt.label}
                  {'\n'}
                  <Text style={styles.chipSub}>{opt.value}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.customToggle}
          onPress={() => setUseCustomTime((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.customToggleText}>
            {useCustomTime ? '← Use preset times' : '+ Set custom time'}
          </Text>
        </TouchableOpacity>

        {useCustomTime && (
          <TextInput
            style={styles.input}
            placeholder="HH:MM  (e.g. 09:30)"
            placeholderTextColor="#bab9b4"
            value={customTime}
            onChangeText={setCustomTime}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            returnKeyType="done"
          />
        )}

        {/* ── Preview ─────────────────────────────────────────────────── */}
        {selectedMedicine && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Reminder preview</Text>
            <Text style={styles.previewLine}>
              💊 <Text style={styles.previewBold}>{selectedMedicine.name}</Text>
            </Text>
            <Text style={styles.previewLine}>
              🕐 {effectiveTime()} · {FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label}
            </Text>
            <Text style={styles.previewLine}>
              🔄 Refill alert every {intervalDays} days
            </Text>
          </View>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.btn,
            (!selectedMedicine || submitting) && styles.btnDisabled,
          ]}
          onPress={handleCreate}
          disabled={!selectedMedicine || submitting}
          activeOpacity={0.8}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Set Reminder</Text>
          }
        </TouchableOpacity>

        {/* Bottom padding for keyboard */}
        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#f7f6f2' },
  content:         { padding: 20 },

  sectionLabel:    { fontSize: 13, fontWeight: '600', color: '#7a7974', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  searchRow:       { position: 'relative' },
  searchSpinner:   { position: 'absolute', right: 12, top: 14 },

  input:           { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#dcd9d5', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#28251d' },
  inputSelected:   { borderColor: '#01696f' },

  dropdown:        { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#dcd9d5', marginTop: 4, overflow: 'hidden' },
  dropDivider:     { height: 1, backgroundColor: '#f3f0ec' },
  dropItem:        { paddingHorizontal: 14, paddingVertical: 12 },
  dropName:        { fontSize: 14, fontWeight: '600', color: '#28251d' },
  dropMfr:         { fontSize: 12, color: '#7a7974', marginTop: 2 },

  selectedBadge:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#cedcd8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  selectedText:    { fontSize: 14, fontWeight: '600', color: '#01696f', flex: 1 },
  clearText:       { fontSize: 13, color: '#0c4e54', fontWeight: '600' },

  chipRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcd9d5', alignItems: 'center' },
  chipActive:      { backgroundColor: '#01696f', borderColor: '#01696f' },
  chipText:        { fontSize: 13, color: '#28251d', fontWeight: '500', textAlign: 'center' },
  chipTextActive:  { color: '#fff' },
  chipSub:         { fontSize: 11, color: '#7a7974' },

  customToggle:    { marginTop: 10, marginBottom: 6 },
  customToggleText:{ fontSize: 13, color: '#01696f', fontWeight: '600' },

  preview:         { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 24, borderWidth: 1, borderColor: '#dcd9d5' },
  previewTitle:    { fontSize: 12, fontWeight: '600', color: '#7a7974', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  previewLine:     { fontSize: 14, color: '#28251d', marginBottom: 5, lineHeight: 20 },
  previewBold:     { fontWeight: '700' },

  btn:             { backgroundColor: '#01696f', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  btnDisabled:     { opacity: 0.45 },
  btnText:         { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
