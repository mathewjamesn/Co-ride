import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Header, Segmented, T, Toggle } from '../components';
import { colors, makeStyles, radius } from '../theme';
import { Pref, useTheme } from '../themeContext';
import { RideLog, useTrip } from '../trip';

/* ------------------------------------------------------------------ */
/* Settings: appearance + screen-on                                    */
/* ------------------------------------------------------------------ */

const PREFS: { key: Pref; label: string; icon: string; sub: string }[] = [
  { key: 'system', label: 'System default', icon: 'cellphone', sub: 'Follows your phone setting' },
  { key: 'light', label: 'Light', icon: 'white-balance-sunny', sub: 'Bright and clear' },
  { key: 'dark', label: 'Dark', icon: 'weather-night', sub: 'Easier on the eyes at night' },
];

export function Settings({ navigation }: any) {
  const { pref, setPref, mode, keepAwake, setKeepAwake } = useTheme();
  const [notify, setNotify] = useState(true);
  const [sound, setSound] = useState(true);
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <T v="label" color={colors.muted}>APPEARANCE</T>
        <View style={st.group}>
          {PREFS.map((p, i) => {
            const on = pref === p.key;
            return (
              <Pressable key={p.key} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPref(p.key)} style={[st.row, i > 0 && st.divider]}>
                <View style={st.icon}><Icon name={p.icon as any} size={24} color={colors.text} /></View>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{p.label}</T>
                  <T v="small" color={colors.muted}>{p.key === 'system' ? `${p.sub} (now ${mode})` : p.sub}</T>
                </View>
                <Icon name={on ? 'radiobox-marked' : 'radiobox-blank'} size={28} color={colors.text} />
              </Pressable>
            );
          })}
        </View>

        <T v="label" color={colors.muted} style={{ marginTop: 8 }}>DURING RIDES</T>
        <View style={st.group}>
          <View style={st.row}>
            <View style={st.icon}><Icon name="monitor-eye" size={24} color={colors.text} /></View>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">Keep screen on</T>
              <T v="small" color={colors.muted}>Stops the screen locking while you track a request or ride</T>
            </View>
            <Toggle value={keepAwake} onChange={setKeepAwake} />
          </View>
        </View>

        <T v="label" color={colors.muted} style={{ marginTop: 8 }}>NOTIFICATIONS</T>
        <View style={st.group}>
          <View style={st.row}>
            <View style={st.icon}><Icon name="bell-outline" size={24} color={colors.text} /></View>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">Ride updates</T>
              <T v="small" color={colors.muted}>Requests, driver arrival and chat messages</T>
            </View>
            <Toggle value={notify} onChange={setNotify} />
          </View>
          <View style={[st.row, st.divider]}>
            <View style={st.icon}><Icon name="volume-high" size={24} color={colors.text} /></View>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">Sounds</T>
            </View>
            <Toggle value={sound} onChange={setSound} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Carpools: ride history                                              */
/* ------------------------------------------------------------------ */

export function History({ navigation }: any) {
  const { history } = useTrip();
  const [tab, setTab] = useState<'all' | 'rider' | 'driver'>('all');
  const data = history.filter(h => tab === 'all' || h.role === tab);
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title="My carpools" onBack={() => navigation.goBack()} />
      <View style={{ margin: 16, marginBottom: 0 }}>
        <Segmented value={tab} options={[['all', 'All'], ['rider', 'Taken'], ['driver', 'Offered']]} onChange={setTab} />
      </View>
      <FlatList
        data={data}
        keyExtractor={h => h.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<T color={colors.muted} style={{ textAlign: 'center', padding: 32 }}>No rides here yet.</T>}
        renderItem={({ item }) => <RideRow r={item} />}
      />
    </View>
  );
}

const RideRow = ({ r }: { r: RideLog }) => {
  const driver = r.role === 'driver';
  return (
    <View style={st.ride}>
      <View style={st.rideHead}>
        <View style={[st.tag, { backgroundColor: driver ? colors.lime : colors.ground }]}>
          <Icon name={driver ? 'steering' : 'seat-passenger'} size={16} color={colors.text} />
          <T v="label">{driver ? 'Offered' : 'Taken'}</T>
        </View>
        {r.cancelled ? <T v="label" color={colors.red}>Cancelled</T> : <T v="heading">{driver ? '+' : '-'}{r.pts} pts</T>}
      </View>
      <T v="small" color={colors.muted} style={{ marginTop: 8 }}>{r.when}</T>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <View style={{ alignItems: 'center', paddingTop: 4 }}>
          <View style={[st.dot, { backgroundColor: colors.green }]} />
          <View style={{ width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 3 }} />
          <View style={[st.dot, { backgroundColor: colors.red }]} />
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          <T v="bodyStrong" numberOfLines={1}>{r.from}</T>
          <T v="bodyStrong" numberOfLines={1}>{r.to}</T>
        </View>
      </View>
      <T v="small" color={colors.muted} style={{ marginTop: 8 }}>With {r.people}</T>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Payments: points wallet                                             */
/* ------------------------------------------------------------------ */

const TOPUPS = [100, 250, 500, 1000];

export function Wallet({ navigation }: any) {
  const { wallet, history, topUp } = useTrip();
  const { bottom } = useSafeAreaInsets();
  const [amt, setAmt] = useState(250);
  const [added, setAdded] = useState<number | null>(null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title="Payments" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: bottom + 16 }}>
        <View style={st.balance}>
          <T v="label" color={colors.darkMuted}>POINTS BALANCE</T>
          <T v="hero" color={colors.onInk} style={{ marginTop: 4 }}>{wallet} <T v="heading" color={colors.accent}>pts</T></T>
          <T v="small" color={colors.darkMuted} style={{ marginTop: 4 }}>1 pt = Rs 1. Earn points offering rides, spend them on rides you take.</T>
        </View>

        <T v="label" color={colors.muted}>ADD POINTS</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TOPUPS.map(a => (
            <Pressable key={a} accessibilityRole="button" accessibilityState={{ selected: amt === a }} onPress={() => setAmt(a)} style={[st.amt, amt === a && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
              <T v="label" color={amt === a ? colors.accent : colors.text}>{a}</T>
            </Pressable>
          ))}
        </View>
        <Button title={added === amt ? `Added ${amt} pts` : `Add ${amt} pts via UPI`} icon={added === amt ? 'check' : 'plus'} variant="lime" onPress={() => { topUp(amt); setAdded(amt); }} />

        <T v="label" color={colors.muted} style={{ marginTop: 6 }}>RECENT ACTIVITY</T>
        <View style={st.group}>
          {history.filter(h => !h.cancelled).slice(0, 6).map((h, i) => (
            <View key={h.id} style={[st.row, i > 0 && st.divider]}>
              <View style={st.icon}><Icon name={h.role === 'driver' ? 'arrow-down-bold' : 'arrow-up-bold'} size={22} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <T v="bodyStrong" numberOfLines={1}>{h.role === 'driver' ? 'Ride earnings' : 'Ride fare'}</T>
                <T v="small" color={colors.muted} numberOfLines={1}>{h.when}</T>
              </View>
              <T v="heading" color={h.role === 'driver' ? colors.green : colors.text}>{h.role === 'driver' ? '+' : '-'}{h.pts}</T>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Cancel ride with a reason (rider or driver)                         */
/* ------------------------------------------------------------------ */

const REASONS = {
  rider: ['Driver is taking too long', 'Plans changed', 'Found another ride', 'Booked by mistake', 'Driver asked me to cancel', 'Other'],
  driver: ['Rider is not responding', 'Rider is not at the pickup', 'Vehicle problem', 'Plans changed', 'Unsafe pickup location', 'Other'],
};

export function CancelRide({ navigation, route }: any) {
  const role: 'rider' | 'driver' = route.params.role;
  const { trip, reset, logRide } = useTrip();
  const { bottom } = useSafeAreaInsets();
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const confirm = () => {
    logRide({
      role,
      from: route.params.from,
      to: route.params.to,
      when: route.params.when,
      pts: 0,
      people: route.params.people ?? (role === 'rider' ? trip.driver?.name ?? 'Driver' : trip.riders.map(r => r.name).join(', ')),
      cancelled: true,
    });
    reset();
    setDone(true);
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <View style={st.bigIcon}><Icon name="close-circle-outline" size={56} color={colors.accent} /></View>
        <T v="display">Ride cancelled</T>
        <T color={colors.muted} style={{ textAlign: 'center' }}>{role === 'rider' ? 'We have let your driver know. You can search for another pool any time.' : 'We have let your riders know and will help them find another ride.'}</T>
        <Button title="Back to home" variant="lime" style={{ alignSelf: 'stretch', marginTop: 16 }} onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title="Cancel ride" subtitle="Tell us why" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <T color={colors.muted}>Frequent cancellations can lower your rating. Pick the closest reason.</T>
        {REASONS[role].map(r => (
          <Pressable key={r} accessibilityRole="radio" accessibilityState={{ selected: reason === r }} onPress={() => setReason(r)} style={[st.reason, reason === r && { borderColor: colors.text, borderWidth: 2 }]}>
            <T v="bodyStrong" style={{ flex: 1 }}>{r}</T>
            <Icon name={reason === r ? 'radiobox-marked' : 'radiobox-blank'} size={26} color={colors.text} />
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: bottom + 16, gap: 10 }}>
        <Button title="Cancel ride" variant="danger" disabled={!reason} onPress={confirm} />
        <Button title="Keep my ride" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const st = makeStyles(() => ({
  group: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 68 },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  ride: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 14 },
  rideHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  balance: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: colors.darkLine },
  amt: { flex: 1, minHeight: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 16, minHeight: 60 },
  bigIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
}));
