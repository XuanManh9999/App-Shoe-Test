#!/bin/bash

# ============================================
# BÌNH VƯƠNG ERP - SCRIPT KHỞI ĐỘNG HOÀN CHỈNH
# Chạy Database, Backend và Frontend với nohup
# ============================================

set -e

APP_DIR="/usr/local/app-anh-vuong"
LOG_DIR="$APP_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Tạo thư mục logs nếu chưa có
mkdir -p "$LOG_DIR"

echo "========================================"
echo "  BÌNH VƯƠNG ERP - KHỞI ĐỘNG HỆ THỐNG"
echo "========================================"
echo ""

# Bước 1: Kiểm tra và khởi động MySQL
echo "[1/5] Kiểm tra MySQL..."
if systemctl is-active --quiet mysql || service mysql status > /dev/null 2>&1; then
    echo "✓ MySQL đang chạy"
else
    echo "⚠ Đang khởi động MySQL..."
    sudo systemctl start mysql || sudo service mysql start
    sleep 3
    echo "✓ MySQL đã khởi động"
fi

# Bước 2: Kiểm tra database
echo ""
echo "[2/5] Kiểm tra database..."
cd "$APP_DIR"
if mysql -u db_vuong_erp -p7Hse2hJ2T5JP6h23 db_vuong_erp -e "SHOW TABLES;" > /dev/null 2>&1; then
    echo "✓ Database đã sẵn sàng"
else
    echo "⚠ Đang khởi tạo database..."
    mysql -u root -p7Hse2hJ2T5JP6h23 -e "CREATE DATABASE IF NOT EXISTS db_vuong_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
    sed 's/binh_vuong_erp/db_vuong_erp/g' schema.sql | mysql -u root -p7Hse2hJ2T5JP6h23 2>/dev/null || echo "⚠ Một số bảng có thể đã tồn tại"
    echo "✓ Database đã được khởi tạo"
fi

# Bước 3: Dừng các process cũ nếu có
echo ""
echo "[3/5] Dừng các process cũ..."
pkill -f "python3.*app.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2
echo "✓ Đã dọn dẹp process cũ"

# Bước 4: Khởi động Backend (Flask)
echo ""
echo "[4/5] Khởi động Backend (Flask API)..."
cd "$APP_DIR"
nohup python3 app.py > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
sleep 3

# Kiểm tra backend có chạy không
if ps -p $BACKEND_PID > /dev/null && curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✓ Backend đã khởi động thành công (PID: $BACKEND_PID)"
    echo "  URL: http://localhost:5000"
else
    echo "✗ Backend khởi động thất bại. Kiểm tra log: tail -f $BACKEND_LOG"
    exit 1
fi

# Bước 5: Khởi động Frontend (React/Vite)
echo ""
echo "[5/5] Khởi động Frontend (React App)..."
cd "$APP_DIR"
nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
sleep 5

# Kiểm tra frontend có chạy không
if ps -p $FRONTEND_PID > /dev/null && curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend đã khởi động thành công (PID: $FRONTEND_PID)"
    echo "  URL: http://localhost:3000"
else
    echo "⚠ Frontend đang khởi động... (có thể mất thêm vài giây)"
    echo "  Kiểm tra log: tail -f $FRONTEND_LOG"
fi

# Lưu PIDs vào file để dễ dừng sau
echo "$BACKEND_PID" > "$LOG_DIR/backend.pid"
echo "$FRONTEND_PID" > "$LOG_DIR/frontend.pid"

echo ""
echo "========================================"
echo "  ✓ HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG"
echo "========================================"
echo ""
echo "📍 Truy cập ứng dụng:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📊 Xem logs:"
echo "   Backend:  tail -f $BACKEND_LOG"
echo "   Frontend: tail -f $FRONTEND_LOG"
echo ""
echo "🛑 Dừng hệ thống:"
echo "   ./stop-all.sh"
echo ""
echo "📋 Kiểm tra trạng thái:"
echo "   ./status-all.sh"
echo ""
echo "========================================"

