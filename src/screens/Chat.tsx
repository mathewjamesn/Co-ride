import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, T } from '../components';
import { colors, makeStyles, radius } from '../theme';
import { Msg, useChat } from '../chat';

const QUICK = ['I am at the pickup point', 'Running 5 minutes late', 'Where are you?', 'Please share live location', 'Thank you!'];

export const callNumber = () => Linking.openURL('tel:+919876543210').catch(() => {});

/** One-to-one chat between rider and driver. Works the same from both sides. */
export function Chat({ navigation, route }: any) {
  const { id, name, sub }: { id: string; name: string; sub?: string } = route.params;
  const { threads, send, open } = useChat();
  const { bottom } = useSafeAreaInsets();
  const [text, setText] = useState('');
  const list = useRef<FlatList<Msg>>(null);
  const msgs = threads[id] ?? [];

  useEffect(() => {
    open(id);
    return () => open(null);
  }, [id]);
  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [msgs.length]);

  const submit = (m: string) => {
    const v = m.trim();
    if (!v) return;
    send(id, v);
    setText('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Header title={name} subtitle={sub ?? 'Carpool chat'} onBack={() => navigation.goBack()} rightIcon="phone" onRight={callNumber} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={list}
          data={msgs}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={st.empty}>
              <Icon name="message-text-outline" size={40} color={colors.muted} />
              <T v="bodyStrong">Say hello to {name.split(' ')[0]}</T>
              <T v="small" color={colors.muted} style={{ textAlign: 'center' }}>Coordinate the pickup point and timing here. Phone numbers stay private.</T>
            </View>
          }
          renderItem={({ item }) => {
            const me = item.from === 'me';
            return (
              <View style={[st.bubble, me ? st.me : st.them]}>
                <T color={me ? colors.onInk : colors.text}>{item.text}</T>
                <T v="small" color={me ? colors.darkMuted : colors.muted} style={{ alignSelf: 'flex-end', marginTop: 2 }}>{item.at}</T>
              </View>
            );
          }}
        />
        <View style={[st.dock, { paddingBottom: bottom + 10 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8 }} keyboardShouldPersistTaps="handled">
            {QUICK.map(q => (
              <Pressable key={q} accessibilityRole="button" onPress={() => submit(q)} style={st.quick}>
                <T v="label">{q}</T>
              </Pressable>
            ))}
          </ScrollView>
          <View style={st.inputRow}>
            <TextInput
              style={st.input}
              value={text}
              onChangeText={setText}
              placeholder="Message"
              placeholderTextColor={colors.muted}
              onSubmitEditing={() => submit(text)}
              returnKeyType="send"
              accessibilityLabel="Message"
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!text.trim()} onPress={() => submit(text)} style={[st.send, !text.trim() && { opacity: 0.4 }]}>
              <Icon name="send" size={22} color={colors.accent} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const st = makeStyles(() => ({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink, borderBottomRightRadius: 4, borderWidth: 1, borderColor: colors.darkLine },
  them: { alignSelf: 'flex-start', backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.line },
  dock: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line },
  quick: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  input: { flex: 1, minHeight: 48, borderRadius: radius.pill, backgroundColor: colors.ground, paddingHorizontal: 16, fontSize: 16, color: colors.text },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
}));
