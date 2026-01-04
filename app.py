from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'binh_vuong_erp'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def init_database():
    """Initialize database if it doesn't exist"""
    try:
        # Connect without database to create it
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.close()
        conn.close()
        print(f"Database '{DB_CONFIG['database']}' ready")
    except Error as e:
        print(f"Error initializing database: {e}")

# ============ PRODUCTION ORDERS ============

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all production orders"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM production_orders ORDER BY sortOrder ASC, createdAt DESC")
        orders = cursor.fetchall()
        
        # Convert JSON fields
        for order in orders:
            order['bom'] = json.loads(order['bom']) if order['bom'] else {}
            order['details'] = json.loads(order['details']) if order['details'] else []
            order['stages'] = json.loads(order['stages']) if order['stages'] else []
            order['statusHistory'] = json.loads(order['statusHistory']) if order['statusHistory'] else []
        
        cursor.close()
        conn.close()
        return jsonify(orders)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new production order"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO production_orders (
                id, orderCode, itemCode, modelId, customerId, customerName, gender,
                totalQuantity, orderDate, deliveryDate, productImage, generalNote,
                bom, details, stages, priority, priorityReason, status, statusNote,
                statusHistory, sortOrder, createdAt, parentOrderId
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """
        values = (
            data['id'], data['orderCode'], data['itemCode'], data.get('modelId'),
            data['customerId'], data['customerName'], data['gender'],
            data['totalQuantity'], data['orderDate'], data['deliveryDate'],
            data['productImage'], data.get('generalNote', ''),
            json.dumps(data['bom']), json.dumps(data['details']),
            json.dumps(data['stages']), data['priority'], data.get('priorityReason', ''),
            data['status'], data.get('statusNote', ''), json.dumps(data.get('statusHistory', [])),
            data.get('sortOrder', 0), data['createdAt'], data.get('parentOrderId')
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Order created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    """Update an existing production order"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            UPDATE production_orders SET
                orderCode=%s, itemCode=%s, modelId=%s, customerId=%s, customerName=%s,
                gender=%s, totalQuantity=%s, orderDate=%s, deliveryDate=%s,
                productImage=%s, generalNote=%s, bom=%s, details=%s, stages=%s,
                priority=%s, priorityReason=%s, status=%s, statusNote=%s,
                statusHistory=%s, sortOrder=%s, parentOrderId=%s
            WHERE id=%s
        """
        values = (
            data['orderCode'], data['itemCode'], data.get('modelId'),
            data['customerId'], data['customerName'], data['gender'],
            data['totalQuantity'], data['orderDate'], data['deliveryDate'],
            data['productImage'], data.get('generalNote', ''),
            json.dumps(data['bom']), json.dumps(data['details']),
            json.dumps(data['stages']), data['priority'], data.get('priorityReason', ''),
            data['status'], data.get('statusNote', ''), json.dumps(data.get('statusHistory', [])),
            data.get('sortOrder', 0), data.get('parentOrderId'), order_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Order updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    """Delete a production order"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM production_orders WHERE id=%s", (order_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Order deleted successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ CUSTOMERS ============

@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM customers ORDER BY createdAt DESC")
        customers = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(customers)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers', methods=['POST'])
def create_customer():
    """Create a new customer"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO customers (id, name, code, contactPerson, phone, address, debtDays, debtLimit, createdAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['name'], data['code'], data.get('contactPerson', ''),
            data.get('phone', ''), data.get('address', ''), data.get('debtDays', 30),
            data.get('debtLimit', 0), data['createdAt']
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Customer created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """Update an existing customer"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            UPDATE customers SET
                name=%s, code=%s, contactPerson=%s, phone=%s, address=%s, debtDays=%s, debtLimit=%s
            WHERE id=%s
        """
        values = (
            data['name'], data['code'], data.get('contactPerson', ''),
            data.get('phone', ''), data.get('address', ''), data.get('debtDays', 30),
            data.get('debtLimit', 0), customer_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Customer updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ PRODUCT MODELS ============

@app.route('/api/models', methods=['GET'])
def get_models():
    """Get all product models"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM product_models ORDER BY createdAt DESC")
        models = cursor.fetchall()
        
        for model in models:
            model['bom'] = json.loads(model['bom']) if model['bom'] else {}
            model['editHistory'] = json.loads(model['editHistory']) if model['editHistory'] else []
            model['isArchived'] = bool(model['isArchived'])
        
        cursor.close()
        conn.close()
        return jsonify(models)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['POST'])
def create_model():
    """Create a new product model"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO product_models (
                id, itemCode, productImage, bom, gender, createdAt, updatedAt,
                editHistory, isArchived, technicalDocument
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['itemCode'], data['productImage'],
            json.dumps(data['bom']), data['gender'], data['createdAt'],
            data.get('updatedAt'), json.dumps(data.get('editHistory', [])),
            data.get('isArchived', False), data.get('technicalDocument', '')
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Model created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>', methods=['PUT'])
def update_model(model_id):
    """Update an existing product model"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            UPDATE product_models SET
                itemCode=%s, productImage=%s, bom=%s, gender=%s, updatedAt=%s,
                editHistory=%s, isArchived=%s, technicalDocument=%s
            WHERE id=%s
        """
        values = (
            data['itemCode'], data['productImage'], json.dumps(data['bom']),
            data['gender'], data.get('updatedAt'), json.dumps(data.get('editHistory', [])),
            data.get('isArchived', False), data.get('technicalDocument', ''), model_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Model updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/<model_id>', methods=['DELETE'])
def delete_model(model_id):
    """Delete a product model"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM product_models WHERE id=%s", (model_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Model deleted successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ SHIPPING NOTES ============

@app.route('/api/shipping', methods=['GET'])
def get_shipping_notes():
    """Get all shipping notes"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM shipping_notes ORDER BY createdAt DESC")
        notes = cursor.fetchall()
        
        for note in notes:
            note['items'] = json.loads(note['items']) if note['items'] else []
            note['editHistory'] = json.loads(note['editHistory']) if note['editHistory'] else []
        
        cursor.close()
        conn.close()
        return jsonify(notes)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shipping', methods=['POST'])
def create_shipping_note():
    """Create a new shipping note"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO shipping_notes (
                id, noteCode, customerId, customerName, shippingDate, items,
                totalAmount, deposit, remaining, note, createdAt, editHistory
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['noteCode'], data['customerId'], data['customerName'],
            data['shippingDate'], json.dumps(data['items']), data['totalAmount'],
            data.get('deposit', 0), data.get('remaining', 0), data.get('note', ''),
            data['createdAt'], json.dumps(data.get('editHistory', []))
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Shipping note created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shipping/<note_id>', methods=['PUT'])
def update_shipping_note(note_id):
    """Update an existing shipping note"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            UPDATE shipping_notes SET
                noteCode=%s, customerId=%s, customerName=%s, shippingDate=%s,
                items=%s, totalAmount=%s, deposit=%s, remaining=%s, note=%s, editHistory=%s
            WHERE id=%s
        """
        values = (
            data['noteCode'], data['customerId'], data['customerName'],
            data['shippingDate'], json.dumps(data['items']), data['totalAmount'],
            data.get('deposit', 0), data.get('remaining', 0), data.get('note', ''),
            json.dumps(data.get('editHistory', [])), note_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Shipping note updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ PAYMENTS ============

@app.route('/api/payments', methods=['GET'])
def get_payments():
    """Get all payments"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM payments ORDER BY paymentDate DESC")
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(payments)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payments/customer/<customer_id>', methods=['GET'])
def get_payments_by_customer(customer_id):
    """Get payments for a specific customer"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM payments WHERE customerId=%s ORDER BY paymentDate DESC", (customer_id,))
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(payments)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payments', methods=['POST'])
def create_payment():
    """Create a new payment"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO payments (
                id, customerId, customerName, shippingNoteId, amount, paymentMethod,
                paymentDate, note, createdAt
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['customerId'], data['customerName'],
            data.get('shippingNoteId'), data['amount'], data['paymentMethod'],
            data['paymentDate'], data.get('note', ''), data['createdAt']
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Payment created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ RETURN LOGS ============

@app.route('/api/returns', methods=['GET'])
def get_returns():
    """Get all return logs"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM return_logs ORDER BY returnDate DESC")
        returns = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(returns)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/returns/order/<order_id>', methods=['GET'])
def get_returns_by_order(order_id):
    """Get return logs for a specific order"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM return_logs WHERE orderId=%s ORDER BY returnDate DESC", (order_id,))
        returns = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(returns)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/returns', methods=['POST'])
def create_return():
    """Create a new return log"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO return_logs (
                id, orderId, orderCode, returnDate, quantity, reason, note, createdAt
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['orderId'], data['orderCode'], data['returnDate'],
            data['quantity'], data['reason'], data.get('note', ''), data['createdAt']
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Return log created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ USERS ============

@app.route('/api/users/login', methods=['POST'])
def login():
    """User login"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", 
                      (data['username'], data['password']))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            user['permissions'] = json.loads(user['permissions']) if user['permissions'] else {}
            return jsonify(user)
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users ORDER BY createdAt DESC")
        users = cursor.fetchall()
        
        for user in users:
            user['permissions'] = json.loads(user['permissions']) if user['permissions'] else {}
        
        cursor.close()
        conn.close()
        return jsonify(users)
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO users (id, username, password, fullName, role, permissions, createdAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data['id'], data['username'], data['password'], data['fullName'],
            data['role'], json.dumps(data['permissions']), data['createdAt']
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'User created successfully', 'id': data['id']}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user"""
    data = request.json
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            UPDATE users SET
                username=%s, password=%s, fullName=%s, role=%s, permissions=%s
            WHERE id=%s
        """
        values = (
            data['username'], data['password'], data['fullName'],
            data['role'], json.dumps(data['permissions']), user_id
        )
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'User updated successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'User deleted successfully'})
    except Error as e:
        return jsonify({'error': str(e)}), 500

# ============ HEALTH CHECK ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

# ============ MAIN ============

if __name__ == '__main__':
    print("=" * 50)
    print("BÌNH VƯƠNG ERP - BACKEND SERVER")
    print("=" * 50)
    init_database()
    print(f"Server starting on http://localhost:5000")
    print("API endpoints available:")
    print("  - GET  /api/health")
    print("  - GET  /api/orders")
    print("  - POST /api/orders")
    print("  - PUT  /api/orders/<id>")
    print("  - DEL  /api/orders/<id>")
    print("  - GET  /api/customers")
    print("  - POST /api/customers")
    print("  - PUT  /api/customers/<id>")
    print("  - GET  /api/models")
    print("  - POST /api/models")
    print("  - PUT  /api/models/<id>")
    print("  - DEL  /api/models/<id>")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)

