-- Insert sample data for Bình Vương ERP

USE binh_vuong_erp;

-- Insert sample production order
INSERT INTO production_orders (
    id, orderCode, itemCode, customerId, customerName, gender,
    totalQuantity, orderDate, deliveryDate, productImage, generalNote,
    bom, details, stages, priority, status, sortOrder, createdAt
) VALUES (
    '1',
    'PO191225',
    'B0137',
    'cust-1',
    'LA CAMIE',
    'Nữ',
    252,
    '2025-12-30',
    '2026-01-29',
    'https://picsum.photos/seed/shoes1/400/400',
    'KABE HẬU+MŨI 0.2',
    '{"knifeCode":"B0137","formCode":"BV.049","soleCode":"TH... CHẶT DAO BV.049","frameCode":"BV-049","heel":"TTP-190 SƠN","accessory":"VH816","talong":"MÚT SUỐT MAY VIỀN","technicalNote":"Sườn suốt không bọc"}',
    '[{"id":"d1","color":"Nâu XC 0913-3","lining":"Lót nâu 6 ĐThắng-Talon nâu 13 Phú Hòa","sizes":{"size34":0,"size35":28,"size36":42,"size37":56,"size38":56,"size39":42,"size40":28},"total":252}]',
    '[{"id":"chat","name":"Chặt","status":"pending"},{"id":"mat-giay","name":"Mặt giày","status":"pending"},{"id":"suon","name":"Sườn","status":"pending"},{"id":"de","name":"Đế","status":"pending"},{"id":"got","name":"Gót","status":"pending"},{"id":"go","name":"Gò","status":"pending"},{"id":"dong-goi","name":"Đóng gói","status":"pending"}]',
    'medium',
    'active',
    0,
    NOW()
);

SELECT 'Sample data inserted successfully!' as message;

