
import React, { useState, useMemo } from 'react';
import { ProductionOrder, Customer, ReturnLog, StageStatus, OrderStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Calendar, FileText, Download, TrendingUp, Users, AlertCircle, CheckCircle2, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Printer, Search, Factory, PackageCheck, Zap,
  CalendarRange, ArrowRight, Medal, Trophy, Star
} from 'lucide-react';

interface Props {
  orders: ProductionOrder[];
  customers: Customer[];
  returns: ReturnLog[];
}

type TimeRange = 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'lastMonth' | 'weekToDate' | 'monthToDate' | 'custom';

const ReportManager: React.FC<Props> = ({ orders, customers, returns }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filterByTime = (orderDate: string) => {
    const date = new Date(orderDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (selectedRange) {
      case 'today': return date >= today;
      case 'yesterday': return date >= new Date(today.getTime() - 86400000) && date < today;
      case '7days': return date >= new Date(today.getTime() - 7 * 86400000);
      case '30days': return date >= new Date(today.getTime() - 30 * 86400000);
      case '90days': return date >= new Date(today.getTime() - 90 * 86400000);
      case 'monthToDate': return date >= new Date(now.getFullYear(), now.getMonth(), 1);
      case 'weekToDate': return date >= new Date(today.getTime() - today.getDay() * 86400000);
      case 'lastMonth': return date >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && date <= new Date(now.getFullYear(), now.getMonth(), 0);
      case 'custom':
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999); 
        return date >= start && date <= end;
      default: return true;
    }
  };

  const filteredOrders = useMemo(() => orders.filter(o => filterByTime(o.orderDate) && o.status !== OrderStatus.CANCELLED), [orders, selectedRange, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    let totalQty = 0;
    let producingQty = 0;
    let completedQty = 0;
    let completedOrdersCount = 0;
    let producingOrdersCount = 0;
    let readyCount = 0;

    filteredOrders.forEach(order => {
      totalQty += order.totalQuantity;
      const doneCount = order.stages.filter(s => s.status === StageStatus.DONE).length;
      const progress = (doneCount / order.stages.length) * 100;
      const isDone = progress === 100;
      
      if (progress >= 70 && !isDone) {
        readyCount++;
      }

      if (isDone) {
        completedQty += order.totalQuantity;
        completedOrdersCount++;
      } else {
        producingQty += order.totalQuantity;
        producingOrdersCount++;
      }
    });

    return { totalQty, producingQty, completedQty, completedOrdersCount, producingOrdersCount, readyCount };
  }, [filteredOrders]);

  const customerData = useMemo(() => {
    const map = new Map();
    filteredOrders.forEach(o => map.set(o.customerName, (map.get(o.customerName) || 0) + o.totalQuantity));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [filteredOrders]);

  // Logic tính toán bảng xếp hạng mã hàng
  const itemRankingData = useMemo(() => {
    const map = new Map<string, { qty: number, count: number, img: string }>();
    filteredOrders.forEach(o => {
      const current = map.get(o.itemCode) || { qty: 0, count: 0, img: o.productImage };
      map.set(o.itemCode, {
        qty: current.qty + o.totalQuantity,
        count: current.count + 1,
        img: o.productImage || current.img
      });
    });
    return Array.from(map.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredOrders]);

  const statusData = [
    { name: 'Đang Sản Xuất', value: stats.producingOrdersCount, color: '#2563eb' },
    { name: 'Hoàn Thành', value: stats.completedOrdersCount, color: '#059669' },
  ];

  const rangeLabels: Record<Exclude<TimeRange, 'custom'>, string> = {
    today: 'Hôm nay', 
    yesterday: 'Hôm qua', 
    '7days': '7 ngày qua', 
    '30days': '30 ngày qua', 
    '90days': '90 ngày qua', 
    lastMonth: 'Tháng trước', 
    weekToDate: 'Đầu tuần đến nay', 
    monthToDate: 'Đầu tháng đến nay'
  };

  return (
    <div className="flex h-full gap-8 animate-in fade-in duration-700 pb-20">
      <aside className="w-80 bg-white rounded-[2.5rem] border-4 border-slate-950 p-6 shadow-2xl shrink-0 hidden lg:block overflow-y-auto custom-scrollbar">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-4">Lọc theo thời gian</h3>
        <nav className="space-y-1.5">
          {(Object.keys(rangeLabels) as (keyof typeof rangeLabels)[]).map(range => (
            <button key={range} onClick={() => setSelectedRange(range)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black transition-all border-2 flex items-center justify-between ${selectedRange === range ? 'bg-slate-950 text-white border-slate-950 shadow-lg' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}>
              {rangeLabels[range]}
              {selectedRange === range && <ChevronRight size={14} />}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t-2 border-slate-50">
            <button 
              onClick={() => setSelectedRange('custom')} 
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black transition-all border-2 flex items-center justify-between ${selectedRange === 'custom' ? 'bg-blue-600 text-white border-blue-800 shadow-lg' : 'text-slate-500 border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-2">
                <CalendarRange size={16} />
                Khoảng ngày tự chọn
              </div>
              {selectedRange === 'custom' && <ChevronRight size={14} />}
            </button>
            
            {selectedRange === 'custom' && (
              <div className="mt-4 p-4 bg-slate-50 rounded-[1.5rem] border-2 border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Từ ngày</label>
                  <input 
                    type="date" 
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Đến ngày</label>
                  <input 
                    type="date" 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Báo Cáo Sản Lượng</h2>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} className="text-slate-400" />
                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">
                  {selectedRange === 'custom' 
                    ? `Từ ${customStartDate || '...'} đến ${customEndDate || '...'}` 
                    : `Khoảng thời gian: ${rangeLabels[selectedRange as keyof typeof rangeLabels]}`}
                </p>
              </div>
           </div>
           <div className="bg-yellow-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 border-2 border-slate-950">
              <Zap size={18} /> Đang Sẵn Sàng (SS {'>'}= 70%): {stats.readyCount} Lệnh
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <ReportStatCard label="Tổng Sản Lượng" value={stats.totalQty} suffix="Đôi" icon={<FileText size={24}/>} trend="Kế hoạch" color="default" up />
           <ReportStatCard label="Đang Chạy" value={stats.producingQty} suffix="Đôi" icon={<Factory size={24}/>} trend="Xưởng" color="blue" />
           <ReportStatCard label="Đã Hoàn Thành" value={stats.completedQty} suffix="Đôi" icon={<PackageCheck size={24}/>} trend="Xong" color="emerald" up />
           <ReportStatCard label="Sẵn Sàng (SS)" value={stats.readyCount} suffix="Lệnh" icon={<ArrowUpRight size={24}/>} trend="Chuẩn bị xong" color="amber" up />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Card: Bảng Xếp Hạng Mã Hàng (Tính năng mới) */}
           <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Medal size={24} className="text-yellow-500"/> Xếp Hạng Mã Hàng SX Nhiều Nhất
                </h3>
                <Star size={18} className="text-yellow-400 fill-current" />
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                {itemRankingData.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest">Chưa có dữ liệu sản xuất</div>
                ) : (
                  itemRankingData.map((item, index) => {
                    const maxQty = itemRankingData[0].qty;
                    const percent = (item.qty / maxQty) * 100;
                    const isTop3 = index < 3;
                    
                    return (
                      <div key={item.code} className="flex items-center gap-4 group">
                        <div className="relative shrink-0">
                          {index === 0 ? <Trophy size={20} className="absolute -top-2 -left-2 text-yellow-500 z-10 drop-shadow-md rotate-[-15deg]" /> : null}
                          <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-sm ${index === 0 ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-slate-100'}`}>
                             <img src={item.img} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border-2 ${
                            index === 0 ? 'bg-yellow-400 border-slate-900 text-slate-900' : 
                            index === 1 ? 'bg-slate-300 border-slate-900 text-slate-900' : 
                            index === 2 ? 'bg-amber-600 border-slate-900 text-white' : 
                            'bg-slate-900 border-slate-900 text-white'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-end mb-1">
                              <p className="font-black text-slate-950 uppercase text-sm truncate">{item.code}</p>
                              <p className="text-xs font-black text-blue-600">{item.qty.toLocaleString()} <span className="text-[8px] uppercase text-slate-400">đôi</span></p>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-600'}`} 
                                style={{ width: `${percent}%` }}
                              />
                           </div>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Lên lệnh {item.count} lần trong kỳ</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Users size={24} className="text-blue-600"/> Top Khách Hàng (Sản Lượng)
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5 đối tác lớn nhất</span>
              </div>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerData} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#0f172a', fontWeight: 900, fontSize: 10}} />
                       <Tooltip 
                        cursor={{fill: '#f1f5f9'}} 
                        contentStyle={{borderRadius: '16px', border: '3px solid #0f172a', fontWeight: 'bold'}}
                       />
                       <Bar dataKey="value" radius={[0, 10, 10, 0]} fill="#2563eb" />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-2xl">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <TrendingUp size={24} className="text-emerald-600" /> Tỉ lệ hoàn thành lệnh
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: '3px solid #0f172a', fontWeight: 'bold'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-slate-950 shadow-2xl flex flex-col justify-center">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-yellow-400 rounded-2xl border-2 border-white">
                       <Zap size={32} className="text-slate-950" />
                    </div>
                    <div>
                       <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Sẵn Sàng Giao (SS)</h4>
                       <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">Tiến độ sản xuất {'>'}= 70%</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                       <p className="text-4xl font-black text-yellow-400">{stats.readyCount}</p>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Lệnh sắp hoàn tất</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                       <p className="text-4xl font-black text-emerald-400">{stats.completedOrdersCount}</p>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Lệnh đã xong 100%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border-4 border-slate-950 shadow-2xl overflow-hidden mb-10">
           <div className="p-8 bg-slate-50 border-b-4 border-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Chi tiết tình trạng sản xuất</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dữ liệu theo bộ lọc thời gian đã chọn</p>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  placeholder="Tìm mã lệnh hoặc khách..." 
                  className="pl-12 pr-6 py-3 border-2 border-slate-200 rounded-2xl text-xs font-bold w-72 shadow-sm focus:border-blue-600 outline-none transition-all" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                 />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                 <thead>
                    <tr className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest">
                      <th className="p-6 text-left">Lệnh Sản Xuất</th>
                      <th className="p-6">Số Lượng</th>
                      <th className="p-6">Hiện Trạng</th>
                      <th className="p-6">Tình trạng SS</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-slate-50 font-black text-slate-950">
                    {filteredOrders.filter(o => o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-slate-300 font-black uppercase tracking-[0.2em] italic">Không có dữ liệu trong khoảng này</td>
                      </tr>
                    ) : (
                      filteredOrders.filter(o => o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map((order) => {
                          const doneCount = order.stages.filter(s => s.status === StageStatus.DONE).length;
                          const progress = Math.round((doneCount / order.stages.length) * 100);
                          const isDone = progress === 100;
                          const ss = progress >= 70 && !isDone;
                          return (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="p-6 text-left">
                                  <p className="text-sm uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{order.orderCode}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.customerName}</p>
                               </td>
                               <td className="p-6 text-xl tabular-nums text-blue-600">{order.totalQuantity}</td>
                               <td className="p-6">
                                 <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase border-2 ${isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                   {isDone ? 'ĐÃ HOÀN THÀNH' : 'ĐANG SẢN XUẤT'}
                                 </span>
                               </td>
                               <td className="p-6">
                                  {ss ? (
                                    <div className="flex justify-center">
                                      <span className="bg-yellow-400 px-3 py-1.5 rounded-xl border-2 border-slate-950 text-[10px] font-black shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] uppercase animate-pulse">
                                        Sẵn Sàng
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 uppercase font-black">{progress}% HOÀN TẤT</span>
                                  )}
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
    </div>
  );
};

const ReportStatCard = ({ label, value, icon, trend, up, suffix, color }: any) => {
  const cMap: any = { 
    blue: 'border-blue-600 text-blue-700 bg-blue-50 shadow-blue-100/50', 
    emerald: 'border-emerald-600 text-emerald-700 bg-emerald-50 shadow-emerald-100/50', 
    amber: 'border-amber-500 text-amber-700 bg-amber-50 shadow-amber-100/50', 
    rose: 'border-rose-600 text-rose-700 bg-rose-50 shadow-rose-100/50', 
    default: 'border-slate-950 bg-white shadow-slate-200/50' 
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border-4 shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all ${cMap[color] || cMap.default}`}>
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
             <div className="p-3.5 bg-slate-950 text-white rounded-2xl shadow-lg border-2 border-slate-800">{icon}</div>
             {trend && <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${up ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'}`}>{trend}</div>}
          </div>
          <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-4xl font-black tracking-tighter text-slate-950">{value} <span className="text-sm opacity-50 ml-1 uppercase">{suffix}</span></p>
       </div>
       <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-500">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 120 })}
       </div>
    </div>
  );
};

export default ReportManager;
