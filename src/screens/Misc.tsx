import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, T } from '../components';
import { colors, radius, makeStyles } from '../theme';
import { menuItems } from '../data';
import { useSearch } from '../state';
import { useTrip } from '../trip';
import { useGarage } from '../garage';
import { useKeepAwake } from '../keepAwake';
import { useTheme } from '../themeContext';
import { ContactBar } from './Trip';

/** Request sent / ride cancelled */
export function Status({ navigation, route }: any) {
  const { person, find } = route.params;
  const { s } = useSearch();
  const { top } = useSafeAreaInsets();
  const { beginAsRider, beginAsDriver } = useTrip();
  const { active } = useGarage();
  useKeepAwake();
  const [cancelled, setCancelled] = useState(false);
  const accept = () => {
    if (find) beginAsRider(person, s.from);
    else beginAsDriver(person, active?.seats ?? 1);
    navigation.replace('Accepted');
  };
  const fg = cancelled ? colors.onInk : colors.accent;
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[st.top, { backgroundColor: cancelled ? colors.red : colors.ink, paddingTop: top + 40 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to home" style={[st.back, { top: top + 8 }]} onPress={() => navigation.popToTop()}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </Pressable>
        <View style={[st.stamp, { borderColor: fg }]}>
          <Icon name={cancelled ? 'close-circle-outline' : 'check-circle-outline'} size={56} color={fg} />
        </View>
        <T v="display" color={colors.onInk} style={{ marginTop: 16 }}>{cancelled ? 'Ride cancelled' : find ? 'Request sent' : 'Offer sent'}</T>
        <T color={colors.darkMuted} style={{ marginTop: 6 }}>{s.when}</T>
      </View>
      <ScrollView style={st.sheet} contentContainerStyle={{ padding: 20 }}>
        <T v="label" color={colors.muted} style={{ letterSpacing: 0.5 }}>RIDE DETAILS</T>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <View style={[st.dot, { backgroundColor: colors.green }]} />
            <View style={{ width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 3 }} />
            <View style={[st.dot, { backgroundColor: colors.red }]} />
          </View>
          <View style={{ flex: 1, gap: 14 }}>
            <T v="bodyStrong" numberOfLines={1}>{s.from}</T>
            <T v="bodyStrong" numberOfLines={1}>{s.to}</T>
          </View>
        </View>
        {!cancelled && (
          <View style={st.who}>
            <Avatar name={person.name} size={52} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <T v="heading">{person.name}</T>
              <T v="small" color={colors.muted}>{person.time} · {person.points} pts</T>
              <View style={[st.pending, { alignSelf: 'flex-start', marginTop: 6 }]}><T v="label" color={colors.warnText}>Pending</T></View>
            </View>
            <ContactBar id={person.id} name={person.name} navigation={navigation} sub={person.org} />
          </View>
        )}
        {!cancelled && (
          <View style={st.proto}>
            <T v="small" color={colors.muted}>PROTOTYPE · {find ? 'driver' : 'rider'}'s phone</T>
            <Pressable accessibilityRole="button" onPress={accept} style={st.protoBtn}>
              <T v="label">{find ? `${person.name} accepts my request` : `${person.name} accepts my offer`}</T>
            </Pressable>
          </View>
        )}
        <View style={st.refer}>
          <T v="title" style={{ textAlign: 'center' }}>To get more matches, refer your friends & colleagues</T>
          <View style={st.referIcon}><Icon name="account-multiple-plus" size={56} color={colors.text} /></View>
          <T color={colors.muted} style={{ marginBottom: 12, textAlign: 'center' }}>Earn 500 points plus 2% commission on every ride</T>
          <Button title="Refer now" variant="lime" style={{ alignSelf: 'stretch' }} onPress={() => Linking.openURL('https://wa.me/?text=Join%20me%20on%20Go-Pool')} />
          {!cancelled && <Button title="Cancel ride" variant="danger" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => navigation.navigate('CancelRide', { role: find ? 'rider' : 'driver', from: s.from, to: s.to, when: s.when, people: person.name })} />}
          {cancelled && <Button title="Back to home" variant="outline" style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => navigation.popToTop()} />}
        </View>
      </ScrollView>
    </View>
  );
}

/** Side menu */
const MENU_ROUTES: Record<string, string> = { Settings: 'Settings', 'My Carpools': 'History', Payments: 'Wallet', Vehicles: 'Vehicles' };

export function Menu({ navigation }: any) {
  const { top } = useSafeAreaInsets();
  const { mode, setPref } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={[st.menuHead, { paddingTop: top + 24 }]}>
        <Avatar name="Mathew" size={72} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <T v="heading" color={colors.onInk}>Welcome aboard, Mathew</T>
          <T v="small" color={colors.darkMuted} style={{ marginTop: 6 }}>Your travel stats show up here</T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onPress={() => setPref(mode === 'dark' ? 'light' : 'dark')} style={st.themeBtn}>
          <Icon name={mode === 'dark' ? 'white-balance-sunny' : 'weather-night'} size={24} color={colors.accent} />
        </Pressable>
      </View>
      <ScrollView>
        {menuItems.map(m => (
          <Pressable key={m.label} accessibilityRole="button" style={st.item} onPress={() => MENU_ROUTES[m.label] && navigation.navigate(MENU_ROUTES[m.label])}>
            <View style={st.itemIcon}><Icon name={m.icon as any} size={24} color={colors.text} /></View>
            <T v="bodyStrong" style={{ flex: 1, marginLeft: 16, fontSize: 18 }}>{m.label}</T>
            <Icon name="chevron-right" size={26} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={st.foot}>
        <Pressable accessibilityRole="button" style={st.footItem}><Icon name="headset" size={28} color={colors.text} /><T v="label" style={{ marginTop: 4 }}>Help</T></Pressable>
        <Pressable accessibilityRole="button" style={st.footItem} onPress={() => navigation.goBack()}><Icon name="home-outline" size={28} color={colors.text} /><T v="label" style={{ marginTop: 4 }}>Home</T></Pressable>
      </SafeAreaView>
    </View>
  );
}

const st = makeStyles(() => ({
  top: { alignItems: 'center', paddingBottom: 56 },
  back: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  stamp: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sheet: { flex: 1, backgroundColor: colors.white, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  who: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ground, borderRadius: radius.lg, padding: 14, marginTop: 20 },
  proto: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.md, padding: 12, gap: 8, marginTop: 16 },
  protoBtn: { minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  themeBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  pending: { backgroundColor: colors.warnTint, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.warnLine },
  refer: { alignItems: 'center', marginTop: 28 },
  referIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  menuHead: { backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', padding: 20 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, minHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.ground },
  itemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  foot: { flexDirection: 'row', backgroundColor: colors.ground },
  footItem: { flex: 1, alignItems: 'center', paddingVertical: 14, minHeight: 64 },
}));
