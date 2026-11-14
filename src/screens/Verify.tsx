import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Header, T, Toggle, TopBar } from '../components';
import { colors, makeStyles, radius } from '../theme';
import { ENDORSEMENTS_NEEDED, classifyEmail, methodLabel, useAuth } from '../auth';

const Label = ({ children }: { children: string }) => <T v="label" color={colors.muted} style={{ marginBottom: 8, marginTop: 14 }}>{children}</T>;

const Footer = ({ children }: { children: React.ReactNode }) => {
  const { bottom } = useSafeAreaInsets();
  return <View style={{ padding: 16, paddingBottom: bottom + 16, gap: 10, backgroundColor: colors.ground }}>{children}</View>;
};

const goHome = (navigation: any) => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

/* ------------------------------------------------------------------ */
/* 1. Email                                                            */
/* ------------------------------------------------------------------ */

export function Email({ navigation }: any) {
  const { auth, setEmail } = useAuth();
  const [email, setText] = useState(auth.email);
  const k = classifyEmail(email);

  const next = () => {
    setEmail(email, k);
    navigation.navigate(k.org ? 'EmailOtp' : 'VerifyChoice');
  };

  return (
    <View style={st.flex}>
      <TopBar title="Your email" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <T color={colors.muted}>Go-Pool is for people who know who they travel with. Your email helps us confirm who you are.</T>
          <Label>EMAIL ADDRESS</Label>
          <TextInput
            style={st.input}
            value={email}
            onChangeText={setText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@company.com"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Email address"
          />
          {k.valid && k.org ? (
            <View style={[st.note, { backgroundColor: colors.greenTint, borderColor: colors.green }]}>
              <Icon name={k.school ? 'school-outline' : 'office-building-outline'} size={22} color={colors.green} />
              <View style={{ flex: 1 }}>
                <T v="label" color={colors.green}>{k.school ? 'School email' : 'Work email'} · {k.orgName}</T>
                <T v="small" color={colors.green}>We will send a code to this address to verify it.</T>
              </View>
            </View>
          ) : null}
          {k.valid && !k.org ? (
            <View style={[st.note, { backgroundColor: colors.warnTint, borderColor: colors.warnLine }]}>
              <Icon name="email-outline" size={22} color={colors.warnText} />
              <View style={{ flex: 1 }}>
                <T v="label" color={colors.warnText}>Personal email</T>
                <T v="small" color={colors.warnText}>You will verify with endorsements from members, or with a government ID.</T>
              </View>
            </View>
          ) : null}
          {email.length > 4 && !k.valid ? <T v="small" color={colors.red} style={{ marginTop: 8 }}>Enter a valid email address.</T> : null}
          <T v="small" color={colors.muted} style={{ marginTop: 16 }}>Tip: a company or college email is the quickest way to get verified.</T>
        </ScrollView>
        <Footer>
          <Button title="Continue" variant="lime" disabled={!k.valid} onPress={next} />
        </Footer>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 2a. Organisation email: OTP                                         */
/* ------------------------------------------------------------------ */

export function EmailOtp({ navigation }: any) {
  const { auth, verifyOrg } = useAuth();
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <View style={st.flex}>
      <TopBar title="Verify your email" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={st.mailIcon}><Icon name="email-check-outline" size={40} color={colors.text} /></View>
          <T v="title" style={{ marginTop: 16 }}>Check your inbox</T>
          <T color={colors.muted} style={{ marginTop: 6 }}>We sent a 6-digit code to <T v="bodyStrong">{auth.email}</T>.</T>
          <TextInput
            style={[st.input, { letterSpacing: 10, textAlign: 'center', fontSize: 26, marginTop: 20 }]}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            accessibilityLabel="Email verification code"
          />
          <T v="small" color={colors.muted} style={{ marginTop: 10 }}>Prototype: any 6 digits will work.</T>
          <Pressable accessibilityRole="button" onPress={() => setSent(true)} style={{ marginTop: 16, minHeight: 44, justifyContent: 'center' }}>
            <T v="label" color={colors.blue}>{sent ? 'Code sent again' : 'Resend code'}</T>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={{ minHeight: 44, justifyContent: 'center' }}>
            <T v="label" color={colors.blue}>Use a different email</T>
          </Pressable>
        </ScrollView>
        <Footer>
          <Button title="Verify" variant="lime" disabled={code.length !== 6} onPress={() => { verifyOrg(); navigation.replace('VerifyStatus'); }} />
        </Footer>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 2b. Personal email: choose how to verify                            */
/* ------------------------------------------------------------------ */

const Option = ({ icon, title, body, tag, onPress }: { icon: string; title: string; body: string; tag: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={st.option}>
    <View style={st.optIcon}><Icon name={icon as any} size={28} color={colors.text} /></View>
    <View style={{ flex: 1 }}>
      <T v="heading">{title}</T>
      <T v="small" color={colors.muted} style={{ marginTop: 2 }}>{body}</T>
      <View style={st.tag}><T v="small" style={{ fontWeight: '700' }}>{tag}</T></View>
    </View>
    <Icon name="chevron-right" size={26} color={colors.muted} />
  </Pressable>
);

export function VerifyChoice({ navigation }: any) {
  const { auth } = useAuth();
  return (
    <View style={st.flex}>
      <TopBar title="Verify it is you" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <T color={colors.muted}>
          <T v="bodyStrong">{auth.email}</T> is a personal email, so we need one more step before you can ride or offer a pool. Pick whichever is easier.
        </T>
        <Option
          icon="account-group-outline"
          title="Get endorsed by others"
          body={`Ask ${ENDORSEMENTS_NEEDED} verified Go-Pool members who know you to vouch for you.`}
          tag="Quick if you know members"
          onPress={() => navigation.navigate('Endorse')}
        />
        <Option
          icon="card-account-details-outline"
          title="Verify personal identity"
          body="Aadhaar, Driving Licence, PAN card or Voter ID, plus a selfie."
          tag="Reviewed within 24 hours"
          onPress={() => navigation.navigate('IdVerify')}
        />
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Email')} style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
          <T v="label" color={colors.blue}>Use a work or school email instead</T>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 3a. Endorsements                                                    */
/* ------------------------------------------------------------------ */

export function Endorse({ navigation }: any) {
  const { sendEndorsements } = useAuth();
  const [people, setPeople] = useState(Array.from({ length: ENDORSEMENTS_NEEDED }, () => ({ name: '', phone: '' })));
  const upd = (i: number, p: Partial<{ name: string; phone: string }>) => setPeople(list => list.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const phones = people.map(p => p.phone);
  const valid = people.every(p => p.name.trim() && p.phone.length === 10) && new Set(phones).size === phones.length;

  return (
    <View style={st.flex}>
      <TopBar title="Get endorsed" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={st.steps}>
            {['Enter ' + ENDORSEMENTS_NEEDED + ' members who know you', 'They get a request in their app', 'You are verified once all accept'].map((x, i) => (
              <View key={x} style={st.stepRow}>
                <View style={st.stepNo}><T v="small" style={{ fontWeight: '800' }}>{i + 1}</T></View>
                <T style={{ flex: 1 }}>{x}</T>
              </View>
            ))}
          </View>

          {people.map((p, i) => (
            <View key={i}>
              <Label>{`ENDORSER ${i + 1}`}</Label>
              <TextInput style={st.input} value={p.name} onChangeText={v => upd(i, { name: v })} placeholder="Name" placeholderTextColor={colors.muted} accessibilityLabel={`Endorser ${i + 1} name`} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={st.cc}><T v="bodyStrong">+91</T></View>
                <TextInput style={[st.input, { flex: 1 }]} value={p.phone} onChangeText={v => upd(i, { phone: v.replace(/\D/g, '') })} keyboardType="number-pad" maxLength={10} placeholder="Mobile number" placeholderTextColor={colors.muted} accessibilityLabel={`Endorser ${i + 1} mobile number`} />
              </View>
            </View>
          ))}
          {new Set(phones.filter(Boolean)).size < phones.filter(Boolean).length ? <T v="small" color={colors.red} style={{ marginTop: 8 }}>Each endorser needs a different number.</T> : null}

          <View style={st.warn}>
            <Icon name="information-outline" size={20} color={colors.text} />
            <T v="small" style={{ flex: 1 }}>Only endorsers who are already verified members count. Endorsing someone you do not know can affect their own rating.</T>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => Share.share({ message: 'I am joining Go-Pool, a carpooling app. Please endorse me once you have it. Download Go-Pool and look for my request.' }).catch(() => {})}
            style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
            <T v="label" color={colors.blue}>Invite someone who is not on Go-Pool yet</T>
          </Pressable>
        </ScrollView>
        <Footer>
          <Button title="Send endorsement requests" variant="lime" disabled={!valid} onPress={() => { sendEndorsements(people.map(p => ({ name: p.name.trim(), phone: p.phone }))); navigation.replace('VerifyStatus'); }} />
        </Footer>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 3b. Personal ID                                                     */
/* ------------------------------------------------------------------ */

type Doc = { key: string; label: string; icon: string; hint: string; placeholder: string; test: (v: string) => boolean; sides: 1 | 2; max: number };
const DOCS: Doc[] = [
  { key: 'aadhaar', label: 'Aadhaar', icon: 'card-account-details-outline', hint: '12-digit number. Only the last 4 digits are stored.', placeholder: '1234 5678 9012', test: v => /^\d{12}$/.test(v), sides: 2, max: 12 },
  { key: 'dl', label: 'Driving Licence', icon: 'car-key', hint: 'Needed if you want to offer rides.', placeholder: 'KL07 20190001234', test: v => /^[A-Z]{2}\d{2}\d{11}$/.test(v), sides: 2, max: 16 },
  { key: 'pan', label: 'PAN card', icon: 'card-text-outline', hint: '10 characters, like ABCDE1234F.', placeholder: 'ABCDE1234F', test: v => /^[A-Z]{5}\d{4}[A-Z]$/.test(v), sides: 1, max: 10 },
  { key: 'voter', label: 'Voter ID', icon: 'vote-outline', hint: 'EPIC number, like ABC1234567.', placeholder: 'ABC1234567', test: v => /^[A-Z]{3}\d{7}$/.test(v), sides: 2, max: 10 },
];

const Upload = ({ title, done, onPress }: { title: string; done: boolean; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={st.upload}>
    <View style={[st.upIcon, done && { backgroundColor: colors.greenTint }]}>
      <Icon name={done ? 'check-circle' : 'camera-outline'} size={24} color={done ? colors.green : colors.text} />
    </View>
    <View style={{ flex: 1 }}>
      <T v="bodyStrong">{title}</T>
      <T v="small" color={colors.muted}>{done ? 'Uploaded' : 'Tap to take a photo'}</T>
    </View>
    <T v="label" color={colors.blue}>{done ? 'Retake' : 'Add'}</T>
  </Pressable>
);

export function IdVerify({ navigation }: any) {
  const { submitId } = useAuth();
  const [docKey, setDocKey] = useState('aadhaar');
  const [name, setName] = useState('');
  const [num, setNum] = useState('');
  const [front, setFront] = useState(false);
  const [back, setBack] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [consent, setConsent] = useState(false);
  const doc = DOCS.find(d => d.key === docKey)!;
  const clean = num.replace(/\s/g, '').toUpperCase();
  const numOk = doc.test(clean);
  const valid = name.trim().length > 2 && numOk && front && (doc.sides === 1 || back) && selfie && consent;

  return (
    <View style={st.flex}>
      <TopBar title="Verify identity" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Label>CHOOSE A DOCUMENT</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {DOCS.map(d => {
              const on = d.key === docKey;
              return (
                <Pressable key={d.key} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => { setDocKey(d.key); setNum(''); setBack(false); }} style={[st.docCard, on && { borderColor: colors.text, borderWidth: 2, backgroundColor: colors.lime }]}>
                  <Icon name={d.icon as any} size={26} color={colors.text} />
                  <T v="label">{d.label}</T>
                </Pressable>
              );
            })}
          </View>

          <Label>NAME AS ON DOCUMENT</Label>
          <TextInput style={st.input} value={name} onChangeText={setName} autoCapitalize="words" placeholder="Full name" placeholderTextColor={colors.muted} accessibilityLabel="Name as on document" />

          <Label>{`${doc.label.toUpperCase()} NUMBER`}</Label>
          <TextInput style={st.input} value={num} onChangeText={v => setNum(v.toUpperCase())} autoCapitalize="characters" autoCorrect={false} maxLength={doc.max + 4} placeholder={doc.placeholder} placeholderTextColor={colors.muted} accessibilityLabel={`${doc.label} number`} />
          {num.length > 0 && !numOk ? <T v="small" color={colors.red} style={{ marginTop: 6 }}>That number does not look right. {doc.hint}</T> : <T v="small" color={colors.muted} style={{ marginTop: 6 }}>{doc.hint}</T>}

          <Label>PHOTOS</Label>
          <View style={{ gap: 10 }}>
            <Upload title={doc.sides === 2 ? `${doc.label} (front)` : doc.label} done={front} onPress={() => setFront(true)} />
            {doc.sides === 2 ? <Upload title={`${doc.label} (back)`} done={back} onPress={() => setBack(true)} /> : null}
            <Upload title="Selfie" done={selfie} onPress={() => setSelfie(true)} />
          </View>

          <View style={st.consent}>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">I agree to verification</T>
              <T v="small" color={colors.muted}>Go-Pool may check these details with the issuing authority. We never share them with other members.</T>
            </View>
            <Toggle value={consent} onChange={setConsent} />
          </View>
        </ScrollView>
        <Footer>
          <Button title="Submit for verification" variant="lime" disabled={!valid} onPress={() => { submitId(doc.label); navigation.replace('VerifyStatus'); }} />
        </Footer>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Status: pending / verified                                          */
/* ------------------------------------------------------------------ */

const ProtoBtn = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <Pressable accessibilityRole="button" onPress={onPress} style={st.protoBtn}>
    <T v="label">{title}</T>
  </Pressable>
);

export function VerifyStatus({ navigation }: any) {
  const { auth, verified, acceptEndorser, approveId, nextStep } = useAuth();
  const { top } = useSafeAreaInsets();
  const done = auth.endorsers.filter(e => e.accepted).length;
  const pendingEndorse = auth.status === 'pending' && auth.method === 'endorsed';
  const pendingId = auth.status === 'pending' && auth.method === 'id';

  if (verified) {
    return (
      <View style={st.flex}>
        <View style={[st.hero, { paddingTop: top + 48 }]}>
          <View style={st.stamp}><Icon name="shield-check" size={56} color={colors.accent} /></View>
          <T v="display" color={colors.onInk} style={{ marginTop: 16 }}>You are verified</T>
          <T color={colors.darkMuted} style={{ marginTop: 6, textAlign: 'center', paddingHorizontal: 24 }}>
            {methodLabel(auth.method)}{auth.method === 'org' && auth.orgName ? ` · ${auth.orgName}` : ''}. You can now find a pool or offer one.
          </T>
        </View>
        <View style={{ flex: 1 }} />
        <Footer>
          <Button title="Start riding" variant="lime" icon="car-side" onPress={() => goHome(navigation)} />
        </Footer>
      </View>
    );
  }

  if (!pendingEndorse && !pendingId) {
    const step = nextStep() ?? 'Email';
    return (
      <View style={st.flex}>
        <Header title="Verification" onBack={() => navigation.goBack()} />
        <View style={{ padding: 24, gap: 12, alignItems: 'center' }}>
          <Icon name="shield-alert-outline" size={56} color={colors.muted} />
          <T v="title">Verify to start riding</T>
          <T color={colors.muted} style={{ textAlign: 'center' }}>Confirm who you are to find a pool or offer one.</T>
          <Button title="Verify now" variant="lime" style={{ alignSelf: 'stretch', marginTop: 8 }} onPress={() => navigation.navigate(step)} />
        </View>
      </View>
    );
  }

  return (
    <View style={st.flex}>
      <Header title={pendingId ? 'Under review' : 'Waiting for endorsements'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {pendingEndorse ? (
          <>
            <View style={st.progress}>
              <T v="hero">{done}<T v="heading" color={colors.muted}> of {ENDORSEMENTS_NEEDED}</T></T>
              <T color={colors.muted}>endorsements received</T>
            </View>
            {auth.endorsers.map((e, i) => (
              <View key={e.phone} style={st.person}>
                <View style={[st.avatar, e.accepted && { backgroundColor: colors.greenTint }]}>
                  <Icon name={e.accepted ? 'check' : 'clock-outline'} size={22} color={e.accepted ? colors.green : colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong">{e.name}</T>
                  <T v="small" color={colors.muted}>+91 {e.phone}</T>
                </View>
                <View style={[st.chip, { backgroundColor: e.accepted ? colors.greenTint : colors.warnTint, borderColor: e.accepted ? colors.green : colors.warnLine }]}>
                  <T v="small" color={e.accepted ? colors.green : colors.warnText} style={{ fontWeight: '700' }}>{e.accepted ? 'Endorsed' : 'Pending'}</T>
                </View>
              </View>
            ))}
            <View style={st.proto}>
              <T v="small" color={colors.muted}>PROTOTYPE · endorser's phone</T>
              {auth.endorsers.map((e, i) => (e.accepted ? null : <ProtoBtn key={e.phone} title={`${e.name} endorses me`} onPress={() => acceptEndorser(i)} />))}
            </View>
          </>
        ) : (
          <>
            <View style={st.person}>
              <View style={st.avatar}><Icon name="card-account-details-outline" size={22} color={colors.text} /></View>
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">{auth.idType}</T>
                <T v="small" color={colors.muted}>Submitted just now</T>
              </View>
            </View>
            <View style={st.timeline}>
              {[
                { t: 'Documents submitted', on: true },
                { t: 'Checking with the issuing authority', on: true, now: true },
                { t: 'Approved', on: false },
              ].map(x => (
                <View key={x.t} style={st.stepRow}>
                  <View style={[st.stepNo, x.on && { backgroundColor: x.now ? colors.lime : colors.green, borderColor: x.now ? colors.text : colors.green }]}>
                    <Icon name={x.on && !x.now ? 'check' : x.now ? 'dots-horizontal' : 'circle-small'} size={16} color={x.on && !x.now ? colors.onInk : colors.text} />
                  </View>
                  <T v={x.now ? 'bodyStrong' : 'body'} color={x.on ? colors.text : colors.muted} style={{ flex: 1 }}>{x.t}</T>
                </View>
              ))}
              <T v="small" color={colors.muted}>This usually takes up to 24 hours. We will notify you.</T>
            </View>
            <View style={st.proto}>
              <T v="small" color={colors.muted}>PROTOTYPE · verification team</T>
              <ProtoBtn title="Approve my verification" onPress={approveId} />
            </View>
          </>
        )}
      </ScrollView>
      <Footer>
        <Button title="Continue to app" variant="outline" onPress={() => goHome(navigation)} />
        <T v="small" color={colors.muted} style={{ textAlign: 'center' }}>You can browse now. Finding or offering a pool unlocks once you are verified.</T>
      </Footer>
    </View>
  );
}

const st = makeStyles(() => ({
  flex: { flex: 1, backgroundColor: colors.ground },
  input: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, height: 56, fontSize: 17, fontWeight: '700', color: colors.text, borderWidth: 1, borderColor: colors.line },
  cc: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  note: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: radius.md, borderWidth: 1, padding: 12, marginTop: 12 },
  mailIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 16 },
  optIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  tag: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: colors.ground, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  steps: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNo: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  warn: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.lime, borderRadius: radius.md, padding: 12, marginTop: 16 },
  docCard: { width: '47.5%', minHeight: 84, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 },
  upload: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 12, minHeight: 64 },
  upIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, marginTop: 16 },
  hero: { backgroundColor: colors.ink, alignItems: 'center', paddingBottom: 48, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  stamp: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  progress: { backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 20, alignItems: 'center' },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  chip: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  timeline: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 14 },
  proto: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.md, padding: 12, gap: 8 },
  protoBtn: { minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
}));
