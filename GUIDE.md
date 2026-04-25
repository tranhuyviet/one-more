# One More — Hướng dẫn đầy đủ

## 1. Chạy app khi phát triển

```bash
npx expo start --port 8083
```

Sau đó bấm `i` để mở iOS Simulator, hoặc quét QR bằng Expo Go trên điện thoại (chế độ dev).

Type check:
```bash
npx tsc --noEmit
```

---

## 2. Cấu trúc dự án

```
app/                    # Màn hình (Expo Router file-based)
  _layout.tsx           # Root layout — auth init, splash overlay
  index.tsx             # Home screen
  welcome.tsx           # Onboarding (tên + ngôn ngữ)
  log/[id].tsx          # Log nhanh một bài tập
  exercises/            # Danh sách & thêm bài tập
  history/              # Lịch sử theo tuần
  stats/                # Thống kê & biểu đồ
  profile/              # Cài đặt cá nhân

src/
  firebase/             # Firebase queries
    config.ts           # Khởi tạo app + auth + Firestore
    auth.ts             # signInAnonymously, onAuthChange
    profile.ts          # getProfile, createProfile, updateProfile
    logs.ts             # getLogs, addLog, ...
  store/                # Zustand stores
  hooks/                # useTheme, useTranslation
  constants/
    theme.ts            # Màu sắc, spacing (MIN palette)
    i18n.ts             # Bản dịch vi / en
  types/index.ts        # TypeScript types
  components/           # UI components dùng chung
```

---

## 3. Firebase

### Cấu trúc Firestore

```
users/{userId}/
  data/profile          ← Profile (name, language, darkMode)
  exercises/{id}        ← Bài tập do user tạo
  exercise_logs/{id}    ← Mỗi set đã log
```

### Auth

App dùng **Anonymous Authentication** — không cần đăng nhập.  
- `signInAnonymously()` chạy tự động khi mở app lần đầu.
- UID được lưu qua `@react-native-async-storage/async-storage` → không mất khi tắt app.
- **QUAN TRỌNG**: Không xóa app vì sẽ mất dữ liệu (tài khoản ẩn danh không khôi phục được).

### Persistence (đã cấu hình)

`src/firebase/config.ts` dùng `initializeAuth` với `getReactNativePersistence(AsyncStorage)` để lưu auth state. `getReactNativePersistence` chỉ có trong RN bundle của Firebase (Metro tự resolve đúng), nên phải dùng `require()` thay vì `import`.

---

## 4. Dark Mode

Có 3 chế độ lưu trong `profile.darkMode: 'auto' | 'light' | 'dark'`:

- `auto` (mặc định): theo thiết lập hệ thống (iOS Dark/Light Mode)
- `light`: luôn sáng
- `dark`: luôn tối

Logic trong `src/hooks/useTheme.ts`:
```ts
const mode = profile?.darkMode ?? 'auto';
const isDark = mode === 'auto' ? systemScheme === 'dark' : mode === 'dark';
```

User đổi trong Profile → mục Appearance.

**Migration**: User cũ có `darkMode: boolean` → `getProfile()` tự chuyển:  
`false` → `'auto'`, `true` → `'dark'`

---

## 5. Ngôn ngữ

Hỗ trợ Tiếng Việt (`vi`) và English (`en`). Bản dịch tại `src/constants/i18n.ts`.

- `useTranslation()` đọc từ `profile.language` → dùng trong các màn hình đã có profile.
- `welcome.tsx` dùng `translations[lang]` trực tiếp (profile chưa tồn tại) → ngôn ngữ đổi ngay khi chọn.

---

## 6. Build lên iPhone thật

### Yêu cầu

- Tài khoản **Apple Developer** ($99/năm) — cần cho EAS build không expire.
- EAS CLI đã đăng nhập: `eas login` (tài khoản: viet.tran.dev@gmail.com)
- Expo account: viet.tran

### Các bước

**Bước 1 — Đăng ký UDID iPhone** (chỉ làm 1 lần cho mỗi thiết bị):
```bash
eas device:create
```
- Chọn **Website** khi được hỏi "How would you like to register your devices?"
- EAS tạo một link → mở link đó trên iPhone (không phải trên Mac)
- Làm theo hướng dẫn trên iPhone để cài profile → UDID tự động đăng ký
- Đăng nhập Apple ID: `vietth@msn.com`, Apple Team: `Viet Tran (9VVPHQ6NGH)`
- EAS project đã được tạo: `@viet.tran/one-more` (ID: `e28ae154-4ab4-48be-89f1-ba2f5294ab8b`)

**Bước 2 — Build IPA** (Release build, internal distribution):
```bash
eas build --profile preview --platform ios
```
Mất khoảng 15–30 phút trên cloud Expo.

**Bước 3 — Cài lên iPhone**:  
Sau khi build xong, EAS gửi link (hoặc QR) → mở link trên iPhone → Install.

### Build local (không cần Developer account, expire 7 ngày)

iPhone cắm vào Mac qua USB, sau đó:
```bash
npx expo run:ios --device --configuration Release
```

---

## 7. Upload lên TestFlight

Cần điền `ascAppId` và `appleTeamId` vào `eas.json` → phần `submit.production.ios` trước.  
Lấy ở [App Store Connect](https://appstoreconnect.apple.com) và [Apple Developer Portal](https://developer.apple.com/account).

```bash
pnpm testflight
```

Lệnh này sẽ: build production IPA → tự động upload lên TestFlight.  
Sau đó vào App Store Connect → TestFlight → invite tester hoặc tự test.

---

## 8. Cập nhật app sau khi sửa code

Mỗi lần có thay đổi muốn cài lại:
```bash
pnpm build:ios
```

Nếu chỉ sửa JS (không sửa native code), có thể dùng **EAS Update** (OTA update — không cần build lại):
```bash
eas update --branch preview --message "mô tả thay đổi"
```

---

## 8. Cấu hình build (`eas.json`)

| Profile | Mục đích | Distribution |
|---------|----------|--------------|
| `development` | Dev client để debug | Internal |
| `preview` | Test trên iPhone thật | Internal (ad hoc) |
| `production` | Lên App Store | Store |

---

## 9. Các lệnh thường dùng

```bash
# Dev
pnpm start                        # Chạy dev server (Expo Go)
pnpm dev                       # Dev client
pnpm dev:tunnel                # Dev client qua tunnel (khác mạng)
npx tsc --noEmit                  # Kiểm tra TypeScript

# Build local
pnpm ios                       # Simulator
pnpm ios:device                # iPhone debug (cắm USB)
pnpm ios:release               # iPhone release (cắm USB, expire 7 ngày)

# EAS cloud build
pnpm build:ios                 # Preview build → cài trực tiếp lên iPhone
pnpm build:ios:prod            # Production build
pnpm testflight                # Build + upload lên TestFlight

# Thiết bị & update
eas device:create                 # Đăng ký iPhone mới
eas build:list                    # Xem danh sách build
eas update --branch preview --message "..."  # OTA update (chỉ JS)
```
