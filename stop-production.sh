#!/bin/bash

echo "========================================"
echo "  BINH VUONG ERP - STOPPING SERVICES"
echo "========================================"
echo ""

echo "Stopping Backend..."
pkill -f "python3 app.py"
echo "✓ Backend stopped"

echo ""
echo "Stopping Frontend..."
pkill -f "serve -s dist"
echo "✓ Frontend stopped"

echo ""
echo "========================================"
echo "  ✓ ALL SERVICES STOPPED"
echo "========================================"

