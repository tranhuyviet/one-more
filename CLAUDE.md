# CLAUDE.md

## Project Overview

**One More** — React Native fitness tracking app (Expo SDK 54).
Người dùng log các bài tập thể dục (hít đất, squat, nhảy dây...) theo set, xem lịch sử và thống kê tiến bộ.

## Commands

```bash
npx expo start --port 8083   # Start dev server
npx tsc --noEmit             # Type check
npx expo install <package>   # Install with Expo compatibility
pnpm test                    # Run unit tests
pnpm test:coverage           # Run tests with coverage report
pnpm test:watch              # Watch mode
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

## Validation Standards (Zod)

**Nguyên tắc bắt buộc: validate tại mọi boundary — không tin bất kỳ dữ liệu nào từ bên ngoài.**

### Schemas
- Tất cả data types định nghĩa trong `src/schemas/index.ts` bằng Zod
- TypeScript types được **infer từ schema** — không viết interface/type riêng
- Schemas là single source of truth cho cả validation lẫn types

### Firebase reads — bắt buộc parse
Mọi Firestore document khi đọc về phải qua `safeParse` trước khi đưa vào store:
```typescript
const result = ExerciseSchema.safeParse({ id: d.id, ...d.data() });
if (!result.success) {
  console.warn('[Firebase] Invalid doc:', d.id, result.error.issues);
  return []; // bỏ qua doc lỗi, không crash app
}
return [result.data];
```

### Firebase writes — validate trước khi gửi
Mọi create/update operation phải validate input trước khi gọi Firebase:
```typescript
const validation = CreateExerciseInputSchema.safeParse(input);
if (!validation.success) { /* show error, return early */ }
// chỉ gọi Firebase sau khi validate thành công
```

### Form inputs — 3 lớp bảo vệ
1. **`maxLength` trên TextInput** — ngăn nhập quá dài ở UI level
2. **Zod `safeParse` trong handleSave** — validate trước khi gọi store/Firebase
3. **Inline error text** — hiển thị lỗi cụ thể dưới input (không dùng Alert)

Ví dụ chuẩn:
```typescript
// state
const [nameError, setNameError] = useState('');

// trong handleSave
const validation = CreateExerciseInputSchema.safeParse(input);
if (!validation.success) {
  const issue = validation.error.issues.find(i => i.path[0] === 'name');
  setNameError(issue?.message ?? '');
  return;
}
setNameError('');
// tiếp tục save...

// trong JSX
<TextInput maxLength={50} onChangeText={t => { setName(t); setNameError(''); }} />
{nameError ? <Text style={styles.errorText}>{nameError}</Text> : <Text style={styles.charCount}>{name.length}/50</Text>}
```

### Limits hiện tại
| Field | Limit | Lý do |
|-------|-------|-------|
| Exercise name | 50 chars | Hiển thị vừa UI, không bị truncate |
| Profile name | 50 chars | Như trên |
| Log note | 200 chars | Đủ để ghi cảm nhận, không quá dài |
| QuickPicks | 1–6 values, > 0, integer | UX grid 2×3, giá trị có nghĩa |
| Exercise color | Hex `#RRGGBB` | Consistent format |

## Testing Standards

**Framework:** `ts-jest` (không dùng `jest-expo` cho pure logic tests — tránh React Native overhead)

### Bắt buộc viết test cho
- Mọi pure function trong `src/utils/` (date, stats, unit logic)
- Mọi Zod schema — validate cả happy path lẫn invalid cases
- i18n completeness — đảm bảo vi và en có cùng số keys, không có empty string
- Constants structure — QUICK_PICK_VALUES phải có đúng format

### Không cần test
- Firebase calls (cần mock quá phức tạp, ít ROI)
- React components (dùng manual QA)
- Zustand store actions (integration, không phải unit)

### Cấu trúc test file
```
__tests__/
  dateUtils.test.ts     ← test src/utils/dateUtils.ts
  statsUtils.test.ts    ← test src/utils/statsUtils.ts
  unitUtils.test.ts     ← test src/utils/unitUtils.ts
  schemas.test.ts       ← test src/schemas/index.ts
  i18n.test.ts          ← test src/constants/i18n.ts
```

### Coverage target
- `src/utils/` → 100% statements, 100% functions
- `src/schemas/` → 100% branches
- `src/constants/` → 100%
- Branch coverage < 100% chỉ chấp nhận với defensive fallback code

### Nguyên tắc viết test
- Mỗi edge case là 1 `it()` riêng — không gộp nhiều assertions không liên quan
- Test tên theo pattern: `'returns X when Y'` hoặc `'rejects X when Y'`
- Dùng helper factory functions (`makeLog()`, `dateMs()`) để tránh boilerplate
- Luôn test cả invalid/empty input, không chỉ happy path

## Shared UI Components

Các component dùng chung giữa nhiều màn hình để tránh duplicate:
- `ExerciseFilterBar` — filter chips theo môn tập
- `TimeRangeTabs` — Tuần/Tháng/Năm selector
- `PeriodNav` — prev/next navigation với label

Khi thêm UI pattern mới dùng ở 2+ màn hình → extract ngay thành component trong `src/components/ui/`

## Business Logic Extraction

Mọi logic tính toán phức tạp phải nằm trong `src/utils/`, không inline trong component:
- `dateUtils.ts` — date/period calculations
- `statsUtils.ts` — aggregation, best, diff%
- `unitUtils.ts` — unit labels, quick picks

Lý do: testable, reusable, component chỉ làm UI rendering.

## Setup Required

1. Create Firebase project at console.firebase.google.com
2. Enable Anonymous Authentication
3. Create Firestore database
4. Copy config to `src/firebase/config.ts` (replace placeholder values)
5. Add Firestore indexes if queried fields require composite indexes

## iOS / Android IDs

- iOS bundle: `com.viet.tran.onemore`
- Android package: `com.viet.tran.onemore`
