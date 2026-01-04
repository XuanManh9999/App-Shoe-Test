# 🚀 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG VỚI BACKEND

## ✅ Đã Hoàn Thành

Hệ thống **Bình Vương ERP** đã được cài đặt và cấu hình đầy đủ với:

### 1. Backend Flask API
- ✅ Python 3.10.12 đã cài đặt
- ✅ Flask, Flask-CORS, MySQL Connector đã cài đặt
- ✅ MySQL Server đã cài đặt và đang chạy
- ✅ Database `binh_vuong_erp` đã được tạo
- ✅ Schema và dữ liệu mẫu đã được import

### 2. Frontend React
- ✅ Node.js dependencies đã cài đặt
- ✅ Vite development server đang chạy
- ✅ Lỗi JSX đã được sửa

## 🌐 Các Địa Chỉ Truy Cập

### Frontend (React + Vite)
- **Local**: http://localhost:3000/
- **Network**: http://222.255.214.187:3000/
- **Network**: http://172.17.0.1:3000/

### Backend (Flask API)
- **Local**: http://localhost:5000/
- **Network**: http://222.255.214.187:5000/
- **Health Check**: http://localhost:5000/api/health

## 📊 API Endpoints Đã Có

### Production Orders
- `GET /api/orders` - Lấy tất cả lệnh sản xuất
- `POST /api/orders` - Tạo lệnh sản xuất mới
- `PUT /api/orders/<id>` - Cập nhật lệnh sản xuất
- `DELETE /api/orders/<id>` - Xóa lệnh sản xuất

### Customers
- `GET /api/customers` - Lấy tất cả khách hàng
- `POST /api/customers` - Tạo khách hàng mới
- `PUT /api/customers/<id>` - Cập nhật khách hàng

### Product Models
- `GET /api/models` - Lấy tất cả mã hàng
- `POST /api/models` - Tạo mã hàng mới
- `PUT /api/models/<id>` - Cập nhật mã hàng
- `DELETE /api/models/<id>` - Xóa mã hàng

### Shipping Notes
- `GET /api/shipping` - Lấy tất cả phiếu giao hàng
- `POST /api/shipping` - Tạo phiếu giao hàng mới
- `PUT /api/shipping/<id>` - Cập nhật phiếu giao hàng

### Payments
- `GET /api/payments` - Lấy tất cả thanh toán
- `GET /api/payments/customer/<id>` - Lấy thanh toán theo khách hàng
- `POST /api/payments` - Tạo thanh toán mới

### Return Logs
- `GET /api/returns` - Lấy tất cả trả hàng
- `GET /api/returns/order/<id>` - Lấy trả hàng theo lệnh
- `POST /api/returns` - Tạo trả hàng mới

### Users & Authentication
- `POST /api/users/login` - Đăng nhập
- `GET /api/users` - Lấy tất cả người dùng
- `POST /api/users` - Tạo người dùng mới
- `PUT /api/users/<id>` - Cập nhật người dùng
- `DELETE /api/users/<id>` - Xóa người dùng

## 🔐 Tài Khoản Đăng Nhập

Hệ thống có 3 tài khoản mặc định đã được tạo trong database:

### 1. Admin (Giám Đốc)
- **Username**: `admin`
- **Password**: `123`
- **Quyền hạn**: Toàn quyền

### 2. Kỹ Thuật
- **Username**: `kythuat`
- **Password**: `123`
- **Quyền hạn**: Quản lý sản xuất, mã hàng

### 3. Sản Xuất
- **Username**: `xuong`
- **Password**: `123`
- **Quyền hạn**: Xem và cập nhật tiến độ

## 🔄 Trạng Thái Hệ Thống

### Đang Chạy:
1. ✅ **Frontend Vite Server** - Port 3000
2. ✅ **Backend Flask API** - Port 5000
3. ✅ **MySQL Database** - Port 3306

### Kiểm Tra Trạng Thái:
```bash
# Kiểm tra backend
curl http://localhost:5000/api/health

# Kiểm tra MySQL
mysql -u root -e "SHOW DATABASES;"

# Kiểm tra frontend
curl http://localhost:3000
```

## 📝 Lưu Ý Quan Trọng

### Hiện Tại:
- ⚠️ **Frontend vẫn đang sử dụng LocalStorage**
- ⚠️ Để kết nối frontend với backend, cần import file `api.ts` và thay thế localStorage bằng API calls
- ⚠️ Dữ liệu hiện tại được lưu riêng biệt: Frontend (LocalStorage) và Backend (MySQL)

### Để Sử Dụng Backend API:
Bạn có 2 lựa chọn:

#### Lựa chọn 1: Tiếp tục dùng LocalStorage (Hiện tại)
- Không cần thay đổi gì
- Dữ liệu lưu trong trình duyệt
- Không cần backend chạy

#### Lựa chọn 2: Chuyển sang sử dụng Backend API
- Cần chỉnh sửa file `App.tsx` để sử dụng `api.ts`
- Dữ liệu sẽ được lưu vào MySQL
- Có thể truy cập từ nhiều thiết bị
- Dữ liệu được bảo mật và backup tốt hơn

## 🛠️ Quản Lý Hệ Thống

### Dừng Hệ Thống:
```bash
# Dừng frontend
pkill -f "vite"

# Dừng backend
pkill -f "python3 app.py"

# Dừng MySQL
systemctl stop mysql
```

### Khởi động lại:
```bash
# Khởi động MySQL
systemctl start mysql

# Khởi động backend (trong terminal riêng)
cd /usr/local/App-Shoe-Test
python3 app.py

# Khởi động frontend (trong terminal riêng)
cd /usr/local/App-Shoe-Test
npm run dev
```

### Xem Log:
```bash
# Backend log
tail -f /root/.cursor/projects/usr-local-App-Shoe-Test/terminals/*.txt

# MySQL log
tail -f /var/log/mysql/error.log
```

## 🗄️ Quản Lý Database

### Truy cập MySQL:
```bash
mysql -u root
```

### Các lệnh hữu ích:
```sql
-- Xem tất cả database
SHOW DATABASES;

-- Sử dụng database
USE binh_vuong_erp;

-- Xem tất cả bảng
SHOW TABLES;

-- Xem dữ liệu
SELECT * FROM users;
SELECT * FROM customers;
SELECT * FROM production_orders;

-- Backup database
mysqldump -u root binh_vuong_erp > backup.sql

-- Restore database
mysql -u root binh_vuong_erp < backup.sql
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Backend không kết nối được database**
   ```bash
   systemctl status mysql
   mysql -u root -e "SELECT 1"
   ```

2. **Port đã được sử dụng**
   ```bash
   lsof -ti:5000 | xargs kill -9  # Backend
   lsof -ti:3000 | xargs kill -9  # Frontend
   ```

3. **Frontend không load được**
   ```bash
   cd /usr/local/App-Shoe-Test
   rm -rf node_modules
   npm install
   npm run dev
   ```

## 🎉 Kết Luận

Hệ thống đã sẵn sàng sử dụng! Bạn có thể:
- ✅ Truy cập frontend tại http://localhost:3000
- ✅ Đăng nhập với tài khoản admin/123
- ✅ Backend API sẵn sàng tại http://localhost:5000
- ✅ Database MySQL đang chạy và có dữ liệu mẫu

**Lưu ý**: Hiện tại frontend vẫn dùng LocalStorage. Nếu muốn kết nối với backend, cần chỉnh sửa code frontend để sử dụng API calls thay vì localStorage.

