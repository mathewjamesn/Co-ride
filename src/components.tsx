import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './theme';
import { Person } from './data';

export const Button = ({ title, onPress, style, color = colors.primary }: { title: string; onPress?: () => void; style?: ViewStyle; color?: string }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [s.btn, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }, style]}>
    <Text style={s.btnText}>{title}</Text>
  </Pressable>
);

export const GreenHeader = ({ title, subtitle, onBack, onRight, rightIcon }: { title: string; subtitle?: string; onBack?: () => void; onRight?: () => void; rightIcon?: string }) => {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: top + 12 }]}>
      <Pressable onPress={onBack} style={[s.hBtn, !onBack && { opacity: 0 }]}>
        <Icon name="chevron-left" size={28} color="#fff" />
      </Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={s.hTitle}>{title}</Text>
        {subtitle ? <Text style={s.hSub}>{subtitle}</Text> : null}
      </View>
      <Pressable onPress={onRight} style={[s.hBtn, !rightIcon && { opacity: 0 }]}>
        <Icon name={(rightIcon ?? 'dots-vertical') as any} size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

export const Avatar = ({ name, size = 64 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size / 2.6, fontWeight: '700', color: colors.primary }}>{initials}</Text>
    </View>
  );
};

/** Stylised map placeholder. Swap for react-native-maps / Google Maps later. */
export const MapMock = ({ height = 300, label }: { height?: number; label?: string }) => {
  const W = 360;
  const pts = [[0.78, 0.15], [0.62, 0.3], [0.5, 0.32], [0.38, 0.5], [0.3, 0.7], [0.18, 0.88]];
  return (
    <View style={{ height, backgroundColor: '#E8EEF2', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: height * 0.8, backgroundColor: '#BFE0F2', borderRadius: 90 }} />
      <View style={{ position: 'absolute', right: 20, top: 60, width: 110, height: 70, backgroundColor: '#CFEBD6', borderRadius: 30 }} />
      {pts.slice(1).map((p, i) => {
        const x1 = pts[i][0] * W, y1 = pts[i][1] * height;
        const x2 = p[0] * W, y2 = p[1] * height;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ang = Math.atan2(y2 - y1, x2 - x1);
        return (
          <View
            key={i}
            style={{ position: 'absolute', left: (x1 + x2) / 2 - len / 2, top: (y1 + y2) / 2 - 2, width: len, height: 4, backgroundColor: colors.primary, borderRadius: 2, transform: [{ rotate: `${ang}rad` }] }}
          />
        );
      })}
      <View style={[s.pin, { left: pts[0][0] * W - 8, top: pts[0][1] * height - 8, backgroundColor: colors.green }]} />
      <Icon name="map-marker" size={34} color={colors.red} style={{ position: 'absolute', left: pts[5][0] * W - 17, top: pts[5][1] * height - 34 }} />
      <Text style={s.mapLabel}>{label ?? 'Map preview'}</Text>
    </View>
  );
};

export const PersonCard = ({ p, cta, onCta, onPress }: { p: Person; cta: string; onCta: () => void; onPress?: () => void }) => (
  <Pressable onPress={onPress} style={s.card}>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', marginRight: 14 }}>
        <Avatar name={p.name} />
        <View style={[s.row, { marginTop: 4, gap: 2 }]}>
          <Icon name="star" color="#F5A623" size={16} />
          <Text>{p.rating}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.row}>
          <Icon name={p.verified ? 'shield-check' : 'shield-alert-outline'} size={20} color={p.verified ? colors.primary : colors.muted} />
          <Text style={s.name}>{p.name}</Text>
        </View>
        <View style={[s.row, { marginTop: 4 }]}>
          <Icon name="office-building-outline" size={20} color={colors.muted} />
          <Text style={s.org} numberOfLines={1}>{p.org}</Text>
        </View>
        <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
          <View style={s.row}>
            <Icon name="clock-outline" size={20} color={colors.muted} />
            <Text style={s.time}>{p.time}</Text>
          </View>
          <View style={s.row}>
            <Icon name="phone-outline" size={24} />
            <View style={s.sep} />
            <Icon name="message-outline" size={24} />
          </View>
        </View>
      </View>
    </View>
    <View style={s.leg}>
      <Icon name="walk" size={18} color={colors.muted} />
      <Text>{p.walkTo}</Text>
      <Icon name="chevron-right" size={16} color={colors.muted} />
      <Icon name={p.vehicle === 'bike' ? 'motorbike' : 'car'} size={18} color={colors.muted} />
      <Text>{p.ride}</Text>
      <Icon name="chevron-right" size={16} color={colors.muted} />
      <Icon name="walk" size={18} color={colors.muted} />
      <Text>{p.walkFrom}</Text>
    </View>
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 12 }]}>
      <Text style={{ color: p.match === 100 ? colors.primary : colors.amber, fontWeight: '600' }}>
        {p.match === 100 ? 'Full Match' : `${p.match}% Match`}
      </Text>
      <View style={s.row}>
        <Text style={s.points}>{p.points}</Text>
        <Pressable onPress={onCta} style={s.cta}>
          <Text style={s.btnText}>{cta}</Text>
        </Pressable>
      </View>
    </View>
  </Pressable>
);

const s = StyleSheet.create({
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: { backgroundColor: '#12361C', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 16 },
  hBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  hSub: { color: '#ddd', fontSize: 13 },
  pin: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  mapLabel: { position: 'absolute', right: 8, bottom: 6, color: '#999', fontSize: 11 },
  card: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 18, color: '#444' },
  org: { fontSize: 15, color: '#555', flex: 1 },
  time: { fontSize: 18, fontWeight: '700' },
  sep: { width: 1, height: 28, backgroundColor: colors.border, marginHorizontal: 8 },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 10, marginTop: 12, justifyContent: 'center' },
  points: { fontSize: 24, fontWeight: '700', color: colors.primary, marginRight: 12 },
  cta: { backgroundColor: colors.primary, borderRadius: 22, paddingHorizontal: 22, height: 44, alignItems: 'center', justifyContent: 'center' },
});
