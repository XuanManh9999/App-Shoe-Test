
import React, { useState, useMemo } from 'react';
import { Customer, ProductionOrder, StageStatus, User, ShippingNote, Payment, OrderStatus } from '../types';
import { generateId } from '../utils';
import { Users, Plus, Phone, MapPin, User as UserIcon, Search, ChevronRight, ClipboardList, TrendingUp, Truck, DollarSign, Package, CreditCard, Calendar, Clock, AlertCircle, Save, X, Trash2 } from 'lucide-react';
import OrderList from './OrderList';
import { ordersAPI } from '../api';

interface Props {
  customers: Customer[];
  orders: ProductionOrder[];
  shippingNotes: ShippingNote[];
  payments: Payment[];
  onAdd: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  onReorderOrders?: (newOrders: ProductionOrder[]) => void;
  user: User;
}

const CustomerManager: React.FC<Props> = ({ customers, orders, shippingNotes, payments, onAdd, onUpdate, onAddPayment, onDeletePayment, onReorderOrders, user }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'shipping' | 'debt'>('orders');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    address: '',
    debtDays: 30,
    debtLimit: 500000000
  });

  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    method: 'transfer',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdate({ ...editingCustomer, ...newCustomer } as Customer);
      setEditingCustomer(null);
    } else {
      const customer: Customer = {
        ...newCustomer as Customer,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      onAdd(customer);
    }
    setShowAddForm(false);
    setNewCustomer({ name: '', code: '', contactPerson: '', phone: '', address: '', debtDays: 30, debtLimit: 500000000 });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const payment: Payment = {
      ...paymentData as Payment,
      id: generateId(),
      customerId: selectedCustomer.id,
      createdBy: user.fullName
    };
    onAddPayment(payment);
    setShowPaymentForm(false);
    setPaymentData({ amount: 0, date: new Date().toISOString().split('T')[0], method: 'transfer', note: '' });
  };

  const customerOrders = orders.filter(o => o.customerId === selectedCustomer?.id || o.customerName === selectedCustomer?.name);
  const customerShipping = shippingNotes.filter(s => s.customerId === selectedCustomer?.id || s.customerName === selectedCustomer?.name);
  const customerPayments = payments.filter(p => p.customerId === selectedCustomer?.id);

  // Handler để reorder orders của customer
  const handleReorderCustomerOrders = async (newCustomerOrders: ProductionOrder[]) => {
    if (!selectedCustomer) return;
    
    try {
      // Update sortOrder cho các orders đã reorder
      const updatedCustomerOrders = newCustomerOrders.map((order, index) => ({ ...order, sortOrder: index }));
      
      // Lấy các orders không phải của customer này (cancelled và orders của customers khác)
      const otherOrders = orders.filter(o => 
        o.status === OrderStatus.CANCELLED || 
        (o.customerId !== selectedCustomer.id && o.customerName !== selectedCustomer.name)
      );
      
      // Merge lại: customer orders (đã reorder) + other orders
      const allUpdatedOrders = [...updatedCustomerOrders, ...otherOrders];
      
      // Update tất cả customer orders trong API
      await Promise.all(updatedCustomerOrders.map(order => ordersAPI.update(order.id, order)));
      
      // Gọi callback từ parent nếu có
      if (onReorderOrders) {
        onReorderOrders(allUpdatedOrders);
      }
    } catch (error) {
      console.error('Error reordering customer orders:', error);
      alert('Lỗi khi sắp xếp lại thứ tự lệnh!');
    }
  };

  // Tính nợ hiện tại
  const totalReceivables = customerShipping.reduce((a, b) => a + b.balanceAmount, 0);
  const totalPaid = customerPayments.reduce((a, b) => a + b.amount, 0);
  const currentDebt = totalReceivables - totalPaid;

  const isOverLimit = selectedCustomer && currentDebt > selectedCustomer.debtLimit;

  // Tính toán trạng thái các phiếu nợ
  const debtStatus = useMemo(() => {
    if (!selectedCustomer) return [];
    return customerShipping.map(note => {
      const shippingDate = new Date(note.shippingDate);
      const dueDate = new Date(shippingDate.getTime() + (selectedCustomer.debtDays * 86400000));
      const now = new Date();
      
      let status: 'safe' | 'warning' | 'overdue' = 'safe';
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);

      if (diffDays < 0 && note.balanceAmount > 0) status = 'overdue';
      else if (diffDays <= 3 && note.balanceAmount > 0) status = 'warning';

      return { ...note, dueDate, status, diffDays };
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [customerShipping, selectedCustomer]);

  if (selectedCustomer) {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border-2 border-slate-200 shadow-sm shrink-0">
              Quay lại danh sách
            </button>
            <button onClick={() => { setEditingCustomer(selectedCustomer); setNewCustomer(selectedCustomer); setShowAddForm(true); }} className="px-6 py-2 bg-white text-slate-600 rounded-xl font-black text-xs uppercase border-2 border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shrink-0">Sửa hồ sơ</button>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-950 uppercase tracking-tighter">Hồ sơ: {selectedCustomer.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           <div className={`bg-white p-8 rounded-[2.5rem] border-4 shadow-2xl space-y-6 ${isOverLimit ? 'border-rose-600' : 'border-slate-950'}`}>
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center border-2 border-blue-200 mx-auto shadow-inner">
                 <UserIcon size={40} />
              </div>
              <div className="text-center space-y-1">
                 <p className="text-xl font-black text-slate-950 uppercase">{selectedCustomer.name}</p>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mã: {selectedCustomer.code}</p>
              </div>
              <div className="space-y-4 pt-4 border-t-2 border-slate-50">
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Thời hạn nợ:</span>
                    <span className="text-slate-900">{selectedCustomer.debtDays} Ngày</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Hạn mức nợ:</span>
                    <span className="text-slate-900">{selectedCustomer.debtLimit.toLocaleString()}đ</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600"><Phone size={16} className="text-blue-600" /><span className="text-sm font-bold">{selectedCustomer.phone}</span></div>
                 <div className="flex items-start gap-3 text-slate-600"><MapPin size={16} className="text-blue-600 mt-1 shrink-0" /><span className="text-sm font-bold leading-tight">{selectedCustomer.address}</span></div>
              </div>
              {isOverLimit && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 flex items-center gap-2 animate-pulse">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-black uppercase">Vượt hạn mức nợ!</span>
                </div>
              )}
           </div>

           <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <CustomerStatCard label="Số dư nợ hiện tại" value={currentDebt > 0 ? currentDebt : 0} icon={<DollarSign size={24}/>} color={currentDebt > 0 ? (isOverLimit ? "rose" : "amber") : "emerald"} suffix="vnđ" />
              <CustomerStatCard label="Đã xuất hàng" value={customerShipping.length} icon={<Truck size={24}/>} color="blue" />
              <CustomerStatCard label="Tiền đã thu" value={totalPaid + customerShipping.reduce((a,b)=>a+b.depositAmount, 0)} icon={<CreditCard size={24}/>} color="emerald" suffix="vnđ" />
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex gap-4 border-b-4 border-slate-100">
              <button onClick={() => setActiveTab('orders')} className={`py-4 px-8 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Kế hoạch sản xuất</button>
              <button onClick={() => setActiveTab('shipping')} className={`py-4 px-8 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === 'shipping' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Lịch sử xuất hàng</button>
              <button onClick={() => setActiveTab('debt')} className={`py-4 px-8 font-black text-xs uppercase tracking-widest transition-all border-b-4 ${activeTab === 'debt' ? 'border-rose-600 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Công nợ & Thu tiền</button>
           </div>

           {activeTab === 'orders' ? (
             <OrderList orders={customerOrders} onReorder={handleReorderCustomerOrders} title={`Tiến độ sản xuất của ${selectedCustomer.name}`} user={user} />
           ) : activeTab === 'shipping' ? (
             <div className="bg-white rounded-[2.5rem] border-4 border-slate-950 shadow-2xl overflow-hidden">
                <table className="w-full text-center border-collapse">
                   <thead>
                      <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
                         <th className="p-5 text-left">Phiếu Giao / Ngày</th>
                         <th className="p-5">Mã Hàng</th>
                         <th className="p-5">SL Thực Xuất</th>
                         <th className="p-5">Thành Tiền</th>
                         <th className="p-5">Ngày Phải Trả</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-slate-50 font-black text-slate-950">
                      {debtStatus.length === 0 ? (
                        <tr><td colSpan={5} className="py-20 text-slate-300 font-black uppercase tracking-widest italic">Chưa có lịch sử xuất hàng</td></tr>
                      ) : (
                        debtStatus.map(note => (
                          <tr key={note.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-5 text-left">
                                <p className="text-sm font-black uppercase tracking-tight">{note.orderCode}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(note.shippingDate).toLocaleDateString('vi-VN')}</p>
                             </td>
                             <td className="p-5 text-xs font-black text-slate-600">{note.itemCode}</td>
                             <td className="p-5 text-xl text-blue-600">{note.totalQuantity} <span className="text-[9px] uppercase">Đôi</span></td>
                             <td className="p-5 text-lg text-emerald-600">{note.totalAmount.toLocaleString()}đ</td>
                             <td className="p-5">
                                <div className="flex flex-col items-center">
                                  <p className="text-sm">{note.dueDate.toLocaleDateString('vi-VN')}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase mt-1 ${
                                    note.status === 'overdue' ? 'bg-rose-600 text-white' : 
                                    note.status === 'warning' ? 'bg-amber-400 text-slate-900' : 
                                    'bg-emerald-500 text-white'
                                  }`}>
                                    {note.status === 'overdue' ? `Quá hạn ${Math.abs(note.diffDays)} ngày` : 
                                     note.status === 'warning' ? `Hạn còn ${note.diffDays} ngày` : 'Trong hạn'}
                                  </span>
                                </div>
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-2xl">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-3"><Clock size={24} className="text-rose-600"/> Theo dõi nợ quá hạn</h3>
                   </div>
                   <div className="space-y-4">
                      {debtStatus.filter(n => n.status === 'overdue').length === 0 ? (
                        <p className="py-10 text-center text-slate-300 font-black uppercase tracking-widest italic">Tuyệt vời! Không có nợ quá hạn.</p>
                      ) : (
                        debtStatus.filter(n => n.status === 'overdue').map(note => (
                          <div key={note.id} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border-2 border-rose-100 group">
                             <div>
                                <p className="font-black text-slate-900 uppercase text-sm">{note.orderCode}</p>
                                <p className="text-[10px] font-bold text-rose-600 uppercase">Quá hạn từ {note.dueDate.toLocaleDateString('vi-VN')}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-lg font-black text-rose-600">{note.balanceAmount.toLocaleString()}đ</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase">Tiền còn lại</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-2xl">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black uppercase flex items-center gap-3"><Wallet size={24} className="text-emerald-600"/> Nhật ký thanh toán</h3>
                      <button onClick={() => setShowPaymentForm(true)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg"><Plus size={16}/> Nhận tiền</button>
                   </div>
                   <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {customerPayments.length === 0 ? (
                        <p className="py-10 text-center text-slate-300 font-black uppercase tracking-widest italic">Chưa có bản ghi thanh toán nào.</p>
                      ) : (
                        customerPayments.map(pay => (
                          <div key={pay.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg border border-emerald-200"><DollarSign size={20} className="text-emerald-600"/></div>
                                <div>
                                   <p className="font-black text-slate-900 text-sm">+{pay.amount.toLocaleString()}đ</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(pay.date).toLocaleDateString('vi-VN')} • {pay.method === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
                                </div>
                             </div>
                             <button onClick={() => onDeletePayment(pay.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>

        {showPaymentForm && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[110] flex items-center justify-center p-6">
             <form onSubmit={handlePaymentSubmit} className="bg-white w-full max-w-lg rounded-[2.5rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                   <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3"><Plus size={24}/> Ghi nhận thu tiền nợ</h3>
                   <button type="button" onClick={() => setShowPaymentForm(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Số tiền thu</label>
                      <input type="number" value={paymentData.amount} onChange={e => setPaymentData(p => ({...p, amount: Number(e.target.value)}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl font-black text-3xl text-emerald-600 outline-none focus:border-emerald-600 shadow-inner" required />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ngày thu</label>
                         <input type="date" value={paymentData.date} onChange={e => setPaymentData(p => ({...p, date: e.target.value}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl font-black text-sm outline-none focus:border-blue-600" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hình thức</label>
                         <select value={paymentData.method} onChange={e => setPaymentData(p => ({...p, method: e.target.value as any}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl font-black text-xs outline-none focus:border-blue-600">
                            <option value="transfer">Chuyển khoản</option>
                            <option value="cash">Tiền mặt</option>
                         </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ghi chú (Nội dung CK...)</label>
                      <textarea value={paymentData.note} onChange={e => setPaymentData(p => ({...p, note: e.target.value}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl font-bold min-h-[100px]" placeholder="..." />
                   </div>
                </div>
                <div className="p-8 bg-slate-50 border-t-4 border-slate-100 flex justify-end gap-4">
                   <button type="button" onClick={() => setShowPaymentForm(false)} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400">Hủy</button>
                   <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-emerald-800 flex items-center gap-2 active:scale-95 transition-all">
                      <Save size={18} /> XÁC NHẬN THU TIỀN
                   </button>
                </div>
             </form>
          </div>
        )}

        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-300">
             <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[3rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden my-auto">
                <div className="p-10 bg-slate-950 text-white flex justify-between items-center shrink-0">
                   <h3 className="text-2xl font-black uppercase tracking-tight">{editingCustomer ? 'Sửa hồ sơ khách hàng' : 'Thiết lập hồ sơ khách hàng'}</h3>
                   <button type="button" onClick={() => { setShowAddForm(false); setEditingCustomer(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <CustomerInput label="Tên khách hàng" placeholder="VD: LA CAMIE" value={newCustomer.name} onChange={v => setNewCustomer(p => ({...p, name: v}))} required />
                   <CustomerInput label="Mã ký hiệu" placeholder="VD: LC" value={newCustomer.code} onChange={v => setNewCustomer(p => ({...p, code: v}))} required />
                   <CustomerInput label="Người liên hệ" placeholder="VD: Anh Nam" value={newCustomer.contactPerson} onChange={v => setNewCustomer(p => ({...p, contactPerson: v}))} />
                   <CustomerInput label="Số điện thoại" placeholder="VD: 09..." value={newCustomer.phone} onChange={v => setNewCustomer(p => ({...p, phone: v}))} />
                   
                   {/* Trường mới: Quản lý nợ */}
                   <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 md:col-span-2 grid grid-cols-2 gap-6">
                      <CustomerInput label="Hạn nợ (Số ngày)" type="number" value={String(newCustomer.debtDays)} onChange={v => setNewCustomer(p => ({...p, debtDays: Number(v)}))} required />
                      <CustomerInput label="Hạn mức nợ (Số tiền)" type="number" value={String(newCustomer.debtLimit)} onChange={v => setNewCustomer(p => ({...p, debtLimit: Number(v)}))} required />
                      <p className="col-span-2 text-[9px] font-bold text-blue-400 italic">Cấu hình riêng theo đàm phán với khách hàng này.</p>
                   </div>

                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Địa chỉ văn phòng</label>
                      <textarea value={newCustomer.address} onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold min-h-[100px]" placeholder="Nhập địa chỉ chi tiết..." />
                   </div>
                </div>
                <div className="p-10 bg-slate-50 border-t-4 border-slate-100 flex justify-end gap-4 shrink-0">
                   <button type="button" onClick={() => { setShowAddForm(false); setEditingCustomer(null); }} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Hủy bỏ</button>
                   <button type="submit" className="px-10 py-4 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-4 border-blue-900 active:scale-95 transition-all hover:bg-blue-600">Lưu thông tin</button>
                </div>
             </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Danh mục Khách Hàng</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Quản lý đối tác và công nợ giao nhận</p>
         </div>
         <button onClick={() => { setEditingCustomer(null); setNewCustomer({ name: '', code: '', contactPerson: '', phone: '', address: '', debtDays: 30, debtLimit: 500000000 }); setShowAddForm(true); }} className="px-8 py-4 bg-slate-950 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl border-4 border-slate-800">
            <Plus size={20} /> Thêm đối tác mới
         </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-300">
           <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[3rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden my-auto">
              <div className="p-10 bg-slate-950 text-white flex justify-between items-center shrink-0">
                 <h3 className="text-2xl font-black uppercase tracking-tight">{editingCustomer ? 'Sửa hồ sơ khách hàng' : 'Thiết lập hồ sơ khách hàng'}</h3>
                 <button type="button" onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <CustomerInput label="Tên khách hàng" placeholder="VD: LA CAMIE" value={newCustomer.name} onChange={v => setNewCustomer(p => ({...p, name: v}))} required />
                 <CustomerInput label="Mã ký hiệu" placeholder="VD: LC" value={newCustomer.code} onChange={v => setNewCustomer(p => ({...p, code: v}))} required />
                 <CustomerInput label="Người liên hệ" placeholder="VD: Anh Nam" value={newCustomer.contactPerson} onChange={v => setNewCustomer(p => ({...p, contactPerson: v}))} />
                 <CustomerInput label="Số điện thoại" placeholder="VD: 09..." value={newCustomer.phone} onChange={v => setNewCustomer(p => ({...p, phone: v}))} />
                 
                 {/* Trường mới: Quản lý nợ */}
                 <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 md:col-span-2 grid grid-cols-2 gap-6">
                    <CustomerInput label="Hạn nợ (Số ngày)" type="number" value={String(newCustomer.debtDays)} onChange={v => setNewCustomer(p => ({...p, debtDays: Number(v)}))} required />
                    <CustomerInput label="Hạn mức nợ (Số tiền)" type="number" value={String(newCustomer.debtLimit)} onChange={v => setNewCustomer(p => ({...p, debtLimit: Number(v)}))} required />
                    <p className="col-span-2 text-[9px] font-bold text-blue-400 italic">Cấu hình riêng theo đàm phán với khách hàng này.</p>
                 </div>

                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Địa chỉ văn phòng</label>
                    <textarea value={newCustomer.address} onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold min-h-[100px]" placeholder="Nhập địa chỉ chi tiết..." />
                 </div>
              </div>
              <div className="p-10 bg-slate-50 border-t-4 border-slate-100 flex justify-end gap-4 shrink-0">
                 <button type="button" onClick={() => setShowAddForm(false)} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Hủy bỏ</button>
                 <button type="submit" className="px-10 py-4 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-4 border-blue-900 active:scale-95 transition-all hover:bg-blue-600">Lưu thông tin</button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
         {customers.map(customer => {
           const count = orders.filter(o => o.customerId === customer.id || o.customerName === customer.name).length;
           
           // Tính nợ cho card tổng quát
           const cShipping = shippingNotes.filter(s => s.customerId === customer.id || s.customerName === customer.name);
           const cPayments = payments.filter(p => p.customerId === customer.id);
           const debt = cShipping.reduce((a, b) => a + b.balanceAmount, 0) - cPayments.reduce((a, b) => a + b.amount, 0);
           const overLimit = debt > customer.debtLimit;

           return (
             <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className={`bg-white p-8 rounded-[2.5rem] border-[6px] shadow-xl hover:-translate-y-3 transition-all cursor-pointer group ${overLimit ? 'border-rose-600' : 'border-slate-950'}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 text-white rounded-2xl shadow-lg border-2 ${overLimit ? 'bg-rose-600 border-rose-800' : 'bg-slate-950 border-slate-800 group-hover:bg-blue-600'}`}>
                      <UserIcon size={24} />
                   </div>
                   <div className="text-right">
                      <p className={`text-xl font-black leading-none ${debt > 0 ? (overLimit ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'}`}>
                        {debt > 0 ? (debt.toLocaleString() + 'đ') : 'Dư trả'}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Công nợ hiện tại</p>
                   </div>
                </div>
                <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-blue-700 transition-colors">{customer.name}</h3>
                <div className="space-y-3 pt-4 border-t-2 border-slate-50">
                   <div className="flex items-center gap-2 text-slate-500 text-xs font-bold"><Phone size={14} className="text-slate-300" /> {customer.phone || 'Chưa cập nhật'}</div>
                   <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span className="text-slate-400">Thời hạn nợ: {customer.debtDays} Ngày</span>
                      <span className="text-blue-600">{count} Đơn hàng</span>
                   </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">Ký hiệu: {customer.code}</span>
                   <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transform group-hover:translate-x-2 transition-all" />
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );
};

const CustomerInput: React.FC<{label: string, value?: string, type?: string, onChange: (v: string) => void, required?: boolean, placeholder?: string}> = ({label, value, type = "text", onChange, required, placeholder}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label} {required && '*'}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full p-4 bg-slate-50 border-4 border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-all font-black text-lg shadow-inner" />
  </div>
);

const CustomerStatCard: React.FC<{label: string, value: number | string, icon: React.ReactNode, color: string, suffix?: string}> = ({label, value, icon, color, suffix}) => {
  const colorMap: any = {
    blue: "border-blue-600 text-blue-700 bg-blue-50 shadow-blue-50",
    amber: "border-amber-500 text-amber-700 bg-amber-50 shadow-amber-50",
    emerald: "border-emerald-500 text-emerald-700 bg-emerald-50 shadow-emerald-50",
    rose: "border-rose-600 text-rose-700 bg-rose-50 shadow-rose-50"
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border-4 shadow-2xl relative overflow-hidden group ${colorMap[color]}`}>
       <div className="relative z-10 space-y-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg inline-block">{icon}</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
          <p className="text-3xl font-black text-slate-950 tracking-tighter">{typeof value === 'number' ? value.toLocaleString() : value} <span className="text-lg uppercase text-slate-400 ml-1">{suffix}</span></p>
       </div>
       <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform">{icon}</div>
    </div>
  );
};

const Wallet = ({size, className}: {size: number, className?: string}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>;

export default CustomerManager;
