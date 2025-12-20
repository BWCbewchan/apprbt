# 📊 Hướng dẫn Setup Hệ thống Thống kê & Feedback

## 🎉 Tính năng đã thêm

### ✅ 1. Tracking lượt truy cập
- Tự động theo dõi khi người dùng chuyển màn hình
- Lưu User ID và Session ID để phân tích
- Ghi lại device/browser thông qua User Agent

### ✅ 2. Nút Feedback góc phải
- **Vị trí**: Góc dưới bên phải màn hình (fixed)
- **Chức năng**:
  - Đánh giá bằng sao (1-5 ⭐)
  - Viết nhận xét
  - Đề xuất tính năng mới
- **Animation**: Smooth fade-in/out với success state

### ✅ 3. Nút Statistics Dashboard
- **Vị trí**: Ngay phía trên nút Feedback
- **Chức năng**:
  - Xem tổng lượt xem và số người dùng
  - Xếp hạng màn hình theo popularity
  - Top 3 được highlight vàng
  - Refresh real-time từ Google Sheets

---

## 🚀 Cài đặt nhanh - 5 bước

### Bước 1️⃣: Tạo Google Sheet
```
1. Mở: https://sheets.google.com
2. Tạo sheet mới: "AppRBT Analytics"
3. Copy Sheet ID từ URL
```

### Bước 2️⃣: Deploy Apps Script
```
1. Mở file: appscript/Code.gs
2. Copy toàn bộ code
3. Trong Google Sheet: Extensions > Apps Script
4. Paste code vào
5. Thay SHEET_ID ở dòng 8
6. Deploy > New deployment > Web app
7. Copy Web App URL
```

### Bước 3️⃣: Cấu hình Frontend (Chọn 1 trong 2 cách)

#### Cách 1: Dùng Environment Variable (Khuyến nghị)
```bash
# Copy file .env.example
cp .env.example .env.local

# Sửa .env.local
NEXT_PUBLIC_APPSCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

#### Cách 2: Hard-code trong file
Sửa trực tiếp trong file `lib/appscript.ts` dòng 7:
```typescript
const APPSCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

### Bước 4️⃣: Test
```bash
npm run dev
```
Mở app → Chuyển màn hình → Check Google Sheet có data

### Bước 5️⃣: Deploy Production
```bash
npm run build
npm run start
```

---

## 📁 Cấu trúc Files mới

```
approbotics/
├── appscript/
│   ├── Code.gs                    # Apps Script server
│   └── README.md                  # Hướng dẫn chi tiết
├── app/
│   ├── components/
│   │   ├── FeedbackButton.tsx     # Nút feedback
│   │   └── StatisticsButton.tsx   # Nút thống kê
│   └── hooks/
│       └── usePageTracking.ts     # Hook tracking
├── lib/
│   └── appscript.ts               # API helpers
└── .env.example                   # Template config
```

---

## 🎨 UI/UX

### Feedback Button
- **Màu sắc**: Gradient purple → pink
- **Icon**: MessageSquare
- **Hover**: Scale 1.1x
- **Badge**: Red dot pulsing

### Statistics Button
- **Màu sắc**: Gradient blue → cyan
- **Icon**: BarChart3
- **Position**: Above feedback button
- **Hover**: Scale 1.1x

### Modal Design
- **Background**: Dark blur overlay
- **Card**: Glassmorphism style
- **Animation**: Fade-in + Zoom-in
- **Success**: Green checkmark animation

---

## 📊 Google Sheets Structure

### Sheet 1: PageViews
Tự động ghi log mỗi lần chuyển màn hình

### Sheet 2: Feedback
Phân loại theo màu:
- 🟢 Rating 4-5: Hài lòng
- 🟡 Rating 3: Trung bình
- 🔴 Rating 1-2: Không hài lòng

### Sheet 3: Statistics
Tự động tính toán:
- Tổng views mỗi screen
- Unique users
- Top 3 highlight vàng/bạc/đồng

---

## 🔧 Tùy chỉnh

### Thay đổi vị trí buttons
File: `components/FeedbackButton.tsx` & `StatisticsButton.tsx`
```typescript
// Feedback: line ~192
"fixed bottom-6 right-6 z-50"

// Statistics: line ~59
"fixed bottom-24 right-6 z-50"
```

### Thay đổi màu gradient
```typescript
// Feedback button
"bg-gradient-to-r from-purple-500 to-pink-500"

// Statistics button
"bg-gradient-to-r from-blue-500 to-cyan-500"
```

### Thay đổi giới hạn ký tự
File: `components/FeedbackButton.tsx`
```typescript
maxLength={500}  // Comment
maxLength={300}  // Feature request
```

---

## 🐛 Troubleshooting

### ❌ "Apps Script URL not configured"
**Nguyên nhân**: Chưa setup Apps Script URL  
**Giải pháp**: Thêm URL vào `.env.local` hoặc `lib/appscript.ts`

### ❌ Feedback không gửi được
**Nguyên nhân**: Sai Apps Script URL hoặc chưa deploy  
**Giải pháp**: 
1. Check URL trong `.env.local`
2. Verify Apps Script đã deploy chưa
3. Test function `testFeedback()` trong Apps Script

### ❌ Statistics không load
**Nguyên nhân**: CORS error (normal với Apps Script)  
**Giải pháo**: 
- Console sẽ có warning CORS, ignore nó
- Check Google Sheet xem có data không
- Nếu không có data → Chưa có lượt truy cập

### ❌ "Permission denied" trong Apps Script
**Nguyên nhân**: Chưa authorize  
**Giải pháo**:
1. Mở Apps Script Editor
2. Run function `testPageView`
3. Authorize quyền khi được hỏi

---

## 📈 Best Practices

### 1. Privacy
- User ID = Random string (không lưu thông tin cá nhân)
- Session ID = Tạo mới mỗi session
- Không track IP chi tiết

### 2. Performance
- Page tracking: Fire & forget (no blocking)
- Feedback: No-cors mode
- Statistics: Cache trong component

### 3. Analytics
- Kiểm tra Statistics mỗi ngày
- Đọc Feedback để cải thiện app
- Focus vào top 3 màn hình được dùng nhiều

---

## 🎯 Metrics quan trọng

### Views
- **Cao**: Màn hình được quan tâm
- **Thấp**: Cần cải thiện UI/UX hoặc ít người biết

### Unique Users
- So sánh với Total Views → Tỷ lệ người quay lại
- Cao = Màn hình hữu ích

### Feedback Rating
- Trung bình ≥ 4.0: Good
- Trung bình 3.0-4.0: Need improvement
- Trung bình < 3.0: Urgent fix needed

---

## 📞 Support

### Documentation
- **Apps Script**: `appscript/README.md`
- **API Helpers**: `lib/appscript.ts` (có JSDoc)

### Debugging
```typescript
// Enable console logs
localStorage.setItem('debug_tracking', 'true');

// Clear user data (reset tracking)
import { clearUserData } from '@/lib/appscript';
clearUserData();
```

---

## ✅ Checklist hoàn thành

- [ ] Tạo Google Sheet
- [ ] Deploy Apps Script
- [ ] Copy Apps Script URL
- [ ] Cập nhật `.env.local` hoặc `lib/appscript.ts`
- [ ] Test tracking: Chuyển màn hình → Check Sheet
- [ ] Test feedback: Gửi feedback → Check Sheet
- [ ] Test statistics: Click nút thống kê → Xem data
- [ ] Deploy production

---

## 🎉 Kết quả

Sau khi setup xong, bạn sẽ có:

✅ Hệ thống tracking tự động  
✅ Nút feedback đẹp, dễ dùng  
✅ Dashboard thống kê real-time  
✅ Data được lưu an toàn trong Google Sheets  
✅ Hiểu rõ user behavior  
✅ Thu thập feedback để cải thiện app  

**Chúc mừng! Bạn đã có hệ thống analytics hoàn chỉnh! 🚀**
