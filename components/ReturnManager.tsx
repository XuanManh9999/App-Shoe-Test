
import React from 'react';
import { ReturnLog, ProductionOrder } from '../types';
import { RefreshCw, ArrowRight, AlertTriangle, FileText } from 'lucide-react';

interface Props {
  returns: ReturnLog[];
  orders: ProductionOrder[];
}

const ReturnManager: React.FC<Props> = ({ returns, orders }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="text-rose-600" />
          Quản Lý Trả Hàng & Làm Bù
        </h2>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          <AlertTriangle className="mx-auto mb-4 opacity-20" size={48} />
          Chưa có ghi nhận trả hàng nào trong hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {returns.map(ret => {
            const originalOrder = orders.find(o => o.id === ret.originalOrderId);
            const remakeOrder = orders.find(o => o.parentOrderId === ret.originalOrderId && o.orderCode.includes('-BÙ'));
            
            return (
              <div key={ret.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="shrink-0 w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                  <AlertTriangle size={32} />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Lỗi sản xuất
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ret.date).toLocaleDateString('vi-VN')} {new Date(ret.date).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900">
                    Lệnh gốc: {originalOrder?.orderCode || 'N/A'} - {originalOrder?.itemCode}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Chi tiết: <span className="font-bold">{ret.color}</span> • Size: <span className="font-bold">{ret.size}</span> • SL: <span className="font-bold text-rose-600">{ret.quantity}</span>
                  </p>
                  <p className="text-sm bg-gray-50 p-2 rounded border border-gray-100 italic">
                    Lý do: {ret.reason}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase">
                      <FileText size={16} /> Lệnh bù liên kết:
                   </div>
                   <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-emerald-800 text-sm">
                          {originalOrder?.orderCode}-BÙ
                        </p>
                        <p className="text-[10px] text-emerald-600">Tự động khởi tạo</p>
                      </div>
                      <ArrowRight size={20} className="text-emerald-400" />
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReturnManager;
