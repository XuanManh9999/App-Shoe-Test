#!/bin/bash

echo "========================================"
echo "  BINH VUONG ERP - KHOI DONG HE THONG"
echo "========================================"
echo ""

echo "[1/3] Kiem tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Chua cai dat Node.js!"
    echo "Vui long tai tai: https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js da cai dat"

echo ""
echo "[2/3] Kiem tra dependencies..."
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dang cai dat dependencies lan dau..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Cai dat that bai!"
        exit 1
    fi
else
    echo "[OK] Dependencies da san sang"
fi

echo ""
echo "[3/3] Khoi dong ung dung..."
echo ""
echo "========================================"
echo "  Ung dung se mo tai: http://localhost:3000"
echo "  Nhan Ctrl+C de dung server"
echo "========================================"
echo ""

npm run dev

