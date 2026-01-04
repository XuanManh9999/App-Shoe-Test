#!/bin/bash

echo "========================================"
echo "  BINH VUONG ERP - STATUS CHECK"
echo "========================================"
echo ""

# Check MySQL
echo "MySQL Database:"
if systemctl is-active --quiet mysql; then
    echo "  ✓ Running"
else
    echo "  ✗ Stopped"
fi

# Check Backend
echo ""
echo "Backend (Flask API - Port 5000):"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "  ✓ Running"
    BACKEND_PID=$(ps aux | grep "python3 app.py" | grep -v grep | awk '{print $2}' | head -1)
    echo "  PID: $BACKEND_PID"
else
    echo "  ✗ Stopped"
fi

# Check Frontend
echo ""
echo "Frontend (React App - Port 3000):"
if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "  ✓ Running"
    FRONTEND_PID=$(ps aux | grep "serve -s dist" | grep -v grep | awk '{print $2}' | head -1)
    echo "  PID: $FRONTEND_PID"
else
    echo "  ✗ Stopped"
fi

echo ""
echo "========================================"
echo "Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Network:"
echo "  Frontend: http://222.255.214.187:3000"
echo "  Backend:  http://222.255.214.187:5000"
echo "========================================"

