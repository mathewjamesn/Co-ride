import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, T, Toggle, TopBar } from '../components';
import { colors, radius } from '../theme';

export const Logo = ({ size = 150 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
    <Icon name="source-fork" size={size * 0.58} color={colors.lime} />
  </View>
);

/** Screen 1: ownership-change consent */
export function Consent({ navigation }: any) {
  const [ok, setOk] = useState(true);
  return (
    <SafeAreaView style={s.flex}>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
        <T v="display" style={s.h1}>Two apps. Better focus.</T>
        <T color={colors.muted} style={s.sub}>For business reasons, iDisha is moving Carpool services to CoRide Mobility Pvt Ltd</T>
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
          <View style={[s.panel, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }]}>
            <View style={s.panelIcon}><Icon name="taxi" size={36} color={colors.ink} /></View>
            <T v="label" style={s.small}>Quick Taxi</T>
            <T v="heading" style={s.panelTitle}>Taxi services are moving to a new app</T>
            <T v="small" color={colors.muted} style={s.panelBody}>Download Quick Taxi from the Play Store from the planned cutover date to continue booking taxis.</T>
          </View>
          <View style={[s.panel, { backgroundColor: colors.ink }]}>
            <Logo size={64} />
            <T v="label" color={colors.lime} style={s.small}>Quick Ride</T>
            <T v="heading" color={colors.white} style={s.panelTitle}>This app will now be solely for carpooling</T>
            <T v="small" color={colors.darkMuted} style={s.panelBody}>Quick Ride (Carpool) will be owned and operated by CoRide Mobility Pvt Ltd.</T>
          </View>
        </View>
      </ScrollView>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: ok }} style={s.checkRow} onPress={() => setOk(!ok)}>
        <Icon name={ok ? 'checkbox-marked' : 'checkbox-blank-outline'} size={30} color={colors.ink} />
        <T style={{ flex: 1 }}>I have read and agree to the <T color={colors.blue} style={{ fontWeight: '700' }}>Terms & Conditions</T> of CoRide Mobility Pvt Ltd.</T>
      </Pressable>
      <Button title="I understand and consent" variant="lime" disabled={!ok} style={{ marginHorizontal: 16, marginBottom: 12 }} onPress={() => navigation.replace('Onboarding')} />
    </SafeAreaView>
  );
}

const slides = [
  { title: 'Carpool', body: 'Carpool / bikepool for daily commuting', icon: 'car-multiple' },
  { title: 'Start\ncarpooling', body: 'Join your colleague and reduce one car from the road today\n\nGet car rides at ₹5/km', icon: 'account-group' },
  { title: 'Earn points', body: 'Offer rides, earn points and redeem them on every commute', icon: 'star-circle' },
];

/** Screens 2-3: onboarding carousel */
export function Onboarding({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  return (
    <SafeAreaView style={s.flex}>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Logo size={104} />
        <T v="display" style={s.brand}>Quick Ride</T>
        <T v="label" color={colors.muted} style={s.tag}>Carpool • Bikepool</T>
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
            <View style={s.slideIcon}><Icon name={item.icon as any} size={40} color={colors.ink} /></View>
            <T v="hero" style={s.slideTitle}>{item.title}</T>
            <View style={s.underline} />
            <T color={colors.muted} style={s.slideBody}>{item.body}</T>
          </View>
        )}
      />
      <View style={s.dots}>
        {slides.map((_, k) => <View key={k} style={[s.dot, k === i && { backgroundColor: colors.ink, width: 24 }]} />)}
      </View>
      <Button title="Enter your phone number" style={{ marginHorizontal: 24 }} onPress={() => navigation.navigate('Phone')} />
      <T v="small" color={colors.muted} style={s.terms}>By continuing, I agree to Quick Ride <T v="small" color={colors.blue} style={{ fontWeight: '700' }}>Terms</T></T>
    </SafeAreaView>
  );
}

/** Screen 4: phone number */
export function Phone({ navigation }: any) {
  const [num, setNum] = useState('');
  const [wa, setWa] = useState(true);
  const valid = num.length === 10;
  return (
    <View style={s.flexGround}>
      <TopBar title="Enter your number" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 16 }}>
          <T color={colors.muted} style={{ marginBottom: 12 }}>OTP will be sent here for verification</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={s.cc}><T v="bodyStrong">IN  +91</T></View>
            <TextInput style={s.input} keyboardType="number-pad" maxLength={10} value={num} onChangeText={setNum} placeholder="Mobile number" placeholderTextColor={colors.muted} accessibilityLabel="Mobile number" />
          </View>
          <View style={s.waRow}>
            <Icon name="whatsapp" size={28} color={colors.green} />
            <T style={{ flex: 1 }}>Allow WhatsApp updates</T>
            <Toggle value={wa} onChange={setWa} />
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <Button title="Send OTP" variant="lime" disabled={!valid} style={{ margin: 16 }} onPress={() => navigation.navigate('Otp', { num })} />
      </KeyboardAvoidingView>
    </View>
  );
}

/** OTP verification (prototype: any 4 digits accepted) */
export function Otp({ navigation, route }: any) {
  const [code, setCode] = useState('');
  return (
    <View style={s.flexGround}>
      <TopBar title="Verify OTP" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <T color={colors.muted} style={{ marginBottom: 16 }}>Enter the 4-digit code sent to +91 {route.params?.num}</T>
          <TextInput style={[s.input, { letterSpacing: 16, textAlign: 'center', fontSize: 28 }]} keyboardType="number-pad" maxLength={4} value={code} onChangeText={setCode} accessibilityLabel="OTP code" />
          <T v="small" color={colors.muted} style={{ marginTop: 12 }}>Prototype: any 4 digits will work.</T>
        </ScrollView>
        <Button title="Verify" variant="lime" disabled={code.length !== 4} style={{ margin: 16 }} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ground },
  flexGround: { flex: 1, backgroundColor: colors.ground },
  h1: { textAlign: 'center', marginTop: 24 },
  sub: { textAlign: 'center', paddingHorizontal: 24, marginVertical: 14 },
  panel: { flex: 1, borderRadius: radius.xl, padding: 14, alignItems: 'center' },
  panelIcon: { width: 64, height: 64, borderRadius: 19, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  small: { marginTop: 8 },
  panelTitle: { textAlign: 'center', marginTop: 14 },
  panelBody: { textAlign: 'center', marginTop: 10 },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16 },
  brand: { marginTop: 14 },
  tag: { letterSpacing: 1, marginTop: 2 },
  slideIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  slideTitle: { marginTop: 18 },
  underline: { width: 80, height: 6, borderRadius: 3, backgroundColor: colors.lime, marginVertical: 14 },
  slideBody: { fontSize: 18, lineHeight: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  terms: { textAlign: 'center', marginVertical: 14 },
  cc: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, height: 56, fontSize: 20, fontWeight: '800', color: colors.ink, borderWidth: 1, borderColor: colors.line },
  waRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, padding: 14, borderRadius: radius.md, marginTop: 24 },
});
