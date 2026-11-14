import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, CompactCard, Header, MapMock, PersonCard, Segmented, T, Toggle } from '../components';
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
  const { s, set } = useSearch();
  const find = s.mode === 'find';
  const [sort, setSort] = useState<Sort>(route.params?.sort ?? 'recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view, setView] = useState<'detailed' | 'compact'>('detailed');
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
        extraData={view}
        ListHeaderComponent={
          <View>
            <View style={{ marginBottom: 12 }}>
              <Segmented value={view} options={[['detailed', 'Detailed'], ['compact', 'Compact']]} onChange={setView} />
            </View>
            <View style={st.summary}>
              <Icon name="map-marker-path" size={22} color={colors.text} />
              <T style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>{s.from} → {s.to}</T>
              <T v="label" color={colors.muted}>11 KM</T>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[st.summary, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
            <T v="heading">No {noun} match these filters</T>
            <T v="small" color={colors.muted}>Try turning off the verification filter.</T>
            <Button title="Reset filters" onPress={() => setVerifiedOnly(false)} />
          </View>
        }
        renderItem={({ item, index }) => view === 'compact' ? (
          <CompactCard
            p={item}
            cta={s.requested.includes(item.id) ? (find ? 'Requested' : 'Offered') : find ? 'Request' : 'Offer'}
            done={s.requested.includes(item.id)}
            onCta={() => (s.requested.includes(item.id) ? navigation.navigate('Status', { person: item, find }) : set({ requested: [...s.requested, item.id] }))}
            onPress={() => navigation.navigate('Route', { list: data, index })}
          />
        ) : (
          <PersonCard
            p={item}
            cta={s.requested.includes(item.id) ? (find ? 'Requested' : 'Offered') : find ? 'Request' : 'Offer'}
            done={s.requested.includes(item.id)}
            onCta={() => (s.requested.includes(item.id) ? navigation.navigate('Status', { person: item, find }) : set({ requested: [...s.requested, item.id] }))}
            onPress={() => navigation.navigate('Route', { list: data, index })}
            onChat={() => navigation.navigate('Chat', { id: item.id, name: item.name, sub: item.org })}
            onCall={callNumber}
          />
        )}
      />
    </View>
  );
}

/** One step of the journey, drawn as a vertical timeline. */
const Step = ({ icon, color, title, sub, last }: { icon: string; color: string; title: string; sub: string; last?: boolean }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <View style={{ alignItems: 'center', width: 30 }}>
      <View style={[st.stepDot, { backgroundColor: color }]}><Icon name={icon as any} size={16} color={colors.onInk} /></View>
      {!last ? <View style={st.stepLine} /> : null}
    </View>
    <View style={{ flex: 1, paddingBottom: last ? 0 : 14 }}>
      <T v="bodyStrong">{title}</T>
      <T v="small" color={colors.muted}>{sub}</T>
    </View>
  </View>
);

/**
 * Route detail. The map fills the screen; the details live in a bottom sheet that can be
 * peeked (summary + button), expanded (full timeline), or hidden by tapping the map.
 */
export function RouteDetail({ navigation, route }: any) {
  const { list, index: start }: { list: Person[]; index: number } = route.params;
  const [i, setI] = useState(start);
  const [mode, setMode] = useState<'peek' | 'full' | 'hidden'>('peek');
  const [box, setBox] = useState({ w: 360, h: 500 });
  const p = list[i];
  const { s, set } = useSearch();
  const find = s.mode === 'find';
  const sent = s.requested.includes(p.id);
  const { top, bottom } = useSafeAreaInsets();
  const strong = p.match >= 90;
  const vehicle = p.vehicle === 'bike' ? 'Bike' : 'Car';
  const cta = () => (sent ? navigation.navigate('Status', { person: p, find }) : set({ requested: [...s.requested, p.id] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <View style={[st.routeHead, { paddingTop: top + 8 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={st.close} onPress={() => navigation.goBack()}><Icon name="close" size={22} color={colors.onInk} /></Pressable>
        <T v="heading" style={{ flex: 1 }} numberOfLines={1}>{find ? `${p.name}'s ride route` : 'Matching ride taker'}</T>
        <View style={st.pager}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous match" hitSlop={6} onPress={() => setI(Math.max(0, i - 1))}><Icon name="chevron-left" size={26} color={i === 0 ? colors.muted : colors.text} /></Pressable>
          <T v="label">{i + 1}/{list.length}</T>
          <Pressable accessibilityRole="button" accessibilityLabel="Next match" hitSlop={6} onPress={() => setI(Math.min(list.length - 1, i + 1))}><Icon name="chevron-right" size={26} color={i === list.length - 1 ? colors.muted : colors.text} /></Pressable>
        </View>
      </View>

      <View style={{ flex: 1 }} onLayout={e => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {/* Tap the map to hide or bring back the details */}
        <Pressable accessibilityRole="button" accessibilityLabel={mode === 'hidden' ? 'Show details' : 'Hide details, show full map'} onPress={() => setMode(mode === 'hidden' ? 'peek' : 'hidden')} style={StyleAbs}>
          <MapMock height={box.h} />
        </Pressable>

        {/* Map labels: kept short, and larger when the sheet is hidden */}
        <View pointerEvents="none" style={[st.tag, { left: 0.78 * 360 - 96, top: 0.15 * box.h + 12, borderColor: colors.green }]}>
          <T v="label" color={colors.green}>PICK UP · {p.walkTo}</T>
        </View>
        <View pointerEvents="none" style={[st.tag, { left: 0.18 * 360 + 22, top: 0.88 * box.h - 42, borderColor: colors.red }]}>
          <T v="label" color={colors.red}>DROP · {p.walkFrom}</T>
        </View>
        <View pointerEvents="none" style={[st.km, { left: 130, top: 0.38 * box.h }]}><T v="label" color={colors.accent}>{p.ride.replace(' km', ' KM')}</T></View>

        <Pressable accessibilityRole="button" accessibilityLabel={mode === 'hidden' ? 'Show details' : 'Full screen map'} onPress={() => setMode(mode === 'hidden' ? 'peek' : 'hidden')} style={st.mapBtn}>
          <Icon name={mode === 'hidden' ? 'arrow-collapse' : 'arrow-expand'} size={22} color={colors.text} />
        </Pressable>

        {mode === 'hidden' ? (
          <Pressable accessibilityRole="button" onPress={() => setMode('peek')} style={[st.showBar, { bottom: bottom + 16 }]}>
            <Icon name="chevron-up" size={22} color={colors.accent} />
            <T v="label" color={colors.onInk}>{p.name} · {p.match}% · Show details</T>
          </Pressable>
        ) : (
          <View style={[st.sheetBox, { paddingBottom: bottom + 12, maxHeight: box.h * (mode === 'full' ? 0.82 : 0.5) }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={mode === 'full' ? 'Collapse details' : 'Expand details'} onPress={() => setMode(mode === 'full' ? 'peek' : 'full')} style={st.grabArea}>
              <View style={st.grab} />
            </Pressable>
            <ScrollView scrollEnabled={mode === 'full'} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              <View style={st.who}>
                <Avatar name={p.name} size={52} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T v="heading" numberOfLines={1}>{p.name}</T>
                  <T v="small" color={p.verified ? colors.green : colors.muted}>{p.verified ? 'Verified' : 'Not verified'} · ★ {p.rating} ({p.reviews})</T>
                </View>
                <View style={[st.matchPill, { backgroundColor: strong ? colors.greenTint : colors.warnTint }]}>
                  <T v="heading" color={strong ? colors.green : colors.warnText}>{p.match}%</T>
                  <T v="small" color={strong ? colors.green : colors.warnText}>match</T>
                </View>
              </View>

              <View style={st.stats}>
                <View style={st.stat}><T v="small" color={colors.muted}>Pick up</T><T v="label">{p.time}</T></View>
                <View style={st.statSep} />
                <View style={st.stat}><T v="small" color={colors.muted}>Ride</T><T v="label">{p.ride}</T></View>
                <View style={st.statSep} />
                <View style={st.stat}><T v="small" color={colors.muted}>Fare</T><T v="label">{p.points} pts</T></View>
              </View>

              {mode === 'full' ? (
                <View style={{ marginTop: 16 }}>
                  <T v="label" color={colors.muted} style={{ marginBottom: 10 }}>YOUR JOURNEY</T>
                  <Step icon="walk" color={colors.muted} title={`Walk ${p.walkTo} to pick-up point`} sub={s.from} />
                  <Step icon="map-marker-account" color={colors.green} title={`Picked up at ${p.time}`} sub={`${p.name} meets you here`} />
                  <Step icon={p.vehicle === 'bike' ? 'motorbike' : 'car'} color={colors.text} title={`${vehicle} ride · ${p.ride}`} sub={`About ${Math.round(parseFloat(p.ride) * 3)} min`} />
                  <Step icon="map-marker" color={colors.red} title="Dropped near your destination" sub={s.to} />
                  <Step icon="walk" color={colors.muted} title={`Walk ${p.walkFrom} to destination`} sub={s.to} last />
                  <View style={st.contactRow}>
                    <Pressable accessibilityRole="button" onPress={callNumber} style={st.contactBtn}><Icon name="phone-outline" size={22} color={colors.text} /><T v="label">Call</T></Pressable>
                    <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Chat', { id: p.id, name: p.name, sub: p.org })} style={st.contactBtn}><Icon name="message-outline" size={22} color={colors.text} /><T v="label">Message</T></Pressable>
                  </View>
                </View>
              ) : null}

              <Button
                style={{ marginTop: 14 }}
                title={sent ? (find ? 'Request sent · View' : 'Offer sent · View') : find ? 'Request to join' : 'Offer ride'}
                icon={sent ? 'check-circle' : undefined}
                variant={sent ? 'outline' : 'lime'}
                onPress={cta}
              />
              {mode === 'peek' ? (
                <Pressable accessibilityRole="button" onPress={() => setMode('full')} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <T v="label" color={colors.blue}>See full journey</T>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const StyleAbs = { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 } as const;

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
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 2 },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.white, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 6, height: 44 },
  mapBtn: { position: 'absolute', right: 14, top: 14, width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  showBar: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 18, height: 52, elevation: 6 },
  sheetBox: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, elevation: 10 },
  grabArea: { height: 28, alignItems: 'center', justifyContent: 'center' },
  who: { flexDirection: 'row', alignItems: 'center' },
  matchPill: { borderRadius: radius.lg, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center' },
  stats: { flexDirection: 'row', backgroundColor: colors.ground, borderRadius: radius.md, paddingVertical: 10, marginTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statSep: { width: 1, backgroundColor: colors.line },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contactBtn: { flex: 1, minHeight: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
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
  tag: { position: 'absolute', backgroundColor: colors.white, borderWidth: 2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  km: { position: 'absolute', left: 150, top: 110, backgroundColor: colors.ink, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, minHeight: 68 },
}));
