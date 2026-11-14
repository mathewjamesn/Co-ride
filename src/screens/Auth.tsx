import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, T, TopBar } from '../components';
import { colors, radius, makeStyles } from '../theme';

export const Logo = ({ size = 150 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
    <Icon name="source-fork" size={size * 0.58} color={colors.accent} />
  </View>
);

const slides = [
  { title: 'Carpool', body: 'Carpool / bikepool for daily commuting', icon: 'car-multiple' },
  { title: 'Start\ncarpooling', body: 'Join your colleague and reduce one car from the road today\n\nGet car rides at ₹5/km', icon: 'account-group' },
  { title: 'Earn points', body: 'Offer rides, earn points and redeem them on every commute', icon: 'star-circle' },
];

/** First screen for a new user: Carpool intro + enter phone number */
export function Onboarding({ navigation }: any) {
  const { width } = useWindowDimensions();
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  return (
    <SafeAreaView style={s.flex}>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Logo size={104} />
        <T v="display" style={s.brand}>Go-Pool</T>
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
            <View style={s.slideIcon}><Icon name={item.icon as any} size={40} color={colors.text} /></View>
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
      <T v="small" color={colors.muted} style={s.terms}>By continuing, I agree to Go-Pool <T v="small" color={colors.blue} style={{ fontWeight: '700' }}>Terms</T></T>
    </SafeAreaView>
  );
}

/** Screen 4: phone number */
export function Phone({ navigation }: any) {
  const [num, setNum] = useState('');
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

const s = makeStyles(() => ({
  flex: { flex: 1, backgroundColor: colors.ground },
  flexGround: { flex: 1, backgroundColor: colors.ground },
  h1: { textAlign: 'center', marginTop: 24 },
  sub: { textAlign: 'center', paddingHorizontal: 24, marginVertical: 14 },
  panel: { flex: 1, borderRadius: radius.xl, padding: 14, alignItems: 'center' },
  panelIcon: { width: 64, height: 64, borderRadius: 19, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  small: { marginTop: 8 },
  panelTitle: { textAlign: 'center', marginTop: 14 },
  panelBody: { textAlign: 'center', marginTop: 10 },
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
  input: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, height: 56, fontSize: 20, fontWeight: '800', color: colors.text, borderWidth: 1, borderColor: colors.line },
}));
