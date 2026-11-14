import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Header, MapMock, PersonCard, Segmented, T, Toggle } from '../components';
import { colors, radius, makeStyles } from '../theme';
import { Person, rideGivers, rideTakers } from '../data';
import { useSearch } from '../state';
import { useKeepAwake } from '../keepAwake';
import { callNumber } from './Chat';

export type Sort = 'recommended' | 'route' | 'points' | 'active' | 'pickup';
const sortLabels: [Sort, string][] = [
  ['recommended', 'Recommended'],
  ['route', 'Route % - High to Low'],
  ['points', 'Points - Low to High'],
  ['active', 'Active Users - High to Low'],
  ['pickup', 'Pickup Point Distance - Low to High'],
];
const km = (t: string) => (t.endsWith('km') ? parseFloat(t) * 1000 : parseFloat(t));

function sortList(list: Person[], by: Sort) {
  const l = [...list];
  if (by === 'route') l.sort((a, b) => b.match - a.match);
  if (by === 'points') l.sort((a, b) => a.points - b.points);
  if (by === 'active') l.sort((a, b) => b.reviews - a.reviews);
  if (by === 'pickup') l.sort((a, b) => km(a.walkTo) - km(b.walkTo));
  return l;
}

/** Map summary: "Found N carpool givers on your route" with a See givers button. */
export function Matches({ navigation }: any) {
  const { s } = useSearch();
  useKeepAwake();
  const { top, bottom } = useSafeAreaInsets();
  const find = s.mode === 'find';
  const total = (find ? rideGivers : rideTakers).length;
  const noun = find ? 'carpool givers' : 'ride takers';
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[st.matchBar, { paddingTop: top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()} style={st.barBtn}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T v="bodyStrong" numberOfLines={1}>{s.from} to {s.to}</T>
          <T v="small" color={colors.muted}>{s.when}</T>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <MapMock height={420} />
      </View>
      <View style={[st.sheet, { paddingBottom: bottom + 16 }]}>
        <View style={st.grab} />
        <T v="label" color={colors.muted} style={{ marginBottom: 8 }}>Ride matches</T>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={st.found}><T v="bodyStrong">Found {total} {noun} on your route.</T></View>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Results')} style={st.see}>
            <T v="bodyStrong" color={colors.accent}>{find ? 'See givers' : 'See takers'}</T>
            <View style={st.badge}><T v="label">{total}</T></View>
          </Pressable>
        </View>
        <View style={{ marginTop: 16, gap: 10 }}>
          <View style={st.stop}><View style={[st.dot, { backgroundColor: colors.green }]} /><T v="label" style={{ flex: 1 }} numberOfLines={1}>{s.from}</T></View>
          <View style={st.stop}><View style={[st.dot, { backgroundColor: colors.red }]} /><T v="label" style={{ flex: 1 }} numberOfLines={1}>{s.to}</T><T v="label" color={colors.muted}>11 km</T></View>
        </View>
      </View>
    </View>
  );
}

/** List of ride givers (Find) or ride takers (Offer) with filter */
export function Results({ navigation, route }: any) {
  const { s } = useSearch();
  const find = s.mode === 'find';
  const [sort, setSort] = useState<Sort>(route.params?.sort ?? 'recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const base = find ? rideGivers : rideTakers;
  const data = useMemo(() => sortList(base.filter(p => !verifiedOnly || p.verified), sort), [base, sort, verifiedOnly]);
  const noun = find ? 'ride givers' : 'ride takers';

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header
        title={`${data.length} ${noun} available`}
        subtitle={s.when}
        onBack={() => navigation.goBack()}
        rightIcon="filter-variant"
        onRight={() => navigation.navigate('Filter', { sort, verifiedOnly, noun, onApply: (a: Sort, b: boolean) => { setSort(a); setVerifiedOnly(b); } })}
      />
      <FlatList
        data={data}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={st.summary}>
            <Icon name="map-marker-path" size={22} color={colors.text} />
            <T style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>{s.from} → {s.to}</T>
            <T v="label" color={colors.muted}>11 KM</T>
          </View>
        }
        ListEmptyComponent={
          <View style={[st.summary, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
            <T v="heading">No {noun} match these filters</T>
            <T v="small" color={colors.muted}>Try turning off the verification filter.</T>
            <Button title="Reset filters" onPress={() => setVerifiedOnly(false)} />
          </View>
        }
        renderItem={({ item, index }) => (
          <PersonCard
            p={item}
            cta={find ? 'Request' : 'Offer'}
            onCta={() => navigation.navigate('Status', { person: item, find })}
            onPress={() => navigation.navigate('Route', { list: data, index })}
            onChat={() => navigation.navigate('Chat', { id: item.id, name: item.name, sub: item.org })}
            onCall={callNumber}
          />
        )}
      />
    </View>
  );
}

/** Route detail with pickup/drop and pager through matches */
export function RouteDetail({ navigation, route }: any) {
  const { list, index: start }: { list: Person[]; index: number } = route.params;
  const [i, setI] = useState(start);
  const p = list[i];
  const find = useSearch().s.mode === 'find';
  const { top, bottom } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[st.routeHead, { paddingTop: top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={st.close} onPress={() => navigation.goBack()}><Icon name="close" size={22} color={colors.onInk} /></Pressable>
        <T v="heading">{find ? `${p.name}'s ride route` : 'Matching ride taker'}</T>
      </View>
      <View>
        <MapMock height={300} />
        <View style={st.legCard}>
          <Icon name="walk" size={20} color={colors.muted} /><T v="label">{p.walkTo}</T>
          <Icon name="chevron-right" size={20} color={colors.muted} />
          <Icon name={p.vehicle === 'bike' ? 'motorbike' : 'car'} size={20} color={colors.text} />
          <Icon name="chevron-right" size={20} color={colors.muted} />
          <Icon name="walk" size={20} color={colors.muted} /><T v="label">{p.walkFrom}</T>
        </View>
        <View style={[st.tag, { left: 90, top: 150, borderColor: colors.red }]}><T v="label" color={colors.red}>DROP</T></View>
        <View style={[st.tag, { right: 16, top: 190, borderColor: colors.green }]}><T v="label" color={colors.green}>PICK UP</T></View>
        <View style={st.km}><T v="label" color={colors.accent}>{p.ride.replace(' km', ' KM')}</T></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Message ${p.name}`} onPress={() => navigation.navigate('Chat', { id: p.id, name: p.name, sub: p.org })} style={st.chat}><Icon name="message-text" size={26} color={colors.accent} /></Pressable>
      </View>
      <ScrollView style={st.detailSheet} contentContainerStyle={{ padding: 14, paddingBottom: bottom + 14 }}>
        <View style={st.pager}>
          <View style={st.pill}><Icon name="map-marker-account" size={18} color={colors.green} /><T v="label">Pickup</T></View>
          <View style={st.count}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous match" onPress={() => setI(Math.max(0, i - 1))}><Icon name="chevron-left" size={28} color={colors.text} /></Pressable>
            <T v="small" style={{ textAlign: 'center', fontWeight: '700' }}>{i + 1} / {list.length}{'\n'}Matches</T>
            <Pressable accessibilityRole="button" accessibilityLabel="Next match" onPress={() => setI(Math.min(list.length - 1, i + 1))}><Icon name="chevron-right" size={28} color={colors.text} /></Pressable>
          </View>
          <View style={st.pill}><Icon name="map-marker" size={18} color={colors.red} /><T v="label">Drop</T></View>
        </View>
        <View style={st.person}>
          <View style={{ alignItems: 'center' }}><Avatar name={p.name} size={72} /><T v="small" style={{ marginTop: 4 }}>Today</T></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <T v="title">{p.name}</T>
                <T v="label" color={p.verified ? colors.green : colors.muted}>{p.verified ? 'Verified' : 'Not verified'}</T>
              </View>
              <View style={{ alignItems: 'center' }}>
                <T v="small" style={{ fontWeight: '700' }}>Route match</T>
                <T v="display" color={colors.text}>{p.match}%</T>
                <T v="label" color={colors.blue}>{p.points} pts</T>
              </View>
            </View>
            <T v="small" style={{ marginTop: 4 }}>★ {p.rating} ({p.reviews})  ·  {p.time}</T>
          </View>
        </View>
        <Button title={find ? 'Join' : 'Offer ride'} variant="lime" onPress={() => navigation.navigate('Status', { person: p, find })} />
      </ScrollView>
    </View>
  );
}

/** Sort / Preferences filter */
export function Filter({ navigation, route }: any) {
  const [tab, setTab] = useState<'sort' | 'prefs'>('sort');
  const [sort, setSort] = useState<Sort>(route.params.sort);
  const [verified, setVerified] = useState<boolean>(route.params.verifiedOnly);
  const { bottom } = useSafeAreaInsets();
  const done = () => { route.params.onApply(sort, verified); navigation.goBack(); };
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Filter your search" />
      <View style={{ margin: 16 }}>
        <Segmented value={tab} options={[['sort', 'Sort by'], ['prefs', 'Preferences']]} onChange={setTab} />
      </View>
      {tab === 'sort' ? sortLabels.map(([k, label]) => (
        <Pressable key={k} accessibilityRole="radio" accessibilityState={{ selected: sort === k }} style={st.opt} onPress={() => setSort(k)}>
          <T v={sort === k ? 'heading' : 'bodyStrong'} style={{ flex: 1 }}>{label}</T>
          <Icon name={sort === k ? 'radiobox-marked' : 'radiobox-blank'} size={30} color={colors.text} />
        </Pressable>
      )) : (
        <View style={st.opt}>
          <View style={{ flex: 1 }}>
            <T v="bodyStrong">Verified users only</T>
            <T v="small" color={colors.muted}>Hide people who have not completed ID checks</T>
          </View>
          <Toggle value={verified} onChange={setVerified} />
        </View>
      )}
      <View style={{ flex: 1 }} />
      <View style={{ padding: 16, paddingBottom: bottom + 16, backgroundColor: colors.ground }}>
        <Button title="Show results" variant="lime" onPress={done} />
      </View>
    </View>
  );
}

const st = makeStyles(() => ({
  matchBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  barBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 16, marginTop: -18, elevation: 8 },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 14 },
  found: { flex: 1.2, backgroundColor: colors.ground, borderRadius: radius.lg, padding: 14, justifyContent: 'center' },
  see: { flex: 1, minHeight: 64, borderRadius: radius.lg, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -8, left: -6, minWidth: 26, height: 26, borderRadius: 13, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  stop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.line },
  routeHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingBottom: 12 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  legCard: { position: 'absolute', top: 10, left: 14, right: 14, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 3 },
  tag: { position: 'absolute', backgroundColor: colors.white, borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  km: { position: 'absolute', left: 150, top: 110, backgroundColor: colors.ink, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  chat: { position: 'absolute', right: 14, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  detailSheet: { flex: 1, marginTop: -16, backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.lime, borderRadius: radius.xl, padding: 10, marginBottom: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.text, borderRadius: radius.pill, paddingHorizontal: 12, height: 46 },
  count: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 8, height: 54 },
  person: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 14 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, minHeight: 68 },
}));
