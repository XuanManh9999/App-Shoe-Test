
import React, { useState, useMemo } from 'react';
import { ProductionOrder, ShippingNote, OrderStatus, ShippingDetailRow, SizeBreakdown, User, UserRole, Gender, ShippingEditLog } from '../types';
import { 
  Truck, Search, PackageCheck, Calendar, Printer, Plus, X, 
  ArrowRight, FileSpreadsheet, DollarSign, CreditCard, ChevronDown, Save, Eye, Edit, Trash2, History, AlertCircle, Filter, CalendarRange
} from 'lucide-react';

interface Props {
  orders: ProductionOrder[];
  shippingNotes: ShippingNote[];
  onAdd: (note: ShippingNote) => void;
  onUpdate: (note: ShippingNote) => void;
  onDelete: (id: string) => void;
  user: User;
}

type TimeFilter = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'custom';

const ShippingManager: React.FC<Props> = ({ orders, shippingNotes, onAdd, onUpdate, onDelete, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [editingNote, setEditingNote] = useState<ShippingNote | null>(null);
  const [viewingNote, setViewingNote] = useState<ShippingNote | null>(null);

  const finishedOrders = useMemo(() => {
    return orders.filter(order => {
      const isFinished = order.stages.every(s => s.status === 'done');
      const alreadyShipped = shippingNotes.some(note => note.orderId === order.id);
      return isFinished && order.status !== OrderStatus.CANCELLED;
    });
  }, [orders, shippingNotes]);

  const filteredOrders = finishedOrders.filter(o => 
    o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Logic lọc lịch sử phiếu giao hàng theo thời gian (bao gồm cả tùy chỉnh)
  const filteredShippingNotes = useMemo(() => {
    return shippingNotes.filter(note => {
      const noteDate = new Date(note.shippingDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const isSearchMatch = note.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.itemCode.toLowerCase().includes(searchTerm.toLowerCase());

      if (!isSearchMatch) return false;

      switch (timeFilter) {
        case 'today':
          return noteDate >= today;
        case 'yesterday':
          const yesterday = new Date(today.getTime() - 86400000);
          return noteDate >= yesterday && noteDate < today;
        case 'thisWeek':
          const day = today.getDay() || 7; 
          const monday = new Date(today.getTime() - (day - 1) * 86400000);
          return noteDate >= monday;
        case 'thisMonth':
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return noteDate >= firstDayOfMonth;
        case 'custom':
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return noteDate >= start && noteDate <= end;
        default:
          return true;
      }
    });
  }, [shippingNotes, timeFilter, searchTerm, customStartDate, customEndDate]);

  const startShipping = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setEditingNote(null);
    setShowShippingForm(true);
  };

  const startEditShipping = (note: ShippingNote) => {
    const order = orders.find(o => o.id === note.orderId);
    if (!order) return alert("Không tìm thấy lệnh gốc của phiếu này.");
    setSelectedOrder(order);
    setEditingNote(note);
    setShowShippingForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-4">
            <Truck className="text-blue-600" />
            XUẤT HÀNG & GIAO NHẬN
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Quản lý đóng thùng và phiếu giao hàng thực tế</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm mã lệnh, khách hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-6 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-blue-600 outline-none w-72 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-4">Đơn hàng chờ xuất ({filteredOrders.length})</h3>
           <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-slate-300">
                  Chưa có đơn hàng nào hoàn thành sản xuất.
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm hover:border-blue-600 transition-all group">
                     <div className="flex gap-4 items-start">
                        <img src={order.productImage} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" alt="" />
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">DONE 100%</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.itemCode}</span>
                           </div>
                           <h4 className="text-lg font-black text-slate-900 uppercase truncate mt-1">{order.orderCode}</h4>
                           <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5">{order.customerName}</p>
                        </div>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                           <p className="text-xl font-black text-slate-900 leading-none">{order.totalQuantity}</p>
                           <p className="text-[8px] font-black text-slate-400 uppercase">Sản lượng SX</p>
                        </div>
                        <button onClick={() => startShipping(order)} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-600 transition-all">
                           <FileSpreadsheet size={14} /> Lập phiếu giao
                        </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Lịch sử xuất hàng gần đây</h3>
                
                {/* BỘ LỌC THỜI GIAN */}
                <div className="flex items-center bg-white p-1 rounded-xl border-2 border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
                  <FilterButton active={timeFilter === 'all'} label="Tất cả" onClick={() => setTimeFilter('all')} />
                  <FilterButton active={timeFilter === 'today'} label="Hôm nay" onClick={() => setTimeFilter('today')} />
                  <FilterButton active={timeFilter === 'yesterday'} label="Hôm qua" onClick={() => setTimeFilter('yesterday')} />
                  <FilterButton active={timeFilter === 'thisWeek'} label="Tuần này" onClick={() => setTimeFilter('thisWeek')} />
                  <FilterButton active={timeFilter === 'thisMonth'} label="Tháng này" onClick={() => setTimeFilter('thisMonth')} />
                  <FilterButton active={timeFilter === 'custom'} label="Tùy chọn" icon={<CalendarRange size={12} />} onClick={() => setTimeFilter('custom')} />
                </div>
              </div>

              {/* Ô NHẬP NGÀY TÙY CHỈNH */}
              {timeFilter === 'custom' && (
                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-1">Từ ngày</label>
                    <input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                  <ArrowRight size={16} className="text-blue-300 mt-4" />
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-1">Đến ngày</label>
                    <input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}
           </div>

           <div className="bg-white rounded-[2.5rem] border-4 border-slate-950 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-center border-collapse">
                    <thead>
                       <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
                          <th className="p-5 text-left">Phiếu Giao / Khách</th>
                          <th className="p-5">Mã Hàng</th>
                          <th className="p-5">SL Thực Xuất</th>
                          <th className="p-5">Thành Tiền</th>
                          <th className="p-5 text-right pr-8">Thao tác</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50 font-black text-slate-950">
                       {filteredShippingNotes.length === 0 ? (
                         <tr><td colSpan={5} className="py-20 text-slate-300 font-black uppercase tracking-widest italic">Không tìm thấy phiếu nào trong khoảng này</td></tr>
                       ) : (
                         filteredShippingNotes.map(note => (
                           <tr key={note.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="p-5 text-left">
                                 <p className="text-sm font-black uppercase tracking-tight">{note.orderCode}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">{note.customerName} • {new Date(note.shippingDate).toLocaleDateString('vi-VN')}</p>
                              </td>
                              <td className="p-5 text-xs font-black text-slate-600">{note.itemCode}</td>
                              <td className="p-5 text-xl text-blue-600">{note.totalQuantity} <span className="text-[9px] uppercase">Đôi</span></td>
                              <td className="p-5 text-lg text-emerald-600">{note.totalAmount.toLocaleString()}đ</td>
                              <td className="p-5 text-right pr-8">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setViewingNote(note)} className="p-2 bg-white border-2 border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"><Eye size={18} /></button>
                                    <button onClick={() => startEditShipping(note)} className="p-2 bg-white border-2 border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 rounded-xl transition-all"><Edit size={18} /></button>
                                    <button onClick={() => onDelete(note.id)} className="p-2 bg-white border-2 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all"><Trash2 size={18} /></button>
                                 </div>
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {(showShippingForm && selectedOrder) && (
        <ShippingFormModal 
          order={selectedOrder} 
          editingNote={editingNote}
          user={user}
          onClose={() => { setShowShippingForm(false); setSelectedOrder(null); setEditingNote(null); }}
          onSave={(note) => { 
            if (editingNote) onUpdate(note);
            else onAdd(note);
            setShowShippingForm(false); 
            setSelectedOrder(null);
            setEditingNote(null);
          }}
        />
      )}

      {viewingNote && (
        <ShippingViewModal 
          note={viewingNote} 
          onClose={() => setViewingNote(null)} 
          gender={orders.find(o => o.id === viewingNote.orderId)?.gender || Gender.FEMALE}
        />
      )}
    </div>
  );
};

const FilterButton = ({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon?: React.ReactNode }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
      active ? 'bg-slate-950 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ShippingFormModal = ({ order, editingNote, user, onClose, onSave }: { order: ProductionOrder, editingNote: ShippingNote | null, user: User, onClose: () => void, onSave: (note: ShippingNote) => void }) => {
  const [shippingDate, setShippingDate] = useState(editingNote?.shippingDate || new Date().toISOString().split('T')[0]);
  const [details, setDetails] = useState<ShippingDetailRow[]>(editingNote?.details || order.details.map(d => ({
    ...d,
    unitPrice: 0,
    amount: 0
  })));
  const [deposit, setDeposit] = useState(editingNote?.depositAmount || 0);
  const [depositDate, setDepositDate] = useState(editingNote?.depositDate || '');
  const [note, setNote] = useState(editingNote?.note || '');
  const [editReason, setEditReason] = useState('');

  const femaleSizes = [34, 35, 36, 37, 38, 39, 40];
  const maleSizes = [38, 39, 40, 41, 42, 43, 44, 45];
  const activeSizes = order.gender === Gender.FEMALE ? femaleSizes : maleSizes;

  const updateSize = (rowIndex: number, size: number, value: number) => {
    const newDetails = [...details];
    const row = { ...newDetails[rowIndex] };
    const sizes = { ...row.sizes, [`size${size}`]: value };
    row.sizes = sizes;
    row.total = Object.values(sizes).reduce((a, b) => a + (b || 0), 0);
    row.amount = row.total * row.unitPrice;
    newDetails[rowIndex] = row;
    setDetails(newDetails);
  };

  const updatePrice = (rowIndex: number, price: number) => {
    const newDetails = [...details];
    const row = { ...newDetails[rowIndex] };
    row.unitPrice = price;
    row.amount = row.total * price;
    newDetails[rowIndex] = row;
    setDetails(newDetails);
  };

  const totalQuantity = details.reduce((a, b) => a + b.total, 0);
  const totalAmount = details.reduce((a, b) => a + b.amount, 0);
  const balance = totalAmount - deposit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNote && !editReason.trim()) {
      return alert("Vui lòng nhập lý do sửa phiếu giao hàng.");
    }

    const editLog: ShippingEditLog | null = editingNote ? {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      reason: editReason,
      user: user.fullName
    } : null;

    const newNote: ShippingNote = {
      id: editingNote?.id || crypto.randomUUID(),
      orderId: order.id,
      orderCode: order.orderCode,
      customerId: order.customerId,
      customerName: order.customerName,
      itemCode: order.itemCode,
      shippingDate,
      productImage: order.productImage,
      details,
      totalQuantity,
      totalAmount,
      depositAmount: deposit,
      balanceAmount: balance,
      depositDate,
      note,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: editingNote ? new Date().toISOString() : undefined,
      editHistory: editLog 
        ? [editLog, ...(editingNote?.editHistory || [])] 
        : (editingNote?.editHistory || [])
    };
    onSave(newNote);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-[95vw] lg:max-w-7xl rounded-[2.5rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
         <div className="p-6 bg-slate-950 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
               <FileSpreadsheet className="text-blue-400" size={24} />
               <h3 className="text-xl font-black uppercase tracking-tight italic">
                 {editingNote ? 'CẬP NHẬT PHIẾU GIAO HÀNG' : 'LẬP PHIẾU XUẤT KHO GIAO HÀNG'}
               </h3>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
         </div>

         <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
            {editingNote && (
               <div className="mb-8 p-6 bg-amber-50 border-4 border-amber-400 rounded-3xl animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                     <AlertCircle className="text-amber-600" size={24} />
                     <h4 className="text-base font-black uppercase text-amber-900">Yêu cầu ghi lý do thay đổi nội dung phiếu</h4>
                  </div>
                  <textarea 
                    required
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-amber-200 rounded-xl font-bold text-sm outline-none focus:border-amber-500"
                    placeholder="Nhập lý do sửa phiếu tại đây (Ví dụ: Thay đổi đơn giá theo thỏa thuận mới, Sửa lại số lượng thực giao...)"
                  />
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 border-b-4 border-slate-950 pb-8">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Khách hàng</label>
                  <p className="text-2xl font-black text-slate-950 uppercase">{order.customerName}</p>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lệnh sản xuất</label>
                  <p className="text-2xl font-black text-blue-600 uppercase">{order.orderCode}</p>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mã hàng xuất</label>
                  <p className="text-2xl font-black text-slate-950 uppercase">{order.itemCode}</p>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ngày giao thực tế</label>
                  <input type="date" value={shippingDate} onChange={e => setShippingDate(e.target.value)} className="w-full p-2 bg-slate-100 border-2 border-slate-200 rounded-xl font-black text-sm" />
               </div>
            </div>

            <div className="border-4 border-slate-950 overflow-hidden rounded-2xl shadow-xl">
               <table className="w-full text-center border-collapse">
                  <thead>
                     <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
                        <th className="p-4 border-r-2 border-slate-800" rowSpan={2}>PHỐI MÀU</th>
                        <th className="p-4 border-r-2 border-slate-800" colSpan={activeSizes.length}>DẢI SIZE (SỬA SỐ LƯỢNG THỰC XUẤT)</th>
                        <th className="p-4 border-r-2 border-slate-800" rowSpan={2}>TỔNG CỘNG</th>
                        <th className="p-4 border-r-2 border-slate-800" rowSpan={2}>ĐƠN GIÁ (VNĐ)</th>
                        <th className="p-4" rowSpan={2}>THÀNH TIỀN</th>
                     </tr>
                     <tr className="bg-slate-800 text-slate-300 font-black text-[10px] uppercase">
                        {activeSizes.map(s => <th key={s} className="p-2 border-r-2 border-slate-700">{s}</th>)}
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 font-black">
                     {details.map((row, i) => (
                       <tr key={row.id}>
                          <td className="p-4 text-left border-r-2 border-slate-100 bg-slate-50">
                             <p className="text-xs uppercase">{row.color}</p>
                             <p className="text-[8px] text-slate-400">{row.lining}</p>
                          </td>
                          {activeSizes.map(s => (
                            <td key={s} className="p-1 border-r-2 border-slate-100">
                               <input 
                                 type="number" 
                                 onFocus={e => e.target.select()}
                                 value={row.sizes[`size${s}` as keyof SizeBreakdown] || 0}
                                 onChange={e => updateSize(i, s, Number(e.target.value))}
                                 className="w-full p-2 bg-white border border-slate-200 rounded text-center text-blue-600 focus:border-blue-500 outline-none" 
                               />
                            </td>
                          ))}
                          <td className="p-4 border-r-2 border-slate-100 bg-blue-50 text-blue-700 text-lg">{row.total}</td>
                          <td className="p-4 border-r-2 border-slate-100 w-32">
                             <input 
                               type="number" 
                               onFocus={e => e.target.select()}
                               value={row.unitPrice}
                               onChange={e => updatePrice(i, Number(e.target.value))}
                               className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-center font-black"
                               placeholder="0"
                             />
                          </td>
                          <td className="p-4 bg-emerald-50 text-emerald-700 text-lg">{(row.amount).toLocaleString()}đ</td>
                       </tr>
                     ))}
                  </tbody>
                  <tfoot className="bg-slate-950 text-white font-black">
                     <tr>
                        <td className="p-6 text-right uppercase tracking-widest text-xs" colSpan={activeSizes.length + 1}>CỘNG TỔNG PHIẾU:</td>
                        <td className="p-6 text-3xl text-yellow-400">{totalQuantity} <span className="text-[10px] block text-white/50">Đôi</span></td>
                        <td className="p-6 border-l-2 border-slate-800"></td>
                        <td className="p-6 text-2xl text-emerald-400">{totalAmount.toLocaleString()}đ</td>
                     </tr>
                  </tfoot>
               </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><CreditCard size={14}/> Số tiền khách cọc</label>
                  <input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value))} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-xl text-emerald-600 outline-none focus:border-emerald-500" placeholder="0" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><Calendar size={14}/> Ngày cọc</label>
                  <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-black text-lg" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><DollarSign size={14}/> Còn lại thanh toán</label>
                  <div className="w-full p-4 bg-rose-600 text-white rounded-2xl font-black text-3xl flex items-center justify-center shadow-lg">
                     {balance.toLocaleString()}đ
                  </div>
               </div>
               <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ghi chú giao hàng</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl font-bold min-h-[80px]" placeholder="..." />
               </div>
            </div>
         </div>

         <div className="p-6 bg-slate-100 border-t-4 border-slate-950 flex justify-end gap-4 shrink-0">
            <button type="button" onClick={onClose} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400">Hủy</button>
            <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-blue-800 flex items-center gap-3 active:scale-95 transition-all">
               <Save size={18} /> {editingNote ? 'CẬP NHẬT PHIẾU GIAO' : 'LƯU PHIẾU GIAO HÀNG'}
            </button>
         </div>
      </form>
    </div>
  );
};

const ShippingViewModal = ({ note, onClose, gender }: { note: ShippingNote, onClose: () => void, gender: Gender }) => {
  const femaleSizes = [34, 35, 36, 37, 38, 39, 40];
  const maleSizes = [38, 39, 40, 41, 42, 43, 44, 45];
  const activeSizes = gender === Gender.FEMALE ? femaleSizes : maleSizes;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
       <div className="bg-white w-full max-w-6xl rounded-[2.5rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:w-full print:border-0 print:rounded-none">
          <div className="p-6 bg-slate-950 text-white flex justify-between items-center shrink-0 print:hidden">
             <div className="flex items-center gap-4">
                <h3 className="font-black uppercase tracking-widest text-sm">Xem Phiếu Giao Hàng</h3>
                {note.updatedAt && (
                  <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">
                    <History size={12}/> Đã chỉnh sửa
                  </span>
                )}
             </div>
             <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-5 py-2.5 bg-blue-600 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Printer size={16}/> IN PHIẾU</button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar print:p-0 print:overflow-visible">
             <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black uppercase text-slate-900 leading-none">BÌNH VƯƠNG FOOTWEAR</h2>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Xưởng Sản Xuất Giày Dép Cao Cấp</p>
                </div>
                <div className="text-right">
                   <h1 className="text-3xl font-black uppercase underline underline-offset-8 decoration-4 decoration-blue-600">PHIẾU GIAO HÀNG</h1>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Số phiếu: {note.id.substring(0, 8).toUpperCase()}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10 mb-8 font-black text-sm uppercase">
                <div className="space-y-2 border-l-4 border-slate-950 pl-4">
                   <p className="text-slate-400 text-[10px]">KHÁCH HÀNG:</p>
                   <p className="text-xl">{note.customerName}</p>
                </div>
                <div className="space-y-2 border-r-4 border-slate-950 pr-4 text-right">
                   <p className="text-slate-400 text-[10px]">NGÀY GIAO HÀNG:</p>
                   <p className="text-xl">{new Date(note.shippingDate).toLocaleDateString('vi-VN')}</p>
                </div>
             </div>

             <div className="border-[4px] border-slate-950 overflow-hidden mb-8">
                <table className="w-full text-center border-collapse text-sm">
                   <thead>
                      <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest border-b-4 border-slate-950">
                         <th className="p-3 border-r-2 border-slate-800" rowSpan={2}>PHỐI MÀU</th>
                         <th className="p-2 border-r-2 border-slate-800" colSpan={activeSizes.length}>CHI TIẾT SIZE</th>
                         <th className="p-3 border-r-2 border-slate-800" rowSpan={2}>TỔNG SL</th>
                         <th className="p-3 border-r-2 border-slate-800" rowSpan={2}>ĐƠN GIÁ</th>
                         <th className="p-3" rowSpan={2}>THÀNH TIỀN</th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-900 font-black text-[9px] uppercase border-b-2 border-slate-950">
                         {activeSizes.map(s => <th key={s} className="p-1.5 border-r border-slate-300">{s}</th>)}
                      </tr>
                   </thead>
                   <tbody className="divide-y-2 divide-slate-200 font-black text-xs">
                      {note.details.map((row, i) => (
                        <tr key={i}>
                           <td className="p-3 text-left border-r-2 border-slate-100 bg-slate-50/50">
                              <p className="uppercase">{row.color}</p>
                              <p className="text-[8px] text-slate-400">{row.lining}</p>
                           </td>
                           {activeSizes.map(s => (
                             <td key={s} className="p-1.5 border-r border-slate-100 tabular-nums">
                                {row.sizes[`size${s}` as keyof SizeBreakdown] || '-'}
                             </td>
                           ))}
                           <td className="p-3 border-r-2 border-slate-100 text-lg bg-blue-50/30">{row.total}</td>
                           <td className="p-3 border-r-2 border-slate-100">{row.unitPrice.toLocaleString()}đ</td>
                           <td className="p-3 bg-slate-50 font-bold">{row.amount.toLocaleString()}đ</td>
                        </tr>
                      ))}
                   </tbody>
                   <tfoot className="border-t-4 border-slate-950 font-black text-sm">
                      <tr className="bg-slate-950 text-white">
                         <td className="p-4 text-right uppercase text-[10px]" colSpan={activeSizes.length + 1}>CỘNG TỔNG SL:</td>
                         <td className="p-4 text-2xl text-yellow-400">{note.totalQuantity} <span className="text-[8px] text-white/50">Đôi</span></td>
                         <td className="p-4 border-l-2 border-slate-800"></td>
                         <td className="p-4 text-xl text-emerald-400">{note.totalAmount.toLocaleString()}đ</td>
                      </tr>
                   </tfoot>
                </table>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                   {note.note && (
                     <div className="p-4 bg-slate-50 border-l-4 border-blue-600 print:border-l-2">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Ghi chú giao nhận:</p>
                        <p className="text-xs font-bold italic text-slate-700">{note.note}</p>
                     </div>
                   )}
                   
                   {/* Nhật ký sửa đổi - Ẩn khi in nếu muốn */}
                   {note.editHistory && note.editHistory.length > 0 && (
                     <div className="space-y-3 print:hidden">
                        <p className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-2"><History size={12}/> Nhật ký thay đổi nội dung phiếu:</p>
                        {note.editHistory.map(log => (
                          <div key={log.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-amber-700 uppercase">{new Date(log.date).toLocaleString('vi-VN')}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">Người sửa: {log.user}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-600 italic">Lý do: {log.reason}</p>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="space-y-2 text-xs font-black uppercase">
                      <div className="flex justify-between border-b border-slate-100 py-1">
                         <span className="text-slate-400">Tiền hàng:</span>
                         <span>{note.totalAmount.toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1 text-rose-600">
                         <span className="text-slate-400">Đã cọc:</span>
                         <span>-{note.depositAmount.toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between py-2 text-xl bg-slate-900 text-white px-4 rounded-xl mt-2">
                         <span className="text-white/50">CÒN LẠI:</span>
                         <span className="text-yellow-400">{note.balanceAmount.toLocaleString()}đ</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 text-center font-black uppercase text-[10px] pt-10">
                   <div className="space-y-20">
                      <p>NGƯỜI NHẬN HÀNG</p>
                      <p className="text-slate-300">(Ký & Ghi rõ họ tên)</p>
                   </div>
                   <div className="space-y-20">
                      <p>KHO BÌNH VƯƠNG</p>
                      <p className="text-slate-300">(Ký & Ghi rõ họ tên)</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ShippingManager;
