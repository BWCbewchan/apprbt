# 📊 Hệ thống Thống kê & Feedback - Apps Script

## 🎯 Tính năng

### 1. **Thống kê lượt truy cập**
- Theo dõi số người vào từng màn hình
- Thống kê tổng lượt xem và số người dùng duy nhất
- Tự động xếp hạng màn hình phổ biến nhất
- Hiển thị top 3 màn hình với highlight vàng/bạc/đồng

### 2. **Hệ thống Feedback**
- Đánh giá theo sao (1-5 ⭐)
- Nhận xét từ người dùng
- Đề xuất tính năng mới
- Tự động phân loại theo màu dựa vào rating
- Nút feedback cố định góc phải màn hình

### 3. **Dữ liệu được lưu**
- **PageViews**: Timestamp, Screen, User ID, Session ID, User Agent
- **Feedback**: Timestamp, Rating, Comment, Feature Request, Screen, User ID
- **Statistics**: Tự động tính toán và cập nhật real-time

---

## 🚀 Hướng dẫn Setup Apps Script

### Bước 1: Tạo Google Sheet

1. Mở [Google Sheets](https://sheets.google.com)
2. Tạo một spreadsheet mới
3. Đặt tên: `AppRBT Analytics`
4. Sao chép **Sheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID_HERE]/edit
   ```

### Bước 2: Tạo Apps Script Project

1. Trong Google Sheet, vào: **Extensions** > **Apps Script**
2. Xóa code mẫu
3. Copy toàn bộ code từ file `appscript/Code.gs`
4. Paste vào Apps Script Editor
5. **Cập nhật `SHEET_ID`** ở dòng 8:
   ```javascript
   SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE', // ← Thay bằng Sheet ID của bạn
   ```

### Bước 3: Deploy Web App

1. Trong Apps Script Editor, click **Deploy** > **New deployment**
2. Click biểu tượng ⚙️ (Settings) > Chọn **Web app**
3. Cấu hình:
   - **Description**: `AppRBT Analytics API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (hoặc `Anyone with Google account` nếu muốn bảo mật hơn)
4. Click **Deploy**
5. Cho phép quyền truy cập khi được yêu cầu
6. **Sao chép Web App URL** (có dạng: `https://script.google.com/macros/s/.../exec`)

### Bước 4: Cập nhật Frontend

Mở 2 files sau và thay `YOUR_APPSCRIPT_WEB_APP_URL_HERE`:

#### File 1: `app/components/FeedbackButton.tsx`
```typescript
const APPSCRIPT_URL = 'https://script.google.com/macros/s/.../exec'; // ← Paste URL của bạn
```

#### File 2: `app/hooks/usePageTracking.ts`
```typescript
const APPSCRIPT_URL = 'https://script.google.com/macros/s/.../exec'; // ← Paste URL của bạn
```

### Bước 5: Test

#### Test trong Apps Script:
1. Trong Apps Script Editor, chọn function: `testPageView`
2. Click **Run** (▶️)
3. Kiểm tra Sheet `PageViews` đã có dữ liệu
4. Chạy tiếp `testFeedback` và `testStatistics`

#### Test trong App:
1. Start development server:
   ```bash
   npm run dev
   ```
2. Mở app trong browser
3. Chuyển qua các màn hình khác nhau → Check Sheet `PageViews`
4. Click nút Feedback góc phải → Gửi đánh giá → Check Sheet `Feedback`
5. Xem thống kê trong Sheet `Statistics`

---

## 📋 Cấu trúc Google Sheet

### Sheet: **PageViews**
| Timestamp | Screen | User ID | Session ID | User Agent | IP Address |
|-----------|--------|---------|------------|------------|------------|
| 2024-01-01 10:00 | screen1 | user_123 | session_456 | Chrome/120 | 1.2.3.4 |

### Sheet: **Feedback**
| Timestamp | Rating | Comment | Feature Request | Screen | User ID | Session ID | Status |
|-----------|--------|---------|-----------------|--------|---------|------------|--------|
| 2024-01-01 10:05 | ⭐⭐⭐⭐⭐ (5) | App tuyệt vời! | Dark mode | screen1 | user_123 | session_456 | New |

### Sheet: **Statistics** (Tự động)
| Screen | Total Views | Unique Users | Last Updated |
|--------|-------------|--------------|--------------|
| screen1 🥇 | 150 | 45 | 2024-01-01 10:30 |
| screen2 🥈 | 120 | 38 | 2024-01-01 10:30 |
| screen3 🥉 | 95 | 30 | 2024-01-01 10:30 |

---

## 🎨 UI Components

### Feedback Button
- **Vị trí**: Góc phải dưới màn hình (fixed)
- **Style**: Gradient purple-pink với icon feedback
- **Animation**: Hover scale + pulse dot
- **Kích thước**: 56x56px (responsive)

### Feedback Modal
- **Rating**: 5 sao với hover effect
- **Comment**: Textarea 500 ký tự
- **Feature Request**: Textarea 300 ký tự
- **Hiển thị màn hình hiện tại**
- **Success animation** sau khi submit

---

## 📊 Analytics Dashboard

### Xem thống kê trong Google Sheet:
1. Mở Sheet `Statistics`
2. Thấy danh sách màn hình xếp theo lượt view (giảm dần)
3. Top 3 được highlight vàng/bạc/đồng
4. Tự động cập nhật mỗi khi có page view mới

### Xem feedback:
1. Mở Sheet `Feedback`
2. Rating ≥4: Nền xanh lá (hài lòng)
3. Rating =3: Nền vàng (trung bình)
4. Rating ≤2: Nền đỏ (không hài lòng)
5. Sort theo timestamp để thấy feedback mới nhất

---

## 🔧 Tùy chỉnh

### Thay đổi màu feedback:
Trong `Code.gs`, function `handleFeedback`, line ~104-110:
```javascript
if (rating >= 4) {
  sheet.getRange(lastRow, 1, 1, 8).setBackground('#d9ead3'); // Green
} else if (rating === 3) {
  sheet.getRange(lastRow, 1, 1, 8).setBackground('#fff2cc'); // Yellow
} else {
  sheet.getRange(lastRow, 1, 1, 8).setBackground('#f4cccc'); // Red
}
```

### Thay đổi text feedback button:
Trong `FeedbackButton.tsx`, line ~199:
```typescript
<MessageSquare className="h-6 w-6" /> // Đổi icon
```

### Thay đổi vị trí button:
Trong `FeedbackButton.tsx`, line ~192:
```typescript
"fixed bottom-6 right-6 z-50", // Đổi bottom-6/right-6
```

---

## 🔐 Bảo mật

### User ID & Session ID:
- **User ID**: Lưu trong `localStorage` (persistent)
- **Session ID**: Lưu trong `sessionStorage` (xóa khi đóng browser)
- Tự động tạo khi người dùng truy cập lần đầu
- Format: `user_timestamp_randomstring`

### Privacy:
- Không lưu thông tin cá nhân
- IP Address chỉ để phân tích (không dùng để tracking)
- User Agent để biết thiết bị/browser

---

## 📱 Responsive

- **Desktop**: Nút feedback góc phải dưới
- **Mobile**: Nút feedback thu nhỏ, modal full-width
- **Tablet**: Layout adaptive

---

## 🎯 Best Practices

1. **Kiểm tra Sheet ID** trước khi deploy
2. **Test các functions** trong Apps Script trước
3. **Backup Google Sheet** thường xuyên
4. **Monitor feedback** để cải thiện app
5. **Phân tích statistics** để hiểu user behavior

---

## 🐛 Troubleshooting

### Lỗi: "Script function not found"
→ Kiểm tra đã deploy Web App chưa

### Lỗi: "Permission denied"
→ Chạy lại authorization trong Apps Script

### Feedback không gửi được:
→ Kiểm tra `APPSCRIPT_URL` đã đúng chưa

### Statistics không cập nhật:
→ Gọi manual function `updateStatistics()` trong Apps Script

### CORS Error:
→ Đã dùng `mode: 'no-cors'`, ignore warning trong console

---

## 📞 Support

Nếu có vấn đề, liên hệ:
- **Email**: [tranchibaoit@gmail.com]
- **GitHub Issues**: [Link to repo]

---

## 📄 License

© Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo

---

**Chúc bạn setup thành công! 🎉**
