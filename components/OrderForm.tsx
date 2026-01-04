
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductionOrder, Priority, OrderDetailRow, StageStatus, SizeBreakdown, OrderStatus, Gender, Customer, ProductModel } from '../types';
import { INITIAL_STAGES } from '../constants';
import { Save, Plus, Trash2, Image as ImageIcon, Upload, ClipboardList, Scissors, Settings, Info, ChevronDown, Palette, ArrowLeft, Search, Box } from 'lucide-react';

interface Props {
  onSave: (order: ProductionOrder) => void;
  orders?: ProductionOrder[];
  customers: Customer[];
  models: ProductModel[];
}

const OrderForm: React.FC<Props> = ({ onSave, orders, customers, models }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  
  const [formData, setFormData] = useState<Partial<ProductionOrder>>({
    id: crypto.randomUUID(),
    orderCode: '',
    itemCode: '',
    customerId: '',
    customerName: '',
    gender: Gender.FEMALE,
    totalQuantity: 0,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    productImage: '',
    generalNote: '',
    bom: {
      knifeCode: '',
      formCode: '',
      soleCode: '',
      frameCode: '',
      heel: '',
      accessory: '',
      talong: '',
      technicalNote: ''
    },
    details: [],
    stages: INITIAL_STAGES,
    priority: Priority.MEDIUM,
    priorityReason: '',
    status: OrderStatus.ACTIVE,
    statusNote: '',
    statusHistory: [],
    sortOrder: orders ? orders.length : 0,
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    if (id && orders) {
      const orderToEdit = orders.find(o => o.id === id);
      if (orderToEdit) {
        setFormData(orderToEdit);
      }
    }
  }, [id, orders]);

  const femaleSizes = [34, 35, 36, 37, 38, 39, 40];
  const maleSizes = [38, 39, 40, 41, 42, 43, 44, 45];
  const activeSizeRange = formData.gender === Gender.FEMALE ? femaleSizes : maleSizes;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, productImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBOM = (field: keyof typeof formData.bom, value: string) => {
    setFormData(prev => ({
      ...prev,
      bom: { ...prev.bom!, [field]: value }
    }));
  };

  const handleSelectModel = (model: ProductModel) => {
    setFormData(prev => ({
      ...prev,
      itemCode: model.itemCode,
      productImage: model.productImage,
      gender: model.gender,
      bom: { ...model.bom }
    }));
    setShowModelSelector(false);
  };

  const addDetailRow = () => {
    const initialSizes: SizeBreakdown = {};
    activeSizeRange.forEach(s => {
      initialSizes[`size${s}` as keyof SizeBreakdown] = 0;
    });

    const newDetail: OrderDetailRow = {
      id: crypto.randomUUID(),
      color: '',
      lining: '',
      sizes: initialSizes,
      total: 0
    };
    setFormData(prev => ({ ...prev, details: [...(prev.details || []), newDetail] }));
  };

  const updateDetailRow = (index: number, field: keyof OrderDetailRow, value: any) => {
    const updatedDetails = [...(formData.details || [])];
    const row = { ...updatedDetails[index], [field]: value } as OrderDetailRow;
    
    if (field === 'sizes') {
      const sizes = value as SizeBreakdown;
      row.total = Object.values(sizes).reduce((acc: number, val: number) => acc + (val ? Number(val) : 0), 0);
    }
    
    updatedDetails[index] = row;
    const globalTotal = updatedDetails.reduce((acc, d) => acc + d.total, 0);
    setFormData(prev => ({ ...prev, details: updatedDetails, totalQuantity: globalTotal }));
  };

  const handleGenderChange = (newGender: Gender) => {
    const updatedDetails = (formData.details || []).map(row => {
      const newSizes: SizeBreakdown = {};
      const targetRange = newGender === Gender.FEMALE ? femaleSizes : maleSizes;
      targetRange.forEach(s => {
        newSizes[`size${s}` as keyof SizeBreakdown] = 0;
      });
      return { ...row, sizes: newSizes, total: 0 };
    });
    setFormData(prev => ({ ...prev, gender: newGender, details: updatedDetails, totalQuantity: 0 }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({ ...prev, customerId, customerName: customer.name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productImage) { alert("Vui lòng tải lên hình ảnh mẫu."); return; }
    if (!formData.customerId) { alert("Vui lòng chọn khách hàng."); return; }
    if ((formData.details?.length || 0) === 0) { alert("Vui lòng thêm chi tiết màu."); return; }
    onSave(formData as ProductionOrder);
    navigate('/orders');
  };

  const filteredModels = models.filter(m => m.itemCode.toLowerCase().includes(modelSearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6">
      {/* Selector Modal cho Mã Hàng */}
      {showModelSelector && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black uppercase tracking-tight">Chọn mã hàng từ danh mục</h3>
                 <button onClick={() => setShowModelSelector(false)} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft size={24}/></button>
              </div>
              <div className="p-6 border-b-2 border-slate-100">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm mã hàng nhanh..." 
                      autoFocus
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold"
                    />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 custom-scrollbar">
                 {filteredModels.length === 0 ? (
                   <div className="col-span-2 py-10 text-center text-slate-300 font-bold uppercase tracking-widest">Không tìm thấy mã nào</div>
                 ) : (
                   filteredModels.map(model => (
                     <div 
                      key={model.id} 
                      onClick={() => handleSelectModel(model)}
                      className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-4 transition-all group"
                     >
                        <img src={model.productImage} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" alt="" />
                        <div>
                           <p className="font-black text-slate-950 text-lg leading-none uppercase">{model.itemCode}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Dải: Giày {model.gender}</p>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-white/95 backdrop-blur-md sticky top-0 z-40 rounded-2xl border-2 border-slate-200 shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
              {id ? 'Cập Nhật Lệnh Sản Xuất' : 'Tạo Lệnh Sản Xuất Mới'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Xưởng Bình Vương • ERP Production</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 font-bold text-xs uppercase transition-all">Hủy</button>
          <button type="submit" form="order-form" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95 text-xs uppercase border-b-4 border-blue-800">
            <Save size={18} /> Lưu Lệnh Sản Xuất
          </button>
        </div>
      </div>

      <form id="order-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Thông tin nhận diện */}
        <section className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b-2 border-slate-100">
             <div className="flex items-center gap-3">
                <Info className="text-blue-600" size={20} />
                <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">1. Thông tin cơ bản & Thời gian</h3>
             </div>
             <button 
                type="button" 
                onClick={() => setShowModelSelector(true)}
                className="px-4 py-1.5 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all border border-slate-800"
              >
               <Box size={14} /> Chọn từ danh mục mã hàng
             </button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Image Column */}
            <div className="md:col-span-3">
               <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ảnh sản phẩm mẫu</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-square rounded-2xl bg-slate-50 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all shadow-inner"
                >
                  {formData.productImage ? (
                    <img src={formData.productImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ImageIcon size={48} strokeWidth={1.5} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Tải ảnh lên</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
            </div>
            
            {/* Fields Column */}
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormInput label="Mã Lệnh" placeholder="PO-0001" value={formData.orderCode} onChange={(v) => setFormData(prev => ({ ...prev, orderCode: v }))} required color="blue" />
              <FormInput label="Mã Hàng" placeholder="MODEL-XYZ" value={formData.itemCode} onChange={(v) => setFormData(prev => ({ ...prev, itemCode: v }))} required color="blue" />
              
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Khách Hàng <span className="text-rose-500">*</span></label>
                 <div className="relative">
                   <select 
                    value={formData.customerId} 
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-950 outline-none focus:border-blue-600 transition-all appearance-none shadow-sm"
                    required
                   >
                     <option value="">-- Chọn khách hàng --</option>
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Giới tính (Dải Size)</label>
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                  <button type="button" onClick={() => handleGenderChange(Gender.FEMALE)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${formData.gender === Gender.FEMALE ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}>NỮ</button>
                  <button type="button" onClick={() => handleGenderChange(Gender.MALE)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${formData.gender === Gender.MALE ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500'}`}>NAM</button>
                </div>
              </div>

              <FormInput label="Ngày Nhận" type="date" value={formData.orderDate} onChange={(v) => setFormData(prev => ({ ...prev, orderDate: v }))} color="blue" />
              <FormInput label="Ngày Giao" type="date" value={formData.deliveryDate} onChange={(v) => setFormData(prev => ({ ...prev, deliveryDate: v }))} required color="blue" />
              
              <div className="sm:col-span-2 lg:col-span-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 block">Ghi chú chung lệnh sản xuất</label>
                 <textarea 
                   className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-950 outline-none focus:border-blue-600 transition-all min-h-[80px] shadow-inner" 
                   placeholder="Nhập ghi chú yêu cầu kỹ thuật đặc biệt..."
                   value={formData.generalNote} 
                   onChange={(e) => setFormData(prev => ({ ...prev, generalNote: e.target.value }))} 
                 />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: BOM */}
        <section className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-8 py-4 flex items-center gap-3 border-b-2 border-emerald-100">
             <Scissors className="text-emerald-600" size={20} />
             <h3 className="text-emerald-900 font-black uppercase tracking-widest text-sm">2. Cấu tạo kỹ thuật & Vật tư (BOM)</h3>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormInput label="Mã Dao Quai" value={formData.bom?.knifeCode} onChange={(v) => updateBOM('knifeCode', v)} color="emerald" />
            <FormInput label="Mã Form" value={formData.bom?.formCode} onChange={(v) => updateBOM('formCode', v)} color="emerald" />
            <FormInput label="Mã Đế" value={formData.bom?.soleCode} onChange={(v) => updateBOM('soleCode', v)} color="emerald" />
            <FormInput label="Mã Sườn" value={formData.bom?.frameCode} onChange={(v) => updateBOM('frameCode', v)} color="emerald" />
            <FormInput label="Loại Gót" value={formData.bom?.heel} onChange={(v) => updateBOM('heel', v)} color="emerald" />
            <FormInput label="Khóa / Nơ" value={formData.bom?.accessory} onChange={(v) => updateBOM('accessory', v)} color="emerald" />
            <FormInput label="Talong" value={formData.bom?.talong} onChange={(v) => updateBOM('talong', v)} color="emerald" />
            <FormInput label="Ghi chú KT" value={formData.bom?.technicalNote} onChange={(v) => updateBOM('technicalNote', v)} color="emerald" />
          </div>
        </section>

        {/* Section 3: Bảng Size & Số lượng */}
        <section className="bg-white rounded-[2rem] border-[4px] border-slate-900 shadow-2xl overflow-hidden">
          <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-400 text-slate-900 rounded-xl shadow-lg border-2 border-white rotate-2">
                   <Palette size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Kế hoạch số lượng theo Màu & Size</h3>
                   <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">Phân bổ chi tiết số lượng đôi</p>
                </div>
             </div>
             <button 
              type="button" 
              onClick={addDetailRow} 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 border-b-4 border-blue-800 text-xs"
            >
              <Plus size={18} /> THÊM PHỐI MÀU
            </button>
          </div>
          
          <div className="overflow-x-auto bg-slate-50 p-6">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-2 text-left w-12">STT</th>
                  <th className="px-4 py-2 text-left min-w-[280px]">PHỐI MÀU / CHI TIẾT LÓT</th>
                  {activeSizeRange.map(s => (
                    <th key={s} className="px-2 py-2 w-20 text-center bg-slate-200 rounded-t-xl text-slate-700 text-sm">{s}</th>
                  ))}
                  <th className="px-4 py-2 text-center w-24 bg-blue-600 text-white rounded-t-xl">TỔNG</th>
                  <th className="px-4 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {formData.details?.map((row, index) => (
                  <tr key={row.id} className="group">
                    <td className="px-4 py-4 text-center font-black text-slate-300 text-2xl italic">{index + 1}</td>
                    <td className="px-6 py-6 bg-white border-2 border-slate-200 rounded-l-2xl shadow-sm">
                       <div className="space-y-4">
                          <input 
                            className="w-full p-3 bg-blue-50/30 border-2 border-blue-100 rounded-xl outline-none font-black text-slate-900 text-lg focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:font-normal placeholder:text-slate-300" 
                            placeholder="Tên màu phối..." 
                            value={row.color} 
                            onChange={(e) => updateDetailRow(index, 'color', e.target.value)} 
                          />
                          <input 
                            className="w-full p-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none text-xs font-bold text-slate-500 focus:border-slate-300 shadow-inner" 
                            placeholder="Chi tiết lót / talong..." 
                            value={row.lining} 
                            onChange={(e) => updateDetailRow(index, 'lining', e.target.value)} 
                          />
                       </div>
                    </td>
                    {activeSizeRange.map(s => (
                      <td key={s} className="px-1 py-4 bg-white border-y-2 border-slate-200 shadow-sm">
                        <input 
                          type="number" 
                          onFocus={(e) => e.target.select()}
                          className="w-full h-16 p-1 bg-slate-50 border-2 border-slate-200 rounded-lg text-center font-black text-blue-900 text-3xl focus:border-yellow-400 focus:bg-white outline-none transition-all tabular-nums appearance-none shadow-inner" 
                          value={row.sizes[`size${s}` as keyof SizeBreakdown] || 0} 
                          onChange={(e) => {
                            const newSizes = { ...row.sizes, [`size${s}`]: Number(e.target.value) };
                            updateDetailRow(index, 'sizes', newSizes);
                          }} 
                        />
                      </td>
                    ))}
                    <td className="px-4 py-4 bg-blue-600 border-y-2 border-blue-700 text-center shadow-lg">
                       <p className="font-black text-white text-3xl tabular-nums">{row.total}</p>
                       <span className="text-[8px] font-black text-blue-200 uppercase">ĐÔI</span>
                    </td>
                    <td className="px-4 py-4 bg-white border-y-2 border-r-2 border-slate-200 rounded-r-2xl shadow-sm">
                      <button 
                        type="button" 
                        onClick={() => { 
                          const updated = [...(formData.details || [])]; 
                          updated.splice(index, 1); 
                          setFormData(prev => ({ ...prev, details: updated, totalQuantity: updated.reduce((a,b)=>a+b.total, 0) })); 
                        }} 
                        className="p-3 text-slate-300 hover:text-rose-600 transition-all active:scale-75"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-10 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-t-8 border-yellow-400">
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center font-black text-5xl text-yellow-400 border-2 border-white/20">
                 {formData.gender === Gender.FEMALE ? '♀' : '♂'}
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Xác nhận phân loại</p>
                  <p className="text-3xl font-black tracking-tight uppercase">Dòng hàng {formData.gender === Gender.FEMALE ? 'Nữ' : 'Nam'}</p>
               </div>
            </div>
            <div className="flex items-center gap-10 bg-white/5 px-10 py-6 rounded-3xl border border-white/10 shadow-inner">
               <span className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">TỔNG TOÀN LỆNH:</span>
               <div className="flex items-baseline gap-4">
                  <p className="text-7xl font-black text-yellow-400 tracking-tighter leading-none">{formData.totalQuantity}</p>
                  <span className="text-xl font-black text-slate-500 uppercase">Đôi</span>
               </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

const FormInput: React.FC<{ label: string, type?: string, value?: string, placeholder?: string, onChange?: (v: string) => void, required?: boolean, color: string }> = ({ label, type = "text", value, placeholder, onChange, required, color }) => {
  const colorMap: any = {
    blue: "border-slate-200 focus:border-blue-600 focus:ring-blue-50",
    emerald: "border-slate-200 focus:border-emerald-600 focus:ring-emerald-50",
    purple: "border-slate-200 focus:border-purple-600 focus:ring-purple-50"
  };
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 block uppercase tracking-widest px-1">{label} {required && <span className="text-rose-500">*</span>}</label>
      <input 
        type={type} 
        value={value || ''} 
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)} 
        required={required} 
        className={`w-full p-3.5 bg-slate-50 border-2 ${colorMap[color]} rounded-xl text-sm font-black text-slate-900 outline-none focus:bg-white transition-all shadow-sm placeholder:font-normal placeholder:text-slate-300`}
      />
    </div>
  );
}

export default OrderForm;
