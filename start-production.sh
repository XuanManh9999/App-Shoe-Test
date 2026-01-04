#!/bin/bash

echo "========================================"
echo "  BINH VUONG ERP - PRODUCTION START"
echo "========================================"
echo ""

# Kiểm tra MySQL
echo "[1/4] Checking MySQL..."
if ! systemctl is-active --quiet mysql; then
    echo "Starting MySQL..."
    systemctl start mysql
fi
echo "✓ MySQL is running"

# Dừng các process cũ nếu có
echo ""
echo "[2/4] Stopping old processes..."
pkill -f "python3 app.py" 2>/dev/null || true
pkill -f "serve -s dist" 2>/dev/null || true
sleep 2
echo "✓ Old processes stopped"

# Khởi động Backend
echo ""
echo "[3/4] Starting Backend (Flask API)..."
cd /usr/local/App-Shoe-Test
nohup python3 app.py > backend.log 2>&1 &
sleep 3
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✓ Backend started successfully on http://localhost:5000"
else
    echo "✗ Backend failed to start. Check backend.log"
    exit 1
fi

# Khởi động Frontend
echo ""
echo "[4/4] Starting Frontend (React App)..."
nohup serve -s dist -l 3000 > frontend.log 2>&1 &
sleep 2
if curl -s -I http://localhost:3000 > /dev/null; then
    echo "✓ Frontend started successfully on http://localhost:3000"
else
    echo "✗ Frontend failed to start. Check frontend.log"
    exit 1
fi

echo ""
echo "========================================"
echo "  ✓ ALL SERVICES RUNNING"
echo "========================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "Network Access:"
echo "  - http://222.255.214.187:3000"
echo "  - http://222.255.214.187:5000"
echo ""
echo "Logs:"
echo "  - Backend:  tail -f backend.log"
echo "  - Frontend: tail -f frontend.log"
echo ""
echo "To stop: ./stop-production.sh"
echo "========================================"

