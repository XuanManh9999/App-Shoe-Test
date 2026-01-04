
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Factory, LayoutDashboard, PlusCircle, AlertCircle, Menu, X, RefreshCw, 
  Search, Trash2, Bell, Settings, Users, Box, LogOut, ShieldAlert, 
  ShieldCheck, Archive, ChevronRight, ChevronDown, Database, 
  BarChart3, FileText, ClipboardList, Truck, CreditCard
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import OrderDetail from './components/OrderDetail';
import ReturnManager from './components/ReturnManager';
import CustomerManager from './components/CustomerManager';
import ModelManager from './components/ModelManager';
import UserManager from './components/UserManager';
import ReportManager from './components/ReportManager';
import ShippingManager from './components/ShippingManager';
import Login from './components/Login';
import { ProductionOrder, ReturnLog, OrderStatus, Customer, ProductModel, User, UserRole, ShippingNote, Priority, Payment } from './types';
import { SAMPLE_ORDER, SAMPLE_CUSTOMER, DEFAULT_USERS, INITIAL_STAGES } from './constants';
import { generateId } from './utils';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; isSubItem?: boolean; badge?: number }> = ({ to, icon, label, isSubItem, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      } ${isSubItem ? 'py-2' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight">
          {label}
        </span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-900">
          {badge}
        </span>
      )}
    </Link>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('btv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<ProductionOrder[]>(() => {
    const saved = localStorage.getItem('btv_orders');
    return saved ? JSON.parse(saved) : [SAMPLE_ORDER];
  });

  const [returns, setReturns] = useState<ReturnLog[]>(() => {
    const saved = localStorage.getItem('btv_returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingNotes, setShippingNotes] = useState<ShippingNote[]>(() => {
    const saved = localStorage.getItem('btv_shipping');
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('btv_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('btv_customers');
    return saved ? JSON.parse(saved) : [SAMPLE_CUSTOMER];
  });

  const [models, setModels] = useState<ProductModel[]>(() => {
    const saved = localStorage.getItem('btv_models');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('btv_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<string[]>(['production', 'categories']);

  useEffect(() => localStorage.setItem('btv_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('btv_returns', JSON.stringify(returns)), [returns]);
  useEffect(() => localStorage.setItem('btv_shipping', JSON.stringify(shippingNotes)), [shippingNotes]);
  useEffect(() => localStorage.setItem('btv_payments', JSON.stringify(payments)), [payments]);
  useEffect(() => localStorage.setItem('btv_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('btv_models', JSON.stringify(models)), [models]);
  useEffect(() => localStorage.setItem('btv_users', JSON.stringify(users)), [users]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('btv_user', JSON.stringify(currentUser));
    else localStorage.removeItem('btv_user');
  }, [currentUser]);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
  };

  const handleLogin = (user: User) => {
    const latestUser = users.find(u => u.id === user.id) || user;
    setCurrentUser(latestUser);
  };

  const handleLogout = () => setCurrentUser(null);

  const addOrder = (newOrder: ProductionOrder) => setOrders(prev => [newOrder, ...prev]);
  const updateOrder = (updatedOrder: ProductionOrder) => setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  const deleteOrder = (id: string) => {
    if (window.confirm("Xác nhận XÓA VĨNH VIỄN lệnh này?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };
  
  const addReturn = (newReturn: ReturnLog) => {
    setReturns(prev => [newReturn, ...prev]);
    
    const originalOrder = orders.find(o => o.id === newReturn.originalOrderId);
    if (originalOrder) {
      const remakeOrder: ProductionOrder = {
        ...originalOrder,
        id: generateId(),
        orderCode: `${originalOrder.orderCode}-BÙ`,
        parentOrderId: originalOrder.id,
        totalQuantity: newReturn.quantity,
        priority: Priority.HIGH,
        priorityReason: `Làm bù cho hàng lỗi: ${newReturn.reason}`,
        stages: INITIAL_STAGES,
        details: originalOrder.details.map(d => {
          if (d.color === newReturn.color) {
            const newSizes = { ...d.sizes, [`size${newReturn.size}`]: newReturn.quantity };
            Object.keys(newSizes).forEach(k => {
              if (k !== `size${newReturn.size}`) (newSizes as any)[k] = 0;
            });
            return { ...d, sizes: newSizes, total: newReturn.quantity };
          }
          return { ...d, total: 0, sizes: {} as any };
        }).filter(d => d.total > 0),
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [remakeOrder, ...prev]);
    }
  };

  const addShippingNote = (note: ShippingNote) => setShippingNotes(prev => [note, ...prev]);
  const updateShippingNote = (updated: ShippingNote) => setShippingNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
  const deleteShippingNote = (id: string) => {
    if (window.confirm("Xác nhận XÓA phiếu giao hàng này?")) {
      setShippingNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const addPayment = (payment: Payment) => setPayments(prev => [payment, ...prev]);
  const deletePayment = (id: string) => {
    if (window.confirm("Xác nhận XÓA khoản thanh toán này?")) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const addCustomer = (customer: Customer) => setCustomers(prev => [customer, ...prev]);
  const updateCustomer = (updated: Customer) => setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  const addModel = (model: ProductModel) => setModels(prev => [model, ...prev]);
  const updateModel = (model: ProductModel) => setModels(prev => prev.map(m => m.id === model.id ? model : m));
  const archiveModel = (id: string) => setModels(prev => prev.map(m => m.id === id ? { ...m, isArchived: true } : m));
  const restoreModel = (id: string) => setModels(prev => prev.map(m => m.id === id ? { ...m, isArchived: false } : m));
  // Fix: Corrected TypeScript error where setModels was called twice in a nested callback, returning void instead of ProductModel[]
  const permanentlyDeleteModel = (id: string) => setModels(prev => prev.filter(m => m.id !== id));

  const addUser = (user: User) => setUsers(prev => [user, ...prev]);
  const updateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (currentUser?.id === updated.id) setCurrentUser(updated);
  };
  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return alert("Không thể xóa chính mình!");
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const reorderOrders = (newOrders: ProductionOrder[]) => {
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
    const updatedVisible = newOrders.map((order, index) => ({ ...order, sortOrder: index }));
    setOrders([...updatedVisible, ...cancelledOrders]);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const activeOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
  const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
  const pendingShippingCount = activeOrders.filter(order => {
    const isFinished = order.stages.every(s => s.status === 'done');
    return isFinished && !shippingNotes.some(note => note.orderId === order.id);
  }).length;

  return (
    <Router>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static inset-y-0 left-0 w-72 bg-[#0f172a] text-slate-300 transition-all duration-300 z-30 flex flex-col shadow-2xl`}>
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl">BV</div>
            <div className="leading-tight">
              <h1 className="font-black text-white text-lg tracking-tight uppercase">Bình Vương</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Enterprise ERP</p>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
            {currentUser.permissions.dashboard && <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Bảng điều khiển" />}
            <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hệ thống sản xuất</p></div>
            {currentUser.permissions.orders && (
              <div className="space-y-1">
                 <SidebarLink to="/orders" icon={<Factory size={20} />} label="Lệnh sản xuất" />
                 {currentUser.permissions.canEdit && <SidebarLink to="/create-order" icon={<PlusCircle size={20} />} label="Tạo lệnh mới" />}
                 {currentUser.permissions.returns && <SidebarLink to="/returns" icon={<RefreshCw size={20} />} label="Trả hàng & Bù" />}
              </div>
            )}
            <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kho & Xuất hàng</p></div>
            <SidebarLink to="/shipping" icon={<Truck size={20} />} label="Xuất hàng & Giao nhận" badge={pendingShippingCount} />
            <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Báo cáo & Tài chính</p></div>
            <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label="Báo cáo sản lượng" />
            <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quản lý danh mục</p></div>
            <div className="space-y-1">
              {currentUser.permissions.models && (
                <div className="space-y-1">
                  <button onClick={() => toggleMenu('models')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all hover:bg-slate-800/50 group ${openMenus.includes('models') ? 'text-white' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-3">
                      <Box size={20} className={openMenus.includes('models') ? 'text-blue-400' : ''} />
                      <span className="text-sm font-bold tracking-tight">Mã hàng (BOM)</span>
                    </div>
                    {openMenus.includes('models') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {openMenus.includes('models') && (
                    <div className="pl-10 space-y-1 animate-in slide-in-from-top-2 duration-300">
                       <SidebarLink to="/models" icon={<Database size={14} />} label="Danh sách mã" isSubItem />
                       <SidebarLink to="/models-archive" icon={<Archive size={14} />} label="Kho lưu trữ" isSubItem badge={models.filter(m => m.isArchived).length || undefined} />
                    </div>
                  )}
                </div>
              )}
              {currentUser.permissions.customers && <SidebarLink to="/customers" icon={<Users size={20} />} label="Khách hàng & Công nợ" />}
            </div>
            {currentUser.role === UserRole.ADMIN && (
              <>
                <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quản trị</p></div>
                <SidebarLink to="/users" icon={<ShieldCheck size={20} />} label="Nhân sự" />
                <SidebarLink to="/cancelled" icon={<Trash2 size={20} />} label="Lệnh đã hủy" />
              </>
            )}
          </nav>
          <div className="p-6 border-t border-slate-800/50 bg-slate-950/20">
             <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-blue-600 uppercase">{currentUser.username.substring(0, 2)}</div>
                <div className="text-xs min-w-0 flex-1">
                   <p className="font-bold text-white truncate">{currentUser.fullName}</p>
                   <p className="text-slate-500 uppercase text-[8px] font-black tracking-widest">{currentUser.role}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><LogOut size={16} /></button>
             </div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-4">
               <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg md:hidden"><Menu size={24} /></button>
               <ShieldAlert size={18} className="text-amber-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quyền hạn: {currentUser.role}</span>
             </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
            <Routes>
              <Route path="/" element={<Dashboard orders={orders} returns={returns} shippingNotes={shippingNotes} payments={payments} />} />
              <Route path="/orders" element={<OrderList orders={activeOrders} onReorder={reorderOrders} onDelete={deleteOrder} title="Điều hành sản xuất" user={currentUser} />} />
              <Route path="/cancelled" element={currentUser.role === UserRole.ADMIN ? <OrderList orders={cancelledOrders} onReorder={() => {}} onDelete={deleteOrder} title="Thư mục đã hủy" user={currentUser} /> : <Navigate to="/orders" />} />
              <Route path="/create-order" element={currentUser.permissions.canEdit ? <OrderForm onSave={addOrder} customers={customers} models={models} orders={orders} /> : <Navigate to="/orders" />} />
              <Route path="/edit-order/:id" element={currentUser.permissions.canEdit ? <OrderForm onSave={updateOrder} customers={customers} models={models} orders={orders} /> : <Navigate to="/orders" />} />
              <Route path="/order/:id" element={<OrderDetail orders={orders} onUpdate={updateOrder} onDelete={deleteOrder} onAddReturn={addReturn} user={currentUser} />} />
              <Route path="/shipping" element={<ShippingManager orders={orders} shippingNotes={shippingNotes} onAdd={addShippingNote} onUpdate={updateShippingNote} onDelete={deleteShippingNote} user={currentUser} />} />
              <Route path="/returns" element={<ReturnManager returns={returns} orders={orders} />} />
              <Route path="/customers" element={<CustomerManager customers={customers} orders={orders} shippingNotes={shippingNotes} payments={payments} onAdd={addCustomer} onUpdate={updateCustomer} onAddPayment={addPayment} onDeletePayment={deletePayment} user={currentUser} />} />
              <Route path="/models" element={<ModelManager models={models.filter(m => !m.isArchived)} onAdd={addModel} onUpdate={updateModel} onDelete={archiveModel} user={currentUser} />} />
              <Route path="/models-archive" element={<ModelManager models={models.filter(m => m.isArchived)} onAdd={addModel} onUpdate={updateModel} onDelete={permanentlyDeleteModel} onRestore={restoreModel} isArchiveView user={currentUser} />} />
              <Route path="/users" element={currentUser.role === UserRole.ADMIN ? <UserManager users={users} currentUser={currentUser} onAdd={addUser} onUpdate={updateUser} onDelete={deleteUser} /> : <Navigate to="/orders" />} />
              <Route path="/reports" element={<ReportManager orders={orders} customers={customers} returns={returns} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
