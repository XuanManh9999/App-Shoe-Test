-- ============================================
-- BÌNH VƯƠNG FOOTWEAR ERP - DATABASE SCHEMA
-- Hệ thống quản lý sản xuất giày dép
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS binh_vuong_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE binh_vuong_erp;

-- ============================================
-- TABLE: customers
-- Quản lý thông tin khách hàng và công nợ
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    contactPerson VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    debtDays INT DEFAULT 30 COMMENT 'Số ngày được nợ',
    debtLimit DECIMAL(15,2) DEFAULT 0 COMMENT 'Hạn mức nợ tối đa (VNĐ)',
    createdAt DATETIME NOT NULL,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: product_models
-- Quản lý mã hàng và BOM (Bill of Materials)
-- ============================================
CREATE TABLE IF NOT EXISTS product_models (
    id VARCHAR(36) PRIMARY KEY,
    itemCode VARCHAR(255) NOT NULL UNIQUE,
    productImage LONGTEXT COMMENT 'Base64 hoặc URL ảnh sản phẩm',
    bom JSON NOT NULL COMMENT 'Cấu tạo kỹ thuật: knifeCode, formCode, soleCode, frameCode, heel, accessory, talong, technicalNote',
    gender ENUM('Nữ', 'Nam') NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    editHistory JSON COMMENT 'Lịch sử cải tiến sản phẩm',
    isArchived BOOLEAN DEFAULT FALSE,
    technicalDocument LONGTEXT COMMENT 'Tài liệu kỹ thuật HTML',
    INDEX idx_itemCode (itemCode),
    INDEX idx_gender (gender),
    INDEX idx_archived (isArchived)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: production_orders
-- Quản lý lệnh sản xuất
-- ============================================
CREATE TABLE IF NOT EXISTS production_orders (
    id VARCHAR(36) PRIMARY KEY,
    orderCode VARCHAR(100) NOT NULL UNIQUE,
    itemCode VARCHAR(100) NOT NULL,
    modelId VARCHAR(36),
    customerId VARCHAR(36) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    gender ENUM('Nữ', 'Nam') NOT NULL,
    totalQuantity INT NOT NULL,
    orderDate DATE NOT NULL,
    deliveryDate DATE NOT NULL,
    productImage LONGTEXT,
    generalNote TEXT,
    bom JSON NOT NULL COMMENT 'BOM cho lệnh này',
    details JSON NOT NULL COMMENT 'Chi tiết màu và size breakdown',
    stages JSON NOT NULL COMMENT 'Tiến độ các công đoạn sản xuất',
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    priorityReason TEXT,
    status ENUM('active', 'suspended', 'stopped', 'cancelled', 'completed') DEFAULT 'active',
    statusNote TEXT,
    statusHistory JSON COMMENT 'Lịch sử thay đổi trạng thái',
    sortOrder INT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    parentOrderId VARCHAR(36) COMMENT 'ID lệnh gốc nếu đây là lệnh bù',
    INDEX idx_orderCode (orderCode),
    INDEX idx_customerId (customerId),
    INDEX idx_itemCode (itemCode),
    INDEX idx_status (status),
    INDEX idx_deliveryDate (deliveryDate),
    INDEX idx_sortOrder (sortOrder),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (modelId) REFERENCES product_models(id) ON DELETE SET NULL,
    FOREIGN KEY (parentOrderId) REFERENCES production_orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: return_logs
-- Quản lý trả hàng và làm bù
-- ============================================
CREATE TABLE IF NOT EXISTS return_logs (
    id VARCHAR(36) PRIMARY KEY,
    originalOrderId VARCHAR(36) NOT NULL,
    color VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    quantity INT NOT NULL,
    reason TEXT NOT NULL,
    date DATETIME NOT NULL,
    INDEX idx_originalOrderId (originalOrderId),
    INDEX idx_date (date),
    FOREIGN KEY (originalOrderId) REFERENCES production_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: shipping_notes
-- Quản lý phiếu giao hàng
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_notes (
    id VARCHAR(36) PRIMARY KEY,
    orderId VARCHAR(36) NOT NULL,
    orderCode VARCHAR(100) NOT NULL,
    customerId VARCHAR(36) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    itemCode VARCHAR(100) NOT NULL,
    shippingDate DATE NOT NULL,
    productImage LONGTEXT,
    details JSON NOT NULL COMMENT 'Chi tiết số lượng, đơn giá, thành tiền theo màu và size',
    totalQuantity INT NOT NULL,
    totalAmount DECIMAL(15,2) NOT NULL,
    depositAmount DECIMAL(15,2) DEFAULT 0,
    balanceAmount DECIMAL(15,2) NOT NULL,
    depositDate DATE,
    note TEXT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME,
    editHistory JSON COMMENT 'Lịch sử chỉnh sửa phiếu',
    INDEX idx_orderId (orderId),
    INDEX idx_customerId (customerId),
    INDEX idx_shippingDate (shippingDate),
    FOREIGN KEY (orderId) REFERENCES production_orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payments
-- Quản lý thanh toán công nợ
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    customerId VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    method ENUM('transfer', 'cash') NOT NULL,
    note TEXT,
    createdBy VARCHAR(255) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customerId (customerId),
    INDEX idx_date (date),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: users
-- Quản lý tài khoản người dùng và phân quyền
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Nên hash trong production',
    fullName VARCHAR(255) NOT NULL,
    role ENUM('admin', 'tech', 'prod', 'viewer') NOT NULL,
    permissions JSON NOT NULL COMMENT 'Chi tiết quyền truy cập',
    createdAt DATETIME NOT NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Users
INSERT INTO users (id, username, password, fullName, role, permissions, createdAt) VALUES
('u-1', 'admin', '123', 'Giám Đốc Bình Vương', 'admin', 
 '{"dashboard": true, "orders": true, "models": true, "customers": true, "returns": true, "shipping": true, "canEdit": true, "canDelete": true}', 
 NOW()),
('u-2', 'kythuat', '123', 'Văn Phòng Kỹ Thuật', 'tech', 
 '{"dashboard": true, "orders": true, "models": true, "customers": false, "returns": true, "shipping": true, "canEdit": true, "canDelete": false}', 
 NOW()),
('u-3', 'xuong', '123', 'Tổ Trưởng Sản Xuất', 'prod', 
 '{"dashboard": true, "orders": true, "models": true, "customers": false, "returns": true, "shipping": true, "canEdit": false, "canDelete": false}', 
 NOW())
ON DUPLICATE KEY UPDATE username=username;

-- Sample Customer
INSERT INTO customers (id, name, code, contactPerson, phone, address, debtDays, debtLimit, createdAt) VALUES
('cust-1', 'LA CAMIE', 'LC', 'Anh Nam', '0901234567', 'TP. Hồ Chí Minh', 30, 500000000, NOW())
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Tổng quan sản lượng theo khách hàng
CREATE OR REPLACE VIEW v_customer_production_summary AS
SELECT 
    c.id,
    c.name,
    c.code,
    COUNT(po.id) AS total_orders,
    SUM(po.totalQuantity) AS total_quantity,
    SUM(CASE WHEN po.status = 'completed' THEN po.totalQuantity ELSE 0 END) AS completed_quantity
FROM customers c
LEFT JOIN production_orders po ON c.id = po.customerId
WHERE po.status != 'cancelled'
GROUP BY c.id, c.name, c.code;

-- View: Công nợ khách hàng
CREATE OR REPLACE VIEW v_customer_debt AS
SELECT 
    c.id,
    c.name,
    c.code,
    c.debtDays,
    c.debtLimit,
    COALESCE(SUM(sn.balanceAmount), 0) AS total_receivables,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COALESCE(SUM(sn.balanceAmount), 0) - COALESCE(SUM(p.amount), 0) AS current_debt
FROM customers c
LEFT JOIN shipping_notes sn ON c.id = sn.customerId
LEFT JOIN payments p ON c.id = p.customerId
GROUP BY c.id, c.name, c.code, c.debtDays, c.debtLimit;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Tạo lệnh bù tự động khi có trả hàng
CREATE PROCEDURE sp_create_remake_order(
    IN p_return_id VARCHAR(36),
    IN p_original_order_id VARCHAR(36),
    IN p_color VARCHAR(255),
    IN p_size INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_new_order_id VARCHAR(36);
    DECLARE v_order_code VARCHAR(100);
    
    -- Generate new order ID
    SET v_new_order_id = UUID();
    
    -- Get original order code and append '-BÙ'
    SELECT CONCAT(orderCode, '-BÙ') INTO v_order_code
    FROM production_orders
    WHERE id = p_original_order_id;
    
    -- Insert remake order (simplified - actual implementation would copy all fields)
    INSERT INTO production_orders (
        id, orderCode, itemCode, customerId, customerName, gender,
        totalQuantity, orderDate, deliveryDate, productImage, generalNote,
        bom, details, stages, priority, priorityReason, status, statusNote,
        statusHistory, sortOrder, createdAt, parentOrderId
    )
    SELECT 
        v_new_order_id, v_order_code, itemCode, customerId, customerName, gender,
        p_quantity, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), productImage, 
        CONCAT('Làm bù cho hàng lỗi - Return ID: ', p_return_id),
        bom, details, stages, 'High', 'Làm bù hàng lỗi', 'active', '',
        '[]', 0, NOW(), p_original_order_id
    FROM production_orders
    WHERE id = p_original_order_id;
    
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger: Tự động cập nhật updatedAt khi sửa phiếu giao hàng
CREATE TRIGGER tr_shipping_notes_update
BEFORE UPDATE ON shipping_notes
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

-- Trigger: Tự động cập nhật updatedAt khi sửa model
CREATE TRIGGER tr_product_models_update
BEFORE UPDATE ON product_models
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END //

DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_orders_customer_status ON production_orders(customerId, status);
CREATE INDEX idx_orders_delivery_status ON production_orders(deliveryDate, status);
CREATE INDEX idx_shipping_customer_date ON shipping_notes(customerId, shippingDate);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Database schema created successfully!' AS message;
SELECT 'Default users created: admin/123, kythuat/123, xuong/123' AS info;

