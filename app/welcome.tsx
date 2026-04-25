import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { translations } from '@/constants/i18n';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import AppLogo from '@/components/ui/AppLogo';
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
  const user = useAuthStore(s => s.user);
  const { createProfile } = useProfileStore();
  const { seedDefaults } = useExerciseStore();

  const [name, setName] = useState('');
  const [lang, setLang] = useState<Language>('vi');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

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
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top spacer */}
        <View style={styles.topSpacer} />

        {/* Brand mark */}
        <View style={styles.brandWrap}>
          <AppLogo size={72} />
          <Text style={[styles.brandName, { color: colors.ink }]}>
            ONE MORE
          </Text>
        </View>

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
        <Text style={[styles.fieldLabel, { color: colors.ink2, marginTop: 32 }]}>
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
                  {active && <View style={styles.radioCheck} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Button
          label={t.getStarted}
          onPress={handleStart}
          loading={loading}
          disabled={!name.trim()}
        />
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
  topSpacer: { height: 60 },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 44,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 18,
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
  radioCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  spacer: { flex: 1, minHeight: 32 },
});
