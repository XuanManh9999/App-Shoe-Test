# ⚡ HƯỚNG DẪN NHANH - 5 PHÚT CHẠY DỰ ÁN

## 🎯 Cách nhanh nhất (Không cần MySQL)

### Bước 1: Cài đặt Node.js
Tải và cài đặt Node.js từ: https://nodejs.org/ (Chọn bản LTS)

### Bước 2: Mở Terminal/CMD trong thư mục dự án

**Windows:** Shift + Chuột phải → "Open PowerShell window here"  
**macOS:** Chuột phải → "New Terminal at Folder"

### Bước 3: Chạy 2 lệnh này

```bash
npm install
npm run dev
```

### Bước 4: Mở trình duyệt

Truy cập: **http://localhost:3000**

### Bước 5: Đăng nhập

- **Admin:** `admin` / `123`
- **Kỹ thuật:** `kythuat` / `123`  
- **Sản xuất:** `xuong` / `123`

---

## ✅ Xong! Bắt đầu sử dụng

Dữ liệu sẽ được lưu trong trình duyệt (LocalStorage), không cần database.

---

## 🐛 Gặp lỗi?

### Lỗi: "npm: command not found"
→ Chưa cài Node.js, quay lại Bước 1

### Lỗi: "Port 3000 is already in use"
→ Đóng ứng dụng khác đang chạy port 3000, hoặc đổi port trong `vite.config.ts`

### Lỗi: "Cannot find module"
→ Chạy lại: `npm install`

### Màn hình trắng
→ Xóa cache trình duyệt (Ctrl+Shift+Del) và tải lại trang

---

## 📖 Muốn tìm hiểu thêm?

Xem file **[HUONG_DAN_CHAY.md](./HUONG_DAN_CHAY.md)** để biết:
- Cách cài đặt MySQL (nếu muốn)
- Tính năng chi tiết
- Xử lý lỗi nâng cao

---

## 🎉 Chúc bạn thành công!

