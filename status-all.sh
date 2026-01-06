#!/bin/bash

# ============================================
# BÌNH VƯƠNG ERP - KIỂM TRA TRẠNG THÁI
# ============================================

APP_DIR="/usr/local/app-anh-vuong"
LOG_DIR="$APP_DIR/logs"

echo "========================================"
echo "  BÌNH VƯƠNG ERP - TRẠNG THÁI HỆ THỐNG"
echo "========================================"
echo ""

# Kiểm tra MySQL
echo "📊 MySQL:"
if systemctl is-active --quiet mysql || service mysql status > /dev/null 2>&1; then
    echo "  ✓ Đang chạy"
else
    echo "  ✗ Không chạy"
fi

# Kiểm tra Database
echo ""
echo "📊 Database:"
if mysql -u db_vuong_erp -p7Hse2hJ2T5JP6h23 db_vuong_erp -e "SHOW TABLES;" > /dev/null 2>&1; then
    TABLE_COUNT=$(mysql -u db_vuong_erp -p7Hse2hJ2T5JP6h23 db_vuong_erp -e "SHOW TABLES;" 2>/dev/null | wc -l)
    echo "  ✓ Kết nối OK (Có $((TABLE_COUNT-1)) bảng)"
else
    echo "  ✗ Không kết nối được"
fi

# Kiểm tra Backend
echo ""
echo "📊 Backend (Flask):"
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
            echo "  ✓ Đang chạy (PID: $BACKEND_PID)"
            echo "  ✓ API phản hồi OK"
        else
            echo "  ⚠ Process chạy nhưng API không phản hồi (PID: $BACKEND_PID)"
        fi
    else
        echo "  ✗ Không chạy (PID file tồn tại nhưng process không tồn tại)"
    fi
else
    if pgrep -f "python3.*app.py" > /dev/null; then
        echo "  ⚠ Đang chạy nhưng không có PID file"
    else
        echo "  ✗ Không chạy"
    fi
fi

# Kiểm tra Frontend
echo ""
echo "📊 Frontend (React/Vite):"
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
            echo "  ✓ Đang chạy (PID: $FRONTEND_PID)"
            echo "  ✓ Web server phản hồi OK"
        else
            echo "  ⚠ Process chạy nhưng web server không phản hồi (PID: $FRONTEND_PID)"
        fi
    else
        echo "  ✗ Không chạy (PID file tồn tại nhưng process không tồn tại)"
    fi
else
    if pgrep -f "vite" > /dev/null; then
        echo "  ⚠ Đang chạy nhưng không có PID file"
    else
        echo "  ✗ Không chạy"
    fi
fi

echo ""
echo "========================================"
echo ""
echo "📍 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000/api/health"
echo ""
echo "📋 Logs:"
echo "  Backend:  tail -f $LOG_DIR/backend.log"
echo "  Frontend: tail -f $LOG_DIR/frontend.log"
echo ""
echo "========================================"

