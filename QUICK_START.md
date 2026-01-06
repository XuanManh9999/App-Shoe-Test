# 🚀 HƯỚNG DẪN NHANH - BÌNH VƯƠNG ERP

## ✅ Hệ thống đã được thiết lập và sẵn sàng sử dụng!

### 📋 Các lệnh chính:

#### 1. **Khởi động hệ thống** (Database + Backend + Frontend)
```bash
cd /usr/local/app-anh-vuong
./start-all.sh
```

#### 2. **Dừng hệ thống**
```bash
./stop-all.sh
```

#### 3. **Kiểm tra trạng thái**
```bash
./status-all.sh
```

#### 4. **Xem logs**
```bash
# Log Backend
tail -f logs/backend.log

# Log Frontend
tail -f logs/frontend.log
```

### 🌐 Truy cập ứng dụng:

- **Frontend (Giao diện người dùng):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### 🔐 Thông tin đăng nhập mặc định:

1. **Admin (Giám Đốc)**
   - Username: `admin`
   - Password: `123`

2. **Kỹ Thuật**
   - Username: `kythuat`
   - Password: `123`

3. **Sản Xuất**
   - Username: `xuong`
   - Password: `123`

### 📊 Thông tin Database:

- **Database:** `db_vuong_erp`
- **User:** `db_vuong_erp`
- **Host:** `localhost:3306`
- **Status:** ✅ Đã khởi tạo và sẵn sàng

### 🔧 Các thành phần đã cài đặt:

- ✅ MySQL Database (đang chạy)
- ✅ Python Dependencies (Flask, flask-cors, mysql-connector-python)
- ✅ Node.js Dependencies (React, Vite, TypeScript)
- ✅ Database Schema (7 bảng chính)
- ✅ Scripts khởi động/dừng/kiểm tra

### 📝 Lưu ý:

1. **Hệ thống chạy với nohup** - sẽ tiếp tục chạy ngay cả khi đóng terminal
2. **Logs được lưu tại:** `/usr/local/app-anh-vuong/logs/`
3. **PIDs được lưu tại:** `/usr/local/app-anh-vuong/logs/*.pid`
4. **API URL đã được cấu hình:** `http://localhost:5000/api`

### 🛠️ Xử lý sự cố:

#### Nếu Backend không khởi động:
```bash
# Kiểm tra log
tail -f logs/backend.log

# Kiểm tra port 5000 có bị chiếm không
lsof -i :5000

# Khởi động lại
./stop-all.sh
./start-all.sh
```

#### Nếu Frontend không khởi động:
```bash
# Kiểm tra log
tail -f logs/frontend.log

# Kiểm tra port 3000 có bị chiếm không
lsof -i :3000

# Khởi động lại
./stop-all.sh
./start-all.sh
```

#### Nếu Database không kết nối được:
```bash
# Kiểm tra MySQL
systemctl status mysql

# Khởi động MySQL nếu cần
sudo systemctl start mysql

# Kiểm tra kết nối
mysql -u db_vuong_erp -p7Hse2hJ2T5JP6h23 db_vuong_erp -e "SHOW TABLES;"
```

### 🎉 Chúc bạn sử dụng thành công!

Hệ thống ERP Bình Vương - Quản lý sản xuất giày dép chuyên nghiệp

