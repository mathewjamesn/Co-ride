import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Header, Segmented, T, Toggle, TopBar } from '../components';
import { colors, makeStyles, radius } from '../theme';
import { COLORS, MAKES, Vehicle, VehicleKind, useGarage } from '../garage';

const Plate = ({ reg }: { reg: string }) => (
  <View style={st.plate}>
    <T v="label" color="#000" style={{ letterSpacing: 1 }}>{reg}</T>
  </View>
);

const StatusChip = ({ v }: { v: Vehicle }) => {
  const ok = v.status === 'verified';
  return (
    <View style={[st.chip, { backgroundColor: ok ? colors.greenTint : colors.warnTint, borderColor: ok ? colors.green : colors.warnLine }]}>
      <Icon name={ok ? 'shield-check' : 'clock-outline'} size={14} color={ok ? colors.green : colors.warnText} />
      <T v="small" color={ok ? colors.green : colors.warnText} style={{ fontWeight: '700' }}>{ok ? 'Verified' : 'Verification pending'}</T>
    </View>
  );
};

/** My vehicles. With `pick: true` it works as "Change vehicle" and returns after a choice. */
export function Vehicles({ navigation, route }: any) {
  const { vehicles, active, select, remove } = useGarage();
  const { bottom } = useSafeAreaInsets();
  const pick = !!route.params?.pick;

  const confirmRemove = (v: Vehicle) =>
    Alert.alert('Remove vehicle?', `${v.make} ${v.model} (${v.reg}) will be removed from your account.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(v.id) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title={pick ? 'Change vehicle' : 'My vehicles'} subtitle="Choose the vehicle you will offer rides in" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {vehicles.length === 0 ? (
          <View style={st.empty}>
            <Icon name="car-off" size={44} color={colors.muted} />
            <T v="heading">No vehicles yet</T>
            <T color={colors.muted} style={{ textAlign: 'center' }}>Add a car or bike to start offering pools and earning points.</T>
          </View>
        ) : null}
        {vehicles.map(v => {
          const on = v.id === active?.id;
          return (
            <Pressable
              key={v.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => { select(v.id); if (pick) navigation.goBack(); }}
              style={[st.card, on && { borderColor: colors.text, borderWidth: 2 }]}>
              <View style={st.row}>
                <View style={st.iconWrap}>
                  <Icon name={v.kind === 'bike' ? 'motorbike' : 'car-side'} size={30} color={colors.text} />
                  <View style={[st.swatch, { backgroundColor: v.colorHex }]} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="heading">{v.make} {v.model}</T>
                  <T v="small" color={colors.muted}>{v.color} · {v.seats} seat{v.seats > 1 ? 's' : ''} to offer</T>
                </View>
                <Icon name={on ? 'radiobox-marked' : 'radiobox-blank'} size={28} color={colors.text} />
              </View>
              <View style={[st.row, { justifyContent: 'space-between', marginTop: 12 }]}>
                <Plate reg={v.reg} />
                <StatusChip v={v} />
              </View>
              <View style={[st.row, { justifyContent: 'space-between', marginTop: 12 }]}>
                {on ? <T v="label" color={colors.green}>Active for new offers</T> : <T v="label" color={colors.muted}>Tap to use this vehicle</T>}
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${v.model}`} hitSlop={8} onPress={() => confirmRemove(v)}>
                  <T v="label" color={colors.red}>Remove</T>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: bottom + 16 }}>
        <Button title="Add vehicle" icon="plus" variant="lime" onPress={() => navigation.navigate('AddVehicle')} />
      </View>
    </View>
  );
}

const Label = ({ children }: { children: string }) => <T v="label" color={colors.muted} style={{ marginBottom: 8, marginTop: 6 }}>{children}</T>;

const DocRow = ({ title, hint, done, optional, onPress }: { title: string; hint: string; done: boolean; optional?: boolean; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={st.doc}>
    <View style={[st.docIcon, done && { backgroundColor: colors.greenTint }]}>
      <Icon name={done ? 'check-circle' : 'camera-outline'} size={24} color={done ? colors.green : colors.text} />
    </View>
    <View style={{ flex: 1 }}>
      <T v="bodyStrong">{title}{optional ? ' (optional)' : ''}</T>
      <T v="small" color={colors.muted}>{done ? 'Uploaded' : hint}</T>
    </View>
    <T v="label" color={colors.blue}>{done ? 'Replace' : 'Upload'}</T>
  </Pressable>
);

/** Add a vehicle: type, registration, make/model, colour, seats and documents. */
export function AddVehicle({ navigation }: any) {
  const { add, vehicles } = useGarage();
  const { bottom } = useSafeAreaInsets();
  const [kind, setKind] = useState<VehicleKind>('car');
  const [reg, setReg] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [seats, setSeats] = useState(3);
  const [rc, setRc] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [makeActive, setMakeActive] = useState(true);

  const regClean = reg.trim().toUpperCase();
  const regOk = /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,3}[ -]?\d{4}$/.test(regClean);
  const dup = vehicles.some(v => v.reg.replace(/\s/g, '') === regClean.replace(/[\s-]/g, ''));
  const valid = regOk && !dup && !!make && model.trim().length > 0 && rc;
  const maxSeats = kind === 'bike' ? 1 : 4;
  const seatCount = Math.min(seats, maxSeats);

  const save = () => {
    add({ kind, make, model: model.trim(), reg: regClean, color: color.name, colorHex: color.hex, seats: seatCount }, makeActive);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <TopBar title="Add vehicle" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Segmented value={kind} options={[['car', 'Car'], ['bike', 'Bike']]} onChange={k => { setKind(k); setMake(''); setSeats(k === 'bike' ? 1 : 3); }} />

          <Label>REGISTRATION NUMBER</Label>
          <TextInput
            style={st.input}
            value={reg}
            onChangeText={setReg}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="KL 07 AB 1234"
            placeholderTextColor={colors.muted}
            maxLength={13}
            accessibilityLabel="Registration number"
          />
          {reg.length > 0 && !regOk ? <T v="small" color={colors.red} style={{ marginTop: 6 }}>Enter a valid number, like KL 07 AB 1234.</T> : null}
          {dup ? <T v="small" color={colors.red} style={{ marginTop: 6 }}>This vehicle is already on your account.</T> : null}

          <Label>MAKE</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {MAKES[kind].map(m => (
              <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: make === m }} onPress={() => setMake(m)} style={[st.pill, make === m && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
                <T v="label" color={make === m ? colors.accent : colors.text}>{m}</T>
              </Pressable>
            ))}
          </ScrollView>

          <Label>MODEL</Label>
          <TextInput style={st.input} value={model} onChangeText={setModel} placeholder={kind === 'bike' ? 'e.g. Activa' : 'e.g. Swift'} placeholderTextColor={colors.muted} accessibilityLabel="Model" />

          <Label>COLOUR</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {COLORS.map(c => (
              <Pressable key={c.name} accessibilityRole="button" accessibilityLabel={c.name} accessibilityState={{ selected: color.name === c.name }} onPress={() => setColor(c)} style={[st.colorRing, color.name === c.name && { borderColor: colors.text }]}>
                <View style={[st.colorDot, { backgroundColor: c.hex }]} />
              </Pressable>
            ))}
          </View>
          <T v="small" color={colors.muted} style={{ marginTop: 6 }}>{color.name}. Riders use this to spot your vehicle.</T>

          <Label>SEATS YOU WILL OFFER</Label>
          <View style={st.stepRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Fewer seats" disabled={kind === 'bike'} onPress={() => setSeats(Math.max(1, seatCount - 1))} style={st.step}>
              <Icon name="minus" size={22} color={colors.text} />
            </Pressable>
            <T v="heading">{seatCount} seat{seatCount > 1 ? 's' : ''}</T>
            <Pressable accessibilityRole="button" accessibilityLabel="More seats" disabled={kind === 'bike'} onPress={() => setSeats(Math.min(maxSeats, seatCount + 1))} style={st.step}>
              <Icon name="plus" size={22} color={colors.text} />
            </Pressable>
          </View>

          <Label>DOCUMENTS</Label>
          <View style={{ gap: 10 }}>
            <DocRow title="Registration certificate (RC)" hint="Front side, clear photo" done={rc} onPress={() => setRc(true)} />
            <DocRow title="Insurance" hint="Valid policy copy" done={insurance} optional onPress={() => setInsurance(true)} />
          </View>
          <T v="small" color={colors.muted} style={{ marginTop: 8 }}>We check documents within 24 hours. You can offer rides while verification is pending, but riders will see it as unverified.</T>

          <View style={st.toggleRow}>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">Use for my pool offers</T>
              <T v="small" color={colors.muted}>Make this the active vehicle</T>
            </View>
            <Toggle value={makeActive} onChange={setMakeActive} />
          </View>
        </ScrollView>
        <View style={{ padding: 16, paddingBottom: bottom + 16, backgroundColor: colors.ground }}>
          <Button title="Save vehicle" variant="lime" disabled={!valid} onPress={save} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = makeStyles(() => ({
  card: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  swatch: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.white },
  plate: { backgroundColor: '#F7D54A', borderRadius: 8, borderWidth: 2, borderColor: '#000', paddingHorizontal: 12, paddingVertical: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  empty: { alignItems: 'center', gap: 8, padding: 32, backgroundColor: colors.white, borderRadius: radius.xl },
  input: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, height: 56, fontSize: 18, fontWeight: '800', color: colors.text, borderWidth: 1, borderColor: colors.line },
  pill: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  colorRing: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.line },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.md, padding: 8, borderWidth: 1, borderColor: colors.line },
  step: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.line, minHeight: 64 },
  docIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginTop: 16, borderWidth: 1, borderColor: colors.line },
}));
