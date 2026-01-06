
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductionOrder, StageStatus, ReturnLog, Priority, OrderStatus, Gender, SizeBreakdown, User, UserRole } from '../types';
import { generateId } from '../utils';
import {
   ChevronLeft, Printer, Trash2, RefreshCcw, Scissors, HardDrive,
   Calendar, AlertTriangle, Zap, Clock, Layers, CheckCircle2, Truck, X, Save, ClipboardList
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
         id: generateId(),
         originalOrderId: order.id,
         date: new Date().toISOString()
      });
      setShowReturnForm(false);
   };

   const isAdmin = user.role === UserRole.ADMIN;
   const progressValue = (order.stages.filter(s => s.status === StageStatus.DONE).length / order.stages.length) * 100;
   const isFullyFinished = progressValue === 100;

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 print:max-w-full print:mx-0 print:px-0 print:pb-0">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 print:hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-widest transition-all bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-slate-200">
               <ChevronLeft size={20} /> Quay lại
            </button>
            <div className="flex flex-wrap gap-3">
               <button onClick={() => setShowReturnForm(true)} className="px-4 md:px-6 py-2.5 md:py-3 bg-rose-50 text-rose-600 border-2 border-rose-200 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-rose-100 active:bg-rose-200 transition-all shadow-sm touch-manipulation">
                  <AlertTriangle size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Báo lỗi / Làm bù</span><span className="sm:hidden">Báo lỗi</span>
               </button>
               {isFullyFinished && (
                  <button onClick={() => navigate('/shipping')} className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 transition-all shadow-xl animate-float touch-manipulation">
                     <Truck size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Lập Phiếu Giao</span><span className="sm:hidden">Giao hàng</span>
                  </button>
               )}
               <button onClick={() => window.print()} className="px-4 md:px-6 py-2.5 md:py-3 bg-slate-950 text-white rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-slate-800 active:bg-slate-900 transition-all shadow-xl touch-manipulation">
                  <Printer size={16} className="md:w-[18px] md:h-[18px]" /> In Phiếu
               </button>
            </div>
         </div>

         <div className={`bg-white border-[6px] border-slate-950 shadow-2xl rounded-[3rem] overflow-hidden print:border-2 print:rounded-lg print:shadow-none print:bg-white print:overflow-visible ${order.status === OrderStatus.CANCELLED ? 'grayscale opacity-50' : ''}`}>
            {/* Banner Status */}
            {isFullyFinished ? (
               <div className="bg-emerald-500 border-b-[6px] border-slate-950 p-6 flex items-center justify-center gap-6 print:p-3 print:border-b-2 print:gap-3">
                  <CheckCircle2 size={32} className="text-white print:w-6 print:h-6" />
                  <div className="text-center">
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic print:text-2xl">SẢN XUẤT HOÀN TẤT 100%</h2>
                  </div>
                  <Truck size={32} className="text-white print:w-6 print:h-6" />
               </div>
            ) : progressValue >= 70 && (
               <div className="bg-yellow-400 border-b-[6px] border-slate-950 p-6 flex items-center justify-center gap-6 animate-pulse print:p-3 print:border-b-2 print:gap-3 print:animate-none">
                  <Zap size={32} fill="black" className="print:w-6 print:h-6" />
                  <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter italic print:text-2xl">LỆNH ĐÃ SẴN SÀNG (SS)</h2>
                  <Zap size={32} fill="black" className="print:w-6 print:h-6" />
               </div>
            )}

            <div className="p-4 sm:p-8 md:p-12 border-b-[4px] sm:border-b-[6px] border-slate-950 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center print:p-6 print:border-b-2 print:gap-6 print:grid-cols-3">
               <div className="space-y-1">
                  <h1 className="font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tighter text-slate-950 print:text-2xl">Bình Vương</h1>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-[8px]">ERP Production System</p>
               </div>
               <div className="text-center"><h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-[0.1em] sm:tracking-[0.2em] underline decoration-[4px] sm:decoration-[6px] underline-offset-4 sm:underline-offset-8 decoration-blue-600 print:text-2xl print:decoration-2 print:underline-offset-4">LỆNH SẢN XUẤT</h2></div>
               <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
                  <div className="bg-slate-950 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white inline-block print:p-2 print:rounded-lg">
                     <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase print:text-[7px]">Mã Số Lệnh</p>
                     <p className="text-xl sm:text-2xl font-black tracking-tighter print:text-lg">{order.orderCode}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 border-b-[4px] sm:border-b-[6px] border-slate-950 print:border-b-2 print:grid-cols-12">
               <div className="lg:col-span-3 p-4 sm:p-6 md:p-10 bg-slate-50 border-r-0 lg:border-r-[6px] border-slate-950 flex flex-col items-center justify-center print:p-4 print:border-r-2 print:col-span-3">
                  <img src={order.productImage} className="w-full aspect-square object-cover rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-slate-950 shadow-xl sm:shadow-2xl print:rounded-lg print:border-2 print:shadow-none print:max-w-full" alt="" />
                  <p className="mt-4 sm:mt-6 md:mt-8 font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tighter bg-yellow-400 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-950 shadow-lg print:mt-3 print:text-lg print:px-3 print:py-2 print:rounded-lg print:border-2">{order.itemCode}</p>
               </div>
               <div className="lg:col-span-9 divide-y-[4px] sm:divide-y-[6px] divide-slate-950 print:divide-y-2 print:col-span-9">
                  <div className="p-4 sm:p-6 md:p-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-10 bg-white print:p-5 print:gap-5 print:grid-cols-3">
                     <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase print:text-[8px]">Khách Hàng</p><p className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 uppercase print:text-xl">{order.customerName}</p></div>
                     <div><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase print:text-[8px]">Ngày Đơn</p><p className="text-lg sm:text-xl md:text-2xl font-black print:text-lg">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p></div>
                     <div className="text-left sm:text-right"><p className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase print:text-[8px]">Hạn Giao</p><p className="text-xl sm:text-2xl md:text-3xl font-black text-rose-600 print:text-xl">{new Date(order.deliveryDate).toLocaleDateString('vi-VN')}</p></div>
                  </div>
                  <div className="p-4 sm:p-6 md:p-10 bg-emerald-50 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 print:p-5 print:gap-4 print:grid-cols-4">
                     {Object.entries(order.bom).map(([k, v]) => (
                        <div key={k}><p className="text-[8px] sm:text-[9px] font-black text-emerald-600/50 uppercase print:text-[7px]">{k}</p><p className="text-xs sm:text-sm font-black text-emerald-900 break-words print:text-xs">{v || '---'}</p></div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Tiến độ */}
            <div className="p-4 sm:p-8 md:p-12 bg-slate-100 print:p-5 print:bg-slate-100">
               <h3 className="text-xl sm:text-2xl font-black uppercase mb-6 sm:mb-8 md:mb-10 flex items-center gap-3 sm:gap-4 print:text-xl print:mb-5 print:gap-3"><HardDrive size={24} className="sm:w-8 sm:h-8 text-blue-600 print:w-6 print:h-6" /> Tiến độ sản xuất</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 print:gap-3 print:grid-cols-7">
                  {order.stages.map((stage) => (
                     <div key={stage.id} className={`p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-[2.5rem] border-[3px] sm:border-[4px] print:p-4 print:rounded-lg print:border-2 print:scale-100 ${stage.status === 'done' ? 'bg-emerald-50 border-emerald-500 print:bg-emerald-50 print:border-emerald-500' : stage.status === 'in_progress' ? 'bg-blue-600 border-slate-950 text-white shadow-xl scale-105 print:bg-blue-600 print:text-white print:border-slate-950' : 'bg-white border-slate-200 print:bg-white print:border-slate-200'}`}>
                        <p className="font-black uppercase text-[9px] sm:text-[10px] mb-3 sm:mb-4 print:text-[9px] print:mb-3 leading-tight">{stage.name}</p>
                        <select
                           disabled={user.role === UserRole.VIEWER}
                           value={stage.status}
                           onChange={(e) => updateStageStatus(stage.id, e.target.value as StageStatus)}
                           className="w-full text-[8px] sm:text-[9px] font-black uppercase p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 bg-slate-50 text-slate-900 outline-none print:hidden"
                        >
                           <option value="pending">Chờ</option>
                           <option value="in_progress">Đang chạy</option>
                           <option value="done">Xong</option>
                        </select>
                        <div className="hidden print:block text-[9px] font-black uppercase print:leading-tight">
                           {stage.status === 'done' ? '✓ XONG' : stage.status === 'in_progress' ? '⚡ ĐANG' : '○ CHỜ'}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Bảng Size */}
            <div className="p-4 sm:p-8 md:p-12 bg-white border-t-[4px] sm:border-t-[6px] border-slate-950 print:p-5 print:border-t-2">
               <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 sm:mb-6 print:text-lg print:mb-3 print:block">Phân bố chi tiết số lượng đơn</h3>
               <div className="overflow-x-auto rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-950 overflow-hidden print:rounded-lg print:border-2 print:overflow-visible custom-scrollbar">
                  <table className="w-full text-center border-collapse print:text-sm print:table-auto min-w-[600px] print:w-full print:border-collapse">
                     <thead className="print:table-header-group">
                        <tr className="bg-slate-950 text-white font-black text-[10px] sm:text-xs uppercase print:text-[10px] print:bg-slate-950">
                           <th className="p-3 sm:p-4 md:p-6 text-left print:p-2 print:text-left sticky left-0 bg-slate-950 z-10 print:static print:bg-slate-950">Phối màu</th>
                           {activeSizeRange.map(s => <th key={s} className="p-3 sm:p-4 md:p-6 print:p-2">{s}</th>)}
                           <th className="p-3 sm:p-4 md:p-6 bg-blue-700 print:p-2 print:bg-blue-700">Tổng</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 sm:divide-y-4 divide-slate-100 font-black text-slate-950 print:divide-y-0 print:table-row-group">
                        {order.details && order.details.length > 0 ? (
                           order.details.map((row, index) => (
                              <tr key={row.id || index} className="print:border-b print:border-slate-200 print:table-row">
                                 <td className="p-3 sm:p-4 md:p-6 text-left border-r-2 border-slate-100 print:p-2 print:text-left print:border-r print:border-slate-200 sticky left-0 bg-white z-10 print:static print:bg-white">
                                    <p className="text-sm sm:text-base md:text-lg uppercase print:text-sm font-black">{row.color || '---'}</p>
                                    {row.lining && <p className="text-xs text-slate-400 print:text-[10px] print:mt-1">{row.lining}</p>}
                                 </td>
                                 {activeSizeRange.map(s => (
                                    <td key={s} className="p-3 sm:p-4 md:p-6 border-r-2 border-slate-100 text-base sm:text-lg md:text-xl print:p-2 print:text-base print:border-r print:border-slate-200 print:tabular-nums">
                                       {row.sizes[`size${s}` as keyof SizeBreakdown] || '-'}
                                    </td>
                                 ))}
                                 <td className="p-3 sm:p-4 md:p-6 bg-slate-50 text-xl sm:text-2xl md:text-3xl text-blue-700 border-l-2 sm:border-l-4 border-slate-950 print:p-2 print:text-lg print:border-l-2 print:bg-slate-50 print:tabular-nums font-black">
                                    {row.total || 0}
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan={activeSizeRange.length + 2} className="p-8 text-center text-slate-400 font-bold uppercase">Chưa có dữ liệu</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Ghi chú chung */}
            {order.generalNote && (
               <div className="p-4 sm:p-8 md:p-12 bg-white border-t-[4px] sm:border-t-[6px] border-slate-950 print:p-5 print:border-t-2 print:page-break-inside-avoid">
                  <h3 className="text-xl sm:text-2xl font-black uppercase mb-4 sm:mb-6 print:text-lg print:mb-3 flex items-center gap-3">
                     <ClipboardList size={24} className="text-blue-600 print:w-5 print:h-5" /> 
                     Ghi chú chung lệnh sản xuất
                  </h3>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 print:rounded-lg print:p-4 print:border print:bg-white">
                     <div className="text-sm sm:text-base font-medium text-slate-900 whitespace-pre-wrap print:text-sm print:leading-relaxed">
                        {order.generalNote}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* MODAL BÁO LỖI */}
         {showReturnForm && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-6">
               <form onSubmit={handleReturnSubmit} className="bg-white w-full max-w-xl rounded-[3rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden">
                  <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                     <h3 className="text-xl font-black uppercase tracking-tight italic">Ghi nhận sản phẩm lỗi & Làm bù</h3>
                     <button type="button" onClick={() => setShowReturnForm(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn phối màu lỗi</label>
                        <select value={returnLog.color} onChange={e => setReturnLog(p => ({ ...p, color: e.target.value }))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black uppercase text-sm" required>
                           <option value="">-- Chọn màu --</option>
                           {order.details.map(d => <option key={d.id} value={d.color}>{d.color}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size lỗi</label>
                           <select value={returnLog.size} onChange={e => setReturnLog(p => ({ ...p, size: Number(e.target.value) }))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-lg">
                              {activeSizeRange.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng lỗi</label>
                           <input type="number" value={returnLog.quantity} onChange={e => setReturnLog(p => ({ ...p, quantity: Number(e.target.value) }))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-3xl text-blue-600 text-center" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lý do lỗi (VD: Hở keo, rách da...)</label>
                        <textarea value={returnLog.reason} onChange={e => setReturnLog(p => ({ ...p, reason: e.target.value }))} className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold min-h-[100px]" placeholder="..." required />
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
