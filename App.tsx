
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import { ordersAPI, customersAPI, modelsAPI, shippingAPI, paymentsAPI, returnsAPI, usersAPI } from './api';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; isSubItem?: boolean; badge?: number; onNavigate?: () => void }> = ({ to, icon, label, isSubItem, badge, onNavigate }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    if (onNavigate && window.innerWidth < 768) {
      onNavigate();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group touch-manipulation ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 active:bg-slate-700/50'
        } ${isSubItem ? 'py-2.5' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight truncate">
          {label}
        </span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-900 flex-shrink-0 ml-2">
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

  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [returns, setReturns] = useState<ReturnLog[]>([]);
  const [shippingNotes, setShippingNotes] = useState<ShippingNote[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [models, setModels] = useState<ProductModel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(['production', 'categories']);

  // Auto-close sidebar on mobile when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    if (window.innerWidth >= 768) setSidebarOpen(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [ordersData, customersData, modelsData, shippingData, paymentsData, returnsData, usersData] = await Promise.all([
          ordersAPI.getAll(),
          customersAPI.getAll(),
          modelsAPI.getAll(),
          shippingAPI.getAll(),
          paymentsAPI.getAll(),
          returnsAPI.getAll(),
          usersAPI.getAll()
        ]);

        setOrders(ordersData || []);
        setCustomers(customersData || []);
        setModels(modelsData || []);
        setShippingNotes(shippingData || []);
        setPayments(paymentsData || []);
        setReturns(returnsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error loading data from API:', error);
        alert('Không thể tải dữ liệu từ server. Vui lòng kiểm tra kết nối.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Keep user session in localStorage
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

  const addOrder = async (newOrder: ProductionOrder) => {
    try {
      await ordersAPI.create(newOrder);
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Lỗi khi thêm lệnh sản xuất!');
    }
  };

  const updateOrder = async (updatedOrder: ProductionOrder) => {
    try {
      await ordersAPI.update(updatedOrder.id, updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Lỗi khi cập nhật lệnh sản xuất!');
    }
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm("Xác nhận XÓA VĨNH VIỄN lệnh này?")) {
      try {
        await ordersAPI.delete(id);
        setOrders(prev => prev.filter(o => o.id !== id));
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Lỗi khi xóa lệnh sản xuất!');
      }
    }
  };

  const addReturn = async (newReturn: ReturnLog) => {
    try {
      await returnsAPI.create(newReturn);
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
        await ordersAPI.create(remakeOrder);
        setOrders(prev => [remakeOrder, ...prev]);
      }
    } catch (error) {
      console.error('Error adding return:', error);
      alert('Lỗi khi thêm trả hàng!');
    }
  };

  const addShippingNote = async (note: ShippingNote) => {
    try {
      await shippingAPI.create(note);
      setShippingNotes(prev => [note, ...prev]);
    } catch (error) {
      console.error('Error adding shipping note:', error);
      alert('Lỗi khi thêm phiếu giao hàng!');
    }
  };

  const updateShippingNote = async (updated: ShippingNote) => {
    try {
      await shippingAPI.update(updated.id, updated);
      setShippingNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    } catch (error) {
      console.error('Error updating shipping note:', error);
      alert('Lỗi khi cập nhật phiếu giao hàng!');
    }
  };

  const deleteShippingNote = async (id: string) => {
    if (window.confirm("Xác nhận XÓA phiếu giao hàng này?")) {
      try {
        await shippingAPI.delete(id);
        setShippingNotes(prev => prev.filter(n => n.id !== id));
      } catch (error) {
        console.error('Error deleting shipping note:', error);
        alert('Lỗi khi xóa phiếu giao hàng!');
      }
    }
  };

  const addPayment = async (payment: Payment) => {
    try {
      await paymentsAPI.create(payment);
      setPayments(prev => [payment, ...prev]);
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Lỗi khi thêm thanh toán!');
    }
  };

  const deletePayment = async (id: string) => {
    if (window.confirm("Xác nhận XÓA khoản thanh toán này?")) {
      try {
        // Note: API doesn't have delete payment endpoint, just remove from state
        setPayments(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Lỗi khi xóa thanh toán!');
      }
    }
  };

  const addCustomer = async (customer: Customer) => {
    try {
      await customersAPI.create(customer);
      setCustomers(prev => [customer, ...prev]);
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Lỗi khi thêm khách hàng!');
    }
  };

  const updateCustomer = async (updated: Customer) => {
    try {
      await customersAPI.update(updated.id, updated);
      // Reload lại danh sách customers từ API để đảm bảo dữ liệu đồng bộ
      const freshCustomers = await customersAPI.getAll();
      setCustomers(freshCustomers || []);
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Lỗi khi cập nhật khách hàng!');
      throw error; // Throw để component có thể xử lý
    }
  };

  const addModel = async (model: ProductModel) => {
    try {
      await modelsAPI.create(model);
      setModels(prev => [model, ...prev]);
    } catch (error) {
      console.error('Error adding model:', error);
      alert('Lỗi khi thêm mã hàng!');
    }
  };

  const updateModel = async (model: ProductModel) => {
    try {
      await modelsAPI.update(model.id, model);
      setModels(prev => prev.map(m => m.id === model.id ? model : m));
    } catch (error) {
      console.error('Error updating model:', error);
      alert('Lỗi khi cập nhật mã hàng!');
    }
  };

  const archiveModel = async (id: string) => {
    try {
      const model = models.find(m => m.id === id);
      if (model) {
        const updated = { ...model, isArchived: true };
        await modelsAPI.update(id, updated);
        setModels(prev => prev.map(m => m.id === id ? updated : m));
      }
    } catch (error) {
      console.error('Error archiving model:', error);
      alert('Lỗi khi lưu trữ mã hàng!');
    }
  };

  const restoreModel = async (id: string) => {
    try {
      const model = models.find(m => m.id === id);
      if (model) {
        const updated = { ...model, isArchived: false };
        await modelsAPI.update(id, updated);
        setModels(prev => prev.map(m => m.id === id ? updated : m));
      }
    } catch (error) {
      console.error('Error restoring model:', error);
      alert('Lỗi khi khôi phục mã hàng!');
    }
  };

  const permanentlyDeleteModel = async (id: string) => {
    try {
      await modelsAPI.delete(id);
      setModels(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Lỗi khi xóa mã hàng!');
    }
  };

  const addUser = async (user: User) => {
    try {
      await usersAPI.create(user);
      setUsers(prev => [user, ...prev]);
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Lỗi khi thêm người dùng!');
    }
  };

  const updateUser = async (updated: User) => {
    try {
      await usersAPI.update(updated.id, updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (currentUser?.id === updated.id) setCurrentUser(updated);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Lỗi khi cập nhật người dùng!');
    }
  };

  const deleteUser = async (id: string) => {
    if (id === currentUser?.id) return alert("Không thể xóa chính mình!");
    try {
      await usersAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng!');
    }
  };

  const reorderOrders = async (newOrders: ProductionOrder[]) => {
    try {
      const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
      const updatedVisible = newOrders.map((order, index) => ({ ...order, sortOrder: index }));

      // Update all orders in API
      await Promise.all(updatedVisible.map(order => ordersAPI.update(order.id, order)));

      setOrders([...updatedVisible, ...cancelledOrders]);
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Lỗi khi sắp xếp lại thứ tự!');
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold">Đang tải dữ liệu từ server...</p>
          <p className="text-slate-400 text-sm mt-2">Vui lòng đợi...</p>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
  const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED);
  const pendingShippingCount = activeOrders.filter(order => {
    const isFinished = order.stages.every(s => s.status === 'done');
    return isFinished && !shippingNotes.some(note => note.orderId === order.id);
  }).length;

  return (
    <Router>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900 print:block print:h-auto">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static inset-y-0 left-0 w-72 md:w-72 max-w-[85vw] bg-[#0f172a] text-slate-300 transition-all duration-300 z-30 flex flex-col shadow-2xl print:hidden`}>
          <div className="p-4 md:p-8 flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-lg md:text-xl flex-shrink-0">BV</div>
            <div className="leading-tight min-w-0">
              <h1 className="font-black text-white text-base md:text-lg tracking-tight uppercase truncate">Bình Vương</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest hidden md:block">Enterprise ERP</p>
            </div>
          </div>
          <nav className="flex-1 px-2 md:px-4 space-y-1 overflow-y-auto custom-scrollbar pb-4 md:pb-10">
            {currentUser.permissions.dashboard && <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Bảng điều khiển" onNavigate={() => setSidebarOpen(false)} />}
            <div className="pt-4 md:pt-6 pb-2 px-2 md:px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Hệ thống sản xuất</p></div>
            {currentUser.permissions.orders && (
              <div className="space-y-1">
                <SidebarLink to="/orders" icon={<Factory size={20} />} label="Lệnh sản xuất" onNavigate={() => setSidebarOpen(false)} />
                {currentUser.permissions.canEdit && <SidebarLink to="/create-order" icon={<PlusCircle size={20} />} label="Tạo lệnh mới" onNavigate={() => setSidebarOpen(false)} />}
                {currentUser.permissions.returns && <SidebarLink to="/returns" icon={<RefreshCw size={20} />} label="Trả hàng & Bù" onNavigate={() => setSidebarOpen(false)} />}
              </div>
            )}
            <div className="pt-4 md:pt-6 pb-2 px-2 md:px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Kho & Xuất hàng</p></div>
            <SidebarLink to="/shipping" icon={<Truck size={20} />} label="Xuất hàng & Giao nhận" badge={pendingShippingCount} onNavigate={() => setSidebarOpen(false)} />
            <div className="pt-4 md:pt-6 pb-2 px-2 md:px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Báo cáo & Tài chính</p></div>
            <SidebarLink to="/reports" icon={<BarChart3 size={20} />} label="Báo cáo sản lượng" onNavigate={() => setSidebarOpen(false)} />
            <div className="pt-4 md:pt-6 pb-2 px-2 md:px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Quản lý danh mục</p></div>
            <div className="space-y-1">
              {currentUser.permissions.models && (
                <div className="space-y-1">
                  <button onClick={() => toggleMenu('models')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all hover:bg-slate-800/50 active:bg-slate-700/50 touch-manipulation group ${openMenus.includes('models') ? 'text-white' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Box size={20} className={`flex-shrink-0 ${openMenus.includes('models') ? 'text-blue-400' : ''}`} />
                      <span className="text-sm font-bold tracking-tight truncate">Mã hàng (BOM)</span>
                    </div>
                    {openMenus.includes('models') ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
                  </button>
                  {openMenus.includes('models') && (
                    <div className="pl-4 md:pl-10 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      <SidebarLink to="/models" icon={<Database size={14} />} label="Danh sách mã" isSubItem onNavigate={() => setSidebarOpen(false)} />
                      <SidebarLink to="/models-archive" icon={<Archive size={14} />} label="Kho lưu trữ" isSubItem badge={models.filter(m => m.isArchived).length || undefined} onNavigate={() => setSidebarOpen(false)} />
                    </div>
                  )}
                </div>
              )}
              {currentUser.permissions.customers && <SidebarLink to="/customers" icon={<Users size={20} />} label="Khách hàng & Công nợ" onNavigate={() => setSidebarOpen(false)} />}
            </div>
            {currentUser.role === UserRole.ADMIN && (
              <>
                <div className="pt-4 md:pt-6 pb-2 px-2 md:px-4"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Quản trị</p></div>
                <SidebarLink to="/users" icon={<ShieldCheck size={20} />} label="Nhân sự" onNavigate={() => setSidebarOpen(false)} />
                <SidebarLink to="/cancelled" icon={<Trash2 size={20} />} label="Lệnh đã hủy" onNavigate={() => setSidebarOpen(false)} />
              </>
            )}
          </nav>
          <div className="p-4 md:p-6 border-t border-slate-800/50 bg-slate-950/20">
            <div className="flex items-center gap-3 p-2 md:p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white bg-blue-600 uppercase flex-shrink-0 text-xs md:text-sm">{currentUser.username.substring(0, 2)}</div>
              <div className="text-xs min-w-0 flex-1">
                <p className="font-bold text-white truncate text-xs md:text-sm">{currentUser.fullName}</p>
                <p className="text-slate-500 uppercase text-[8px] font-black tracking-widest hidden md:block">{currentUser.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 active:text-rose-400 transition-colors touch-manipulation"><LogOut size={16} /></button>
            </div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:block print:w-full">
          <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-sm print:hidden">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg md:hidden touch-manipulation flex-shrink-0"><Menu size={24} /></button>
              <ShieldAlert size={16} md:size={18} className="text-amber-500 flex-shrink-0" />
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] truncate">Quyền: {currentUser.role}</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#f8fafc] print:block print:overflow-visible print:bg-white print:p-0">
            <Routes>
              <Route path="/" element={<Dashboard orders={orders} returns={returns} shippingNotes={shippingNotes} payments={payments} />} />
              <Route path="/orders" element={<OrderList orders={activeOrders} onReorder={reorderOrders} onDelete={deleteOrder} title="Điều hành sản xuất" user={currentUser} />} />
              <Route path="/cancelled" element={currentUser.role === UserRole.ADMIN ? <OrderList orders={cancelledOrders} onReorder={() => { }} onDelete={deleteOrder} title="Thư mục đã hủy" user={currentUser} /> : <Navigate to="/orders" />} />
              <Route path="/create-order" element={currentUser.permissions.canEdit ? <OrderForm onSave={addOrder} customers={customers} models={models} orders={orders} /> : <Navigate to="/orders" />} />
              <Route path="/edit-order/:id" element={currentUser.permissions.canEdit ? <OrderForm onSave={updateOrder} customers={customers} models={models} orders={orders} /> : <Navigate to="/orders" />} />
              <Route path="/order/:id" element={<OrderDetail orders={orders} onUpdate={updateOrder} onDelete={deleteOrder} onAddReturn={addReturn} user={currentUser} />} />
              <Route path="/shipping" element={<ShippingManager orders={orders} shippingNotes={shippingNotes} onAdd={addShippingNote} onUpdate={updateShippingNote} onDelete={deleteShippingNote} user={currentUser} />} />
              <Route path="/returns" element={<ReturnManager returns={returns} orders={orders} />} />
              <Route path="/customers" element={<CustomerManager customers={customers} orders={orders} shippingNotes={shippingNotes} payments={payments} onAdd={addCustomer} onUpdate={updateCustomer} onAddPayment={addPayment} onDeletePayment={deletePayment} onReorderOrders={reorderOrders} user={currentUser} />} />
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
