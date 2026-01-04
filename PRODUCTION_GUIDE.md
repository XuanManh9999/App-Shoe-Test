# 🚀 HƯỚNG DẪN PRODUCTION - BÌNH VƯƠNG ERP

## ✅ Hệ Thống Đã Được Cấu Hình

Hệ thống đã được thiết lập để chạy ở chế độ **production** với **nohup**, nghĩa là:
- ✅ Các service sẽ tiếp tục chạy ngay cả khi bạn đóng terminal
- ✅ Mọi người có thể truy cập từ xa qua địa chỉ IP
- ✅ Tự động khởi động lại khi cần

## 🌐 Địa Chỉ Truy Cập

### Truy cập Local (trên server)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Truy cập từ Mạng (từ máy khác)
- **Frontend**: http://222.255.214.187:3000
- **Backend API**: http://222.255.214.187:5000

## 🔐 Đăng Nhập

| Tài khoản | Username | Password | Quyền hạn |
|-----------|----------|----------|-----------|
| **Admin** | `admin` | `123` | Toàn quyền |
| **Kỹ Thuật** | `kythuat` | `123` | Quản lý sản xuất |
| **Sản Xuất** | `xuong` | `123` | Xem & cập nhật |

## 📝 Quản Lý Hệ Thống

### Kiểm Tra Trạng Thái
```bash
cd /usr/local/App-Shoe-Test
./status.sh
```

### Khởi Động Hệ Thống
```bash
cd /usr/local/App-Shoe-Test
./start-production.sh
```

### Dừng Hệ Thống
```bash
cd /usr/local/App-Shoe-Test
./stop-production.sh
```

### Xem Log

**Backend Log:**
```bash
tail -f /usr/local/App-Shoe-Test/backend.log
```

**Frontend Log:**
```bash
tail -f /usr/local/App-Shoe-Test/frontend.log
```

**Xem 50 dòng cuối:**
```bash
tail -50 /usr/local/App-Shoe-Test/backend.log
tail -50 /usr/local/App-Shoe-Test/frontend.log
```

## 🔄 Cập Nhật Code

Nếu bạn thay đổi code và cần cập nhật:

### Cập Nhật Frontend:
```bash
cd /usr/local/App-Shoe-Test

# Dừng frontend
pkill -f "serve -s dist"

# Build lại
npm run build

# Khởi động lại
nohup serve -s dist -l 3000 > frontend.log 2>&1 &
```

### Cập Nhật Backend:
```bash
cd /usr/local/App-Shoe-Test

# Dừng backend
pkill -f "python3 app.py"

# Khởi động lại
nohup python3 app.py > backend.log 2>&1 &
```

### Hoặc sử dụng script:
```bash
cd /usr/local/App-Shoe-Test
./stop-production.sh
npm run build  # Nếu có thay đổi frontend
./start-production.sh
```

## 🗄️ Backup Database

### Backup thủ công:
```bash
mysqldump -u root binh_vuong_erp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore từ backup:
```bash
mysql -u root binh_vuong_erp < backup_20260104_120000.sql
```

### Backup tự động (crontab):
```bash
# Mở crontab
crontab -e

# Thêm dòng này để backup mỗi ngày lúc 2h sáng
0 2 * * * mysqldump -u root binh_vuong_erp > /usr/local/App-Shoe-Test/backups/backup_$(date +\%Y\%m\%d).sql
```

## 🔧 Xử Lý Sự Cố

### 1. Frontend không truy cập được

**Kiểm tra:**
```bash
curl http://localhost:3000
ps aux | grep "serve -s dist"
```

**Khởi động lại:**
```bash
pkill -f "serve -s dist"
cd /usr/local/App-Shoe-Test
nohup serve -s dist -l 3000 > frontend.log 2>&1 &
```

### 2. Backend không hoạt động

**Kiểm tra:**
```bash
curl http://localhost:5000/api/health
ps aux | grep "python3 app.py"
tail -50 backend.log
```

**Khởi động lại:**
```bash
pkill -f "python3 app.py"
cd /usr/local/App-Shoe-Test
nohup python3 app.py > backend.log 2>&1 &
```

### 3. MySQL không chạy

**Kiểm tra:**
```bash
systemctl status mysql
```

**Khởi động:**
```bash
systemctl start mysql
```

### 4. Port đã được sử dụng

**Tìm process đang dùng port:**
```bash
lsof -ti:3000  # Frontend
lsof -ti:5000  # Backend
```

**Kill process:**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 📊 Giám Sát Hệ Thống

### Kiểm tra tài nguyên:
```bash
# CPU và RAM
top

# Disk space
df -h

# Kiểm tra process
ps aux | grep -E "python3|serve|mysql"
```

### Kiểm tra kết nối:
```bash
# Số kết nối đến backend
netstat -an | grep :5000 | wc -l

# Số kết nối đến frontend
netstat -an | grep :3000 | wc -l
```

## 🔐 Bảo Mật

### Đổi mật khẩu MySQL:
```bash
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

Sau đó cập nhật trong `app.py`:
```python
DB_CONFIG = {
    'password': 'new_password',
    # ...
}
```

### Firewall (nếu cần):
```bash
# Cho phép port 3000 và 5000
ufw allow 3000
ufw allow 5000
```

## 📱 Truy Cập Từ Xa

Để truy cập từ máy khác trong mạng hoặc internet:

1. **Trong mạng LAN**: Sử dụng IP `222.255.214.187`
   - Frontend: http://222.255.214.187:3000
   - Backend: http://222.255.214.187:5000

2. **Từ Internet**: Cần cấu hình port forwarding trên router
   - Forward port 3000 → 222.255.214.187:3000
   - Forward port 5000 → 222.255.214.187:5000

## 🎯 Tính Năng Nohup

Các service đang chạy với **nohup**, nghĩa là:
- ✅ Không bị dừng khi đóng terminal
- ✅ Không bị dừng khi logout SSH
- ✅ Output được ghi vào log files
- ⚠️ Cần dừng thủ công bằng `pkill` hoặc script

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra status: `./status.sh`
2. Xem log: `tail -f backend.log` và `tail -f frontend.log`
3. Restart: `./stop-production.sh && ./start-production.sh`
4. Kiểm tra MySQL: `systemctl status mysql`

## 🎉 Kết Luận

Hệ thống đã sẵn sàng cho production:
- ✅ Frontend build và chạy với serve
- ✅ Backend chạy với nohup
- ✅ MySQL database đang hoạt động
- ✅ Có thể truy cập từ xa
- ✅ Tự động chạy ngay cả khi đóng terminal

**Chúc bạn sử dụng thành công!** 🚀

