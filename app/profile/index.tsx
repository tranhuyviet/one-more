import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useExerciseStore } from '@/store/useExerciseStore';
import Icon from '@/components/ui/Icon';
import TabBar from '@/components/ui/TabBar';
import { TAB_BAR_HEIGHT } from '@/constants/theme';
import { Language, AppearanceMode } from '@/types';

const LANGUAGES: { id: Language; flag: string; name: string }[] = [
  { id: 'vi', flag: '🇻🇳', name: 'Tiếng Việt' },
  { id: 'en', flag: '🇬🇧', name: 'English' },
];

interface RowProps {
  label: string;
  icon: string;
  value?: string;
  action?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  isLast?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

function Row({ label, icon, value, action, onPress, danger, isLast, colors }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.line, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, {
        backgroundColor: danger ? colors.dangerSoft : colors.accentSoft,
      }]}>
        <Text style={styles.rowIconText}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.ink, flex: 1 }]}>
        {label}
      </Text>
      {value && <Text style={[styles.rowValue, { color: colors.ink2 }]}>{value}</Text>}
      {action || (onPress && <Icon name="chev" size={14} stroke={colors.ink2} sw={1.6} />)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(s => s.user);
  const profile = useProfileStore(s => s.profile);
  const { updateName, updateLanguage, setAppearance } = useProfileStore();
  const exercises = useExerciseStore(s => s.exercises);

  const [name, setName] = useState(profile?.name ?? '');
  const [editingName, setEditingName] = useState(false);

  async function handleNameSave() {
    if (!user || !name.trim()) return;
    await updateName(user.uid, name.trim());
    setEditingName(false);
  }

  async function handleLangChange(lang: Language) {
    if (!user) return;
    await updateLanguage(user.uid, lang);
  }

  async function handleAppearance(mode: AppearanceMode) {
    if (!user) return;
    await setAppearance(user.uid, mode);
  }

  const initials = (profile?.name ?? 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <View style={[styles.statusBarCover, { height: insets.top, backgroundColor: colors.bg }]} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_HEIGHT + 24 },
        ]}
      >
        <Text style={[styles.title, { color: colors.ink }]}>{t.profileTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.ink2 }]}>{t.profileSubtitle}</Text>

        {/* Avatar + name */}
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{initials}</Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={[styles.nameFieldLabel, { color: colors.ink2 }]}>
              {t.yourName.toUpperCase()}
            </Text>
            <View style={[styles.nameInputRow, {
              borderColor: editingName ? colors.accent : colors.line,
              borderWidth: editingName ? 1.5 : 1,
              backgroundColor: colors.card,
            }]}>
              {editingName ? (
                <TextInput
                  style={[styles.nameInput, { color: colors.ink }]}
                  value={name}
                  onChangeText={setName}
                  onBlur={handleNameSave}
                  onSubmitEditing={handleNameSave}
                  autoFocus
                  returnKeyType="done"
                />
              ) : (
                <TouchableOpacity
                  style={styles.nameDisplay}
                  onPress={() => setEditingName(true)}
                >
                  <Text style={[styles.nameText, { color: colors.ink }]}>{profile?.name}</Text>
                </TouchableOpacity>
              )}
              {!editingName && (
                <Icon name="pencil" size={14} stroke={colors.ink2} sw={1.8} />
              )}
            </View>
          </View>
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, { color: colors.ink2, marginTop: 24 }]}>
          {t.language.toUpperCase()}
        </Text>
        <View style={styles.langList}>
          {LANGUAGES.map(l => {
            const active = l.id === (profile?.language ?? 'vi');
            return (
              <TouchableOpacity
                key={l.id}
                style={[
                  styles.langRow,
                  {
                    borderColor: active ? colors.accent : colors.line,
                    borderWidth: active ? 1.5 : 1,
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
                onPress={() => handleLangChange(l.id)}
              >
                <Text style={styles.flag}>{l.flag}</Text>
                <Text style={[styles.langName, {
                  color: active ? colors.accentInk : colors.ink,
                  fontWeight: active ? '600' : '500',
                }]}>
                  {l.name}
                </Text>
                <View style={[styles.radio, {
                  borderColor: active ? colors.accent : colors.line,
                  backgroundColor: active ? colors.accent : 'transparent',
                }]}>
                  {active && <Icon name="check" size={11} stroke="#fff" sw={2.5} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.ink2, marginTop: 24 }]}>
          {t.appearance.toUpperCase()}
        </Text>
        <View style={[styles.appearanceCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <View style={styles.appearanceRow}>
            <Text style={styles.appearanceIcon}>🌙</Text>
            <Text style={[styles.appearanceLabel, { color: colors.ink }]}>{t.darkMode}</Text>
          </View>
          <View style={[styles.segmented, { backgroundColor: colors.bg, borderColor: colors.line }]}>
            {(['auto', 'light', 'dark'] as AppearanceMode[]).map(mode => {
              const active = (profile?.darkMode ?? 'auto') === mode;
              const label = mode === 'auto' ? t.appearanceAuto : mode === 'light' ? t.appearanceLight : t.appearanceDark;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.segBtn, active && { backgroundColor: colors.accent }]}
                  onPress={() => handleAppearance(mode)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segBtnText, { color: active ? '#fff' : colors.ink2 }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Exercises */}
        <Text style={[styles.sectionLabel, { color: colors.ink2, marginTop: 28 }]}>
          {t.myExercises.toUpperCase()}
        </Text>
        {exercises.map((ex, i) => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.row, {
              borderBottomColor: colors.line,
              borderBottomWidth: StyleSheet.hairlineWidth,
            }]}
            onPress={() => router.push(`/exercises/add?id=${ex.id}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: `${ex.color}18` }]}>
              <Text style={styles.rowIconText}>{ex.icon}</Text>
            </View>
            <Text style={[styles.rowLabel, { color: colors.ink, flex: 1 }]}>{ex.name}</Text>
            <Text style={[styles.rowValue, { color: colors.ink2 }]}>
              {ex.unit === 'reps' ? t.reps
                : ex.unit === 'duration' ? t.seconds
                : ex.unit === 'minutes' ? t.minutes
                : ex.unit === 'km' ? t.km
                : t.meters}
            </Text>
            <Icon name="chev" size={14} stroke={colors.ink2} sw={1.6} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={() => router.push('/exercises/add')}
          activeOpacity={0.7}
        >
          <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
            <Icon name="plus" size={14} stroke={colors.accent} sw={2} />
          </View>
          <Text style={[styles.rowLabel, { color: colors.accent }]}>{t.addExercise}</Text>
          <Icon name="chev" size={14} stroke={colors.ink2} sw={1.6} />
        </TouchableOpacity>

      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  statusBarCover: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  content: { paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.8 },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 28 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '500', letterSpacing: -0.5 },
  nameContainer: { flex: 1 },
  nameFieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, marginBottom: 6 },
  nameInputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, borderRadius: 10, borderWidth: 1,
  },
  nameDisplay: { flex: 1, paddingVertical: 10 },
  nameText: { fontSize: 17, fontWeight: '600' },
  nameInput: { flex: 1, fontSize: 17, fontWeight: '600', paddingVertical: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
  langList: { gap: 6 },
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 13, borderRadius: 12, gap: 12,
  },
  flag: { fontSize: 20 },
  langName: { flex: 1, fontSize: 15 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16,
  },
  rowIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rowIconText: { fontSize: 14 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 14, marginRight: 8 },
  warningCard: {
    flexDirection: 'row', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 14,
  },
  warningIcon: { fontSize: 18, lineHeight: 22 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: {
    textAlign: 'center', fontSize: 11, lineHeight: 18,
    marginTop: 32, opacity: 0.6,
  },
  appearanceCard: {
    borderRadius: 12, borderWidth: 1,
    padding: 14, gap: 12,
  },
  appearanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appearanceIcon: { fontSize: 16 },
  appearanceLabel: { fontSize: 15, fontWeight: '500' },
  segmented: {
    flexDirection: 'row', borderRadius: 8, borderWidth: 1,
    overflow: 'hidden',
  },
  segBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
  },
  segBtnText: { fontSize: 13, fontWeight: '600' },
});
