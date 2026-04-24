import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import Button from '@/components/ui/Button';
import { Language } from '@/types';

const LANGUAGES: { id: Language; flag: string; name: string }[] = [
  { id: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
  { id: 'en', flag: '🇬🇧', name: 'English' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const { createProfile } = useProfileStore();
  const { seedDefaults } = useExerciseStore();

  const [name, setName] = useState('');
  const [lang, setLang] = useState<Language>('vi');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      await createProfile(user.uid, name.trim(), lang);
      await seedDefaults(user.uid);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand mark */}
        <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
          <Text style={[styles.brandText, { color: '#fff' }]}>W</Text>
        </View>

        <Text style={[styles.title, { color: colors.ink }]}>
          {t.welcomeTitle}
        </Text>
        <Text style={[styles.desc, { color: colors.ink2 }]}>
          {t.welcomeDesc}
        </Text>

        {/* Name input */}
        <Text style={[styles.fieldLabel, { color: colors.ink2 }]}>
          {t.nameLabel.toUpperCase()}
        </Text>
        <View style={[styles.inputContainer, {
          borderColor: name ? colors.accent : colors.line,
          backgroundColor: colors.card,
        }]}>
          <TextInput
            style={[styles.input, { color: colors.ink }]}
            value={name}
            onChangeText={setName}
            placeholder={t.namePh}
            placeholderTextColor={colors.ink2}
            autoFocus
            returnKeyType="done"
          />
        </View>

        {/* Language picker */}
        <Text style={[styles.fieldLabel, { color: colors.ink2, marginTop: 28 }]}>
          {t.languageLabel.toUpperCase()}
        </Text>
        <View style={styles.langList}>
          {LANGUAGES.map(l => {
            const active = l.id === lang;
            return (
              <TouchableOpacity
                key={l.id}
                style={[
                  styles.langRow,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                    borderWidth: active ? 1.5 : 1,
                  },
                ]}
                onPress={() => setLang(l.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{l.flag}</Text>
                <Text style={[
                  styles.langName,
                  { color: active ? colors.accentInk : colors.ink, fontWeight: active ? '600' : '500' },
                ]}>
                  {l.name}
                </Text>
                <View style={[
                  styles.radio,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    backgroundColor: active ? colors.accent : 'transparent',
                  },
                ]}>
                  {active && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Text style={[styles.importHint, { color: colors.ink2 }]}>
          {t.alreadyHaveData}{' '}
          <Text style={{ color: colors.accent, fontWeight: '600' }}>
            {t.importFromFile}
          </Text>
        </Text>

        <Button
          label={t.getStarted}
          onPress={handleStart}
          loading={loading}
          disabled={!name.trim()}
          style={styles.startBtn}
        />

        <Text style={[styles.hint, { color: colors.ink2 }]}>
          {t.canChangeAnytime}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 28,
    flexGrow: 1,
  },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
  },
  langList: {
    gap: 6,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 14,
  },
  flag: {
    fontSize: 22,
  },
  langName: {
    flex: 1,
    fontSize: 15,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  spacer: { flex: 1, minHeight: 24 },
  importHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  startBtn: {
    marginBottom: 14,
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.7,
  },
});
