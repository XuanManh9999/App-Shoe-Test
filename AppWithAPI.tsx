// Wrapper component to use API instead of LocalStorage
// Import this instead of App.tsx to use database

import React, { useState, useEffect } from 'react';
import App from './App';
import {
    ordersService,
    customersService,
    modelsService,
    shippingService,
    paymentsService,
    returnsService,
    usersService
} from './services/dataService';

// This component wraps the original App and syncs data with API
const AppWithAPI: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Load all data from API and store in localStorage
                // This way the existing App component can work without changes
                const [orders, customers, models, shipping, payments, returns, users] = await Promise.all([
                    ordersService.getAll(),
                    customersService.getAll(),
                    modelsService.getAll(),
                    shippingService.getAll(),
                    paymentsService.getAll(),
                    returnsService.getAll(),
                    usersService.getAll()
                ]);

                // Store in localStorage so App component can use it
                localStorage.setItem('btv_orders', JSON.stringify(orders));
                localStorage.setItem('btv_customers', JSON.stringify(customers));
                localStorage.setItem('btv_models', JSON.stringify(models));
                localStorage.setItem('btv_shipping', JSON.stringify(shipping));
                localStorage.setItem('btv_payments', JSON.stringify(payments));
                localStorage.setItem('btv_returns', JSON.stringify(returns));
                localStorage.setItem('btv_users', JSON.stringify(users));

                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing data from API:', error);
                setIsInitialized(true); // Continue anyway with localStorage data
            }
        };

        initializeData();
    }, []);

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg font-bold">Đang tải dữ liệu từ server...</p>
                </div>
            </div>
        );
    }

    return <App />;
};

export default AppWithAPI;

