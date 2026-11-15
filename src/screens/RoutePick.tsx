import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, T } from '../components';
import { colors, radius, makeStyles } from '../theme';
import { useSearch } from '../state';
import { ALTS, END, LANDMARKS, MAX_VIA, START, buildPath, nearestAlt, stats, Pt } from '../routes';

const Seg = ({ a, b, w, h, color, thick }: { a: Pt; b: Pt; w: number; h: number; color: string; thick: number }) => {
  const x1 = a.x * w, y1 = a.y * h, x2 = b.x * w, y2 = b.y * h;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: (x1 + x2) / 2 - len / 2, top: (y1 + y2) / 2 - thick / 2, width: len, height: thick, backgroundColor: color, borderRadius: thick, transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }] }}
    />
  );
};

/** Point halfway along a path, for the time pill. */
function midpoint(path: Pt[]): Pt {
  const L = (p: Pt, q: Pt) => Math.hypot((p.x - q.x) * 360, (p.y - q.y) * 500);
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) total += L(path[i], path[i + 1]);
  let acc = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = L(path[i], path[i + 1]);
    if (acc + seg >= total / 2) {
      const t = (total / 2 - acc) / seg;
      return { x: path[i].x + (path[i + 1].x - path[i].x) * t, y: path[i].y + (path[i + 1].y - path[i].y) * t };
    }
    acc += seg;
  }
  return path[0];
}

/** Full-screen route picker: tap a route to choose it, or switch to waypoint mode and tap the map to route via a place. */
export function RoutePick({ navigation }: any) {
  const { s, set } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  const key = `${s.from}>${s.to}`;
  const [alt, setAlt] = useState(s.routeFor === key ? s.routeAlt : 0);
  const [via, setVia] = useState<Pt[]>(s.routeFor === key ? s.via : []);
  const [mode, setMode] = useState<'route' | 'via'>('route');
  const [open, setOpen] = useState(true);
  const [size, setSize] = useState({ w: 360, h: 640 });

  // Waypoint mode: the map scrolls under a fixed pointer; Confirm drops the waypoint where the pointer is.
  const pan = useRef(new Animated.ValueXY()).current;
  const panNow = useRef({ x: 0, y: 0 });
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => modeRef.current === 'via' && (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
        onPanResponderGrant: () => {
          pan.setOffset(panNow.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_, g) => {
          panNow.current = { x: panNow.current.x + g.dx, y: panNow.current.y + g.dy };
          pan.flattenOffset();
        },
        onPanResponderTerminate: (_, g) => {
          panNow.current = { x: panNow.current.x + g.dx, y: panNow.current.y + g.dy };
          pan.flattenOffset();
        },
      }),
    [pan],
  );
  const pinY = size.h * 0.34;
  const confirmWaypoint = () => {
    if (via.length >= MAX_VIA) return;
    setVia([...via, { x: (size.w / 2 - panNow.current.x) / size.w, y: (pinY - panNow.current.y) / size.h }]);
  };
  const grid: number[] = [];
  for (let g = -4; g <= 6; g++) grid.push(g);

  const tap = (e: any) => {
    const p = { x: e.nativeEvent.locationX / size.w, y: e.nativeEvent.locationY / size.h };
    if (mode === 'via') return;
    const n = nearestAlt(p, via);
    if (n.dist < 40) setAlt(n.alt);
  };

  const info = stats(alt, via);
  const done = () => {
    set({ routeAlt: alt, via, routeFor: key });
    navigation.goBack();
  };
  const order = [0, 1, 2].filter(k => k !== alt).concat(alt); // chosen route drawn on top

  return (
    <View style={{ flex: 1, backgroundColor: colors.mapBg }} onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* Map */}
      <View style={{ flex: 1, overflow: 'hidden' }} {...responder.panHandlers}>
      <Animated.View style={{ width: size.w, height: size.h, transform: pan.getTranslateTransform() }}>
      {grid.map(g => (
        <React.Fragment key={g}>
          <View pointerEvents="none" style={{ position: 'absolute', left: g * 90, top: -size.h * 2, width: 2, height: size.h * 5, backgroundColor: colors.line, opacity: 0.35 }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: g * 110, left: -size.w * 2, height: 2, width: size.w * 5, backgroundColor: colors.line, opacity: 0.35 }} />
        </React.Fragment>
      ))}
      <Pressable accessibilityLabel="Map: tap a route to choose it" onPress={tap} style={{ width: size.w, height: size.h }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: -50, bottom: -30, width: 220, height: size.h * 0.6, backgroundColor: colors.mapWater, borderRadius: 110 }} />
        <View pointerEvents="none" style={{ position: 'absolute', right: 20, top: size.h * 0.2, width: 120, height: 80, backgroundColor: colors.mapPark, borderRadius: 34 }} />

        {order.map(k => {
          const path = buildPath(k, via);
          const on = k === alt;
          return path.slice(1).map((p, i) => <Seg key={`${k}-${i}`} a={path[i]} b={p} w={size.w} h={size.h} color={on ? colors.text : colors.muted} thick={on ? 7 : 4} />);
        })}

        {/* Time pills (tap to choose) */}
        {[0, 1, 2].map(k => {
          const m = midpoint(buildPath(k, via));
          const st = stats(k, via);
          const on = k === alt;
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={`${ALTS[k].name}, ${st.min} minutes`} accessibilityState={{ selected: on }} onPress={() => setAlt(k)} style={[s2.pill, { left: m.x * size.w - 34, top: m.y * size.h - 16 }, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
              <T v="small" color={on ? colors.accent : colors.text} style={{ fontWeight: '800' }}>{st.min} min</T>
            </Pressable>
          );
        })}

        <View pointerEvents="none" style={[s2.dot, { left: START.x * size.w - 10, top: START.y * size.h - 10, backgroundColor: colors.lime }]} />
        <View pointerEvents="none" style={{ position: 'absolute', left: END.x * size.w - 18, top: END.y * size.h - 36 }}><Icon name="map-marker" size={36} color={colors.red} /></View>

        {via.map((p, i) => (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Remove waypoint ${i + 1}`} onPress={() => setVia(via.filter((_, j) => j !== i))} style={[s2.wp, { left: p.x * size.w - 15, top: p.y * size.h - 15 }]}>
            <T v="label" color={colors.accent}>{i + 1}</T>
          </Pressable>
        ))}
      </Pressable>
      </Animated.View>
      </View>
      {mode === 'via' ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: size.w / 2 - 22, top: pinY - 44, alignItems: 'center' }}>
          <Icon name="map-marker" size={44} color={colors.blue} />
          <View style={s2.pinShadow} />
        </View>
      ) : null}

      {/* Top bar */}
      <View style={[s2.topRow, { top: top + 12 }]} pointerEvents="box-none">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()} style={s2.round}>
          <Icon name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={s2.titleChip}>
          <T v="label" numberOfLines={1}>{mode === 'via' ? 'Drag the map to place the pointer' : 'Tap a route to choose it'}</T>
        </View>
      </View>

      {/* Sheet */}
      <View style={[s2.sheet, { paddingBottom: bottom + 14 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={open ? 'Hide details' : 'Show details'} onPress={() => setOpen(!open)} style={s2.grab}>
          <View style={s2.grabBar} />
        </Pressable>

        <View style={s2.summary}>
          <View style={{ flex: 1 }}>
            <T v="title" numberOfLines={1}>Via {ALTS[alt].name}</T>
            <T v="small" color={colors.muted}>{info.min} min · {info.km} km{via.length ? ` · ${via.length} waypoint${via.length > 1 ? 's' : ''}` : ''}</T>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Reset route" onPress={() => { setAlt(0); setVia([]); }} style={s2.reset}>
            <Icon name="restore" size={18} color={colors.text} />
            <T v="label">Reset</T>
          </Pressable>
        </View>

        {open ? (
          <>
            <View style={s2.modes}>
              {([['route', 'map-marker-path', 'Pick route'], ['via', 'map-marker-plus-outline', 'Add waypoint']] as const).map(([k, ic, label]) => {
                const on = mode === k;
                return (
                  <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setMode(k)} style={[s2.mode, on && { backgroundColor: colors.ink }]}>
                    <Icon name={ic} size={20} color={on ? colors.accent : colors.text} />
                    <T v="label" color={on ? colors.accent : colors.text}>{label}</T>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {ALTS.map((a, k) => {
                const st = stats(k, via);
                const on = k === alt;
                return (
                  <Pressable key={a.name} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setAlt(k)} style={[s2.alt, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
                    <T v="small" color={on ? colors.accent : colors.muted} style={{ fontWeight: '800' }}>{a.tag.toUpperCase()}</T>
                    <T v="label" color={on ? colors.onInk : colors.text} numberOfLines={1}>{a.name}</T>
                    <T v="small" color={on ? colors.darkMuted : colors.muted}>{st.min} min · {st.km} km</T>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ gap: 6 }}>
              {via.length === 0 ? (
                <T v="small" color={colors.muted}>No waypoints. Switch to “Add waypoint”, drag the map to put the pointer on a place and confirm. Up to {MAX_VIA}.</T>
              ) : (
                via.map((p, i) => (
                  <View key={i} style={s2.viaRow}>
                    <View style={s2.viaNum}><T v="small" color={colors.accent} style={{ fontWeight: '800' }}>{i + 1}</T></View>
                    <T v="label" style={{ flex: 1 }} numberOfLines={1}>{LANDMARKS[i % LANDMARKS.length]}{i >= LANDMARKS.length ? ` ${Math.floor(i / LANDMARKS.length) + 1}` : ''} area</T>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove waypoint ${i + 1}`} onPress={() => setVia(via.filter((_, j) => j !== i))} style={s2.x}>
                      <Icon name="close" size={18} color={colors.text} />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}

        {mode === 'via' ? (
          <>
            <Button title={via.length >= MAX_VIA ? `Maximum ${MAX_VIA} waypoints` : `Confirm waypoint ${via.length + 1} here`} variant="lime" disabled={via.length >= MAX_VIA} onPress={confirmWaypoint} />
            <Button title="Use this route" variant="outline" onPress={done} />
          </>
        ) : (
          <Button title="Use this route" variant="lime" onPress={done} />
        )}
      </View>
    </View>
  );
}

const s2 = makeStyles(() => ({
  topRow: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  round: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  titleChip: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 14, elevation: 3 },
  pill: { position: 'absolute', width: 68, minHeight: 32, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  pinShadow: { width: 14, height: 5, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.35)', marginTop: -4 },
  dot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: colors.text },
  wp: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.ground, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 16, gap: 10, elevation: 8 },
  grab: { alignItems: 'center', paddingTop: 8, paddingBottom: 2, minHeight: 24 },
  grabBar: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reset: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.white },
  modes: { flexDirection: 'row', gap: 8 },
  mode: { flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  alt: { width: 140, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, padding: 10, gap: 2 },
  viaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 10, minHeight: 44 },
  viaNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  x: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
}));
