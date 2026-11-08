import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MapMock, T, Toggle } from '../components';
import { colors, radius } from '../theme';
import { useSearch } from '../state';

const DAYS = ['Today', 'Tomorrow'];
const TIMES = ['5:00 PM', '5:35 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'];
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const KM = 11;

/** Plan the ride: route, time, recurring, seats, wallet / vehicle, then search. */
export function Plan({ navigation }: any) {
  const { s, set } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  const find = s.mode === 'find';
  const [timeOpen, setTimeOpen] = useState(false);
  const [rate, setRate] = useState(5);
  const [auto, setAuto] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [days, setDays] = useState<boolean[]>([true, true, true, true, true, false, false]);

  const [day, time] = s.when.split(', ');
  const maxSeats = find ? 4 : 3;
  const to = s.to || 'Choose a drop location';

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom + 16 }} keyboardShouldPersistTaps="handled">
        <View>
          <MapMock height={250} />
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()} style={[st.back, { top: top + 12 }]}>
            <Icon name="arrow-left" size={22} color={colors.ink} />
          </Pressable>
          <View style={st.eta}><T v="label">35 min · {KM} km</T></View>
        </View>

        <View style={st.body}>
          <View style={st.routeWrap}>
            <Pressable accessibilityRole="button" accessibilityLabel="Change pickup" onPress={() => navigation.navigate('Drop')} style={st.row}>
              <View style={[st.ring, { borderColor: colors.green }]} />
              <T v="bodyStrong" style={{ flex: 1, paddingRight: 48 }} numberOfLines={1}>{s.from || 'Choose a pickup location'}</T>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Change drop" onPress={() => navigation.navigate('Drop')} style={st.row}>
              <View style={[st.ring, { backgroundColor: colors.red, borderColor: colors.red }]} />
              <T v="bodyStrong" style={{ flex: 1, paddingRight: 48 }} numberOfLines={1}>{to}</T>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Swap pickup and drop" onPress={() => set({ from: s.to, to: s.from })} style={st.swap}>
              <Icon name="swap-vertical" size={24} color={colors.ink} />
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Choose date and time" onPress={() => setTimeOpen(true)} style={[st.row, { justifyContent: 'space-between' }]}>
            <View style={st.inline}>
              <Icon name="calendar-clock" size={24} color={colors.ink} />
              <T v="bodyStrong">{s.when}</T>
            </View>
            <T v="label" color={colors.green}>Change</T>
          </Pressable>

          <View style={[st.row, { justifyContent: 'space-between' }]}>
            <View style={st.inline}>
              <Icon name="recycle" size={24} color={colors.ink} />
              <T v="bodyStrong">Make this ride recurring</T>
            </View>
            <Toggle value={s.recurring} onChange={v => set({ recurring: v })} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[st.row, { flex: 1, justifyContent: 'space-between', paddingHorizontal: 8 }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="Fewer seats" onPress={() => set({ seats: Math.max(1, s.seats - 1) })} style={st.step}>
                <Icon name="minus" size={22} color={colors.ink} />
              </Pressable>
              <T v="label">{s.seats} seat{s.seats > 1 ? 's' : ''}</T>
              <Pressable accessibilityRole="button" accessibilityLabel="More seats" onPress={() => set({ seats: Math.min(maxSeats, s.seats + 1) })} style={st.step}>
                <Icon name="plus" size={22} color={colors.ink} />
              </Pressable>
            </View>
            <View style={[st.row, { flex: 1 }]}>
              <Icon name={find ? 'wallet-outline' : 'car-outline'} size={22} color={colors.ink} />
              <T v="label" numberOfLines={1} style={{ flex: 1 }}>{find ? 'Wallet: 250 pts' : 'Swift · KL 07'}</T>
            </View>
          </View>

          {!find ? (
            <View style={st.card}>
              <View style={st.optRow}>
                <View style={{ flex: 1 }}>
                  <T v="label">Fare per km</T>
                  <T v="small" color={colors.muted}>Each rider pays about {rate * KM} pts for the full route</T>
                </View>
                <View style={st.inline}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Lower fare" onPress={() => setRate(Math.max(1, rate - 1))} style={st.step}>
                    <Icon name="minus" size={20} color={colors.ink} />
                  </Pressable>
                  <T v="label" style={{ minWidth: 50, textAlign: 'center' }}>{rate} pts</T>
                  <Pressable accessibilityRole="button" accessibilityLabel="Raise fare" onPress={() => setRate(Math.min(12, rate + 1))} style={st.step}>
                    <Icon name="plus" size={20} color={colors.ink} />
                  </Pressable>
                </View>
              </View>
              {s.recurring ? (
                <View>
                  <T v="label" color={colors.muted} style={{ marginBottom: 8 }}>Repeat on</T>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {WEEK.map((d, i) => (
                      <Pressable key={i} accessibilityRole="button" accessibilityState={{ selected: days[i] }} onPress={() => setDays(days.map((v, j) => (j === i ? !v : v)))} style={[st.day, days[i] && { backgroundColor: colors.ink }]}>
                        <T v="label" color={days[i] ? colors.lime : colors.ink}>{d}</T>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
              <View style={st.optRow}>
                <View style={{ flex: 1 }}>
                  <T v="label">Auto-accept strong matches</T>
                  <T v="small" color={colors.muted}>Riders with a 90%+ route match join without waiting</T>
                </View>
                <Toggle value={auto} onChange={setAuto} />
              </View>
              <View style={st.optRow}>
                <View style={{ flex: 1 }}>
                  <T v="label">Govt ID verified riders only</T>
                  <T v="small" color={colors.muted}>Unverified riders will not see your ride</T>
                </View>
                <Toggle value={verifiedOnly} onChange={setVerifiedOnly} />
              </View>
            </View>
          ) : null}

          <Button title={find ? 'Find a pool' : 'Offer pool'} variant="lime" disabled={!s.to || !s.from} onPress={() => navigation.navigate('Matches')} />
        </View>
      </ScrollView>

      <Modal visible={timeOpen} transparent animationType="slide" onRequestClose={() => setTimeOpen(false)}>
        <View style={st.scrim}>
          <Pressable style={{ flex: 1 }} accessibilityLabel="Close" onPress={() => setTimeOpen(false)} />
          <View style={[st.sheet, { paddingBottom: bottom + 20 }]}>
            <T v="title">When do you want to go?</T>
            <View style={st.dayTabs}>
              {DAYS.map(d => (
                <Pressable key={d} accessibilityRole="tab" accessibilityState={{ selected: d === day }} onPress={() => set({ when: `${d}, ${time}` })} style={[st.dayTab, d === day && { backgroundColor: colors.ink }]}>
                  <T v="label" color={d === day ? colors.lime : colors.ink}>{d}</T>
                </Pressable>
              ))}
            </View>
            <View style={st.timeGrid}>
              {TIMES.map(t => (
                <Pressable key={t} accessibilityRole="button" accessibilityState={{ selected: t === time }} onPress={() => set({ when: `${day}, ${t}` })} style={[st.time, t === time && { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                  <T v="label">{t}</T>
                </Pressable>
              ))}
            </View>
            <Button title="Done" style={{ marginTop: 18 }} onPress={() => setTimeOpen(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  back: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  eta: { position: 'absolute', left: 16, bottom: 14, backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, elevation: 3 },
  body: { padding: 16, gap: 12, marginTop: -16, backgroundColor: colors.ground, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  routeWrap: { gap: 8 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 16 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, backgroundColor: colors.white },
  swap: { position: 'absolute', right: 12, top: '50%', marginTop: -24, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  step: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, gap: 16 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  day: { flex: 1, minHeight: 44, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
  dayTabs: { flexDirection: 'row', backgroundColor: colors.ground, borderRadius: radius.pill, padding: 4, gap: 4, marginVertical: 14 },
  dayTab: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  time: { width: '23%', minHeight: 46, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
