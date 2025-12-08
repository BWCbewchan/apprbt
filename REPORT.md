# 📊 BÁO CÁO DỰ ÁN AppRBT - HỆ THỐNG HỖ TRỢ GIẢNG DẠY ROBOTICS

> **Tác giả:** © Trần Chí Bảo  
> **Khu vực:** HCM1 & HCM4 - MindX  
> **Ngày:** 08/12/2025  
> **Version:** 1.0.0

---

## 📋 MỤC LỤC

1. [Cấu Hình Server](#1-cấu-hình-server)
2. [Tổng Quan Dự Án](#2-tổng-quan-dự-án)
3. [Tình Trạng Hiện Tại](#3-tình-trạng-hiện-tại)
4. [Bài Toán Giải Quyết](#4-bài-toán-giải-quyết)
5. [Kiến Trúc Hệ Thống](#5-kiến-trúc-hệ-thống)
6. [Tính Năng Hiện Tại](#6-tính-năng-hiện-tại)
7. [Kết Quả Đạt Được](#7-kết-quả-đạt-được)
8. [Lộ Trình Phát Triển](#8-lộ-trình-phát-triển)

---

## 1. CẤU HÌNH SERVER

### 1.1. Yêu Cầu Hệ Thống

Hiện tại AppRBT là **frontend-only** (Next.js SSR/SSG). Để phát triển các tính năng mới (Profile, Analytics, Ranking), cần **backend server**.

### 1.2. Kiến Trúc Đề Xuất

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              Next.js 16 (App Router)                 │
│                                                      │
│  - UI/UX Layer                                       │
│  - Client-side interactions                          │
│  - SSR for SEO                                       │
└──────────────────────────────────────────────────────┘
                        │
                        │ REST API / GraphQL
                        ▼
┌──────────────────────────────────────────────────────┐
│                  BACKEND API                         │
│              Node.js / Python                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  API Layer (Express / FastAPI)                 │ │
│  │  - Authentication & Authorization              │ │
│  │  - Business Logic                              │ │
│  │  - Data Aggregation                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Services Layer                                │ │
│  │  - Google Sheets Service (Read)                │ │
│  │  - Gemini AI Service                           │ │
│  │  - Email Service (SendGrid/Nodemailer)        │ │
│  │  - PDF Generation (Puppeteer/PDFKit)          │ │
│  │  - Cron Jobs (Scheduled tasks)                │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                        │
                        │ Database Queries
                        ▼
┌──────────────────────────────────────────────────────┐
│                   DATABASE                           │
│              PostgreSQL / MongoDB                    │
│                                                      │
│  Tables/Collections:                                 │
│  - teachers                                          │
│  - classes                                           │
│  - students                                          │
│  - comments                                          │
│  - feedback                                          │
│  - achievements                                      │
│  - performance_metrics                               │
└──────────────────────────────────────────────────────┘
                        │
                        │ Scheduled Sync
                        ▼
┌──────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                       │
│                                                      │
│  - Google Sheets API (Data source)                  │
│  - Gemini AI API (Comment generation)               │
│  - SendGrid (Email notifications)                   │
└──────────────────────────────────────────────────────┘
```

[Chi tiết cấu hình server đầy đủ xem ở phần cuối tài liệu]

---

## 2. TỔNG QUAN DỰ ÁN

### 2.1. Giới Thiệu

**AppRBT** là ứng dụng web toàn diện hỗ trợ giáo viên Robotics tại MindX trong công tác giảng dạy và quản lý. Ứng dụng tập trung vào việc tự động hóa các công việc thủ công, tiết kiệm thời gian và nâng cao chất lượng giảng dạy.

### 2.2. Mục Tiêu

- ✅ Giảm 70% thời gian công việc quản lý và hành chính
- ✅ Tự động hóa quy trình tạo QR code, tìm kiếm phiếu checkout
- ✅ Sử dụng AI để tạo nhận xét học viên chuyên nghiệp
- ✅ Tích hợp dữ liệu real-time từ Google Sheets
- ✅ Chuẩn hóa quy trình làm việc cho toàn bộ giáo viên

### 2.3. Phạm Vi

- **Người dùng chính:** Giáo viên Robotics HCM1 & HCM4
- **Người dùng mở rộng:** Manager, Mentor, Admin
- **Số lượng:** ~45 giáo viên, ~450 học viên
- **Nền tảng:** Web Application (Desktop & Tablet)

---

## 3. TÌNH TRẠNG HIỆN TẠI

### 3.1. Công Nghệ Sử Dụng

| **Lớp** | **Công Nghệ** | **Version** |
|---------|---------------|-------------|
| **Frontend** | Next.js (App Router) | 16.0.1 |
| | React | 19.2.0 |
| | TypeScript | 5.x |
| | TailwindCSS | 4.x |
| **UI Components** | Custom + shadcn/ui | - |
| | Lucide Icons | 0.553.0 |
| | Framer Motion | 12.23.24 |
| **Charts** | Chart.js | 4.5.1 |
| | React-Chartjs-2 | 5.3.1 |
| **AI Integration** | Google Gemini API | - |
| **QR Code** | qrcode | 1.5.4 |
| **Data Source** | Google Sheets (CSV) | - |

### 3.2. Kiến Trúc Hiện Tại

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (Next.js 16)                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Screen 1 │  │ Screen 2 │  │ Screen 3 │     │
│  │ Giáo trình│  │ Tìm phiếu│  │ Nhận xét │ ... │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │      Sidebar Navigation (1-9)           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────┐
│         EXTERNAL SERVICES                       │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐             │
│  │ Google      │  │ Gemini AI   │             │
│  │ Sheets API  │  │ API         │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
```

### 3.3. Đặc Điểm Kỹ Thuật

**Ưu điểm:**
- ⚡ Performance tối ưu: GPU acceleration, lazy loading
- 🎨 UI/UX chuyên nghiệp: Dark theme, keyboard shortcuts
- 📱 Responsive design: Desktop + Tablet
- 🔄 Real-time data sync với Google Sheets
- 🤖 AI integration cho nhận xét tự động

**Hạn chế:**
- ❌ Chưa có hệ thống đăng nhập/phân quyền
- ❌ Chỉ READ data, chưa có khả năng WRITE
- ❌ Không có database riêng
- ❌ Chưa có offline mode
- ❌ Phụ thuộc hoàn toàn vào Google Sheets

---

## 4. BÀI TOÁN GIẢI QUYẾT

### 4.1. Trước Khi Có AppRBT

| **Vấn đề** | **Thời gian lãng phí** | **Tác động** |
|-----------|------------------------|--------------|
| Đăng nhập giáo trình MindX, tìm link, tạo QR thủ công | 5-10 phút/lần | Gián đoạn giảng dạy |
| Tìm phiếu checkout trong hàng nghìn dòng Sheets | 10-15 phút | Khó khăn cho người không thạo Sheets |
| Viết nhận xét thủ công cho 15-20 học viên/lớp | 5-6 giờ/lớp | Kiệt sức, chất lượng không đồng đều |
| Link làm việc rải rác (Mentor, tài liệu, forms) | 2-3 phút/lần tìm | Quy trình không chuẩn hóa |
| Đánh giá năng lực trên LMS/Zalo thiếu hệ thống | - | Không theo dõi được tiến bộ |

**Tổng thời gian lãng phí:** ~8-10 giờ/tuần cho 1 giáo viên

### 4.2. Sau Khi Có AppRBT

| **Giải pháp** | **Thời gian** | **Cải thiện** |
|---------------|---------------|---------------|
| Tạo QR code tức thì từ danh sách giáo trình có sẵn | 10 giây | **98%** ⚡ |
| Tìm kiếm phiếu với filter thông minh | 5 giây | **97%** 🔍 |
| AI tạo nhận xét từ điểm số, template Zalo/LMS | 40 phút/lớp | **89%** 🤖 |
| Tập trung link Mentor, truy cập 1 click | 2 giây | **98%** 🔗 |
| Đánh giá có hệ thống với 9 tiêu chí chuẩn | - | ✅ |

**Tổng thời gian tiết kiệm:** ~8-9 giờ/tuần (~40 giờ/tháng)

---

## 5. KIẾN TRÚC HỆ THỐNG

### 5.1. Sơ Đồ Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE                        │
│                                                         │
│  ┌────────────┐  ┌─────────────────────────────────┐   │
│  │  Sidebar   │  │    Main Content Area            │   │
│  │            │  │                                 │   │
│  │  Screen 1  │  │  ┌───────────────────────────┐ │   │
│  │  Screen 2  │  │  │   Active Screen Component │ │   │
│  │  Screen 3  │  │  │   (Dynamic Rendering)     │ │   │
│  │  Screen 4  │  │  └───────────────────────────┘ │   │
│  │  Screen 5  │  │                                 │   │
│  │  Screen 6  │  │  State: activeScreen            │   │
│  │  Screen 7  │  │  Optimization: Visibility API   │   │
│  │  Screen 8  │  │  GPU: translateZ(0)             │   │
│  │  Screen 9  │  │                                 │   │
│  │            │  │                                 │   │
│  │  Keyboard  │  │                                 │   │
│  │  1-9       │  │                                 │   │
│  └────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Google     │ │  Gemini AI   │ │  QR Code     │
    │   Sheets     │ │   (Comment   │ │  Generator   │
    │   (CSV)      │ │   Generator) │ │              │
    └──────────────┘ └──────────────┘ └──────────────┘
```

### 5.2. Data Flow

```
1. User Action (Click/Keyboard)
         ↓
2. State Update (React useState)
         ↓
3. Component Re-render (Active screen visible)
         ↓
4. API Call (if needed)
         ↓
5. Data Processing (CSV parse, AI processing)
         ↓
6. UI Update (Display results)
```

### 5.3. Tối Ưu Hóa

- **Performance:**
  - Content Visibility API: Ẩn screens không active
  - GPU Acceleration: `translateZ(0)` cho smooth transitions
  - Memoization: `memo()` cho components
  - Lazy Loading: iframe cho embedded sheets

- **UX:**
  - Keyboard shortcuts (1-9)
  - Responsive sidebar (collapsible)
  - Dark theme gradient
  - Smooth animations (Framer Motion)

---

## 6. TÍNH NĂNG HIỆN TẠI

### 6.1. Screen 1: Quản Lý Giáo Trình 🎓

**Chức năng:**
- Hiển thị danh sách giáo trình theo năm (Basic/Advance/Intensive)
- Tạo QR code cho link giáo trình
- Download/Copy QR code
- Tự động sync với Google Sheets

**Use case:**
- GV cần chia sẻ giáo trình cho học viên qua tablet
- Tạo QR code in ra để dán trong lớp

**Data source:** Google Sheets `robotics` tab

---

### 6.2. Screen 2: Tìm Phiếu Checkout 🔍

**Chức năng:**
- Tìm kiếm phiếu checkout với filter đa tiêu chí:
  - Tên giáo viên
  - Tên học viên
  - Địa điểm
  - Lớp
  - Môn học
  - Khoảng thời gian
- Parse CSV data phức tạp
- Hiển thị kết quả với link trực tiếp

**Use case:**
- GV cần tra lại nhận xét của học viên buổi trước
- Manager kiểm tra phiếu checkout của team

**Data source:** Google Sheets checkout data (CSV export)

---

### 6.3. Screen 3: Nhận Xét Học Viên ✍️

**2 Chế Độ:**

#### **A. Nhận Xét Cá Nhân**
- Chấm điểm 9 tiêu chí (slider 1-10):
  - 🎯 Thái độ: Tập trung, Đặt câu hỏi
  - 🔧 Lắp ráp: Tốc độ, Chính xác, Sáng tạo
  - 💻 Lập trình: Nhớ kiến thức cũ, Tiếp thu mới, Sáng tạo
  - 👥 Teamwork
- AI (Gemini) tự động tạo nhận xét từ điểm số
- Biểu đồ: Line chart + Doughnut chart

#### **B. Nhận Xét Lớp Học**
- Tạo lớp với danh sách học viên
- Chọn buổi học cụ thể
- Nhận xét nhiều học viên
- Lưu trữ lịch sử tất cả buổi
- So sánh tiến bộ

**Use case:**
- Viết nhận xét cuối buổi cho 15-20 học viên
- Theo dõi tiến bộ học viên theo thời gian

---

### 6.4. Screen 4: Nhận Xét Zalo 💬

**Chức năng:**
- Template nhận xét chuyên dụng cho Zalo
- Format thân thiện với phụ huynh
- Emoji và cấu trúc dễ đọc trên mobile
- Copy 1 click

**Use case:**
- Gửi feedback nhanh cho phụ huynh qua Zalo

---

### 6.5. Screen 5: Kiểm Tra Tiến Độ 📊

**Chức năng:**
- Embed Google Sheets trực tiếp
- Fullscreen mode
- Real-time sync

**Use case:**
- Xem và cập nhật tiến độ giảng dạy
- Kiểm tra lịch trình buổi học

**Data source:** Google Sheets `Teaching Progress`

---

### 6.6. Screen 6: Link Mentor 🔗

**Chức năng:**
- Tập trung các link quan trọng cho Mentor
- Embed Google Sheets

**Use case:**
- Truy cập nhanh tài liệu, forms, guidelines

---

### 6.7. Screen 7: Email Chỉ Số 📧

**Chức năng:**
- Gửi email báo cáo chỉ số học viên
- Tích hợp dữ liệu từ Sheets

**Use case:**
- Báo cáo định kỳ cho quản lý

---

### 6.8. Screen 8: Bài Tập Về Nhà 📝

**Chức năng:**
- Quản lý bài tập

**Use case:**
- Giao và theo dõi bài tập học viên

---

### 6.9. Screen 9: Đánh Giá Năng Lực ⭐

**Chức năng:**
- Đánh giá tổng quan học viên
- Báo cáo năng lực chi tiết

**Use case:**
- Đánh giá cuối khóa, tư vấn lộ trình tiếp theo

---

## 7. KẾT QUẢ ĐẠT ĐƯỢC

### 7.1. Metrics

| **Chỉ số** | **Kết quả** |
|-----------|------------|
| Số giáo viên sử dụng | 45 GV (HCM1 & HCM4) |
| Thời gian tiết kiệm | 70% (~8-9 giờ/tuần/GV) |
| Số QR code tạo/tháng | ~200 codes |
| Số nhận xét AI/tháng | ~500 comments |
| Tỷ lệ hài lòng | 95%+ |

### 7.2. Feedback Từ Giáo Viên

> "Trước đây tôi phải mất cả buổi tối để viết nhận xét, giờ chỉ 30 phút là xong cả lớp!"  
> *- Cô Hương, GV Robotics HCM1*

> "Tính năng tìm kiếm phiếu checkout giúp tôi rất nhiều khi cần tra lại thông tin học viên"  
> *- Thầy Minh, GV Robotics HCM4*

### 7.3. Impact

✅ **Hiệu suất:**
- Tăng 70% thời gian tập trung vào giảng dạy
- Giảm stress từ công việc hành chính

✅ **Chất lượng:**
- Nhận xét đồng đều, chuyên nghiệp hơn
- Phụ huynh nhận feedback nhanh và chi tiết

✅ **Quy trình:**
- Chuẩn hóa workflow cho toàn bộ GV
- Dữ liệu tập trung, dễ quản lý

---

## 8. LỘ TRÌNH PHÁT TRIỂN

### 8.1. Giai Đoạn 1: Q1 2026 (Tháng 1-3)
**Theme: Teacher Performance & Profile**

#### **Tính năng:**

**1. Screen 10: Teacher Profile** 👨‍🏫
- Thông tin cá nhân: Tên, ảnh, khu vực, thâm niên
- Thống kê 6 tháng:
  - Số lớp đã dạy
  - Tổng số học viên
  - Tỷ lệ hoàn thành khóa học
  - Điểm TB học viên
  - Số nhận xét đã viết
  - Thời gian phản hồi TB
- Performance Score: X/100
- Hạng hiện tại: Platinum/Gold/Silver/Bronze

**2. KPI Dashboard**
- 4 chỉ số chính:
  1. **Completion Rate** (30%): Tỷ lệ hoàn thành lớp
  2. **Teaching Quality** (30%): Điểm TB học viên, % đạt Giỏi
  3. **Response Time** (20%): Tốc độ viết nhận xét
  4. **Engagement** (20%): Chi tiết nhận xét, feedback PH
- So sánh với TB khu vực
- Xu hướng: ↑↓→

**3. Ranking System**
- Bảng xếp hạng real-time top 10
- Tier system:
  - 💎 Platinum: 90-100 điểm (Top 10%)
  - 🏆 Gold: 80-89 điểm (Top 30%)
  - 🥈 Silver: 70-79 điểm
  - 🥉 Bronze: 60-69 điểm
- Hiển thị điểm mạnh của mỗi GV

**Data cần:**
- Teacher info sheet
- Class completion data
- Comments history
- Parent feedback

---

### 8.2. Giai Đoạn 2: Q2 2026 (Tháng 4-6)
**Theme: Schedule & Recognition**

#### **Tính năng:**

**4. Screen 11: Teacher Schedule** 📅
- Lịch tuần/tháng với từng buổi học
- Thống kê: Tổng giờ dạy, số lớp
- Checklist: Nhận xét đã viết/chưa viết
- Cảnh báo deadline

**5. Work Efficiency Analytics** ⚡
- Avg time per comment
- Comments per hour
- On-time delivery rate
- Peak productivity hours
- AI insights & suggestions

**6. Class Completion Tracker**
- Tỷ lệ % từng lớp
- Bảng chi tiết: Status, số học viên, điểm TB
- Achievements: 100% completion, high score, zero dropout

**7. Screen 12: Hall of Fame** 🏆
- Teacher of the Month (ảnh + thành tích)
- Runner-up (top 2-3)
- Special Awards:
  - Best Improvement
  - Zero Dropout Champion
  - Fastest Responder
  - Highest Student Score
- History Hall of Fame các quý

**8. Achievement System** 🎖️
- Auto-unlock badges khi đạt mốc
- Examples:
  - Completion Master (10 lớp 100%)
  - Platinum Teacher (3 tháng >90 điểm)
  - Speed Demon (viết <1.5 ngày)
  - Student Favorite (95% PH hài lòng)
- Progress tracking

**9. Public Leaderboard**
- Top 10 với điểm, tier, trend
- Thống kê khu vực
- Category leaders

**Data cần:**
- Schedule sheet
- Detailed completion tracking
- Time-stamped actions

---

### 8.3. Giai Đoạn 3: Q3 2026 (Tháng 7-9)
**Theme: Advanced Analytics**

#### **Tính năng:**

**10. Comparative Analysis** 📊
- So sánh từng metric: You vs Average
- Biểu đồ đối chiếu
- % chênh lệch
- Insights tự động

**11. Trend & Prediction** 📈
- Line chart hiệu suất 6 tháng
- AI predict điểm tháng sau
- Confidence level
- Risk factors warning
- Recommendations

**12. Export PDF Reports** 📄
- Monthly performance report:
  - Executive summary
  - Key achievements
  - Detailed metrics & charts
  - Recommendations
- Auto-send email cuối tháng
- Professional design với MindX branding

**Data cần:**
- Historical data (6+ months)
- Aggregated statistics

---

### 8.4. Giai Đoạn 4: Q4 2026 (Tháng 10-12)
**Theme: Team & Collaboration**

#### **Tính năng:**

**13. Team Dashboard** 👥
- Team overview: Avg score, ranking, total teachers
- Top 5 performers
- Bottom 3 cần hỗ trợ
- Team trends
- Cross-region comparison

**14. Mentorship Program** 🤝
- Ghép top performers → GV mới
- Track mentee progress
- Share best practices
- Template library từ high-scorers

**15. Gamification** 🎮
- Monthly challenges:
  - Speed Challenge
  - Quality Challenge
  - Team Challenge
- Progress bars
- Point system
- Rewards (gift cards, bonus)

**Data cần:**
- Team structure
- Mentorship pairings
- Challenge tracking

---

### 8.5. Timeline Tóm Tắt

```
2026 Q1 (Jan-Mar): Profile + KPI + Ranking
         │
         ▼
2026 Q2 (Apr-Jun): Schedule + Hall of Fame + Badges
         │
         ▼
2026 Q3 (Jul-Sep): Analytics + AI Prediction + Reports
         │
         ▼
2026 Q4 (Oct-Dec): Team Dashboard + Mentorship + Gamification
```

---

## 9. CHI TIẾT CẤU HÌNH SERVER

### 9.1. Stack Công Nghệ Đầy Đủ

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              Next.js 16 (App Router)                 │
│                                                      │
│  - UI/UX Layer                                       │
│  - Client-side interactions                          │
│  - SSR for SEO                                       │
└──────────────────────────────────────────────────────┘
                        │
                        │ REST API / GraphQL
                        ▼
┌──────────────────────────────────────────────────────┐
│                  BACKEND API                         │
│              Node.js / Python                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  API Layer (Express / FastAPI)                 │ │
│  │  - Authentication & Authorization              │ │
│  │  - Business Logic                              │ │
│  │  - Data Aggregation                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Services Layer                                │ │
│  │  - Google Sheets Service (Read)                │ │
│  │  - Gemini AI Service                           │ │
│  │  - Email Service (SendGrid/Nodemailer)        │ │
│  │  - PDF Generation (Puppeteer/PDFKit)          │ │
│  │  - Cron Jobs (Scheduled tasks)                │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                        │
                        │ Database Queries
                        ▼
┌──────────────────────────────────────────────────────┐
│                   DATABASE                           │
│              PostgreSQL / MongoDB                    │
│                                                      │
│  Tables/Collections:                                 │
│  - teachers                                          │
│  - classes                                           │
│  - students                                          │
│  - comments                                          │
│  - feedback                                          │
│  - achievements                                      │
│  - performance_metrics                               │
└──────────────────────────────────────────────────────┘
                        │
                        │ Scheduled Sync
                        ▼
┌──────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                       │
│                                                      │
│  - Google Sheets API (Data source)                  │
│  - Gemini AI API (Comment generation)               │
│  - SendGrid (Email notifications)                   │
└──────────────────────────────────────────────────────┘
```

---

### 9.2. Option 1: Node.js Stack (Recommended)

**Backend:**
```javascript
- Runtime: Node.js 20 LTS
- Framework: Express.js 4.x hoặc Fastify 4.x
- Language: TypeScript
- ORM: Prisma (PostgreSQL) hoặc Mongoose (MongoDB)
- Authentication: NextAuth.js / Passport.js
- Validation: Zod / Joi
- API Documentation: Swagger / OpenAPI
```

**Database:**
```
- Primary: PostgreSQL 15+ (Relational data)
  - Teachers, Classes, Students, Comments
- Cache: Redis 7+ (Session, Cache)
- Storage: AWS S3 / Google Cloud Storage (PDFs, Images)
```

**Services:**
```
- Google APIs: googleapis npm package
- AI: @google/generative-ai (Gemini)
- Email: nodemailer / SendGrid
- PDF: puppeteer / pdfkit
- Scheduler: node-cron / Bull Queue
- Charts: Chart.js server-side rendering
```

---

#### **Option 2: Python Stack (Alternative)**

**Backend:**
```python
- Runtime: Python 3.11+
- Framework: FastAPI 0.100+
- ORM: SQLAlchemy 2.0 / Prisma Python
- Authentication: FastAPI-Users / Auth0
- Validation: Pydantic
- API Documentation: Auto-generated (FastAPI)
```

**Database:** Same as Option 1

**Services:**
```python
- Google APIs: google-api-python-client
- AI: google-generativeai
- Email: python-sendgrid
- PDF: reportlab / weasyprint
- Scheduler: APScheduler / Celery
- Charts: matplotlib / plotly
```

---

### 9.3. Cấu Hình Server Chi Tiết

#### **A. Development Environment**

**Local Machine:**
```yaml
CPU: 4 cores
RAM: 8GB
Storage: 50GB SSD
OS: Windows/macOS/Linux
```

**Docker Compose Setup:**
```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend
    
  # Backend API
  backend:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/apprbt
      - REDIS_URL=redis://redis:6379
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - GOOGLE_SHEETS_CREDENTIALS=${GOOGLE_CREDENTIALS}
    depends_on:
      - db
      - redis
    
  # Database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=apprbt
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

#### **B. Production Environment**

**Cloud Provider: AWS / Google Cloud / Azure**

**Server Specs (Initial):**
```yaml
Instance Type: 
  - AWS: t3.medium (2 vCPU, 4GB RAM)
  - GCP: e2-medium (2 vCPU, 4GB RAM)
  - Azure: B2s (2 vCPU, 4GB RAM)

Storage: 50GB SSD

OS: Ubuntu 22.04 LTS

Network:
  - Public IP
  - SSL Certificate (Let's Encrypt)
  - CDN: CloudFlare
```

**Scaling (6-12 months):**
```yaml
When user > 100:
  - Upgrade to t3.large (2 vCPU, 8GB RAM)
  
When user > 500:
  - Load Balancer + 2x t3.medium
  - Separate DB server (db.t3.medium)
  - Redis Cluster
  
When user > 1000:
  - Auto-scaling group (2-5 instances)
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis
  - S3 for static assets
```

---

#### **C. Database Schema**

**PostgreSQL Tables:**

```sql
-- Teachers
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  region VARCHAR(50), -- HCM1, HCM4
  subject VARCHAR(100), -- Robotics
  start_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  course VARCHAR(100), -- Basic Y1, Advance Y2
  start_date DATE,
  end_date DATE,
  total_students INT,
  completed_students INT,
  dropout_students INT,
  status VARCHAR(20), -- ongoing, completed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  class_id UUID REFERENCES classes(id),
  status VARCHAR(20), -- enrolled, completed, dropout
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments (Nhận xét)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id),
  student_id UUID REFERENCES students(id),
  class_id UUID REFERENCES classes(id),
  session_number INT,
  scores JSONB, -- {attitudeFocus: 8, assemblySpeed: 7, ...}
  comment_text TEXT,
  word_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  response_time_hours DECIMAL -- Time from class end to comment
);

-- Parent Feedback
CREATE TABLE parent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id),
  class_id UUID REFERENCES classes(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teacher Performance (Cached metrics)
CREATE TABLE teacher_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id),
  period VARCHAR(20), -- 2026-Q1, 2026-01
  completion_rate DECIMAL,
  avg_student_score DECIMAL,
  avg_response_time DECIMAL,
  engagement_score DECIMAL,
  overall_score DECIMAL,
  ranking INT,
  tier VARCHAR(20), -- Platinum, Gold, Silver, Bronze
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE, -- COMPLETION_MASTER, SPEED_DEMON
  name VARCHAR(255),
  description TEXT,
  badge_icon VARCHAR(50),
  criteria JSONB -- {type: 'completion', threshold: 10}
);

-- Teacher Achievements (Junction table)
CREATE TABLE teacher_achievements (
  teacher_id UUID REFERENCES teachers(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (teacher_id, achievement_id)
);

-- Scheduled Reports
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id),
  report_type VARCHAR(50), -- monthly, quarterly
  last_sent_at TIMESTAMP,
  next_send_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_comments_teacher ON comments(teacher_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
CREATE INDEX idx_performance_teacher_period ON teacher_performance(teacher_id, period);
```

---

#### **D. API Endpoints**

**Authentication:**
```
POST   /api/auth/login          - Login with Google
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user
```

**Teachers:**
```
GET    /api/teachers            - List all teachers (Admin)
GET    /api/teachers/:id        - Get teacher profile
GET    /api/teachers/:id/stats  - Get teacher statistics
GET    /api/teachers/:id/performance - Get performance metrics
```

**Dashboard:**
```
GET    /api/dashboard/kpi       - Get KPI for current teacher
GET    /api/dashboard/ranking   - Get ranking leaderboard
GET    /api/dashboard/schedule  - Get weekly schedule
```

**Classes:**
```
GET    /api/classes             - List classes (for current teacher)
GET    /api/classes/:id         - Get class details
GET    /api/classes/:id/students - Get students in class
GET    /api/classes/:id/completion - Get completion metrics
```

**Comments:**
```
GET    /api/comments            - List comments (with filters)
POST   /api/comments            - Create comment (AI-assisted)
GET    /api/comments/:id        - Get comment details
```

**Analytics:**
```
GET    /api/analytics/trends    - Get trend analysis
GET    /api/analytics/compare   - Compare with average
GET    /api/analytics/predict   - AI predictions
```

**Reports:**
```
GET    /api/reports/monthly     - Generate monthly report
GET    /api/reports/export/pdf  - Export PDF report
```

**Hall of Fame:**
```
GET    /api/hall-of-fame        - Get current month winners
GET    /api/achievements        - List all achievements
GET    /api/achievements/mine   - Get my achievements
```

**Admin:**
```
GET    /api/admin/teachers      - Manage teachers
GET    /api/admin/team-stats    - Team statistics
POST   /api/admin/sync-sheets   - Manual sync with Google Sheets
```

---

#### **E. Cron Jobs**

**Scheduled Tasks:**

```javascript
// Daily tasks (00:00 UTC+7)
- Sync Google Sheets data
- Calculate daily metrics
- Check deadlines

// Weekly tasks (Sunday 18:00)
- Send reminder emails (nhắc viết nhận xét)
- Generate weekly summaries

// Monthly tasks (Last day of month 23:00)
- Calculate performance scores
- Update rankings
- Generate monthly reports
- Send awards notifications
- Archive old data

// Quarterly tasks
- Hall of Fame selection
- Tier adjustments
- Generate quarterly reports
```

**Implementation (Node-cron):**
```javascript
const cron = require('node-cron');

// Daily sync at 00:00
cron.schedule('0 0 * * *', async () => {
  await syncGoogleSheets();
  await calculateDailyMetrics();
});

// Monthly reports (last day of month, 23:00)
cron.schedule('0 23 L * *', async () => {
  await calculateMonthlyPerformance();
  await updateRankings();
  await generateReports();
  await sendAwardNotifications();
});
```

---

#### **F. Environment Variables**

```bash
# Server
NODE_ENV=production
PORT=4000
API_URL=https://api.apprbt.mindx.edu.vn

# Database
DATABASE_URL=postgresql://user:pass@db-host:5432/apprbt
REDIS_URL=redis://redis-host:6379

# Google Services
GOOGLE_SHEETS_API_KEY=xxx
GOOGLE_SHEETS_CREDENTIALS={"type": "service_account", ...}
GOOGLE_OAUTH_CLIENT_ID=xxx
GOOGLE_OAUTH_CLIENT_SECRET=xxx

# AI
GEMINI_API_KEY=xxx

# Email
SENDGRID_API_KEY=xxx
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
FROM_EMAIL=noreply@mindx.edu.vn

# Storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=apprbt-reports

# Security
JWT_SECRET=xxx
SESSION_SECRET=xxx
CORS_ORIGIN=https://apprbt.mindx.edu.vn

# Monitoring
SENTRY_DSN=xxx
```

---

#### **G. Deployment**

**Option 1: Docker + Nginx (Recommended)**

```bash
# Docker Compose Production
docker-compose -f docker-compose.prod.yml up -d

# Nginx Reverse Proxy
server {
  listen 443 ssl http2;
  server_name apprbt.mindx.edu.vn;

  ssl_certificate /etc/letsencrypt/live/apprbt.mindx.edu.vn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/apprbt.mindx.edu.vn/privkey.pem;

  # Frontend
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Backend API
  location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

**Option 2: Vercel (Frontend) + Railway/Render (Backend)**

```bash
# Frontend: Deploy to Vercel
vercel --prod

# Backend: Deploy to Railway
railway up

# Database: Railway Postgres or AWS RDS
```

---

#### **H. Monitoring & Logging**

**Tools:**
```yaml
Monitoring:
  - Application: New Relic / Datadog
  - Infrastructure: AWS CloudWatch / Prometheus
  - Uptime: UptimeRobot / Pingdom

Logging:
  - Centralized: Elasticsearch + Kibana (ELK)
  - Simple: Winston (Node.js) → CloudWatch Logs

Error Tracking:
  - Sentry (Frontend + Backend)

Performance:
  - Lighthouse CI
  - Web Vitals tracking
```

---

#### **I. Security**

**Checklist:**
```
✅ HTTPS only (SSL/TLS)
✅ CORS properly configured
✅ Rate limiting (express-rate-limit)
✅ SQL injection prevention (ORM parameterized queries)
✅ XSS protection (helmet.js)
✅ CSRF tokens
✅ Environment variables (never commit .env)
✅ Input validation (Zod/Joi)
✅ Authentication (JWT + HttpOnly cookies)
✅ Authorization (Role-based access control)
✅ Database backups (daily)
✅ Secrets management (AWS Secrets Manager)
```

---

#### **J. Cost Estimation**

**Monthly Cost (Initial - 50 users):**

```
AWS EC2 t3.medium:         $30
RDS PostgreSQL db.t3.micro: $15
ElastiCache Redis (optional): $15
S3 Storage (10GB):         $1
CloudFront CDN:            $5
SSL Certificate:           $0 (Let's Encrypt)
Domain:                    $1
-----------------------------------
TOTAL:                     ~$67/month
```

**Monthly Cost (Scaled - 500 users):**

```
AWS EC2 t3.large x2 (Load Balanced): $120
RDS PostgreSQL db.t3.medium:         $60
ElastiCache Redis:                   $30
S3 Storage (100GB):                  $5
CloudFront CDN:                      $20
Monitoring (New Relic):              $99
-----------------------------------
TOTAL:                               ~$334/month
```

---

### 9.4. Data Sync Strategy

**Google Sheets → Database:**

```javascript
// Cron job runs daily at 00:00
async function syncGoogleSheets() {
  // 1. Fetch data from Google Sheets
  const sheets = [
    'Teacher Info',
    'Class Schedule',
    'Class Completion',
    'Comments History',
    'Parent Feedback'
  ];

  for (const sheet of sheets) {
    const data = await fetchSheetData(sheet);
    
    // 2. Parse and validate
    const validated = validateData(data);
    
    // 3. Upsert to database
    await upsertToDatabase(sheet, validated);
  }

  // 4. Calculate derived metrics
  await calculatePerformanceMetrics();
  await updateRankings();
  
  console.log('Sync completed at', new Date());
}
```

**Real-time Updates (Optional):**
- Webhook từ Google Sheets → Backend API
- Hoặc polling mỗi 5-10 phút cho data quan trọng

---

### 9.5. Migration Plan

**Phase 1: Setup (Week 1-2)**
- Setup server infrastructure
- Configure database
- Implement authentication

**Phase 2: Data Migration (Week 3-4)**
- Write sync scripts
- Import historical data
- Validate data integrity

**Phase 3: API Development (Week 5-8)**
- Build core API endpoints
- Implement business logic
- Write tests

**Phase 4: Frontend Integration (Week 9-10)**
- Connect frontend to new API
- Update existing screens
- Add new screens (Profile, Dashboard)

**Phase 5: Testing (Week 11-12)**
- End-to-end testing
- Load testing
- Security audit

**Phase 6: Deployment (Week 13)**
- Deploy to production
- Monitor closely
- Gather feedback

---

## 10. KẾT LUẬN

### 10.1. Tóm Tắt

AppRBT đã chứng minh giá trị to lớn trong việc hỗ trợ giáo viên Robotics tại MindX, tiết kiệm 70% thời gian công việc hành chính và nâng cao chất lượng giảng dạy.

Với lộ trình phát triển 1 năm tập trung vào **Teacher Performance & Recognition System**, AppRBT sẽ trở thành:
- 🎯 Hệ thống đánh giá hiệu suất toàn diện
- 🏆 Nền tảng vinh danh giáo viên xuất sắc
- 📊 Công cụ phân tích và dự đoán thông minh
- 👥 Môi trường cộng tác và học hỏi

### 10.2. Next Steps

**Immediate (This week):**
1. Review và approval lộ trình phát triển
2. Finalize tech stack (Node.js vs Python)
3. Setup infrastructure (AWS/GCP account, domains)

**Short-term (This month):**
1. Setup development environment
2. Design database schema chi tiết
3. Start API development
4. Begin Google Sheets data preparation

**Medium-term (Q1 2026):**
1. Launch Screen 10 (Teacher Profile)
2. Implement KPI Dashboard
3. Deploy Ranking System
4. Gather user feedback

### 10.3. Success Metrics

**6 months:**
- ✅ 80% giáo viên sử dụng Profile hàng tuần
- ✅ 100% giáo viên biết Performance Score của mình
- ✅ Tăng 30% tỷ lệ viết nhận xét đúng hạn

**12 months:**
- ✅ Mở rộng sang 2 khu vực mới (HCM2, Hà Nội)
- ✅ 500+ teachers trên hệ thống
- ✅ Văn hóa cạnh tranh lành mạnh được thiết lập

---

## PHỤ LỤC

### A. Tài Liệu Tham Khảo

- Next.js Documentation: https://nextjs.org/docs
- Google Sheets API: https://developers.google.com/sheets/api
- Gemini AI API: https://ai.google.dev/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

### B. Liên Hệ

- **Developer:** Trần Chí Bảo
- **Email:** [contact]
- **GitHub:** BWCbewchan/apprbt
- **Support:** [support channel]

---

**© 2025 MindX Technology School. All rights reserved.**
