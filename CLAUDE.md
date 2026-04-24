# CLAUDE.md

## Project Overview

**One More** — React Native fitness tracking app (Expo SDK 54).
Người dùng log các bài tập thể dục (hít đất, squat, nhảy dây...) theo set, xem lịch sử và thống kê tiến bộ.

## Commands

```bash
npx expo start --port 8083   # Start dev server
npx tsc --noEmit             # Type check
npx expo install <package>   # Install with Expo compatibility
```

## Tech Stack

- **Expo SDK 54** + **Expo Router v6** (file-based routing)
- **Firebase JS SDK v12** — Firestore + Anonymous Auth (no SQLite)
- **Zustand v5** — state management
- **TypeScript strict mode**
- **react-native-svg** — SVG icons và charts
- Path alias: `@/*` → `src/*`
- Dark mode: controlled by `profile.darkMode` (overrides system)
- Language: `vi` (Vietnamese) default, `en` supported

## Architecture

### Data flow
Screens → Zustand stores → `src/firebase/*.ts` queries → Firestore

### Firebase structure
```
users/{userId}/
  data/profile           ← Profile doc (name, language, darkMode)
  exercises/{id}         ← Exercise definitions
  exercise_logs/{id}     ← Individual logged sets
```

### Auth
Anonymous auth — `signInAnonymously()` on app start. No login required.
User data is tied to `auth.currentUser.uid`.

### Key files
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root Stack, auth init, onAuthChange listener |
| `app/index.tsx` | Home screen — today summary + weekly grid |
| `app/welcome.tsx` | Onboarding — name + language input |
| `app/log/[id].tsx` | Quick log modal for a specific exercise |
| `app/exercises/index.tsx` | Exercise picker modal (from + tab) |
| `app/exercises/add.tsx` | Add exercise form modal |
| `app/history/index.tsx` | History with week navigation |
| `app/stats/index.tsx` | Stats — line chart, compare, records |
| `app/profile/index.tsx` | Profile — name, language, dark mode, data |
| `src/firebase/config.ts` | Firebase init (**needs real credentials**) |
| `src/firebase/logs.ts` | Log queries + date helpers |
| `src/constants/theme.ts` | Color palette (MIN design), spacing, font sizes |
| `src/constants/i18n.ts` | Translations vi/en |
| `src/store/*.ts` | Zustand stores |
| `src/components/ui/TabBar.tsx` | Custom tab bar (5 tabs, elevated + button) |
| `src/components/ui/Icon.tsx` | SVG icon component |
| `src/components/charts/LineChart.tsx` | Trend line chart |
| `src/components/charts/WeekGrid.tsx` | Weekly activity grid |

## Design System

Colors from `src/constants/theme.ts` (MIN palette):
- Light: bg `#FAFAF7`, accent `#0F7A3A`, ink `#0F1713`
- Dark: bg `#0B0F0D`, accent `#5FD693`, ink `#F2F3EE`

Hooks for theming:
- `useTheme()` → `{ colors, isDark }`
- `useTranslation()` → `{ t, lang }`

## Conventions

- `StyleSheet.create` for all styling — no inline styles
- Components never directly call Firebase — always go through stores
- `src/components/ui/` — generic reusable UI
- `src/components/exercise/` — exercise-specific components
- `src/components/charts/` — chart components
- No comments unless WHY is non-obvious

## Setup Required

1. Create Firebase project at console.firebase.google.com
2. Enable Anonymous Authentication
3. Create Firestore database
4. Copy config to `src/firebase/config.ts` (replace placeholder values)
5. Add Firestore indexes if queried fields require composite indexes

## iOS / Android IDs

- iOS bundle: `com.viet.tran.onemore`
- Android package: `com.viet.tran.onemore`
