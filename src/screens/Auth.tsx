import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, FlatList, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, GreenHeader } from '../components';
import { colors } from '../theme';

export const Logo = ({ size = 150 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.yellow, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <Icon name="source-fork" size={size * 0.6} color="#3E7B34" style={{ marginBottom: size * 0.1 }} />
    <View style={{ position: 'absolute', bottom: 0, width: size, height: size * 0.28, backgroundColor: '#3E7B34' }} />
  </View>
);

/** Screen 1: ownership-change consent */
export function Consent({ navigation }: any) {
  const [ok, setOk] = useState(true);
  return (
    <SafeAreaView style={s.flex}>
      <Text style={s.h1}>Two Apps. Better Focus.</Text>
      <Text style={s.sub}>For business reasons, iDisha is moving Carpool services to CoRide Mobility Pvt Ltd</Text>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, flex: 1 }}>
        <View style={[s.panel, { backgroundColor: '#FFF6E6' }]}>
          <Icon name="taxi" size={56} color="#F5B800" />
          <Text style={s.small}>Quick Taxi</Text>
          <Text style={s.panelTitle}>Taxi services are moving to a new app</Text>
          <Text style={s.panelBody}>Download Quick Taxi from the Play Store from the planned cutover date to continue booking taxis.</Text>
        </View>
        <View style={[s.panel, { backgroundColor: '#EAF7F0' }]}>
          <Logo size={64} />
          <Text style={s.small}>Quick Ride</Text>
          <Text style={s.panelTitle}>This app will now be solely for carpooling</Text>
          <Text style={s.panelBody}>Quick Ride (Carpool) will be owned and operated by CoRide Mobility Pvt Ltd.</Text>
        </View>
      </View>
      <Pressable style={s.checkRow} onPress={() => setOk(!ok)}>
        <Icon name={ok ? 'checkbox-marked' : 'checkbox-blank-outline'} size={30} color={colors.green} />
        <Text style={{ flex: 1 }}>I have read and agree to the <Text style={{ color: colors.blue }}>Terms & Conditions</Text> of CoRide Mobility Pvt Ltd.</Text>
      </Pressable>
      <Button title="I Understand and Consent" color={ok ? colors.green : '#aaa'} style={{ marginHorizontal: 16 }} onPress={() => ok && navigation.replace('Onboarding')} />
    </SafeAreaView>
  );
}

const slides = [
  { title: 'Carpool', body: 'Carpool / bikepool for daily commuting', icon: 'car-multiple' },
  { title: 'Start\nCarpooling', body: 'Join your colleague and reduce one car from the road today\n\nGet car rides at ₹5/km', icon: 'account-group' },
  { title: 'Earn Points', body: 'Offer rides, earn points and redeem them on every commute', icon: 'star-circle' },
];

/** Screens 2-3: onboarding carousel */
export function Onboarding({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  return (
    <SafeAreaView style={s.flex}>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Logo size={120} />
        <Text style={s.brand}>Quick Ride</Text>
        <Text style={s.tag}>Carpool • Bikepool</Text>
      </View>
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={x => x.title}
        onMomentumScrollEnd={e => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: 32, justifyContent: 'center' }}>
            <Icon name={item.icon as any} size={64} color={colors.primary} />
            <Text style={s.slideTitle}>{item.title}</Text>
            <View style={s.underline} />
            <Text style={s.slideBody}>{item.body}</Text>
          </View>
        )}
      />
      <View style={s.dots}>
        {slides.map((_, k) => <View key={k} style={[s.dot, k === i && { backgroundColor: colors.green }]} />)}
      </View>
      <Button title="Enter your phone number" style={{ marginHorizontal: 32 }} onPress={() => navigation.navigate('Phone')} />
      <Text style={s.terms}>By continuing, I agree to Quick Ride <Text style={{ color: colors.blue }}>Terms</Text></Text>
    </SafeAreaView>
  );
}

/** Screen 4: phone number */
export function Phone({ navigation }: any) {
  const [num, setNum] = useState('');
  const [wa, setWa] = useState(true);
  const valid = num.length === 10;
  return (
    <View style={s.flex}>
      <GreenHeader title="Enter your number" onBack={() => navigation.goBack()} />
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>OTP will be sent here for verification</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={s.cc}><Text style={s.ccText}>🇮🇳 IN  +91</Text></View>
          <TextInput style={s.input} keyboardType="number-pad" maxLength={10} value={num} onChangeText={setNum} placeholder="Mobile number" autoFocus />
        </View>
        <View style={s.waRow}>
          <Icon name="whatsapp" size={28} color="#25D366" />
          <Text style={{ flex: 1, fontSize: 16 }}>Allow WhatsApp updates</Text>
          <Switch value={wa} onValueChange={setWa} trackColor={{ true: colors.mint, false: '#ccc' }} thumbColor={wa ? colors.primary : '#f4f4f4'} />
        </View>
      </View>
      <View style={{ flex: 1 }} />
      <Button title="Send OTP" color={valid ? colors.primary : '#9AA89D'} style={{ margin: 16 }} onPress={() => valid && navigation.navigate('Otp', { num })} />
    </View>
  );
}

/** OTP verification (prototype: any 4 digits accepted) */
export function Otp({ navigation, route }: any) {
  const [code, setCode] = useState('');
  return (
    <View style={s.flex}>
      <GreenHeader title="Verify OTP" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.muted, marginBottom: 16 }}>Enter the 4-digit code sent to +91 {route.params?.num}</Text>
        <TextInput style={[s.input, { letterSpacing: 16, textAlign: 'center', fontSize: 28 }]} keyboardType="number-pad" maxLength={4} value={code} onChangeText={setCode} autoFocus />
        <Text style={{ color: colors.muted, marginTop: 12 }}>Prototype: any 4 digits will work.</Text>
      </ScrollView>
      <Button title="Verify" color={code.length === 4 ? colors.primary : '#9AA89D'} style={{ margin: 16 }} onPress={() => code.length === 4 && navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 24 },
  sub: { textAlign: 'center', paddingHorizontal: 24, marginVertical: 14, fontSize: 15 },
  panel: { flex: 1, borderRadius: 24, padding: 14, alignItems: 'center' },
  small: { fontWeight: '600', marginTop: 6 },
  panelTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  panelBody: { textAlign: 'center', marginTop: 10, color: '#444' },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16 },
  brand: { fontSize: 36, fontStyle: 'italic', fontWeight: '800', color: '#333', marginTop: 10 },
  tag: { color: '#555', letterSpacing: 1 },
  slideTitle: { fontSize: 38, fontWeight: '800', color: '#444', marginTop: 12 },
  underline: { width: 80, height: 5, borderRadius: 3, backgroundColor: colors.green, marginVertical: 12 },
  slideBody: { fontSize: 18, color: colors.muted, lineHeight: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc' },
  terms: { textAlign: 'center', marginVertical: 14 },
  cc: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  ccText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, height: 56, fontSize: 20, fontWeight: '700', color: colors.primary },
  waRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 14, borderRadius: 10, marginTop: 24 },
});
