import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, MapMock } from '../components';
import { colors } from '../theme';
import { useSearch } from '../state';

/** Find Pool / Offer Pool request form (screen: map + route + time + seats + CTA) */
export function Home({ navigation }: any) {
  const { s, set } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  const find = s.mode === 'find';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View>
        <MapMock height={260 + top} label="1 h | 26 km" />
        <Pressable style={[st.fab, { top: top + 12, left: 14 }]} onPress={() => navigation.navigate('Menu')}>
          <Icon name="menu" size={26} />
        </Pressable>
        <View style={st.eta}><Text style={{ fontWeight: '600' }}>1 h  |  26 KM</Text></View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: bottom + 14 }}>
        <View style={st.tabs}>
          {(['find', 'offer'] as const).map(m => (
            <Pressable key={m} style={[st.tab, s.mode === m && { backgroundColor: colors.primary }]} onPress={() => set({ mode: m })}>
              <Text style={[st.tabText, s.mode === m && { color: '#fff' }]}>{m === 'find' ? 'Find Pool' : 'Offer Pool'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={st.box}>
          <Icon name="circle-outline" size={16} color={colors.green} />
          <TextInput style={st.in} value={s.from} onChangeText={v => set({ from: v })} numberOfLines={1} />
        </View>
        <View style={st.box}>
          <Icon name="circle" size={16} color="#B00020" />
          <TextInput style={st.in} value={s.to} onChangeText={v => set({ to: v })} numberOfLines={1} />
          <Pressable onPress={() => set({ from: s.to, to: s.from })}><Icon name="swap-vertical" size={28} color={colors.primary} /></Pressable>
        </View>
        <View style={st.box}>
          <Icon name="calendar-clock" size={24} color={colors.primary} />
          <TextInput style={st.in} value={s.when} onChangeText={v => set({ when: v })} />
        </View>
        <View style={st.box}>
          <Icon name="recycle" size={24} color={colors.green} />
          <Text style={[st.in, { paddingVertical: 14 }]}>Make this ride recurring</Text>
          <Switch value={s.recurring} onValueChange={v => set({ recurring: v })} trackColor={{ true: colors.mint, false: '#ccc' }} thumbColor={s.recurring ? colors.primary : '#f4f4f4'} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[st.box, { flex: 1 }]}>
            <Pressable onPress={() => set({ seats: Math.max(1, s.seats - 1) })}><Icon name="minus-circle-outline" size={26} color={colors.primary} /></Pressable>
            <Text style={[st.in, { textAlign: 'center' }]}>{s.seats} Seat{s.seats > 1 ? 's' : ''}</Text>
            <Pressable onPress={() => set({ seats: Math.min(4, s.seats + 1) })}><Icon name="plus-circle-outline" size={26} color={colors.primary} /></Pressable>
          </View>
          <View style={[st.box, { flex: 1 }]}>
            <Icon name="wallet" size={24} color={colors.green} />
            <Text style={st.in}>Wallet: 0</Text>
          </View>
        </View>
        <Button title={find ? 'Find Pool' : 'Offer Pool'} onPress={() => navigation.navigate('Results')} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  fab: { position: 'absolute', width: 46, height: 46, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  eta: { position: 'absolute', left: 14, bottom: 14, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, elevation: 3 },
  tabs: { flexDirection: 'row', backgroundColor: '#E9E9E9', borderRadius: 28, padding: 4, marginBottom: 12 },
  tab: { flex: 1, height: 44, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontWeight: '700', fontSize: 16, color: colors.text },
  box: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, marginBottom: 12, minHeight: 52 },
  in: { flex: 1, fontSize: 16, color: colors.text },
});
