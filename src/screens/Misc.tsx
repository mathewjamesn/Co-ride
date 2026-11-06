import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button } from '../components';
import { colors } from '../theme';
import { menuItems } from '../data';
import { useSearch } from '../state';

/** Request sent / ride cancelled */
export function Status({ navigation, route }: any) {
  const { person, find } = route.params;
  const { s } = useSearch();
  const [cancelled, setCancelled] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={[st.top, { backgroundColor: cancelled ? colors.red : colors.primary }]}>
        <Pressable style={st.back} onPress={() => navigation.popToTop()}><Icon name="chevron-left" size={28} /></Pressable>
        <View style={st.stamp}><Icon name={cancelled ? 'close-circle-outline' : 'check-circle-outline'} size={56} color="#fff" /></View>
        <Text style={st.title}>{cancelled ? 'Ride Cancelled' : find ? 'Request Sent' : 'Offer Sent'}</Text>
        <Text style={st.when}>{s.when}</Text>
      </View>
      <ScrollView style={st.sheet} contentContainerStyle={{ padding: 20 }}>
        <Text style={st.label}>RIDE DETAILS</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Icon name="arrow-down" size={22} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15 }} numberOfLines={1}>{s.from}</Text>
            <Text style={{ fontSize: 15, marginTop: 6 }} numberOfLines={1}>{s.to}</Text>
          </View>
        </View>
        {!cancelled && (
          <View style={st.who}>
            <Avatar name={person.name} size={52} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700' }}>{person.name}</Text>
              <Text style={{ color: colors.muted }}>{person.time} · {person.points} points</Text>
            </View>
            <Text style={{ color: colors.amber, fontWeight: '600' }}>Pending</Text>
          </View>
        )}
        <View style={st.refer}>
          <Text style={st.referT}>To get more matches, refer your friends & colleagues</Text>
          <Icon name="account-multiple-plus" size={96} color="#F2A2A2" style={{ marginVertical: 16 }} />
          <Text style={{ color: colors.muted, marginBottom: 12 }}>Earn 500 points plus 2% commission on every ride</Text>
          <Button title="REFER NOW" color="#00B55A" style={{ alignSelf: 'stretch' }} onPress={() => Linking.openURL('https://wa.me/?text=Join%20me%20on%20Co-Ride')} />
          {!cancelled && <Button title="Cancel ride" color={colors.red} style={{ alignSelf: 'stretch', marginTop: 12 }} onPress={() => setCancelled(true)} />}
        </View>
      </ScrollView>
    </View>
  );
}

/** Side menu */
export function Menu({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={st.menuHead}>
        <Avatar name="Mathew" size={72} />
        <View style={{ marginLeft: 16 }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Welcome aboard, Mathew</Text>
          <Text style={{ color: '#fff', marginTop: 10 }}>Your travel stats show up here</Text>
        </View>
      </View>
      <ScrollView>
        {menuItems.map(m => (
          <Pressable key={m.label} style={st.item}>
            <Icon name={m.icon as any} size={30} />
            <Text style={{ flex: 1, fontSize: 20, marginLeft: 18 }}>{m.label}</Text>
            <Icon name="chevron-right" size={30} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={st.foot}>
        <Pressable style={st.footItem}><Icon name="headset" size={30} /><Text style={st.footT}>Help</Text></Pressable>
        <Pressable style={st.footItem} onPress={() => navigation.goBack()}><Icon name="home-outline" size={30} /><Text style={st.footT}>Home</Text></Pressable>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 50, paddingBottom: 50 },
  back: { position: 'absolute', top: 44, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stamp: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#fff', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 16 },
  when: { color: '#fff', fontSize: 17, marginTop: 8 },
  sheet: { flex: 1, backgroundColor: '#fff', marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  label: { color: colors.muted, fontSize: 17, fontWeight: '500' },
  who: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 14, marginTop: 20 },
  refer: { alignItems: 'center', marginTop: 28 },
  referT: { fontSize: 20, fontWeight: '500', textAlign: 'center' },
  menuHead: { backgroundColor: '#12361C', flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 78 },
  foot: { flexDirection: 'row', backgroundColor: '#F2F2F2' },
  footItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  footT: { fontSize: 18, fontWeight: '600', marginTop: 4 },
});
