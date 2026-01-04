// Data Service - Kết nối với Backend API
// Thay thế LocalStorage bằng API calls

import {
    ordersAPI,
    customersAPI,
    modelsAPI,
    shippingAPI,
    paymentsAPI,
    returnsAPI,
    usersAPI
} from '../api';

import {
    ProductionOrder,
    Customer,
    ProductModel,
    ShippingNote,
    Payment,
    ReturnLog,
    User
} from '../types';

// Flag để bật/tắt API mode
export const USE_API = true; // Đổi thành false để dùng lại LocalStorage

// ============ ORDERS ============
export const ordersService = {
    async getAll(): Promise<ProductionOrder[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_orders');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await ordersAPI.getAll();
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    async save(order: ProductionOrder): Promise<void> {
        if (!USE_API) {
            const orders = await this.getAll();
            const index = orders.findIndex(o => o.id === order.id);
            if (index >= 0) {
                orders[index] = order;
            } else {
                orders.push(order);
            }
            localStorage.setItem('btv_orders', JSON.stringify(orders));
            return;
        }
        try {
            const existing = await ordersAPI.getAll();
            const exists = existing.find(o => o.id === order.id);
            if (exists) {
                await ordersAPI.update(order.id, order);
            } else {
                await ordersAPI.create(order);
            }
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        if (!USE_API) {
            const orders = await this.getAll();
            const filtered = orders.filter(o => o.id !== id);
            localStorage.setItem('btv_orders', JSON.stringify(filtered));
            return;
        }
        try {
            await ordersAPI.delete(id);
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
};

// ============ CUSTOMERS ============
export const customersService = {
    async getAll(): Promise<Customer[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_customers');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await customersAPI.getAll();
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    },

    async save(customer: Customer): Promise<void> {
        if (!USE_API) {
            const customers = await this.getAll();
            const index = customers.findIndex(c => c.id === customer.id);
            if (index >= 0) {
                customers[index] = customer;
            } else {
                customers.push(customer);
            }
            localStorage.setItem('btv_customers', JSON.stringify(customers));
            return;
        }
        try {
            const existing = await customersAPI.getAll();
            const exists = existing.find(c => c.id === customer.id);
            if (exists) {
                await customersAPI.update(customer.id, customer);
            } else {
                await customersAPI.create(customer);
            }
        } catch (error) {
            console.error('Error saving customer:', error);
            throw error;
        }
    }
};

// ============ MODELS ============
export const modelsService = {
    async getAll(): Promise<ProductModel[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_models');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await modelsAPI.getAll();
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    },

    async save(model: ProductModel): Promise<void> {
        if (!USE_API) {
            const models = await this.getAll();
            const index = models.findIndex(m => m.id === model.id);
            if (index >= 0) {
                models[index] = model;
            } else {
                models.push(model);
            }
            localStorage.setItem('btv_models', JSON.stringify(models));
            return;
        }
        try {
            const existing = await modelsAPI.getAll();
            const exists = existing.find(m => m.id === model.id);
            if (exists) {
                await modelsAPI.update(model.id, model);
            } else {
                await modelsAPI.create(model);
            }
        } catch (error) {
            console.error('Error saving model:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        if (!USE_API) {
            const models = await this.getAll();
            const filtered = models.filter(m => m.id !== id);
            localStorage.setItem('btv_models', JSON.stringify(filtered));
            return;
        }
        try {
            await modelsAPI.delete(id);
        } catch (error) {
            console.error('Error deleting model:', error);
            throw error;
        }
    }
};

// ============ SHIPPING NOTES ============
export const shippingService = {
    async getAll(): Promise<ShippingNote[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_shipping');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await shippingAPI.getAll();
        } catch (error) {
            console.error('Error fetching shipping notes:', error);
            return [];
        }
    },

    async save(note: ShippingNote): Promise<void> {
        if (!USE_API) {
            const notes = await this.getAll();
            const index = notes.findIndex(n => n.id === note.id);
            if (index >= 0) {
                notes[index] = note;
            } else {
                notes.push(note);
            }
            localStorage.setItem('btv_shipping', JSON.stringify(notes));
            return;
        }
        try {
            const existing = await shippingAPI.getAll();
            const exists = existing.find(n => n.id === note.id);
            if (exists) {
                await shippingAPI.update(note.id, note);
            } else {
                await shippingAPI.create(note);
            }
        } catch (error) {
            console.error('Error saving shipping note:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        if (!USE_API) {
            const notes = await this.getAll();
            const filtered = notes.filter(n => n.id !== id);
            localStorage.setItem('btv_shipping', JSON.stringify(filtered));
            return;
        }
        try {
            await shippingAPI.delete(id);
        } catch (error) {
            console.error('Error deleting shipping note:', error);
            throw error;
        }
    }
};

// ============ PAYMENTS ============
export const paymentsService = {
    async getAll(): Promise<Payment[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_payments');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await paymentsAPI.getAll();
        } catch (error) {
            console.error('Error fetching payments:', error);
            return [];
        }
    },

    async save(payment: Payment): Promise<void> {
        if (!USE_API) {
            const payments = await this.getAll();
            payments.push(payment);
            localStorage.setItem('btv_payments', JSON.stringify(payments));
            return;
        }
        try {
            await paymentsAPI.create(payment);
        } catch (error) {
            console.error('Error saving payment:', error);
            throw error;
        }
    }
};

// ============ RETURNS ============
export const returnsService = {
    async getAll(): Promise<ReturnLog[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_returns');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await returnsAPI.getAll();
        } catch (error) {
            console.error('Error fetching returns:', error);
            return [];
        }
    },

    async save(returnLog: ReturnLog): Promise<void> {
        if (!USE_API) {
            const returns = await this.getAll();
            returns.push(returnLog);
            localStorage.setItem('btv_returns', JSON.stringify(returns));
            return;
        }
        try {
            await returnsAPI.create(returnLog);
        } catch (error) {
            console.error('Error saving return:', error);
            throw error;
        }
    }
};

// ============ USERS ============
export const usersService = {
    async getAll(): Promise<User[]> {
        if (!USE_API) {
            const saved = localStorage.getItem('btv_users');
            return saved ? JSON.parse(saved) : [];
        }
        try {
            return await usersAPI.getAll();
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    async save(user: User): Promise<void> {
        if (!USE_API) {
            const users = await this.getAll();
            const index = users.findIndex(u => u.id === user.id);
            if (index >= 0) {
                users[index] = user;
            } else {
                users.push(user);
            }
            localStorage.setItem('btv_users', JSON.stringify(users));
            return;
        }
        try {
            const existing = await usersAPI.getAll();
            const exists = existing.find(u => u.id === user.id);
            if (exists) {
                await usersAPI.update(user.id, user);
            } else {
                await usersAPI.create(user);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    },

    async delete(id: string): Promise<void> {
        if (!USE_API) {
            const users = await this.getAll();
            const filtered = users.filter(u => u.id !== id);
            localStorage.setItem('btv_users', JSON.stringify(filtered));
            return;
        }
        try {
            await usersAPI.delete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    async login(username: string, password: string): Promise<User | null> {
        if (!USE_API) {
            const users = await this.getAll();
            return users.find(u => u.username === username && u.password === password) || null;
        }
        try {
            return await usersAPI.login(username, password);
        } catch (error) {
            console.error('Error logging in:', error);
            return null;
        }
    }
};

