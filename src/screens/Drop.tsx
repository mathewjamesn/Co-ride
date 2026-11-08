import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { T, TopBar } from '../components';
import { colors, radius } from '../theme';
import { Place, allPlaces, quickPlaces } from '../data';
import { useSearch } from '../state';

const tiles = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'office', label: 'Office', icon: 'office-building-outline' },
  { key: 'airport', label: 'Airports', icon: 'airplane' },
  { key: 'fav', label: 'Favourites', icon: 'heart-outline' },
] as const;

/** "Where would you like to go?" drop-off search. */
export function Drop({ navigation }: any) {
  const { s, set, toggleFav, addRecent } = useSearch();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'airport' | 'fav' | null>(null);

  const { title, items } = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query) return { title: 'Results', items: allPlaces.filter(p => (p.name + ' ' + p.addr).toLowerCase().includes(query)) };
    if (tab === 'airport') return { title: 'Airports', items: quickPlaces.airport };
    if (tab === 'fav') return { title: 'Favourites', items: allPlaces.filter(p => s.favs.includes(p.name)) };
    return { title: 'Recent searches', items: s.recents.map(r => allPlaces.find(p => p.name === r) ?? { name: r, addr: 'Recent' }) };
  }, [q, tab, s.favs, s.recents]);

  const pick = (p: Place) => {
    set({ to: p.name });
    addRecent(p.name);
    navigation.navigate('Plan');
  };

  const onTile = (k: (typeof tiles)[number]['key']) => {
    if (k === 'home') pick(quickPlaces.home[0]);
    else if (k === 'office') pick(quickPlaces.office[0]);
    else setTab(tab === k ? null : k);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <TopBar title="Drop-off location" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={st.fields}>
          <View style={st.field}>
            <View style={[st.dot, { backgroundColor: colors.green }]} />
            <TextInput style={st.input} value={s.from} onChangeText={v => set({ from: v })} placeholder="Your location" placeholderTextColor={colors.muted} accessibilityLabel="Your location" />
            {s.from ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear your location" onPress={() => set({ from: '' })} style={st.clear}>
                <Icon name="close" size={16} color={colors.ink} />
              </Pressable>
            ) : null}
          </View>
          <View style={st.sep} />
          <View style={st.field}>
            <View style={[st.dot, { backgroundColor: colors.red }]} />
            <TextInput style={st.input} value={q} onChangeText={setQ} placeholder="Drop location" placeholderTextColor={colors.muted} autoFocus accessibilityLabel="Drop location" />
            {q ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear drop location" onPress={() => setQ('')} style={st.clear}>
                <Icon name="close" size={16} color={colors.ink} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={st.tiles}>
          {tiles.map(t => {
            const on = tab === t.key;
            return (
              <Pressable key={t.key} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onTile(t.key)} style={[st.tile, on && { backgroundColor: colors.lime }]}>
                <Icon name={t.icon} size={26} color={colors.ink} />
                <T v="label">{t.label}</T>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <T v="label" color={colors.muted} style={{ paddingVertical: 8 }}>{title}</T>
          {items.length === 0 ? (
            <T color={colors.muted} style={{ paddingVertical: 12 }}>No saved places match. Try a landmark name, or pick the spot on the map.</T>
          ) : null}
          {items.map(p => {
            const fav = s.favs.includes(p.name);
            return (
              <View key={p.name} style={st.row}>
                <Pressable accessibilityRole="button" onPress={() => pick(p)} style={st.rowMain}>
                  <Icon name={s.recents.includes(p.name) && !q ? 'clock-outline' : 'map-marker'} size={24} color={colors.muted} />
                  <View style={{ flex: 1 }}>
                    <T v="bodyStrong">{p.name}</T>
                    <T v="small" color={colors.muted} numberOfLines={1}>{p.addr}</T>
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={fav ? `Remove ${p.name} from favourites` : `Add ${p.name} to favourites`} onPress={() => toggleFav(p.name)} style={st.heart}>
                  <Icon name={fav ? 'heart' : 'heart-outline'} size={24} color={fav ? colors.red : colors.muted} />
                </Pressable>
              </View>
            );
          })}
          <Pressable accessibilityRole="button" onPress={() => pick({ name: 'Pinned location', addr: 'Selected on map' })} style={st.row}>
            <View style={st.rowMain}>
              <Icon name="map-marker-radius" size={24} color={colors.ink} />
              <T v="bodyStrong">Select location from map</T>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = StyleSheet.create({
  fields: { margin: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.ground, paddingHorizontal: 12 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  input: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink, minHeight: 48, padding: 0 },
  sep: { height: 1.5, backgroundColor: colors.line },
  clear: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  tiles: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 4, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 6 },
  tile: { flex: 1, minHeight: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  rowMain: { flex: 1, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14 },
  heart: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
