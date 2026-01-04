# 🏭 HƯỚNG DẪN CHẠY DỰ ÁN - HỆ THỐNG ERP BÌNH VƯƠNG

## 📋 Mục Lục
1. [Giới thiệu](#giới-thiệu)
2. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
3. [Cài đặt](#cài-đặt)
4. [Chạy dự án](#chạy-dự-án)
5. [Đăng nhập](#đăng-nhập)
6. [Tính năng chính](#tính-năng-chính)
7. [Xử lý lỗi](#xử-lý-lỗi)

---

## 🎯 Giới thiệu

**Hệ thống ERP Bình Vương** là ứng dụng quản lý sản xuất giày dép toàn diện, bao gồm:
- ✅ Quản lý lệnh sản xuất
- ✅ Quản lý mã hàng (BOM)
- ✅ Quản lý khách hàng & công nợ
- ✅ Xuất hàng & giao nhận
- ✅ Báo cáo sản lượng
- ✅ Phân quyền người dùng

**Công nghệ sử dụng:**
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** Flask (Python) + MySQL
- **State Management:** LocalStorage (có thể nâng cấp lên Backend API)

---

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết:

1. **Node.js** (phiên bản 18 trở lên)
   - Tải tại: https://nodejs.org/

2. **Python** (phiên bản 3.8 trở lên)
   - Tải tại: https://www.python.org/downloads/

3. **MySQL** (phiên bản 8.0 trở lên) - TÙY CHỌN
   - Tải tại: https://dev.mysql.com/downloads/mysql/
   - **LƯU Ý:** Dự án hiện tại chạy hoàn toàn với LocalStorage, không bắt buộc phải có MySQL

4. **Trình duyệt web** hiện đại (Chrome, Firefox, Edge)

---

## 🚀 Cài đặt

### Bước 1: Clone hoặc tải dự án

```bash
# Nếu có git
git clone <repository-url>
cd hệ-thống-quản-lý-sản-xuất-giày-dép-bình-vương

# Hoặc giải nén file zip đã tải về
```

### Bước 2: Cài đặt Frontend (React)

```bash
# Cài đặt các package Node.js
npm install

# Hoặc nếu dùng yarn
yarn install
```

### Bước 3: Cài đặt Backend (Flask) - TÙY CHỌN

**LƯU Ý:** Backend Flask chỉ cần thiết nếu bạn muốn sử dụng database MySQL thay vì LocalStorage.

```bash
# Tạo môi trường ảo Python (khuyến nghị)
python -m venv venv

# Kích hoạt môi trường ảo
# Trên Windows:
venv\Scripts\activate

# Trên macOS/Linux:
source venv/bin/activate

# Cài đặt các package Python
pip install -r requirements.txt
```

### Bước 4: Cấu hình Database MySQL - TÙY CHỌN

**Chỉ làm bước này nếu bạn muốn dùng MySQL:**

1. Tạo file `.env` từ file mẫu:
```bash
# Trên Windows
copy .env.example .env

# Trên macOS/Linux
cp .env.example .env
```

2. Chỉnh sửa file `.env` với thông tin MySQL của bạn:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=binh_vuong_erp
DB_PORT=3306
```

3. Tạo database và import schema:
```bash
# Đăng nhập MySQL
mysql -u root -p

# Trong MySQL console:
source schema.sql
# Hoặc
mysql -u root -p < schema.sql
```

---

## ▶️ Chạy dự án

### Chế độ 1: Chỉ Frontend (LocalStorage) - KHUYẾN NGHỊ CHO BẮT ĐẦU

Đây là cách đơn giản nhất, không cần MySQL:

```bash
# Chạy development server
npm run dev

# Hoặc
yarn dev
```

**Kết quả:**
- Ứng dụng sẽ chạy tại: `http://localhost:3000`
- Dữ liệu được lưu trong LocalStorage của trình duyệt
- Tất cả tính năng đều hoạt động đầy đủ

### Chế độ 2: Frontend + Backend (MySQL) - TÙY CHỌN

Nếu bạn muốn sử dụng database MySQL:

**Terminal 1 - Backend:**
```bash
# Kích hoạt môi trường ảo (nếu chưa)
venv\Scripts\activate  # Windows
# hoặc
source venv/bin/activate  # macOS/Linux

# Chạy Flask server
python app.py
```

**Terminal 2 - Frontend:**
```bash
# Chạy React app
npm run dev
```

**Kết quả:**
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Dữ liệu được lưu trong MySQL database

---

## 🔐 Đăng nhập

Hệ thống có 3 tài khoản mặc định:

### 1. Tài khoản Admin (Giám Đốc)
- **Username:** `admin`
- **Password:** `123`
- **Quyền hạn:** Toàn quyền (xem, sửa, xóa tất cả)

### 2. Tài khoản Kỹ Thuật
- **Username:** `kythuat`
- **Password:** `123`
- **Quyền hạn:** Quản lý lệnh sản xuất, mã hàng, trả hàng (không quản lý khách hàng)

### 3. Tài khoản Sản Xuất
- **Username:** `xuong`
- **Password:** `123`
- **Quyền hạn:** Chỉ xem và cập nhật tiến độ sản xuất

---

## 🎨 Tính năng chính

### 1. Dashboard (Bảng điều khiển)
- Tổng quan sản lượng
- Biểu đồ phân tích
- Theo dõi công nợ
- Cảnh báo lệnh cần giao

### 2. Quản lý Lệnh Sản Xuất
- ✅ Tạo lệnh mới với chi tiết màu và size
- ✅ Cập nhật tiến độ 7 công đoạn (Chặt → Mặt giày → Sườn → Đế → Gót → Gò → Đóng gói)
- ✅ Kéo thả sắp xếp ưu tiên
- ✅ Lọc theo tình trạng (Chưa xong, Hoàn thành, Hạn giao gần)
- ✅ Báo lỗi và tự động tạo lệnh bù
- ✅ In phiếu sản xuất

### 3. Quản lý Mã Hàng (BOM)
- ✅ Tạo mã hàng với thông số kỹ thuật đầy đủ
- ✅ Upload ảnh sản phẩm
- ✅ Soạn thảo tài liệu kỹ thuật (Word-like editor)
- ✅ Lịch sử cải tiến sản phẩm
- ✅ Kho lưu trữ (Archive)

### 4. Xuất Hàng & Giao Nhận
- ✅ Lập phiếu giao hàng từ lệnh đã hoàn thành
- ✅ Nhập số lượng thực xuất và đơn giá
- ✅ Tính toán tự động: Thành tiền, Cọc, Còn lại
- ✅ Lọc theo thời gian (Hôm nay, Tuần này, Tháng này, Tùy chỉnh)
- ✅ Lịch sử chỉnh sửa phiếu
- ✅ In phiếu giao hàng

### 5. Quản lý Khách Hàng & Công Nợ
- ✅ Hồ sơ khách hàng chi tiết
- ✅ Cấu hình hạn nợ và hạn mức nợ riêng
- ✅ Theo dõi công nợ theo từng phiếu giao
- ✅ Cảnh báo nợ quá hạn
- ✅ Ghi nhận thanh toán (Chuyển khoản/Tiền mặt)
- ✅ Lịch sử xuất hàng

### 6. Báo Cáo Sản Lượng
- ✅ Lọc theo thời gian linh hoạt (7 ngày, 30 ngày, 90 ngày, Tùy chỉnh)
- ✅ Biểu đồ phân tích
- ✅ Xếp hạng mã hàng sản xuất nhiều nhất
- ✅ Top khách hàng
- ✅ Thống kê lệnh sẵn sàng (SS >= 70%)

### 7. Quản lý Nhân Sự
- ✅ Tạo tài khoản người dùng
- ✅ Phân quyền chi tiết từng module
- ✅ Quyền Xem/Sửa/Xóa riêng biệt

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi 1: "Cannot find module"
**Nguyên nhân:** Chưa cài đặt dependencies

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi 2: Port 3000 đã được sử dụng
**Giải pháp:**
```bash
# Thay đổi port trong vite.config.ts
# Hoặc tắt ứng dụng đang chạy trên port 3000
```

### Lỗi 3: Database connection failed (nếu dùng MySQL)
**Kiểm tra:**
1. MySQL server đã chạy chưa?
2. Thông tin trong file `.env` có đúng không?
3. Database đã được tạo chưa?

**Giải pháp:**
```bash
# Kiểm tra MySQL
mysql -u root -p

# Tạo lại database
source schema.sql
```

### Lỗi 4: Màn hình trắng sau khi build
**Giải pháp:**
```bash
# Xóa cache và build lại
npm run build
```

### Lỗi 5: Dữ liệu bị mất sau khi tắt trình duyệt
**Nguyên nhân:** Đang dùng chế độ Incognito hoặc đã xóa cache

**Giải pháp:**
- Sử dụng trình duyệt ở chế độ bình thường
- Hoặc chuyển sang sử dụng MySQL backend

---

## 📱 Responsive Design

Ứng dụng được thiết kế responsive, hoạt động tốt trên:
- 💻 Desktop (1920x1080 trở lên)
- 💻 Laptop (1366x768 trở lên)
- 📱 Tablet (768px trở lên)
- 📱 Mobile (375px trở lên)

---

## 🔧 Cấu hình nâng cao

### Thay đổi port Frontend
Chỉnh sửa `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 8080, // Đổi port tại đây
    host: '0.0.0.0',
  },
  // ...
});
```

### Thay đổi port Backend
Chỉnh sửa `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)  # Đổi port tại đây
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại các bước cài đặt
2. Xem phần "Xử lý lỗi" ở trên
3. Kiểm tra console của trình duyệt (F12) để xem lỗi chi tiết

---

## 🎉 Chúc bạn sử dụng thành công!

**Hệ thống ERP Bình Vương** - Giải pháp quản lý sản xuất giày dép chuyên nghiệp

