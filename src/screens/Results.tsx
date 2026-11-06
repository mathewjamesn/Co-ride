import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Avatar, Button, GreenHeader, MapMock, PersonCard } from '../components';
import { colors } from '../theme';
import { Person, rideGivers, rideTakers } from '../data';
import { useSearch } from '../state';

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

/** List of ride givers (Find) or ride takers (Offer) with map summary + filter */
export function Results({ navigation, route }: any) {
  const { s } = useSearch();
  const find = s.mode === 'find';
  const [sort, setSort] = useState<Sort>(route.params?.sort ?? 'recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const base = find ? rideGivers : rideTakers;
  const data = useMemo(() => sortList(base.filter(p => !verifiedOnly || p.verified), sort), [base, sort, verifiedOnly]);
  const noun = find ? 'Ride givers' : 'Ride takers';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GreenHeader title={`${data.length} ${noun} available`} subtitle="5 Nov at 5:35 PM" onBack={() => navigation.goBack()} rightIcon="filter-variant" onRight={() => navigation.navigate('Filter', { sort, verifiedOnly, onApply: (a: Sort, b: boolean) => { setSort(a); setVerifiedOnly(b); } })} />
      <FlatList
        data={data}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={st.summary}>
            <Icon name="map-marker-path" size={22} color={colors.primary} />
            <Text style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>{s.from} → {s.to}</Text>
            <Text style={{ color: colors.muted }}>11 KM</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <PersonCard
            p={item}
            cta={find ? 'Request' : 'Offer'}
            onCta={() => navigation.navigate('Status', { person: item, find })}
            onPress={() => navigation.navigate('Route', { list: data, index })}
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
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={st.routeHead}>
        <Pressable style={st.close} onPress={() => navigation.goBack()}><Icon name="close" size={22} color="#fff" /></Pressable>
        <Text style={{ fontSize: 20, fontWeight: '500' }}>{find ? `${p.name}'s Ride Route` : 'Matching Ride taker'}</Text>
      </View>
      <View>
        <MapMock height={330} label={`${p.ride}`} />
        <View style={st.legCard}>
          <Icon name="walk" size={20} color={colors.muted} /><Text style={st.legTxt}>{p.walkTo}</Text>
          <Icon name="chevron-right" size={20} color={colors.muted} />
          <Icon name={p.vehicle === 'bike' ? 'motorbike' : 'car'} size={20} color={colors.muted} />
          <Icon name="chevron-right" size={20} color={colors.muted} />
          <Icon name="walk" size={20} color={colors.muted} /><Text style={st.legTxt}>{p.walkFrom}</Text>
        </View>
        <View style={[st.tag, { left: 90, top: 150, borderColor: colors.red }]}><Text>DROP</Text></View>
        <View style={[st.tag, { right: 16, top: 190, borderColor: colors.green }]}><Text>PICK UP</Text></View>
        <View style={st.km}><Text style={{ color: '#fff', fontWeight: '700' }}>{p.ride.replace(' km', ' KM')}</Text></View>
        <View style={st.chat}><Icon name="phone-message" size={28} color="#fff" /></View>
      </View>
      <ScrollView style={{ flex: 1, marginTop: -16, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 }} contentContainerStyle={{ padding: 14 }}>
        <View style={st.pager}>
          <View style={st.pill}><Icon name="map-marker-account" size={18} color={colors.primary} /><Text style={st.pillT}>Pickup</Text></View>
          <View style={st.count}>
            <Pressable onPress={() => setI(Math.max(0, i - 1))}><Icon name="chevron-left" size={28} /></Pressable>
            <Text style={{ textAlign: 'center' }}>{i + 1} / {list.length}{'\n'}Matches</Text>
            <Pressable onPress={() => setI(Math.min(list.length - 1, i + 1))}><Icon name="chevron-right" size={28} /></Pressable>
          </View>
          <View style={st.pill}><Icon name="map-marker" size={18} color={colors.red} /><Text style={st.pillT}>Drop</Text></View>
        </View>
        <View style={st.person}>
          <View style={{ alignItems: 'center' }}><Avatar name={p.name} size={76} /><Text style={{ marginTop: 4 }}>Today</Text></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '700' }}>{p.name}</Text>
                <Text style={{ color: p.verified ? colors.primary : colors.muted }}>{p.verified ? '✔ Verified' : 'Not verified'}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontWeight: '700' }}>Route Match</Text>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>{p.match}%</Text>
                <Text style={{ color: colors.blue, fontWeight: '700' }}>{p.points} Points</Text>
              </View>
            </View>
            <Text style={{ marginTop: 4 }}>★ {p.rating} ({p.reviews})   🕔 {p.time}</Text>
          </View>
        </View>
        <Button title={find ? 'JOIN' : 'OFFER RIDE'} onPress={() => navigation.navigate('Status', { person: p, find })} />
      </ScrollView>
    </View>
  );
}

/** Sort / Preferences filter */
export function Filter({ navigation, route }: any) {
  const [tab, setTab] = useState<'sort' | 'prefs'>('sort');
  const [sort, setSort] = useState<Sort>(route.params.sort);
  const [verified, setVerified] = useState<boolean>(route.params.verifiedOnly);
  const done = () => { route.params.onApply(sort, verified); navigation.goBack(); };
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <GreenHeader title="Filter your search" />
      <View style={st.seg}>
        {(['sort', 'prefs'] as const).map(t => (
          <Pressable key={t} style={[st.segItem, tab === t && { backgroundColor: colors.primary }]} onPress={() => setTab(t)}>
            <Text style={[{ fontSize: 16 }, tab === t && { color: '#fff' }]}>{t === 'sort' ? 'Sort By' : 'Preferences'}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'sort' ? sortLabels.map(([k, label]) => (
        <Pressable key={k} style={st.opt} onPress={() => setSort(k)}>
          <Text style={[st.optT, sort === k && { color: colors.primary }]}>{label}</Text>
          <Icon name={sort === k ? 'radiobox-marked' : 'radiobox-blank'} size={30} color={colors.primary} />
        </Pressable>
      )) : (
        <View style={st.opt}>
          <Text style={st.optT}>Verified users only</Text>
          <Switch value={verified} onValueChange={setVerified} trackColor={{ true: colors.mint, false: '#ccc' }} thumbColor={verified ? colors.primary : '#f4f4f4'} />
        </View>
      )}
      <View style={{ flex: 1 }} />
      <Pressable style={st.back} onPress={done}>
        <Icon name="arrow-left" size={30} /><Text style={{ fontSize: 18, fontWeight: '600' }}>Back</Text>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 16 },
  routeHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 44, paddingBottom: 12 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4B6277', alignItems: 'center', justifyContent: 'center' },
  legCard: { position: 'absolute', top: 10, left: 14, right: 14, backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 6, elevation: 3 },
  legTxt: { color: colors.muted, fontSize: 15 },
  tag: { position: 'absolute', backgroundColor: '#fff', borderWidth: 2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  km: { position: 'absolute', left: 150, top: 110, backgroundColor: colors.blue, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  chat: { position: 'absolute', right: 14, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.mint, borderRadius: 20, padding: 12, marginBottom: 14 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primary, borderRadius: 24, paddingHorizontal: 14, height: 46 },
  pillT: { fontSize: 16, fontWeight: '500' },
  count: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 8, height: 54 },
  person: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#eee', padding: 14, marginBottom: 14 },
  seg: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 30, margin: 16, padding: 0, overflow: 'hidden' },
  segItem: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 30 },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 74 },
  optT: { fontSize: 19, fontWeight: '600' },
  back: { backgroundColor: '#F2F2F2', alignItems: 'center', paddingVertical: 16 },
});
