#!/bin/bash

# ============================================
# BÌNH VƯƠNG ERP - DỪNG HỆ THỐNG
# ============================================

APP_DIR="/usr/local/app-anh-vuong"
LOG_DIR="$APP_DIR/logs"

echo "========================================"
echo "  BÌNH VƯƠNG ERP - DỪNG HỆ THỐNG"
echo "========================================"
echo ""

# Dừng Backend
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Đang dừng Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
        echo "✓ Backend đã dừng"
    else
        echo "⚠ Backend không chạy"
    fi
    rm -f "$LOG_DIR/backend.pid"
else
    echo "⚠ Không tìm thấy PID file của Backend"
fi

# Dừng Frontend
if [ -f "$LOG_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Đang dừng Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 2
        echo "✓ Frontend đã dừng"
    else
        echo "⚠ Frontend không chạy"
    fi
    rm -f "$LOG_DIR/frontend.pid"
else
    echo "⚠ Không tìm thấy PID file của Frontend"
fi

# Dừng các process còn sót lại
echo ""
echo "Đang dọn dẹp các process còn sót..."
pkill -f "python3.*app.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

echo ""
echo "========================================"
echo "  ✓ ĐÃ DỪNG HỆ THỐNG"
echo "========================================"

