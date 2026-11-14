import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav, Segmented, T } from '../components';
import { colors, radius, shadow, makeStyles } from '../theme';
import { Place, PresetKey, allPlaces, presetPlaces, quickPlaces } from '../data';
import { useSearch } from '../state';

/** Place list shown when a shortcut (Recent, Favourites, a preset) is expanded. */
function PlaceMenu({ title, items, empty, icon = 'map-marker', onPick, onClose }: { title: string; items: Place[]; empty: string; icon?: string; onPick: (p: Place) => void; onClose: () => void }) {
  return (
    <View style={st.menu}>
      <View style={st.menuHead}>
        <T v="label">{title}</T>
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8} style={{ minHeight: 36, justifyContent: 'center' }}>
          <T v="label" color={colors.muted}>Close</T>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <T v="small" color={colors.muted} style={{ paddingVertical: 10 }}>{empty}</T>
      ) : (
        items.map(p => (
          <Pressable key={p.name} accessibilityRole="button" onPress={() => onPick(p)} style={st.menuRow}>
            <Icon name={icon as any} size={20} color={colors.text} />
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
  { key: 'recent', label: 'Recent', icon: 'history' },
  { key: 'fav', label: 'Favourites', icon: 'heart-outline' },
] as const;

/** Landing screen: Find a Pool / Offer Pool, "Where would you like to go?", shortcuts. */
export function Home({ navigation }: any) {
  const { s, set, addRecent } = useSearch();
  const { top } = useSafeAreaInsets();
  const [open, setOpen] = useState<'recent' | 'fav' | PresetKey | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const find = s.mode === 'find';

  const pick = (p: Place) => {
    set({ to: p.name });
    addRecent(p.name);
    setOpen(null);
    navigation.navigate('Plan');
  };

  const menuFor = () => {
    if (open === 'recent') return { title: 'Recent', items: s.recents.map(r => allPlaces.find(p => p.name === r) ?? { name: r, addr: 'Recent search' }) };
    if (open === 'fav') {
      const all = [...quickPlaces.home, ...quickPlaces.office, ...Object.values(presetPlaces).flatMap(x => x.items)];
      return { title: 'Favourites', items: all.filter(p => s.favs.includes(p.name)) };
    }
    if (open) return { title: presetPlaces[open].label, items: presetPlaces[open].items };
    return null;
  };
  const menu = menuFor();
  const quickMenu = open === 'recent' || open === 'fav';

  const onQuick = (k: (typeof quickTiles)[number]['key']) => {
    if (k === 'home') pick(quickPlaces.home[0]);
    else if (k === 'office') pick(quickPlaces.office[0]);
    else setOpen(open === k ? null : k);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 8, paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        <View style={st.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open menu" style={st.iconBtn} onPress={() => navigation.navigate('Menu')}>
            <Icon name="menu" size={26} color={colors.text} />
          </Pressable>
          <T v="heading">Go-Pool</T>
          <View style={st.iconBtn}>
            <Icon name="bell-outline" size={24} color={colors.text} />
          </View>
        </View>

        <View style={st.hero}>
          <View style={st.heroCircle}>
            <Icon name="car-side" size={58} color={colors.text} />
            <View style={st.heroPeople}>
              {['#B45309', '#1F5FBF', '#7C3AED'].map(c => (
                <View key={c} style={[st.person, { backgroundColor: c }]}>
                  <Icon name="account" size={16} color={colors.onInk} />
                </View>
              ))}
            </View>
          </View>
          <T v="title" style={{ marginTop: 8, textAlign: 'center' }}>Share the ride.{'\n'}Split the cost.</T>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 14 }}>
          <Segmented value={s.mode} options={[['find', 'Find a Pool'], ['offer', 'Offer Pool']]} onChange={m => set({ mode: m })} />

          <View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Drop')} style={st.search}>
              <Icon name="magnify" size={24} color={colors.text} />
              <T v="heading">Where would you like to go?</T>
            </Pressable>
            <T v="small" color={colors.muted} style={{ textAlign: 'center', marginTop: 8 }}>
              {find ? 'Find verified people going your way' : 'Offer your empty seats and cover your fuel'}
            </T>
          </View>

          <View style={st.card}>
            <View style={{ flexDirection: 'row' }}>
              {quickTiles.map(q => {
                const on = (q.key === 'recent' || q.key === 'fav') && open === q.key;
                return (
                  <Pressable key={q.key} accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => onQuick(q.key)} style={[st.tile, on && { backgroundColor: colors.lime }]}>
                    <Icon name={q.icon} size={28} color={colors.text} />
                    <T v="label">{q.label}</T>
                  </Pressable>
                );
              })}
            </View>
            {menu && quickMenu ? <PlaceMenu title={menu.title} items={menu.items} empty={open === 'recent' ? 'No recent searches yet. Places you search will show up here.' : open === 'fav' ? 'No favourites yet. Tap the heart on a place to save it.' : 'No places here yet.'} icon={open === 'recent' ? 'history' : 'map-marker'} onPick={pick} onClose={() => setOpen(null)} /> : null}
          </View>

          <View style={st.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: presetsOpen }} onPress={() => setPresetsOpen(!presetsOpen)} style={st.cardHead}>
              <T v="bodyStrong">Preset locations</T>
              <Icon name={presetsOpen ? 'chevron-up' : 'chevron-down'} size={24} color={colors.text} />
            </Pressable>
            {presetsOpen ? (
              <>
                <View style={st.grid}>
                  {(Object.keys(presetPlaces) as PresetKey[]).map(k => {
                    const on = open === k;
                    return (
                      <Pressable key={k} accessibilityRole="button" accessibilityState={{ expanded: on }} onPress={() => setOpen(on ? null : k)} style={[st.gridTile, on && { backgroundColor: colors.lime }]}>
                        <Icon name={presetPlaces[k].icon as any} size={28} color={colors.text} />
                        <T v="label">{presetPlaces[k].label}</T>
                      </Pressable>
                    );
                  })}
                </View>
                {menu && !quickMenu ? <PlaceMenu title={menu.title} items={menu.items} empty="No places here yet." onPick={pick} onClose={() => setOpen(null)} /> : null}
              </>
            ) : null}
          </View>

        </View>
      </ScrollView>
      <BottomNav active="Home" navigation={navigation} />
    </View>
  );
}

const st = makeStyles(() => ({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  hero: { alignItems: 'center', paddingVertical: 6 },
  heroCircle: { width: 118, height: 118, borderRadius: 59, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  heroPeople: { flexDirection: 'row', marginTop: 2 },
  person: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.lime, marginHorizontal: -3 },
  search: { minHeight: 68, borderRadius: radius.xl, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...shadow },
  card: { backgroundColor: colors.white, borderRadius: radius.xl, padding: 10, borderWidth: 1, borderColor: colors.line },
  cardHead: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  tile: { flex: 1, minHeight: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridTile: { width: '33.33%', minHeight: 76, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 6 },
  menu: { marginTop: 8, borderTopWidth: 2, borderTopColor: colors.lime, paddingTop: 4, paddingHorizontal: 6 },
  menuHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  shortcut: { flex: 1, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
  shortIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 8 },
}));
