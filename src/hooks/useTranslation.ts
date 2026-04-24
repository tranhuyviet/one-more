import { translations, TranslationKey } from '@/constants/i18n';
import { useProfileStore } from '@/store/useProfileStore';

export function useTranslation() {
  const profile = useProfileStore(s => s.profile);
  const lang = profile?.language ?? 'vi';
  const t = translations[lang];
  return { t, lang };
}
