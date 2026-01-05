
import React, { useMemo } from 'react';
import { ProductionOrder, ReturnLog, StageStatus, ShippingNote, Payment } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, TrendingUp, Users, Truck, ArrowRight, DollarSign, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  orders: ProductionOrder[];
  returns: ReturnLog[];
  shippingNotes?: ShippingNote[];
  payments?: Payment[];
}

const Dashboard: React.FC<Props> = ({ orders, returns, shippingNotes = [], payments = [] }) => {
  const navigate = useNavigate();

  const inProgress = orders.filter(o => o.stages.some(s => s.status === StageStatus.IN_PROGRESS)).length;
  const completed = orders.filter(o => o.stages.every(s => s.status === StageStatus.DONE)).length;
  const overdue = orders.filter(o => new Date(o.deliveryDate) < new Date() && !o.stages.every(s => s.status === StageStatus.DONE)).length;

  const pendingShipping = useMemo(() => {
    return orders.filter(order => {
      const isFinished = order.stages.every(s => s.status === StageStatus.DONE);
      const alreadyShipped = shippingNotes.some(note => note.orderId === order.id);
      return isFinished && !alreadyShipped;
    });
  }, [orders, shippingNotes]);

  // Tính toán số liệu công nợ
  const totalReceivables = useMemo(() => shippingNotes.reduce((a, b) => a + b.balanceAmount, 0), [shippingNotes]);
  const totalReceived = useMemo(() => payments.reduce((a, b) => a + b.amount, 0), [payments]);
  const remainingDebt = totalReceivables - totalReceived;

  const data = [
    { name: 'Đang SX', value: inProgress, color: '#2563eb' },
    { name: 'Hoàn thành', value: completed, color: '#059669' },
    { name: 'Trễ hạn', value: overdue, color: '#e11d48' }
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-8 md:pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
         <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tighter uppercase">Bảng Điều Khiển Hệ Thống</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1 hidden md:block">Theo dõi vận hành xưởng Bình Vương</p>
         </div>
         <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-[2rem] border-2 md:border-4 border-slate-950 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 md:gap-4 border-b sm:border-b-0 sm:border-r-2 border-slate-100 pb-4 sm:pb-0 sm:pr-6 w-full sm:w-auto">
               <div className="p-2 md:p-3 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl"><Wallet size={20} className="md:w-6 md:h-6"/></div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã thu trong kỳ</p>
                  <p className="text-lg md:text-xl font-black text-emerald-600">{(totalReceived + shippingNotes.reduce((a,b)=>a+b.depositAmount, 0)).toLocaleString()}đ</p>
               </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
               <div className="p-2 md:p-3 bg-rose-100 text-rose-600 rounded-xl md:rounded-2xl"><DollarSign size={20} className="md:w-6 md:h-6"/></div>
               <div>
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng nợ chưa thu</p>
                  <p className="text-lg md:text-xl font-black text-rose-600">{(remainingDebt > 0 ? remainingDebt : 0).toLocaleString()}đ</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <StatCard title="Tổng Lệnh Đã Tạo" value={orders.length} subValue="Kế hoạch" icon={<ClipboardList size={28}/>} color="blue" />
        <StatCard title="Đang Lên Chuyền" value={inProgress} subValue="Hoạt động" icon={<Clock size={28}/>} color="amber" />
        <StatCard title="Chờ Xuất Hàng" value={pendingShipping.length} subValue="Cần giao" icon={<Truck size={28}/>} color="blue" />
        <StatCard title="Cảnh Báo Trễ" value={overdue} subValue="Xử lý gấp" icon={<AlertCircle size={28}/>} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {pendingShipping.length > 0 && (
            <div className="bg-yellow-50 border-2 md:border-4 border-yellow-400 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-yellow-400 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 border-slate-950 shadow-lg">
                    <Truck size={20} className="md:w-6 md:h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-black uppercase text-slate-950">Lệnh đã sản xuất xong - Chờ giao</h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-yellow-700 uppercase tracking-widest">Có {pendingShipping.length} lệnh cần lập phiếu giao hàng</p>
                  </div>
                </div>
                <button onClick={() => navigate('/shipping')} className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-2 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 active:bg-blue-700 transition-all flex items-center justify-center gap-2 touch-manipulation">
                   Xem tất cả <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {pendingShipping.slice(0, 4).map(order => (
                  <div key={order.id} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-slate-200 flex items-center gap-3 md:gap-4 hover:border-blue-500 active:border-blue-600 transition-all cursor-pointer touch-manipulation" onClick={() => navigate('/shipping')}>
                    <img src={order.productImage} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-xs md:text-sm uppercase truncate">{order.orderCode}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase truncate">{order.customerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 border-slate-950 shadow-2xl relative">
            <h3 className="text-base md:text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2 md:gap-3 mb-4 md:mb-10">
                <TrendingUp size={20} className="md:w-6 md:h-6 text-blue-700" /> Biểu Đồ Phân Tích Sản Xuất
            </h3>
            <div className="h-[250px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={80}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 900, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 700, fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '20px', border: '4px solid #0f172a', fontWeight: 'bold'}} />
                  <Bar dataKey="value" radius={[15, 15, 0, 0]}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 border-slate-950 shadow-2xl flex flex-col">
           <h3 className="text-base md:text-xl font-black text-slate-950 uppercase tracking-tight mb-4 md:mb-8 flex items-center gap-2 md:gap-3">
              <Users size={20} className="md:w-6 md:h-6 text-blue-700" /> Danh Sách Mới Nhất
           </h3>
           <div className="space-y-3 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4">
              {orders.slice(0, 10).map(o => (
                <div key={o.id} onClick={() => navigate(`/order/${o.id}`)} className="p-3 md:p-5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-2xl md:rounded-3xl border-2 border-slate-100 transition-all flex items-center gap-3 md:gap-5 group cursor-pointer touch-manipulation">
                   <img src={o.productImage} className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover border-2 border-slate-950 shadow-lg group-hover:scale-105 transition-transform flex-shrink-0" />
                   <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-950 text-sm md:text-base truncate uppercase tracking-tighter leading-none mb-1">{o.orderCode}</p>
                      <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase truncate tracking-widest">{o.customerName}</p>
                   </div>
                   <div className="text-right flex-shrink-0">
                      <p className="text-xl md:text-2xl font-black text-slate-950 leading-none">{o.totalQuantity}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Đôi</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: number, subValue: string, icon: React.ReactNode, color: string }> = ({ title, value, subValue, icon, color }) => {
  const colorMap: any = {
    blue: "border-blue-600 text-blue-700 bg-blue-50",
    amber: "border-amber-500 text-amber-700 bg-amber-50",
    emerald: "border-emerald-500 text-emerald-700 bg-emerald-50",
    rose: "border-rose-500 text-rose-700 bg-rose-50"
  };
  return (
    <div className={`p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 shadow-xl hover:-translate-y-1 md:hover:-translate-y-2 transition-all relative overflow-hidden group ${colorMap[color]}`}>
      <div className="flex flex-col gap-2 relative z-10">
         <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-white shadow-lg`}>{icon}</div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hidden sm:inline">{subValue}</span>
         </div>
         <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
         <p className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter">{value}</p>
      </div>
      <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-10 group-hover:scale-110 transition-transform">{icon}</div>
    </div>
  );
}

export default Dashboard;
