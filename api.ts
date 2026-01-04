// API Service for Bình Vương ERP
// Kết nối với Flask Backend

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

// Orders API
export const ordersAPI = {
    getAll: () => apiCall<any[]>('/orders'),
    getById: (id: string) => apiCall<any>(`/orders/${id}`),
    create: (order: any) => apiCall<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
    }),
    update: (id: string, order: any) => apiCall<any>(`/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(order),
    }),
    delete: (id: string) => apiCall<void>(`/orders/${id}`, {
        method: 'DELETE',
    }),
};

// Customers API
export const customersAPI = {
    getAll: () => apiCall<any[]>('/customers'),
    getById: (id: string) => apiCall<any>(`/customers/${id}`),
    create: (customer: any) => apiCall<any>('/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
    }),
    update: (id: string, customer: any) => apiCall<any>(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
    }),
    delete: (id: string) => apiCall<void>(`/customers/${id}`, {
        method: 'DELETE',
    }),
};

// Product Models API
export const modelsAPI = {
    getAll: () => apiCall<any[]>('/models'),
    getById: (id: string) => apiCall<any>(`/models/${id}`),
    create: (model: any) => apiCall<any>('/models', {
        method: 'POST',
        body: JSON.stringify(model),
    }),
    update: (id: string, model: any) => apiCall<any>(`/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(model),
    }),
    delete: (id: string) => apiCall<void>(`/models/${id}`, {
        method: 'DELETE',
    }),
};

// Shipping Notes API
export const shippingAPI = {
    getAll: () => apiCall<any[]>('/shipping'),
    getById: (id: string) => apiCall<any>(`/shipping/${id}`),
    create: (note: any) => apiCall<any>('/shipping', {
        method: 'POST',
        body: JSON.stringify(note),
    }),
    update: (id: string, note: any) => apiCall<any>(`/shipping/${id}`, {
        method: 'PUT',
        body: JSON.stringify(note),
    }),
    delete: (id: string) => apiCall<void>(`/shipping/${id}`, {
        method: 'DELETE',
    }),
};

// Payments API
export const paymentsAPI = {
    getAll: () => apiCall<any[]>('/payments'),
    getByCustomer: (customerId: string) => apiCall<any[]>(`/payments/customer/${customerId}`),
    create: (payment: any) => apiCall<any>('/payments', {
        method: 'POST',
        body: JSON.stringify(payment),
    }),
};

// Returns API
export const returnsAPI = {
    getAll: () => apiCall<any[]>('/returns'),
    getByOrder: (orderId: string) => apiCall<any[]>(`/returns/order/${orderId}`),
    create: (returnLog: any) => apiCall<any>('/returns', {
        method: 'POST',
        body: JSON.stringify(returnLog),
    }),
};

// Users API (Authentication)
export const usersAPI = {
    login: (username: string, password: string) => apiCall<any>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    }),
    getAll: () => apiCall<any[]>('/users'),
    create: (user: any) => apiCall<any>('/users', {
        method: 'POST',
        body: JSON.stringify(user),
    }),
    update: (id: string, user: any) => apiCall<any>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
    }),
    delete: (id: string) => apiCall<void>(`/users/${id}`, {
        method: 'DELETE',
    }),
};

// Health check
export const healthCheck = () => apiCall<{ status: string; message: string }>('/health');

