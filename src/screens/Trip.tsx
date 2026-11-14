import React, { useState } from 'react';
import { Modal, Linking, Pressable, ScrollView, Share, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, Header, MapMock, T } from '../components';
import { colors, radius, makeStyles } from '../theme';
import { rideTakers } from '../data';
import { useSearch } from '../state';
import { PIN, VEHICLE, TripRider, useTrip } from '../trip';
import { useChat } from '../chat';
import { useGarage, vehicleName } from '../garage';
import { useKeepAwake } from '../keepAwake';
import { callNumber } from './Chat';

const first = (name: string) => name.split(' ')[0];

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Big action button in the style of the Driver app's Go online / Go offline. */
const Action = ({ title, icon, onPress, disabled, variant = 'lime' }: { title: string; icon: string; onPress: () => void; disabled?: boolean; variant?: 'lime' | 'outline' | 'danger' | 'primary' }) => (
  <Button title={title} icon={icon} variant={variant} disabled={disabled} onPress={onPress} style={{ minHeight: 64 }} />
);

const Chip = ({ ok, text }: { ok: boolean; text: string }) => (
  <View style={[st.chip, { backgroundColor: ok ? colors.greenTint : colors.warnTint, borderColor: ok ? colors.green : colors.warnLine }]}>
    <Icon name={ok ? 'check-circle' : 'clock-outline'} size={16} color={ok ? colors.green : colors.warnText} />
    <T v="label" color={ok ? colors.green : colors.warnText}>{text}</T>
  </View>
);

/** Vertical stop list: each pickup in order, then the drop. */
function StopList({ riders, stop, phase, drop, youLabel, onChat }: { riders: TripRider[]; stop: number; phase: string; drop: string; youLabel?: boolean; onChat?: (r: TripRider) => void }) {
  const dropActive = phase === 'toDrop';
  return (
    <View style={st.stops}>
      {riders.map((r, i) => {
        const done = r.pickedUp;
        const active = !done && i === stop && (phase === 'started' || phase === 'atStop');
        return (
          <View key={r.id} style={st.stopRow}>
            <View style={[st.stopDot, done && { backgroundColor: colors.green, borderColor: colors.green }, active && { backgroundColor: colors.lime, borderColor: colors.text }]}>
              {done ? <Icon name="check" size={14} color={colors.onInk} /> : <T v="small" style={{ fontWeight: '800' }}>{i + 1}</T>}
            </View>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong" color={done ? colors.muted : colors.text}>{youLabel && r.id === 'me' ? 'Your pickup' : `Pick up ${first(r.name)}`}</T>
              <T v="small" color={colors.muted} numberOfLines={1}>{r.pickup}</T>
            </View>
            {active ? <View style={st.now}><T v="label">Now</T></View> : null}
            {onChat && r.id !== 'me' ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Message ${r.name}`} onPress={() => onChat(r)} hitSlop={6} style={st.chatBtn}>
                <Icon name="message-outline" size={22} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
        );
      })}
      <View style={st.stopRow}>
        <View style={[st.stopDot, { borderColor: colors.red }, dropActive && { backgroundColor: colors.red }]}>
          <Icon name="flag-checkered" size={14} color={dropActive ? colors.onInk : colors.red} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="bodyStrong">Drop</T>
          <T v="small" color={colors.muted} numberOfLines={1}>{drop}</T>
        </View>
        {dropActive ? <View style={st.now}><T v="label">Now</T></View> : null}
      </View>
    </View>
  );
}

const Stamp = ({ icon, bg, title, sub, onBack, top }: { icon: string; bg: string; title: string; sub: string; onBack?: () => void; top: number }) => (
  <View style={[st.stampWrap, { backgroundColor: bg, paddingTop: top + 36 }]}>
    {onBack ? (
      <Pressable accessibilityRole="button" accessibilityLabel="Back to home" style={[st.stampBack, { top: top + 8 }]} onPress={onBack}>
        <Icon name="chevron-left" size={28} color={colors.text} />
      </Pressable>
    ) : null}
    <View style={st.stamp}><Icon name={icon as any} size={52} color={colors.accent} /></View>
    <T v="display" color={colors.onInk} style={{ marginTop: 14, textAlign: 'center' }}>{title}</T>
    <T color={colors.darkMuted} style={{ marginTop: 6, textAlign: 'center', paddingHorizontal: 24 }}>{sub}</T>
  </View>
);

const ProtoBox = ({ label, title, onPress }: { label: string; title: string; onPress: () => void }) => (
  <View style={st.proto}>
    <T v="small" color={colors.muted}>PROTOTYPE · {label}</T>
    <Pressable accessibilityRole="button" onPress={onPress} style={st.protoBtn}>
      <T v="label">{title}</T>
    </Pressable>
  </View>
);

/** Call + message buttons for the other person on the ride. The chat thread is keyed by their id. */
export const ContactBar = ({ id, name, navigation, sub }: { id: string; name: string; navigation: any; sub?: string }) => {
  const { unread } = useChat();
  const n = unread[id] ?? 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Call ${name}`} onPress={callNumber} style={st.contact}>
        <Icon name="phone-outline" size={26} color={colors.text} />
      </Pressable>
      <View style={st.sep} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Message ${name}`} onPress={() => navigation.navigate('Chat', { id, name, sub })} style={st.contact}>
        <Icon name="message-outline" size={26} color={colors.text} />
        {n > 0 ? (
          <View style={st.badge}>
            <T v="small" color={colors.onInk} style={{ fontWeight: '800' }}>{n}</T>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

/** Safety centre: emergency call, share trip, support. */
function SafetySheet({ visible, onClose, message, bottom }: { visible: boolean; onClose: () => void; message: string; bottom: number }) {
  const rows = [
    { icon: 'phone-alert', title: 'Call emergency services', sub: 'Dial 112 right away', danger: true, onPress: () => Linking.openURL('tel:112').catch(() => {}) },
    { icon: 'share-variant', title: 'Share trip status', sub: 'Send your route and vehicle to a friend', onPress: () => Share.share({ message }).catch(() => {}) },
    { icon: 'headset', title: 'Call Go-Pool support', sub: 'We are here 24x7', onPress: callNumber },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.scrim}>
        <Pressable style={{ flex: 1 }} accessibilityLabel="Close" onPress={onClose} />
        <View style={[st.addSheet, { paddingBottom: bottom + 20 }]}>
          <T v="title">Safety centre</T>
          <T v="small" color={colors.muted} style={{ marginTop: 2, marginBottom: 8 }}>Your trip details are shared only when you choose to.</T>
          {rows.map(r => (
            <Pressable key={r.title} accessibilityRole="button" onPress={r.onPress} style={st.safeRow}>
              <View style={[st.safeIcon, r.danger && { backgroundColor: colors.redTint }]}>
                <Icon name={r.icon as any} size={24} color={r.danger ? colors.red : colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <T v="bodyStrong" color={r.danger ? colors.red : colors.text}>{r.title}</T>
                <T v="small" color={colors.muted}>{r.sub}</T>
              </View>
              <Icon name="chevron-right" size={24} color={colors.muted} />
            </Pressable>
          ))}
          <Button title="Close" variant="outline" style={{ marginTop: 16 }} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Request accepted                                                    */
/* ------------------------------------------------------------------ */

/** Rider: "{driver} accepted your request". Driver: "{rider} accepted your offer" + add more riders. */
export function Accepted({ navigation }: any) {
  const { trip, addRider } = useTrip();
  const { s } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  useKeepAwake();
  const rider = trip.role === 'rider';
  const d = trip.driver;
  const pool = rideTakers.filter(p => !trip.riders.some(r => r.id === p.id));
  const full = trip.riders.length >= trip.capacity;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Stamp
        top={top}
        icon="check-decagram"
        bg={colors.ink}
        title={rider ? 'Request accepted' : trip.riders.length > 1 ? `${trip.riders.length} riders confirmed` : 'Rider confirmed'}
        sub={rider && d ? `${d.name} will pick you up at ${d.time}` : `${trip.riders[0]?.name ?? 'A rider'} accepted your offer`}
      />
      <ScrollView style={st.sheet} contentContainerStyle={{ padding: 20, paddingBottom: 12, gap: 14 }}>
        {rider && d ? (
          <>
            <View style={st.person}>
              <Avatar name={d.name} size={56} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <T v="heading">{d.name}</T>
                <T v="small" color={colors.muted}>★ {d.rating} ({d.reviews}) · {d.verified ? 'Govt ID verified' : 'Not verified'}</T>
                <T v="label" style={{ marginTop: 2 }}>{VEHICLE}</T>
              </View>
              <ContactBar id={d.id} name={d.name} navigation={navigation} sub={VEHICLE} />
            </View>
            <View style={st.info}>
              <T v="label" color={colors.muted}>RIDE DETAILS</T>
              <T v="bodyStrong" style={{ marginTop: 8 }} numberOfLines={1}>{s.from}</T>
              <T v="small" color={colors.muted} style={{ marginVertical: 2 }}>to</T>
              <T v="bodyStrong" numberOfLines={1}>{s.to}</T>
              <View style={st.fareRow}>
                <T color={colors.muted}>{s.when}</T>
                <T v="heading">{d.points} pts</T>
              </View>
            </View>
            <View style={st.note}>
              <Icon name="information-outline" size={22} color={colors.text} />
              <T v="small" style={{ flex: 1 }}>Be at your pickup a few minutes early. When the driver arrives, tap Check in so they know you are ready.</T>
            </View>
          </>
        ) : (
          <>
            <T v="label" color={colors.muted}>CONFIRMED RIDERS ({trip.riders.length}/{trip.capacity})</T>
            {trip.riders.map((r, i) => (
              <View key={r.id} style={st.person}>
                <Avatar name={r.name} size={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T v="bodyStrong">{r.name}</T>
                  <T v="small" color={colors.muted} numberOfLines={1}>Stop {i + 1} · {r.pickup}</T>
                </View>
                <T v="heading" style={{ marginRight: 4 }}>{r.points} pts</T>
                <ContactBar id={r.id} name={r.name} navigation={navigation} />
              </View>
            ))}
            <T v="label" color={colors.muted} style={{ marginTop: 6 }}>MORE RIDERS ON YOUR ROUTE</T>
            {full ? (
              <T color={colors.muted}>Your vehicle is full. Start the trip when you are ready.</T>
            ) : pool.length === 0 ? (
              <T color={colors.muted}>No more riders nearby right now.</T>
            ) : (
              pool.slice(0, 3).map(p => (
                <View key={p.id} style={st.person}>
                  <Avatar name={p.name} size={44} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <T v="bodyStrong">{p.name}</T>
                    <T v="small" color={colors.muted}>{p.match}% match · {p.points} pts</T>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Accept ${p.name}`} onPress={() => addRider(p)} style={st.accept}>
                    <T v="label" color={colors.accent}>Accept</T>
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: bottom + 16, backgroundColor: colors.white, gap: 4 }}>
        <Action title={rider ? 'Track my ride' : 'Go to trip'} icon={rider ? 'map-marker-path' : 'steering'} onPress={() => navigation.replace(rider ? 'RiderTrip' : 'DriverTrip')} />
        <Button title="Cancel ride" variant="text" onPress={() => navigation.navigate('CancelRide', { role: trip.role, from: s.from, to: s.to, when: s.when })} />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Rider: waiting → check in → on board                                */
/* ------------------------------------------------------------------ */

export function RiderTrip({ navigation }: any) {
  const { trip, startRide, arriveStop, checkIn, proceed, endRide } = useTrip();
  const { s } = useSearch();
  const { bottom } = useSafeAreaInsets();
  const [safety, setSafety] = useState(false);
  useKeepAwake();
  const d = trip.driver;
  const me = trip.riders[0];
  if (!d || !me) return null;
  const shareMsg = `I am on a Go-Pool ride with ${d.name} (${VEHICLE}) from ${s.from} to ${s.to}.`;

  const title = { accepted: 'Driver confirmed', started: 'Driver is on the way', atStop: 'Driver has arrived', toDrop: 'Ride in progress', ended: 'Ride finished' }[trip.phase];
  const finish = () => { endRide(); navigation.replace('RideComplete'); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title={title} subtitle={`${d.name} · ${VEHICLE}`} rightIcon="shield-alert-outline" onRight={() => setSafety(true)} />
      <MapMock height={210} />
      <ScrollView style={[st.sheet, { backgroundColor: colors.ground }]} contentContainerStyle={{ padding: 16, paddingBottom: bottom + 16, gap: 14 }}>
        <View style={st.person}>
          <Avatar name={d.name} size={48} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <T v="bodyStrong">{d.name}</T>
            <T v="small" color={colors.muted}>★ {d.rating} · {VEHICLE}</T>
          </View>
          <ContactBar id={d.id} name={d.name} navigation={navigation} sub={VEHICLE} />
        </View>

        {trip.phase === 'accepted' && (
          <>
            <View style={st.card}>
              <Icon name="timer-sand" size={28} color={colors.text} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">Waiting for the driver to start</T>
                <T v="small" color={colors.muted}>Pickup at {d.time}. We will let you know as soon as they set off.</T>
              </View>
            </View>
            <ProtoBox label="driver's phone" title="Driver starts the ride" onPress={startRide} />
          </>
        )}

        {trip.phase === 'started' && (
          <>
            <View style={st.card}>
              <Icon name="car-clock" size={28} color={colors.text} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">{first(d.name)} is 4 min away</T>
                <T v="small" color={colors.muted}>Head to {me.pickup}. You can check in once they arrive.</T>
              </View>
            </View>
            <Action title="Check in" icon="map-marker-check" disabled onPress={() => {}} />
            <T v="small" color={colors.muted} style={{ textAlign: 'center' }}>Check-in opens when the driver reaches your pickup.</T>
            <ProtoBox label="driver's phone" title="Driver arrives at my pickup" onPress={arriveStop} />
          </>
        )}

        {trip.phase === 'atStop' && (
          <>
            <View style={[st.card, { backgroundColor: colors.lime, borderColor: colors.text }]}>
              <Icon name="map-marker-check" size={28} color={colors.text} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">{first(d.name)} is at your pickup</T>
                <T v="small">Ride PIN: <T v="label">{PIN}</T> (share it with the driver)</T>
              </View>
            </View>
            {me.checkedIn ? (
              <>
                <Chip ok text="You are checked in" />
                <T v="small" color={colors.muted}>Hop in. The driver will confirm and start the trip.</T>
                <ProtoBox label="driver's phone" title="Driver confirms I am on board" onPress={proceed} />
              </>
            ) : (
              <Action title="Check in" icon="map-marker-check" onPress={() => checkIn('me')} />
            )}
          </>
        )}

        {trip.phase === 'toDrop' && (
          <>
            <View style={st.card}>
              <Icon name="road-variant" size={28} color={colors.text} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">On the way to {s.to}</T>
                <T v="small" color={colors.muted}>About 31 min left · 11 km</T>
              </View>
            </View>
            <Action title="Emergency help" icon="shield-alert-outline" variant="outline" onPress={() => setSafety(true)} />
            <ProtoBox label="driver's phone" title="Driver ends the ride" onPress={finish} />
          </>
        )}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Share trip" icon="share-variant" variant="outline" style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => Share.share({ message: shareMsg }).catch(() => {})} />
          {trip.phase !== 'toDrop' ? (
            <Button title="Cancel ride" icon="close-circle-outline" variant="outline" style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => navigation.navigate('CancelRide', { role: 'rider', from: s.from, to: s.to, when: s.when })} />
          ) : null}
        </View>
      </ScrollView>
      <SafetySheet visible={safety} onClose={() => setSafety(false)} message={shareMsg} bottom={bottom} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Driver: start → each stop → drop → end                              */
/* ------------------------------------------------------------------ */

export function DriverTrip({ navigation }: any) {
  const { trip, addRider, startRide, arriveStop, checkIn, proceed, endRide } = useTrip();
  const { s } = useSearch();
  const { bottom } = useSafeAreaInsets();
  const [adding, setAdding] = useState(false);
  const [safety, setSafety] = useState(false);
  const { active } = useGarage();
  useKeepAwake();
  const n = trip.riders.length;
  const cur = trip.riders[trip.stop];
  const hasNext = trip.stop + 1 < n;
  const pool = rideTakers.filter(p => !trip.riders.some(r => r.id === p.id));
  const canAdd = n < trip.capacity && pool.length > 0;
  if (!cur) return null;

  const title = { accepted: 'Ready to start', started: `Stop ${trip.stop + 1} of ${n}`, atStop: `At stop ${trip.stop + 1} of ${n}`, toDrop: 'Heading to drop', ended: 'Ride finished' }[trip.phase];
  const finish = () => { endRide(); navigation.replace('RideComplete'); };
  const shareMsg = `I am driving ${active ? vehicleName(active) : 'my vehicle'} from ${s.from} to ${s.to} with ${n} rider${n > 1 ? 's' : ''} on Go-Pool.`;
  const canCancel = trip.phase !== 'toDrop' && trip.riders.every(r => !r.pickedUp);
  const openChat = (r: TripRider) => navigation.navigate('Chat', { id: r.id, name: r.name, sub: r.pickup });

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title={title} subtitle={`${active ? vehicleName(active) + ' · ' : ''}${n} rider${n > 1 ? 's' : ''}`} rightIcon="shield-alert-outline" onRight={() => setSafety(true)} />
      <MapMock height={190} />
      <ScrollView style={[st.sheet, { backgroundColor: colors.ground }]} contentContainerStyle={{ padding: 16, paddingBottom: 12, gap: 14 }}>
        {trip.phase === 'started' || trip.phase === 'atStop' ? (
          <View style={st.person}>
            <Avatar name={cur.name} size={52} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <T v="heading">{cur.name}</T>
              <T v="small" color={colors.muted} numberOfLines={1}>{cur.pickup}</T>
              {trip.phase === 'started' ? <T v="label" style={{ marginTop: 2 }}>4 min · 1.2 km</T> : <View style={{ marginTop: 6, alignSelf: 'flex-start' }}><Chip ok={cur.checkedIn} text={cur.checkedIn ? 'Checked in' : 'Waiting for check-in'} /></View>}
            </View>
            <ContactBar id={cur.id} name={cur.name} navigation={navigation} sub={cur.pickup} />
          </View>
        ) : null}

        {trip.phase === 'toDrop' ? (
          <View style={st.card}>
            <Icon name="flag-checkered" size={28} color={colors.text} />
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">All {n} rider{n > 1 ? 's are' : ' is'} on board</T>
              <T v="small" color={colors.muted}>Drive to {s.to} · 31 min · 11 km</T>
            </View>
          </View>
        ) : null}

        <StopList riders={trip.riders} stop={trip.stop} phase={trip.phase} drop={s.to || 'Drop'} onChat={openChat} />

        {trip.phase !== 'ended' ? (
          <Action title="Add stop" icon="map-marker-plus" variant="outline" disabled={!canAdd} onPress={() => setAdding(true)} />
        ) : null}
        {n >= trip.capacity && trip.phase !== 'ended' ? <T v="small" color={colors.muted} style={{ textAlign: 'center' }}>{active ? `${active.model} is full (${trip.capacity} seat${trip.capacity > 1 ? 's' : ''}).` : 'Your vehicle is full.'}</T> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Share trip" icon="share-variant" variant="outline" style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => Share.share({ message: shareMsg }).catch(() => {})} />
          {canCancel ? <Button title="Cancel ride" icon="close-circle-outline" variant="outline" style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => navigation.navigate('CancelRide', { role: 'driver', from: s.from, to: s.to, when: s.when })} /> : null}
        </View>
      </ScrollView>

      <View style={[st.dock, { paddingBottom: bottom + 16 }]}>
        {trip.phase === 'accepted' && <Action title="Start ride" icon="play-circle-outline" onPress={startRide} />}
        {trip.phase === 'started' && <Action title={`I have arrived at ${first(cur.name)}`} icon="map-marker-check" onPress={arriveStop} />}
        {trip.phase === 'atStop' && (
          <View style={{ gap: 10 }}>
            <Action
              title={hasNext ? `${first(cur.name)} on board · Go to stop ${trip.stop + 2}` : `${first(cur.name)} on board · Head to drop`}
              icon="account-check"
              disabled={!cur.checkedIn}
              onPress={proceed}
            />
            {!cur.checkedIn ? <Action title={`Check in ${first(cur.name)} myself`} icon="account-check-outline" variant="outline" onPress={() => checkIn(cur.id)} /> : null}
          </View>
        )}
        {trip.phase === 'toDrop' && <Action title="End ride" icon="flag-checkered" onPress={finish} />}
      </View>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <View style={st.scrim}>
          <Pressable style={{ flex: 1 }} accessibilityLabel="Close" onPress={() => setAdding(false)} />
          <View style={[st.addSheet, { paddingBottom: bottom + 20 }]}>
            <T v="title">Add a stop</T>
            <T v="small" color={colors.muted} style={{ marginTop: 2, marginBottom: 8 }}>Riders requesting a seat near your route. They are picked up after your current stops.</T>
            {pool.length === 0 ? <T color={colors.muted}>No more riders nearby.</T> : null}
            {pool.slice(0, 3).map(p => (
              <View key={p.id} style={[st.person, { marginTop: 8 }]}>
                <Avatar name={p.name} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <T v="bodyStrong">{p.name}</T>
                  <T v="small" color={colors.muted}>+{(0.8 + pool.indexOf(p) * 0.6).toFixed(1)} km detour · {p.points} pts</T>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Add stop for ${p.name}`}
                  onPress={() => { addRider(p); if (n + 1 >= trip.capacity || pool.length <= 1) setAdding(false); }}
                  style={st.accept}>
                  <T v="label" color={colors.accent}>Add</T>
                </Pressable>
              </View>
            ))}
            <Button title="Done" variant="outline" style={{ marginTop: 16 }} onPress={() => setAdding(false)} />
          </View>
        </View>
      </Modal>
      <SafetySheet visible={safety} onClose={() => setSafety(false)} message={shareMsg} bottom={bottom} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Ride finished                                                       */
/* ------------------------------------------------------------------ */

const Stars = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} hitSlop={4} onPress={() => onChange(n)}>
        <Icon name={n <= value ? 'star' : 'star-outline'} size={34} color={colors.text} />
      </Pressable>
    ))}
  </View>
);

const TAGS = {
  rider: ['Friendly', 'On time', 'Safe driving', 'Clean vehicle', 'Good route'],
  driver: ['Polite', 'On time', 'Respectful', 'Easy pickup'],
};

export function RideComplete({ navigation }: any) {
  const { trip, reset, logRide, wallet } = useTrip();
  const { s, set } = useSearch();
  const { top, bottom } = useSafeAreaInsets();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const rider = trip.role === 'rider';
  const total = rider ? trip.riders[0]?.points ?? 0 : trip.riders.reduce((a, r) => a + r.points, 0);
  const done = () => {
    logRide({ role: trip.role, from: s.from, to: s.to, when: s.when, pts: total, people: rider ? trip.driver?.name ?? 'Driver' : trip.riders.map(r => r.name).join(', ') });
    reset();
    set({ requested: [] });
    navigation.popToTop();
  };
  const toggleTag = (id: string, tag: string) => setTags(x => ({ ...x, [id]: (x[id] ?? []).includes(tag) ? (x[id] ?? []).filter(v => v !== tag) : [...(x[id] ?? []), tag] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Stamp
        top={top}
        icon="flag-checkered"
        bg={colors.ink}
        title={rider ? 'You have arrived' : 'Ride complete'}
        sub={rider ? `Thanks for riding with ${trip.driver?.name ?? 'your driver'}` : `You carried ${trip.riders.length} rider${trip.riders.length > 1 ? 's' : ''} to ${s.to}`}
      />
      <ScrollView style={st.sheet} contentContainerStyle={{ padding: 20, gap: 14 }}>
        <View style={st.info}>
          <T v="label" color={colors.muted}>{rider ? 'YOU PAID' : 'YOU EARNED'}</T>
          <T v="hero" style={{ marginTop: 4 }}>{total} <T v="heading" color={colors.muted}>pts</T></T>
          <View style={st.fareRow}>
            <T color={colors.muted}>Distance</T><T v="bodyStrong">11 km</T>
          </View>
          <View style={st.fareRow}>
            <T color={colors.muted}>{rider ? 'Wallet balance' : 'Points wallet'}</T><T v="bodyStrong">{rider ? wallet - total : wallet + total} pts</T>
          </View>
        </View>

        <T v="label" color={colors.muted}>{rider ? 'RATE YOUR DRIVER' : 'RATE YOUR RIDERS'}</T>
        {(rider ? [{ id: 'driver', name: trip.driver?.name ?? 'Driver' }] : trip.riders).map(r => (
          <View key={r.id} style={st.person}>
            <Avatar name={r.name} size={44} />
            <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
              <T v="bodyStrong">{r.name}</T>
              <Stars value={ratings[r.id] ?? 0} onChange={v => setRatings({ ...ratings, [r.id]: v })} />
              {(ratings[r.id] ?? 0) > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {TAGS[trip.role].map(tag => {
                    const on = (tags[r.id] ?? []).includes(tag);
                    return (
                      <Pressable key={tag} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => toggleTag(r.id, tag)} style={[st.tag, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
                        <T v="small" color={on ? colors.accent : colors.text} style={{ fontWeight: '700' }}>{tag}</T>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: bottom + 16 }}>
        <Action title="Done" icon="check" onPress={done} />
      </View>
    </View>
  );
}

const st = makeStyles(() => ({
  sheet: { flex: 1, backgroundColor: colors.white, marginTop: -22, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  stampWrap: { alignItems: 'center', paddingBottom: 48 },
  stampBack: { position: 'absolute', left: 16, width: 44, height: 44, borderRadius: 12, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  stamp: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  person: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 12 },
  sep: { width: 1, height: 28, backgroundColor: colors.line, marginHorizontal: 8 },
  info: { backgroundColor: colors.ground, borderRadius: radius.lg, padding: 16 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.lime, borderRadius: radius.md, padding: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  stops: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 14 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stopDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.text, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  now: { backgroundColor: colors.lime, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  accept: { backgroundColor: colors.ink, borderRadius: radius.pill, paddingHorizontal: 18, height: 44, alignItems: 'center', justifyContent: 'center' },
  proto: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.md, padding: 12, gap: 8 },
  protoBtn: { minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  dock: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  contact: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 2, right: 0, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  chatBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  safeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, borderTopWidth: 1, borderTopColor: colors.line },
  safeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  tag: { borderRadius: 999, borderWidth: 1.5, borderColor: colors.line, paddingHorizontal: 12, paddingVertical: 6 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  addSheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20 },
}));
