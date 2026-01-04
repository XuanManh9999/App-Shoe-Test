# 🏭 HỆ THỐNG ERP BÌNH VƯƠNG - QUẢN LÝ SẢN XUẤT GIÀY DÉP

<div align="center">
  <h3>🚀 Hệ thống quản lý sản xuất toàn diện cho xưởng giày dép</h3>
  <p>
    <strong>React 19 • TypeScript • Vite • TailwindCSS • Flask • MySQL</strong>
  </p>
</div>

---

## 📋 Tính năng chính

✅ **Quản lý Lệnh Sản Xuất** - Tạo, theo dõi tiến độ 7 công đoạn, kéo thả ưu tiên  
✅ **Quản lý Mã Hàng (BOM)** - Cấu tạo kỹ thuật, tài liệu Word-like, lịch sử cải tiến  
✅ **Xuất Hàng & Giao Nhận** - Phiếu giao hàng, tính toán tự động, in ấn  
✅ **Quản lý Khách Hàng** - Công nợ, hạn mức, cảnh báo quá hạn  
✅ **Báo Cáo Sản Lượng** - Biểu đồ, thống kê, xếp hạng mã hàng  
✅ **Phân Quyền Chi Tiết** - Admin, Kỹ thuật, Sản xuất, Viewer  
✅ **Responsive Design** - Hoạt động mượt mà trên mọi thiết bị  

---

## 🚀 Chạy nhanh (LocalStorage - Không cần MySQL)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy ứng dụng
npm run dev

# 3. Mở trình duyệt tại http://localhost:3000
```

**Đăng nhập:**
- Admin: `admin` / `123`
- Kỹ thuật: `kythuat` / `123`
- Sản xuất: `xuong` / `123`

---

## 📖 Hướng dẫn chi tiết

👉 **Xem file [HUONG_DAN_CHAY.md](./HUONG_DAN_CHAY.md)** để biết:
- Cài đặt đầy đủ (Frontend + Backend + MySQL)
- Cấu hình database
- Xử lý lỗi thường gặp
- Tính năng chi tiết từng module

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data Visualization
- **Lucide React** - Icons

### Backend (Tùy chọn)
- **Flask** - Python Web Framework
- **MySQL** - Database
- **Flask-CORS** - Cross-Origin Resource Sharing

---

## 📁 Cấu trúc dự án

```
├── components/          # React Components
│   ├── Dashboard.tsx
│   ├── OrderList.tsx
│   ├── OrderForm.tsx
│   ├── OrderDetail.tsx
│   ├── ShippingManager.tsx
│   ├── CustomerManager.tsx
│   ├── ModelManager.tsx
│   ├── ReportManager.tsx
│   ├── UserManager.tsx
│   └── Login.tsx
├── app.py              # Flask Backend API
├── schema.sql          # MySQL Database Schema
├── types.ts            # TypeScript Type Definitions
├── constants.ts        # App Constants
├── App.tsx             # Main App Component
├── index.tsx           # Entry Point
└── vite.config.ts      # Vite Configuration
```

---

## 🎯 Tài khoản mặc định

| Vai trò | Username | Password | Quyền hạn |
|---------|----------|----------|-----------|
| Admin | `admin` | `123` | Toàn quyền |
| Kỹ thuật | `kythuat` | `123` | Quản lý SX, BOM |
| Sản xuất | `xuong` | `123` | Xem & cập nhật tiến độ |

---

## 📸 Screenshots

### Dashboard
Tổng quan sản lượng, biểu đồ phân tích, công nợ

### Quản lý Lệnh Sản Xuất
Kéo thả ưu tiên, theo dõi 7 công đoạn, lọc thông minh

### Xuất Hàng
Lập phiếu giao hàng, tính toán tự động, in phiếu

### Báo Cáo
Lọc theo thời gian, xếp hạng mã hàng, thống kê chi tiết

---

## 🔧 Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run preview  # Preview production build
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Xem file [HUONG_DAN_CHAY.md](./HUONG_DAN_CHAY.md)
2. Kiểm tra console trình duyệt (F12)
3. Đảm bảo đã cài đặt đúng Node.js version 18+

---

## 📝 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại

---

<div align="center">
  <strong>🎉 Chúc bạn sử dụng thành công! 🎉</strong>
</div>
