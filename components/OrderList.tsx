
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductionOrder, Priority, StageStatus, OrderStatus, User, UserRole } from '../types';
import { GripVertical, Eye, Edit, Trash2, Filter, CheckCircle2, Clock, ListFilter, CalendarClock } from 'lucide-react';

interface Props {
  orders: ProductionOrder[];
  onReorder: (newOrders: ProductionOrder[]) => void;
  onDelete?: (id: string) => void;
  title?: string;
  isArchive?: boolean;
  user: User;
}

type CompletionFilter = 'all' | 'pending' | 'completed' | 'urgent';

const OrderList: React.FC<Props> = ({ orders, onReorder, onDelete, title = "Danh sách", isArchive = false, user }) => {
  const navigate = useNavigate();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');

  const getProgress = (order: ProductionOrder) => {
    const doneCount = order.stages.filter(s => s.status === StageStatus.DONE).length;
    return Math.round((doneCount / order.stages.length) * 100);
  };

  // Logic lọc theo tình trạng hoàn thành
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const progress = getProgress(order);
      if (completionFilter === 'completed') return progress === 100;
      if (completionFilter === 'pending') return progress < 100;
      // Chế độ 'urgent' hoặc 'all' đều hiển thị danh sách gốc trước khi sắp xếp
      return true;
    });
  }, [orders, completionFilter]);

  // Logic Sắp xếp
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    if (completionFilter === 'urgent') {
      // Sắp xếp theo hạn giao: Sớm nhất lên đầu
      return list.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    }
    // Mặc định sắp xếp theo thứ tự kéo thả
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [filteredOrders, completionFilter]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isArchive || user.role !== UserRole.ADMIN || completionFilter !== 'all') return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isArchive || user.role !== UserRole.ADMIN || draggedIndex === null || draggedIndex === index || completionFilter !== 'all') return;
    const newOrders = [...sortedOrders];
    const item = newOrders.splice(draggedIndex, 1)[0];
    newOrders.splice(index, 0, item);
    setDraggedIndex(index);
    onReorder(newOrders);
  };

  const isSSReady = (order: ProductionOrder) => {
    const progress = getProgress(order);
    return progress >= 70 && progress < 100;
  };

  const canEdit = [UserRole.ADMIN, UserRole.TECHNICAL].includes(user.role) && user.permissions.canEdit;
  const canDelete = user.permissions.canDelete;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
           <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
           <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{sortedOrders.length} lệnh đang hiển thị</p>
           </div>
        </div>

        {/* BỘ LỌC TÌNH TRẠNG & HẠN GIAO */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm overflow-x-auto custom-scrollbar no-scrollbar">
           <CompletionFilterBtn 
             active={completionFilter === 'all'} 
             label="Tất cả" 
             icon={<ListFilter size={14} />} 
             onClick={() => setCompletionFilter('all')} 
           />
           <CompletionFilterBtn 
             active={completionFilter === 'pending'} 
             label="Chưa xong" 
             icon={<Clock size={14} />} 
             onClick={() => setCompletionFilter('pending')} 
             color="orange"
           />
           <CompletionFilterBtn 
             active={completionFilter === 'urgent'} 
             label="Hạn giao gần" 
             icon={<CalendarClock size={14} />} 
             onClick={() => setCompletionFilter('urgent')} 
             color="purple"
           />
           <CompletionFilterBtn 
             active={completionFilter === 'completed'} 
             label="Hoàn thành" 
             icon={<CheckCircle2 size={14} />} 
             onClick={() => setCompletionFilter('completed')} 
             color="emerald"
           />
        </div>

        {!isArchive && user.role === UserRole.ADMIN && completionFilter === 'all' && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-slate-200">
            <GripVertical size={14} className="text-slate-500" /> Kéo thả ưu tiên lệnh
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <th className="px-6 py-6 w-16 text-center">STT</th>
                <th className="px-4 py-6">Mã Lệnh / Mã Hàng</th>
                <th className="px-4 py-6">Khách Hàng</th>
                <th className="px-4 py-6 text-center">Số Lượng</th>
                <th className="px-4 py-6">Tiến Độ</th>
                <th className="px-4 py-6">Hạn Giao</th>
                <th className="px-4 py-6 w-32 text-right pr-10">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {sortedOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest italic">Dữ liệu trống {completionFilter !== 'all' ? `(trong nhóm ${completionFilter === 'completed' ? 'Hoàn thành' : completionFilter === 'urgent' ? 'Hạn giao gần' : 'Chưa xong'})` : ''}</td></tr>
              ) : (
                sortedOrders.map((order, index) => {
                  const ss = isSSReady(order);
                  const progress = getProgress(order);
                  const isDone = progress === 100;
                  const isUrgent = new Date(order.deliveryDate).getTime() < new Date().getTime() + (7 * 86400000) && !isDone;
                  
                  return (
                    <tr 
                      key={order.id}
                      draggable={!isArchive && user.role === UserRole.ADMIN && completionFilter === 'all'} 
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`group transition-all duration-300 hover:bg-slate-50/80 ${draggedIndex === index ? 'opacity-30 bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-6">
                         <div className="flex items-center justify-center gap-2">
                            {!isArchive && user.role === UserRole.ADMIN && completionFilter === 'all' && <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity" />}
                            <span className="text-sm font-black text-slate-300 group-hover:text-slate-900 transition-colors">{index + 1}</span>
                         </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={order.productImage} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform" alt="" />
                            {isDone && (
                              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                <CheckCircle2 size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="font-black text-slate-900 text-sm uppercase tracking-tighter leading-none">{order.orderCode}</p>
                               {ss && (
                                 <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                                   SS
                                 </span>
                               )}
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 uppercase mt-1 inline-block">{order.itemCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6"><p className="text-sm font-black text-slate-700 uppercase tracking-tight">{order.customerName}</p></td>
                      <td className="px-4 py-6 text-center"><p className="text-base font-black text-blue-600 leading-none">{order.totalQuantity}</p><span className="text-[9px] font-bold text-slate-400 uppercase">Đôi</span></td>
                      <td className="px-4 py-6">
                        <div className="w-40">
                          <div className="flex items-center justify-between mb-2">
                             <span className={`text-[10px] font-black uppercase ${isDone ? 'text-emerald-600' : 'text-slate-900'}`}>{progress}%</span>
                             {isDone ? (
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Đã xong</span>
                             ) : ss && (
                               <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">Sẵn sàng gò</span>
                             )}
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="space-y-1">
                          <p className={`text-xs font-black uppercase tracking-tighter ${isUrgent ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                            {new Date(order.deliveryDate).toLocaleDateString('vi-VN')}
                          </p>
                          {isUrgent && <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest block">Giao Gấp</span>}
                        </div>
                      </td>
                      <td className="px-4 py-6 text-right pr-10">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/order/${order.id}`)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"><Eye size={18} /></button>
                          {!isArchive && canEdit && <button onClick={() => navigate(`/edit-order/${order.id}`)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 rounded-xl transition-all"><Edit size={18} /></button>}
                          {canDelete && <button onClick={() => onDelete?.(order.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all"><Trash2 size={18} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface FilterBtnProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'blue' | 'orange' | 'emerald' | 'purple';
}

const CompletionFilterBtn: React.FC<FilterBtnProps> = ({ active, label, icon, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: active ? 'bg-blue-600 text-white shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600',
    orange: active ? 'bg-orange-600 text-white shadow-orange-200' : 'text-slate-400 hover:bg-slate-50 hover:text-orange-600',
    emerald: active ? 'bg-emerald-600 text-white shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-600',
    purple: active ? 'bg-purple-600 text-white shadow-purple-200' : 'text-slate-400 hover:bg-slate-50 hover:text-purple-600',
  };

  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${colorClasses[color]} ${active ? 'shadow-lg scale-105 z-10' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default OrderList;
