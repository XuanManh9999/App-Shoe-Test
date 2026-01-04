
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductionOrder, StageStatus, ReturnLog, Priority, OrderStatus, Gender, SizeBreakdown, User, UserRole } from '../types';
import { 
  ChevronLeft, Printer, Trash2, RefreshCcw, Scissors, HardDrive, 
  Calendar, AlertTriangle, Zap, Clock, Layers, CheckCircle2, Truck, X, Save
} from 'lucide-react';

interface Props {
  orders: ProductionOrder[];
  onUpdate: (order: ProductionOrder) => void;
  onDelete?: (id: string) => void;
  onAddReturn: (ret: ReturnLog) => void;
  user: User;
}

const OrderDetail: React.FC<Props> = ({ orders, onUpdate, onDelete, onAddReturn, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnLog, setReturnLog] = useState<Partial<ReturnLog>>({
    color: '',
    size: 37,
    quantity: 1,
    reason: ''
  });

  const order = orders.find(o => o.id === id);
  if (!order) return <div className="p-20 text-center font-black uppercase text-slate-300 tracking-widest">Lệnh không tồn tại</div>;

  const activeSizeRange = order.gender === Gender.FEMALE ? [34, 35, 36, 37, 38, 39, 40] : [38, 39, 40, 41, 42, 43, 44, 45];

  const updateStageStatus = (stageId: string, status: StageStatus) => {
    if (user.role === UserRole.VIEWER) return alert("Bạn không có quyền.");
    if (order.status !== OrderStatus.ACTIVE) return alert("Lệnh đã khóa.");
    const updatedStages = order.stages.map(s => {
      if (s.id === stageId) {
        return { 
          ...s, 
          status, 
          startDate: status === StageStatus.IN_PROGRESS ? new Date().toISOString() : s.startDate,
          endDate: status === StageStatus.DONE ? new Date().toISOString() : s.endDate
        };
      }
      return s;
    });
    onUpdate({ ...order, stages: updatedStages });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReturn({
      ...returnLog as ReturnLog,
      id: crypto.randomUUID(),
      originalOrderId: order.id,
      date: new Date().toISOString()
    });
    setShowReturnForm(false);
  };

  const isAdmin = user.role === UserRole.ADMIN;
  const progressValue = (order.stages.filter(s => s.status === StageStatus.DONE).length / order.stages.length) * 100;
  const isFullyFinished = progressValue === 100;

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 print:px-0">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition-all bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-slate-200">
          <ChevronLeft size={20} /> Quay lại
        </button>
        <div className="flex gap-3">
          <button onClick={() => setShowReturnForm(true)} className="px-6 py-3 bg-rose-50 text-rose-600 border-2 border-rose-200 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm">
            <AlertTriangle size={18} /> Báo lỗi / Làm bù
          </button>
          {isFullyFinished && (
            <button onClick={() => navigate('/shipping')} className="px-6 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl animate-float">
              <Truck size={18} /> Lập Phiếu Giao
            </button>
          )}
          <button onClick={() => window.print()} className="px-6 py-3 bg-slate-950 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
            <Printer size={18} /> In Phiếu
          </button>
        </div>
      </div>

      <div className={`bg-white border-[6px] border-slate-950 shadow-2xl rounded-[3rem] overflow-hidden ${order.status === OrderStatus.CANCELLED ? 'grayscale opacity-50' : ''}`}>
        {/* Banner Status */}
        {isFullyFinished ? (
          <div className="bg-emerald-500 border-b-[6px] border-slate-950 p-6 flex items-center justify-center gap-6">
            <CheckCircle2 size={32} className="text-white" />
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">SẢN XUẤT HOÀN TẤT 100%</h2>
            </div>
            <Truck size={32} className="text-white" />
          </div>
        ) : progressValue >= 70 && (
          <div className="bg-yellow-400 border-b-[6px] border-slate-950 p-6 flex items-center justify-center gap-6 animate-pulse">
            <Zap size={32} fill="black" />
            <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic">LỆNH ĐÃ SẴN SÀNG (SS)</h2>
            <Zap size={32} fill="black" />
          </div>
        )}

        <div className="p-12 border-b-[6px] border-slate-950 bg-white grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="space-y-1">
            <h1 className="font-black text-4xl uppercase tracking-tighter text-slate-950">Bình Vương</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ERP Production System</p>
          </div>
          <div className="text-center"><h2 className="text-4xl font-black text-slate-950 uppercase tracking-[0.2em] underline decoration-[6px] underline-offset-8 decoration-blue-600">LỆNH SẢN XUẤT</h2></div>
          <div className="text-right flex flex-col items-end gap-2">
             <div className="bg-slate-950 p-4 rounded-2xl text-white inline-block">
                <p className="text-[9px] font-black text-slate-500 uppercase">Mã Số Lệnh</p>
                <p className="text-2xl font-black tracking-tighter">{order.orderCode}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 border-b-[6px] border-slate-950">
           <div className="lg:col-span-3 p-10 bg-slate-50 border-r-0 lg:border-r-[6px] border-slate-950 flex flex-col items-center justify-center">
              <img src={order.productImage} className="w-full aspect-square object-cover rounded-[2.5rem] border-4 border-slate-950 shadow-2xl" alt="" />
              <p className="mt-8 font-black text-3xl uppercase tracking-tighter bg-yellow-400 px-8 py-3 rounded-2xl border-4 border-slate-950 shadow-lg">{order.itemCode}</p>
           </div>
           <div className="lg:col-span-9 divide-y-[6px] divide-slate-950">
              <div className="p-10 grid grid-cols-3 gap-10 bg-white">
                 <div><p className="text-[10px] font-black text-slate-400 uppercase">Khách Hàng</p><p className="text-3xl font-black text-slate-950 uppercase">{order.customerName}</p></div>
                 <div><p className="text-[10px] font-black text-slate-400 uppercase">Ngày Đơn</p><p className="text-2xl font-black">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p></div>
                 <div className="text-right"><p className="text-[10px] font-black text-rose-400 uppercase">Hạn Giao</p><p className="text-3xl font-black text-rose-600">{new Date(order.deliveryDate).toLocaleDateString('vi-VN')}</p></div>
              </div>
              <div className="p-10 bg-emerald-50 grid grid-cols-4 gap-6">
                 {Object.entries(order.bom).map(([k, v]) => (
                   <div key={k}><p className="text-[9px] font-black text-emerald-600/50 uppercase">{k}</p><p className="text-sm font-black text-emerald-900">{v || '---'}</p></div>
                 ))}
              </div>
           </div>
        </div>

        {/* Tiến độ */}
        <div className="p-12 bg-slate-100">
           <h3 className="text-2xl font-black uppercase mb-10 flex items-center gap-4"><HardDrive size={32} className="text-blue-600" /> Tiến độ sản xuất</h3>
           <div className="grid grid-cols-7 gap-4">
              {order.stages.map((stage) => (
                <div key={stage.id} className={`p-6 rounded-[2.5rem] border-[4px] ${stage.status === 'done' ? 'bg-emerald-50 border-emerald-500' : stage.status === 'in_progress' ? 'bg-blue-600 border-slate-950 text-white shadow-xl scale-105' : 'bg-white border-slate-200'}`}>
                   <p className="font-black uppercase text-[10px] mb-4">{stage.name}</p>
                   <select 
                      disabled={user.role === UserRole.VIEWER} 
                      value={stage.status} 
                      onChange={(e) => updateStageStatus(stage.id, e.target.value as StageStatus)}
                      className="w-full text-[9px] font-black uppercase p-2 rounded-xl border-2 bg-slate-50 text-slate-900 outline-none"
                    >
                      <option value="pending">Chờ</option>
                      <option value="in_progress">Đang chạy</option>
                      <option value="done">Xong</option>
                   </select>
                </div>
              ))}
           </div>
        </div>

        {/* Bảng Size */}
        <div className="p-12 bg-white border-t-[6px] border-slate-950">
           <div className="overflow-x-auto rounded-[2rem] border-4 border-slate-950 overflow-hidden">
              <table className="w-full text-center border-collapse">
                 <thead>
                    <tr className="bg-slate-950 text-white font-black text-xs uppercase">
                       <th className="p-6 text-left">Phối màu</th>
                       {activeSizeRange.map(s => <th key={s} className="p-6">{s}</th>)}
                       <th className="p-6 bg-blue-700">Tổng</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-4 divide-slate-100 font-black text-slate-950">
                    {order.details.map((row) => (
                       <tr key={row.id}>
                          <td className="p-6 text-left border-r-2 border-slate-100"><p className="text-lg uppercase">{row.color}</p></td>
                          {activeSizeRange.map(s => <td key={s} className="p-6 border-r-2 border-slate-100 text-xl">{row.sizes[`size${s}` as keyof SizeBreakdown] || '-'}</td>)}
                          <td className="p-6 bg-slate-50 text-3xl text-blue-700 border-l-4 border-slate-950">{row.total}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* MODAL BÁO LỖI */}
      {showReturnForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <form onSubmit={handleReturnSubmit} className="bg-white w-full max-w-xl rounded-[3rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden">
              <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight italic">Ghi nhận sản phẩm lỗi & Làm bù</h3>
                 <button type="button" onClick={() => setShowReturnForm(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn phối màu lỗi</label>
                    <select value={returnLog.color} onChange={e => setReturnLog(p => ({...p, color: e.target.value}))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black uppercase text-sm" required>
                       <option value="">-- Chọn màu --</option>
                       {order.details.map(d => <option key={d.id} value={d.color}>{d.color}</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size lỗi</label>
                       <select value={returnLog.size} onChange={e => setReturnLog(p => ({...p, size: Number(e.target.value)}))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-lg">
                          {activeSizeRange.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng lỗi</label>
                       <input type="number" value={returnLog.quantity} onChange={e => setReturnLog(p => ({...p, quantity: Number(e.target.value)}))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-3xl text-blue-600 text-center" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lý do lỗi (VD: Hở keo, rách da...)</label>
                    <textarea value={returnLog.reason} onChange={e => setReturnLog(p => ({...p, reason: e.target.value}))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold min-h-[100px]" placeholder="..." required />
                 </div>
              </div>
              <div className="p-8 bg-slate-50 border-t-2 border-slate-100 flex justify-end gap-4">
                 <button type="button" onClick={() => setShowReturnForm(false)} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400">Hủy</button>
                 <button type="submit" className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-rose-800 flex items-center gap-2">
                    <Save size={18} /> GHI NHẬN & TẠO LỆNH BÙ
                 </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
