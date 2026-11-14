import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TextProps, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getMode, radius, shadow, TOUCH, type, makeStyles } from './theme';
import { Person } from './data';

type TypeKey = keyof typeof type;

/** Themed text: ink by default, driver-app type scale. */
export const T = ({ v = 'body', color, style, ...rest }: TextProps & { v?: TypeKey; color?: string }) => (
  <Text {...rest} style={[type[v], { color: color ?? colors.text }, style]} maxFontSizeMultiplier={1.4} />
);

type Variant = 'primary' | 'lime' | 'outline' | 'danger' | 'text';
const palette = (): Record<Variant, { bg: string; fg: string; border?: string }> => ({
  primary: { bg: colors.ink, fg: colors.onInk, border: getMode() === 'dark' ? colors.darkLine : undefined },
  lime: { bg: colors.lime, fg: colors.text },
  outline: { bg: colors.white, fg: colors.text, border: colors.text },
  danger: { bg: colors.red, fg: colors.onInk },
  text: { bg: 'transparent', fg: colors.text },
});

export const Button = ({
  title,
  onPress,
  style,
  variant = 'primary',
  disabled,
  icon,
  pill = true,
}: {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: Variant;
  disabled?: boolean;
  icon?: string;
  pill?: boolean;
}) => {
  const p = palette()[variant];
  const fg = disabled ? colors.muted : p.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: disabled ? colors.line : p.bg, borderRadius: pill ? radius.pill : 16 },
        p.border && !disabled ? { borderWidth: 2, borderColor: p.border } : null,
        pressed && !disabled ? { opacity: 0.85 } : null,
        style,
      ]}>
      <View style={s.row}>
        {icon ? <Icon name={icon as any} size={22} color={fg} /> : null}
        <Text style={[s.btnText, { color: fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
};

/** Dark header used on list/flow screens (matches the Driver app's dark cards). */
export const Header = ({ title, subtitle, onBack, onRight, rightIcon }: { title: string; subtitle?: string; onBack?: () => void; onRight?: () => void; rightIcon?: string }) => {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={[s.hBtn, !onBack && { opacity: 0 }]}>
        <Icon name="chevron-left" size={28} color={colors.onInk} />
      </Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={s.hTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.hSub}>{subtitle}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" onPress={onRight} style={[s.hBtn, !rightIcon && { opacity: 0 }]}>
        <Icon name={(rightIcon ?? 'dots-vertical') as any} size={24} color={colors.accent} />
      </Pressable>
    </View>
  );
};

/** Light top bar with a square back button, used on plain screens. */
export const TopBar = ({ title, onBack }: { title: string; onBack?: () => void }) => {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[s.topBar, { paddingTop: top + 8 }]}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.iconBtn}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <T v="title" style={{ flex: 1 }}>{title}</T>
    </View>
  );
};

export const Avatar = ({ name, size = 64 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size / 2.6, fontWeight: '800', color: colors.text }}>{initials}</Text>
    </View>
  );
};

/** Black pill-shaped toggle button group (Find a Pool / Offer Pool, Sort by / Preferences). */
export const Segmented = <K extends string>({ value, options, onChange }: { value: K; options: [K, string][]; onChange: (k: K) => void }) => (
  <View style={s.seg} accessibilityRole="tablist">
    {options.map(([k, label]) => {
      const on = k === value;
      return (
        <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[s.segItem, on && { backgroundColor: colors.ink }]} onPress={() => onChange(k)}>
          <Text style={[s.segText, { color: on ? colors.accent : colors.text }]}>{label}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.lime, false: colors.line }} thumbColor={value ? colors.text : colors.onInk} />
);

/** Stylised map placeholder. Swap for react-native-maps / Google Maps later. */
export const MapMock = ({ height = 300, label }: { height?: number; label?: string }) => {
  const W = 360;
  const pts = [[0.78, 0.15], [0.62, 0.3], [0.5, 0.32], [0.38, 0.5], [0.3, 0.7], [0.18, 0.88]];
  return (
    <View style={{ height, backgroundColor: colors.mapBg, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: -40, bottom: -30, width: 180, height: height * 0.8, backgroundColor: colors.mapWater, borderRadius: 90 }} />
      <View style={{ position: 'absolute', right: 20, top: 60, width: 110, height: 70, backgroundColor: colors.mapPark, borderRadius: 30 }} />
      {pts.slice(1).map((p, i) => {
        const x1 = pts[i][0] * W, y1 = pts[i][1] * height;
        const x2 = p[0] * W, y2 = p[1] * height;
        const len = Math.hypot(x2 - x1, y2 - y1);
        const ang = Math.atan2(y2 - y1, x2 - x1);
        return (
          <View
            key={i}
            style={{ position: 'absolute', left: (x1 + x2) / 2 - len / 2, top: (y1 + y2) / 2 - 2.5, width: len, height: 5, backgroundColor: colors.text, borderRadius: 3, transform: [{ rotate: `${ang}rad` }] }}
          />
        );
      })}
      <View style={[s.pin, { left: pts[0][0] * W - 9, top: pts[0][1] * height - 9, backgroundColor: colors.lime }]} />
      <Icon name="map-marker" size={34} color={colors.red} style={{ position: 'absolute', left: pts[5][0] * W - 17, top: pts[5][1] * height - 34 }} />
      {label ? <Text style={s.mapLabel}>{label}</Text> : null}
    </View>
  );
};

export type NavTab = 'Home' | 'Booking' | 'Wallet' | 'Profile';
const TABS: { key: NavTab; label: string; icon: string; on: string; route: string }[] = [
  { key: 'Home', label: 'Home', icon: 'home-outline', on: 'home', route: 'Home' },
  { key: 'Booking', label: 'Booking', icon: 'calendar-check-outline', on: 'calendar-check', route: 'History' },
  { key: 'Wallet', label: 'Wallet', icon: 'wallet-outline', on: 'wallet', route: 'Wallet' },
  { key: 'Profile', label: 'Profile', icon: 'account-outline', on: 'account', route: 'Profile' },
];

/** Bottom menu: Home, Booking, Wallet, Profile. */
export const BottomNav = ({ active, navigation }: { active: NavTab; navigation: any }) => {
  const { bottom } = useSafeAreaInsets();
  const go = (tab: (typeof TABS)[number]) => {
    if (tab.key === active) return;
    if (tab.key === 'Home') navigation.navigate('Home');
    else if (active === 'Home') navigation.navigate(tab.route);
    else navigation.replace(tab.route);
  };
  return (
    <View style={[s.nav, { paddingBottom: bottom + 6 }]} accessibilityRole="tablist">
      {TABS.map(tab => {
        const on = tab.key === active;
        return (
          <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={tab.label} onPress={() => go(tab)} style={s.navItem}>
            <View style={[s.navPill, on && { backgroundColor: colors.lime }]}>
              <Icon name={(on ? tab.on : tab.icon) as any} size={24} color={colors.text} />
            </View>
            <Text style={[s.navLabel, { color: on ? colors.text : colors.muted, fontWeight: on ? '800' : '600' }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const PersonCard = ({ p, cta, done, onCta, onPress, onChat, onCall }: { p: Person; cta: string; done?: boolean; onCta: () => void; onPress?: () => void; onChat?: () => void; onCall?: () => void }) => (
  <Pressable onPress={onPress} style={s.card}>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', marginRight: 14 }}>
        <Avatar name={p.name} />
        <View style={[s.row, { marginTop: 4, gap: 2 }]}>
          <Icon name="star" color={colors.text} size={16} />
          <Text style={s.rate}>{p.rating}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.row}>
          <Icon name={p.verified ? 'shield-check' : 'shield-alert-outline'} size={20} color={p.verified ? colors.green : colors.muted} />
          <Text style={s.name}>{p.name}</Text>
        </View>
        <View style={[s.row, { marginTop: 4 }]}>
          <Icon name="office-building-outline" size={18} color={colors.muted} />
          <Text style={s.org} numberOfLines={1}>{p.org}</Text>
        </View>
        <View style={[s.row, { marginTop: 6, justifyContent: 'space-between' }]}>
          <View style={s.row}>
            <Icon name="clock-outline" size={20} color={colors.muted} />
            <Text style={s.time}>{p.time}</Text>
          </View>
          <View style={s.row}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Call ${p.name}`} hitSlop={8} onPress={onCall} style={s.contact}>
              <Icon name="phone-outline" size={24} color={colors.text} />
            </Pressable>
            <View style={s.sep} />
            <Pressable accessibilityRole="button" accessibilityLabel={`Message ${p.name}`} hitSlop={8} onPress={onChat} style={s.contact}>
              <Icon name="message-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
    <View style={s.leg}>
      <Icon name="walk" size={18} color={colors.muted} />
      <Text style={s.legT}>{p.walkTo}</Text>
      <Icon name="chevron-right" size={16} color={colors.muted} />
      <Icon name={p.vehicle === 'bike' ? 'motorbike' : 'car'} size={18} color={colors.text} />
      <Text style={s.legT}>{p.ride}</Text>
      <Icon name="chevron-right" size={16} color={colors.muted} />
      <Icon name="walk" size={18} color={colors.muted} />
      <Text style={s.legT}>{p.walkFrom}</Text>
    </View>
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 12 }]}>
      <View style={[s.matchChip, { backgroundColor: p.match === 100 ? colors.greenTint : colors.warnTint }]}>
        <Text style={{ color: p.match === 100 ? colors.green : colors.warnText, fontWeight: '800' }}>
          {p.match === 100 ? 'Full match' : `${p.match}% match`}
        </Text>
      </View>
      <View style={s.row}>
        <Text style={s.points}>{p.points}<Text style={s.pts}> pts</Text></Text>
        <Pressable accessibilityRole="button" accessibilityLabel={done ? `${cta}. View details` : cta} onPress={onCta} style={[s.cta, done && s.ctaDone]}>
          {done ? <Icon name="check-circle" size={18} color={colors.green} /> : null}
          <Text style={[s.ctaText, done && { color: colors.green }]}>{cta}</Text>
        </Pressable>
      </View>
    </View>
  </Pressable>
);

const s = makeStyles(() => ({
  btn: { minHeight: 56, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', minWidth: TOUCH },
  btnText: { fontSize: 17, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  header: { backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 16 },
  hBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.darkCard, alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: colors.onInk, fontSize: 18, fontWeight: '800' },
  hSub: { color: colors.darkMuted, fontSize: 13, marginTop: 2 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.white },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.pill, padding: 4, gap: 4, borderWidth: 1, borderColor: colors.line },
  segItem: { flex: 1, minHeight: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 15, fontWeight: '800' },
  pin: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: colors.text },
  mapLabel: { position: 'absolute', right: 8, bottom: 6, color: colors.muted, fontSize: 11 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 16 },
  rate: { fontWeight: '700', color: colors.text },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
  org: { fontSize: 14, color: colors.muted, flex: 1 },
  time: { fontSize: 18, fontWeight: '800', color: colors.text },
  nav: { flexDirection: 'row', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 6, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', minHeight: 56, justifyContent: 'center', gap: 2 },
  navPill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 12 },
  contact: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sep: { width: 1, height: 28, backgroundColor: colors.line, marginHorizontal: 8 },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 10, marginTop: 12, justifyContent: 'center' },
  legT: { color: colors.text, fontWeight: '600' },
  matchChip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  points: { fontSize: 24, fontWeight: '800', color: colors.text, marginRight: 12 },
  pts: { fontSize: 13, fontWeight: '600', color: colors.muted },
  cta: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 22, height: 48, alignItems: 'center', justifyContent: 'center' },
  ctaDone: { flexDirection: 'row', gap: 6, backgroundColor: colors.greenTint, borderWidth: 1.5, borderColor: colors.green },
  ctaText: { color: colors.accent, fontSize: 16, fontWeight: '800' },
}));

export { shadow };
