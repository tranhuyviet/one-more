# QA Test Checklist — One More App

## Cách dùng
Chạy toàn bộ checklist trước mỗi release. Đánh dấu ✅/❌ vào từng mục.
Device cần test: **iOS** (chính) + **Android** (nếu có).
Chế độ cần test: **Dark mode** + **Light mode**.

---

## 1. Onboarding (Welcome Screen)

- [ ] Mở app lần đầu → màn hình Welcome hiện ra
- [ ] Để trống tên → nút "Bắt đầu" bị disabled, không thể bấm
- [ ] Nhập tên → nút "Bắt đầu" active
- [ ] Nhập 50 ký tự → không thể nhập thêm (maxLength)
- [ ] Chọn ngôn ngữ Tiếng Việt → toàn app hiển thị tiếng Việt
- [ ] Chọn ngôn ngữ English → toàn app hiển thị tiếng Anh
- [ ] Bấm "Bắt đầu" → vào màn hình Home
- [ ] Mở app lần 2 → không hiện Welcome nữa, vào thẳng Home

---

## 2. Home Screen

- [ ] Hiển thị đúng tên người dùng trong greeting
- [ ] Hôm nay chưa tập → danh sách trống hoặc có prompt bắt đầu
- [ ] Hôm nay đã tập → hiện danh sách các môn với số lần + đơn vị đúng
- [ ] Bấm vào môn trong danh sách → mở Log modal đúng môn đó
- [ ] Weekly grid hiển thị đúng các ngày trong tuần
- [ ] Ngày hiện tại được highlight trong grid
- [ ] Ngày có tập → ô trong grid sáng/có màu
- [ ] Ngày không tập → ô trong grid trống/mờ
- [ ] Thống kê tuần (Tổng, TB/ngày) tính đúng
- [ ] Dark/Light mode toggle từ profile → Home cập nhật ngay

---

## 3. Log Exercise

### Mở modal
- [ ] Bấm nút + ở tab bar → mở exercise picker
- [ ] Chọn môn từ picker → mở Log modal đúng môn
- [ ] Bấm vào môn trên Home → mở Log modal đúng môn
- [ ] Header hiển thị đúng tên + icon môn

### Nhập số
- [ ] Nút + tăng giá trị 1 đơn vị
- [ ] Nút − giảm giá trị (không xuống dưới 0)
- [ ] Bấm quick pick button → giá trị cập nhật ngay
- [ ] Quick pick đang active → được highlight
- [ ] Đơn vị hiển thị đúng (lần/giây/phút/m/km) theo cấu hình môn

### Ghi chú
- [ ] Nhập ghi chú bình thường → lưu được
- [ ] Nhập 200 ký tự → không thể nhập thêm (maxLength)

### Lưu
- [ ] Bấm Lưu → modal đóng
- [ ] Set vừa log xuất hiện trong danh sách Home ngay
- [ ] Bấm Lưu nhiều lần nhanh → không bị duplicate (saving state)
- [ ] Đổi môn (icon đổi môn trong header) → log đúng môn mới

### Xem hôm nay
- [ ] Phần "Hôm nay" cuối modal hiển thị đúng các set đã log
- [ ] Tổng hôm nay tính đúng
- [ ] Thời gian của từng set hiển thị đúng

---

## 4. Exercise Management

### Thêm bài tập
- [ ] Bấm "Thêm bài tập mới" → mở form
- [ ] Để trống tên → nút tạo disabled
- [ ] Nhập tên > 50 ký tự → bị chặn (maxLength) + character counter hiện
- [ ] Tên hợp lệ → character counter hiện `n/50`
- [ ] Chọn icon → preview cập nhật ngay
- [ ] Chọn đơn vị "Lần" → Quick pick default: 5,10,15,20,25,30
- [ ] Chọn đơn vị "Thời gian" → hiện 2 sub-option Giây/Phút
  - [ ] Chọn Giây → Quick pick default: 15,30,45,60,90,120
  - [ ] Chọn Phút → Quick pick default: 5,10,15,20,30,45
- [ ] Chọn đơn vị "Khoảng cách" → hiện 2 sub-option Mét/Km
  - [ ] Chọn Mét → Quick pick default: 50,100,200,400,800,1000
  - [ ] Chọn Km → Quick pick default: 1,2,3,5,10,15
- [ ] Đổi unit → Quick pick tự reset về default của unit mới
- [ ] Sửa từng ô Quick pick → giá trị thay đổi đúng
- [ ] Nút "Sắp xếp tăng dần" → Quick pick sắp xếp đúng thứ tự
- [ ] Chọn màu → preview icon đổi màu nền
- [ ] Bấm Tạo → bài tập xuất hiện trong danh sách
- [ ] Bài tập mới xuất hiện ngay trong filter của History + Stats

### Sửa bài tập
- [ ] Bấm vào bài tập trong Profile → mở form Sửa
- [ ] Form load đúng dữ liệu hiện tại (tên, icon, unit, color, quickPicks)
- [ ] Sửa tên → tên mới lưu được
- [ ] Sửa Quick pick → Log modal dùng Quick pick mới
- [ ] Bấm Lưu → cập nhật ngay ở mọi màn hình

### Xóa bài tập
- [ ] Bấm "Xóa bài tập" → hiện confirm dialog
- [ ] Hủy → không xóa
- [ ] Xác nhận → bài tập biến mất khỏi mọi nơi
- [ ] Không thể xóa nếu chỉ còn 1 bài tập

---

## 5. History Screen

### Filter theo môn
- [ ] "Tất cả" → hiện tất cả môn trong badge mỗi ngày
- [ ] Chọn môn cụ thể → chỉ hiện môn đó + stats hiện ra
- [ ] Stats (Tổng, TB/ngày, Tốt nhất) + đơn vị hiển thị đúng theo môn
- [ ] Không có data trong kỳ → "— không tập —"

### Time range
- [ ] Tuần → hiện 7 ngày (T2–CN)
- [ ] Tháng → hiện đúng số ngày trong tháng (28/29/30/31)
- [ ] Năm → hiện 12 tháng
- [ ] Bấm Tuần/Tháng/Năm → reset về kỳ hiện tại (offset = 0)

### Điều hướng
- [ ] Nút ← → về kỳ trước, dữ liệu load đúng
- [ ] Nút → không active khi đang ở kỳ hiện tại
- [ ] Label kỳ hiện tại highlight màu xanh ("Tuần này", "Tháng này", "Năm nay")
- [ ] Label kỳ cũ hiện số kỳ trước ("1 tuần trước", "2 tháng trước")

### Danh sách ngày
- [ ] Ngày có data → hiện badges với đúng số + màu của môn
- [ ] Ngày không có data → "— không tập —", opacity thấp
- [ ] Bấm vào ngày có data → expand chi tiết từng set
- [ ] Chi tiết hiện đúng: tên môn, số set, tổng, từng set với thời gian
- [ ] Progress bar tương đối so với ngày cao nhất trong kỳ
- [ ] Ngày hiện tại được highlight

### Filter "Tất cả" — không hiện stats
- [ ] Không hiện Tổng/TB/Tốt nhất (vô nghĩa khi mix đơn vị)
- [ ] Không hiện số tổng bên phải mỗi dòng

---

## 6. Stats Screen

### Filter "Tất cả"
- [ ] Hiện: Ngày hoạt động | Set đã log | % so kỳ trước
- [ ] Hiện breakdown từng môn với bar tương đối
- [ ] Không có data → empty state
- [ ] % so kỳ trước tính đúng (positive/negative)

### Filter 1 môn
- [ ] Stats summary: Tổng / TB/ngày / Tốt nhất + đúng đơn vị
- [ ] Trend chart hiển thị đúng theo range:
  - [ ] Tuần → 7 điểm theo ngày (T2-CN)
  - [ ] Tháng → điểm theo tuần
  - [ ] Năm → 12 điểm theo tháng
- [ ] Chart trống khi không có data ("Chưa có dữ liệu")
- [ ] So sánh kỳ: số kỳ trước vs kỳ này + delta đúng
- [ ] Records: Tốt nhất + Tổng đúng

### Điều hướng
- [ ] Cùng logic prev/next như History
- [ ] Đổi range → reset offset về 0

---

## 7. Profile Screen

### Thông tin cá nhân
- [ ] Hiện đúng tên, chữ cái đầu trong avatar
- [ ] Bấm pencil → TextInput active với tên hiện tại
- [ ] Xóa hết tên → không thể save (empty check)
- [ ] Nhập tên > 50 ký tự → bị chặn
- [ ] Submit/blur → tên mới lưu, hiện ngay trên profile + Home greeting
- [ ] Đổi ngôn ngữ → toàn app cập nhật ngay (không cần restart)

### Giao diện
- [ ] Chọn Tối → app chuyển dark mode
- [ ] Chọn Sáng → app chuyển light mode
- [ ] Chọn Tự động → theo system setting

### Danh sách bài tập
- [ ] Hiện đúng tên + đơn vị (lần/giây/phút/m/km) cho từng môn
- [ ] Bấm vào → mở form Sửa

### Dữ liệu
- [ ] Export JSON → file chứa đúng dữ liệu
- [ ] Nút Xóa toàn bộ → confirm dialog → xóa xong về Welcome

---

## 8. Dark/Light Mode

Test các màn hình sau ở **cả 2 chế độ**:
- [ ] Home — badge màu môn nhìn rõ ở cả 2 chế độ
- [ ] History — badge background có contrast đủ
- [ ] Log modal — số lớn, quick pick grid rõ ràng
- [ ] Exercise form — input fields có border visible
- [ ] Stats chart — line nhìn rõ trên background
- [ ] Tab bar — active/inactive state rõ ràng

---

## 9. Đa ngôn ngữ (vi/en)

- [ ] Đổi sang English → toàn bộ text chuyển (không còn tiếng Việt nào)
- [ ] Đổi sang Tiếng Việt → toàn bộ text chuyển
- [ ] Unit labels đúng: lần/reps, giây/sec, phút/min, m/m, km/km
- [ ] Ngày trong tuần đúng: T2-CN (vi) / Mon-Sun (en)
- [ ] Tháng trong năm đúng: T1-T12 (vi) / Jan-Dec (en)
- [ ] Period labels đúng: "Tuần này"/"This week", "Tháng này"/"This month"

---

## 10. Data Persistence

- [ ] Log exercise → force quit app → mở lại → data vẫn còn
- [ ] Thêm exercise → force quit → mở lại → exercise vẫn còn
- [ ] Đổi tên, ngôn ngữ, theme → force quit → mở lại → settings vẫn giữ
- [ ] Điều hướng về tuần trước → data lịch sử hiển thị đúng

---

## 11. Edge Cases & Error Handling

- [ ] Không có internet → app không crash, hiện data đã cache
- [ ] Log value = 0 → không thể save (bị Zod block)
- [ ] Note > 200 ký tự → bị maxLength chặn
- [ ] Nhiều môn trong cùng ngày → badges hiện đủ tất cả (không bị cắt)
- [ ] Tháng 2 năm nhuận (29 ngày) → History tháng hiện đúng 29 ngày
- [ ] Đổi múi giờ → ngày trong History không bị sai
- [ ] Bấm Save nhanh nhiều lần → không tạo duplicate log
- [ ] Offline → add log → back online → data sync lên Firebase

---

## 12. Performance

- [ ] Mở app → Home load < 2 giây
- [ ] Chuyển tab → không bị lag/flash
- [ ] History tháng (30 ngày) → scroll mượt
- [ ] History năm (12 tháng) → scroll mượt
- [ ] Chart render không bị giật

---

## Release Criteria

**Không release nếu có bất kỳ ❌ nào trong:**
- Section 1 (Onboarding)
- Section 3 (Log Exercise) — core feature
- Section 10 (Data Persistence)
- Section 11 items: duplicate log, Zod block

**Có thể release với ❌ minor ở:**
- Section 12 (Performance) — nếu không ảnh hưởng usability
- Section 8 (Dark/Light) — nếu chỉ là cosmetic nhỏ
