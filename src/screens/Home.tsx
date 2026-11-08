import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Segmented, T } from '../components';
import { colors, radius, shadow } from '../theme';
import { Place, PresetKey, presetPlaces, quickPlaces } from '../data';
import { useSearch } from '../state';

/** Place list shown when a shortcut (Airports, Favourites, a preset) is expanded. */
function PlaceMenu({ title, items, onPick, onClose }: { title: string; items: Place[]; onPick: (p: Place) => void; onClose: () => void }) {
  return (
    <View style={st.menu}>
      <View style={st.menuHead}>
        <T v="label">{title}</T>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8} style={{ minHeight: 36, justifyContent: 'center' }}>
          <T v="label" color={colors.muted}>Close</T>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <T v="small" color={colors.muted} style={{ paddingVertical: 10 }}>No favourites yet. Tap the heart on a place to save it.</T>
      ) : (
        items.map(p => (
          <Pressable key={p.name} accessibilityRole="button" onPress={() => onPick(p)} style={st.menuRow}>
            <Icon name="map-marker" size={20} color={colors.ink} />
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">{p.name}</T>
              <T v="small" color={colors.muted} numberOfLines={1}>{p.addr}</T>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

const quickTiles = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'office', label: 'Office', icon: 'office-building-outline' },
  { key: 'airport', label: 'Airports', icon: 'airplane' },
  { key: 'fav', label: 'Favourites', icon: 'heart-outline' },
] as const;

/** Landing screen: Find a Pool / Offer Pool, "Where would you like to go?", shortcuts. */
export function Home({ navigation }: any) {
  const { s, set, addRecent } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  const [open, setOpen] = useState<'airport' | 'fav' | PresetKey | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const find = s.mode === 'find';

  const pick = (p: Place) => {
    set({ to: p.name });
    addRecent(p.name);
    setOpen(null);
    navigation.navigate('Plan');
  };

  const menuFor = () => {
    if (open === 'airport') return { title: 'Airports', items: quickPlaces.airport };
    if (open === 'fav') {
      const all = [...quickPlaces.home, ...quickPlaces.office, ...quickPlaces.airport, ...Object.values(presetPlaces).flatMap(x => x.items)];
      return { title: 'Favourites', items: all.filter(p => s.favs.includes(p.name)) };
    }
    if (open) return { title: presetPlaces[open].label, items: presetPlaces[open].items };
    return null;
  };
  const menu = menuFor();
  const quickMenu = open === 'airport' || open === 'fav';

  const onQuick = (k: (typeof quickTiles)[number]['key']) => {
    if (k === 'home') pick(quickPlaces.home[0]);
    else if (k === 'office') pick(quickPlaces.office[0]);
    else setOpen(open === k ? null : k);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 8, paddingBottom: bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={st.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open menu" style={st.iconBtn} onPress={() => navigation.navigate('Menu')}>
            <Icon name="menu" size={26} color={colors.ink} />
          </Pressable>
          <T v="heading">Co-ride</T>
          <View style={st.iconBtn}>
            <Icon name="bell-outline" size={24} color={colors.ink} />
          </View>
        </View>

        <View style={st.hero}>
          <View style={st.heroCircle}>
            <Icon name="car-side" size={96} color={colors.ink} />
            <View style={st.heroPeople}>
              {['#B45309', '#1F5FBF', '#7C3AED'].map(c => (
                <View key={c} style={[st.person, { backgroundColor: c }]}>
                  <Icon name="account" size={20} color={colors.white} />
                </View>
              ))}
            </View>
          </View>
          <T v="display" style={{ marginTop: 14, textAlign: 'center' }}>Share the ride.{'\n'}Split the cost.</T>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <Segmented value={s.mode} options={[['find', 'Find a Pool'], ['offer', 'Offer Pool']]} onChange={m => set({ mode: m })} />

          <View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Drop')} style={st.search}>
              <Icon name="magnify" size={24} color={colors.ink} />
              <T v="heading">Where would you like to go?</T>
            </Pressable>
            <T v="small" color={colors.muted} style={{ textAlign: 'center', marginTop: 8 }}>
              {find ? 'Find verified people going your way' : 'Offer your empty seats and cover your fuel'}
            </T>
          </View>

          <View style={st.card}>
            <View style={{ flexDirection: 'row' }}>
              {quickTiles.map(q => {
                const on = (q.key === 'airport' || q.key === 'fav') && open === q.key;
                return (
                  <Pressable key={q.key} accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => onQuick(q.key)} style={[st.tile, on && { backgroundColor: colors.lime }]}>
                    <Icon name={q.icon} size={28} color={colors.ink} />
                    <T v="label">{q.label}</T>
                  </Pressable>
                );
              })}
            </View>
            {menu && quickMenu ? <PlaceMenu title={menu.title} items={menu.items} onPick={pick} onClose={() => setOpen(null)} /> : null}
          </View>

          <View style={st.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: presetsOpen }} onPress={() => setPresetsOpen(!presetsOpen)} style={st.cardHead}>
              <T v="bodyStrong">Preset locations</T>
              <Icon name={presetsOpen ? 'chevron-up' : 'chevron-down'} size={24} color={colors.ink} />
            </Pressable>
            {presetsOpen ? (
              <>
                <View style={st.grid}>
                  {(Object.keys(presetPlaces) as PresetKey[]).map(k => {
                    const on = open === k;
                    return (
                      <Pressable key={k} accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => setOpen(on ? null : k)} style={[st.gridTile, on && { backgroundColor: colors.lime }]}>
                        <Icon name={presetPlaces[k].icon as any} size={28} color={colors.ink} />
                        <T v="label">{presetPlaces[k].label}</T>
                      </Pressable>
                    );
                  })}
                </View>
                {menu && !quickMenu ? <PlaceMenu title={menu.title} items={menu.items} onPick={pick} onClose={() => setOpen(null)} /> : null}
              </>
            ) : null}
            <View style={st.divider} />
            {s.recents.length === 0 ? (
              <T color={colors.muted} style={{ textAlign: 'center', paddingVertical: 8 }}>- No recent searches -</T>
            ) : (
              <View>
                <T v="label" color={colors.muted} style={{ paddingBottom: 4 }}>Recent searches</T>
                {s.recents.map(r => (
                  <Pressable key={r} accessibilityRole="button" onPress={() => { set({ to: r }); navigation.navigate('Plan'); }} style={st.menuRow}>
                    <Icon name="clock-outline" size={20} color={colors.muted} />
                    <T v="bodyStrong" style={{ flex: 1 }}>{r}</T>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  hero: { alignItems: 'center', paddingVertical: 18 },
  heroCircle: { width: 190, height: 190, borderRadius: 95, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  heroPeople: { flexDirection: 'row', marginTop: 6 },
  person: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lime, marginHorizontal: -3 },
  search: { minHeight: 68, borderRadius: radius.xl, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...shadow },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 10, borderWidth: 1, borderColor: colors.line },
  cardHead: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  tile: { flex: 1, minHeight: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridTile: { width: '33.33%', minHeight: 76, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 6 },
  menu: { marginTop: 8, borderTopWidth: 2, borderTopColor: colors.lime, paddingTop: 4, paddingHorizontal: 6 },
  menuHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
});
