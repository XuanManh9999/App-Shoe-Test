
import React, { useState, useRef, useEffect } from 'react';
import { ProductModel, BOM, Gender, EditLog, User, UserRole } from '../types';
import { 
  Box, Plus, Trash2, Image as ImageIcon, X, Search, Scissors, Edit, 
  History, Calendar, AlertCircle, CheckCircle2, ShieldCheck, Clock, 
  MessageSquare, Wrench, Info, RefreshCw, Archive, FileText, 
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Type, Save,
  ImagePlus
} from 'lucide-react';

interface Props {
  models: ProductModel[];
  onAdd: (model: ProductModel) => void;
  onUpdate: (model: ProductModel) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isArchiveView?: boolean;
  user: User;
}

const ModelManager: React.FC<Props> = ({ models, onAdd, onUpdate, onDelete, onRestore, isArchiveView = false, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'document' | 'history'>('info');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const canManageModels = user.permissions.models && user.permissions.canEdit;
  const canDelete = user.permissions.canDelete;

  const [logType, setLogType] = useState<'BOM_CHANGE' | 'ISSUE_FIX'>('BOM_CHANGE');
  const [editReason, setEditReason] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [solution, setSolution] = useState('');

  const initialModel: Partial<ProductModel> = {
    itemCode: '',
    productImage: '',
    gender: Gender.FEMALE,
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
    editHistory: [],
    technicalDocument: ''
  };

  const [newModel, setNewModel] = useState<Partial<ProductModel>>(initialModel);

  // Lưu nội dung editor vào state khi chuyển tab
  const handleTabChange = (newTab: 'info' | 'document' | 'history') => {
    if (activeTab === 'document' && editorRef.current) {
      setNewModel(prev => ({ ...prev, technicalDocument: editorRef.current!.innerHTML }));
    }
    setActiveTab(newTab);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewModel(prev => ({ ...prev, productImage: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleEditorImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        execCommand('insertImage', base64Data);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const updateBOM = (field: keyof BOM, value: string) => {
    setNewModel(prev => ({
      ...prev,
      bom: { ...prev.bom!, [field]: value }
    }));
  };

  const startEdit = (model: ProductModel) => {
    if (isArchiveView) return;
    setNewModel({ ...model });
    setEditingId(model.id);
    resetLogFields();
    setActiveTab('info');
    setShowForm(true);
  };

  const resetLogFields = () => {
    setEditReason('');
    setCustomerName('');
    setIssueDesc('');
    setSolution('');
    setLogType('BOM_CHANGE');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNewModel(initialModel);
    resetLogFields();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageModels) return;
    
    // Luôn lấy nội dung mới nhất từ Ref trước khi lưu
    const docContent = activeTab === 'document' && editorRef.current 
      ? editorRef.current.innerHTML 
      : newModel.technicalDocument || '';

    if (editingId) {
      let log: EditLog | null = null;
      if (editReason || customerName || issueDesc || solution) {
        log = {
          date: new Date().toISOString(),
          type: logType,
          reason: logType === 'BOM_CHANGE' ? editReason || 'Cập nhật BOM' : `Sửa lỗi khách ${customerName}`,
          customerName: logType === 'ISSUE_FIX' ? customerName : undefined,
          issueDescription: logType === 'ISSUE_FIX' ? issueDesc : undefined,
          solution: logType === 'ISSUE_FIX' ? solution : undefined,
        };
      }

      const updatedModel: ProductModel = {
        ...newModel as ProductModel,
        technicalDocument: docContent,
        updatedAt: new Date().toISOString(),
        editHistory: log ? [log, ...(newModel.editHistory || [])] : (newModel.editHistory || [])
      };
      onUpdate(updatedModel);
    } else {
      const model: ProductModel = {
        ...newModel as ProductModel,
        id: crypto.randomUUID(),
        technicalDocument: docContent,
        createdAt: new Date().toISOString(),
        isArchived: false,
        editHistory: []
      };
      onAdd(model);
    }
    closeForm();
  };

  const filteredModels = models.filter(m => m.itemCode.toLowerCase().includes(searchTerm.toLowerCase()));

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Không cập nhật state ở đây để tránh giật lag khi đang soạn thảo
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-4">
            {isArchiveView ? <Trash2 className="text-rose-600" /> : <Box className="text-blue-600" />}
            {isArchiveView ? 'KHO LƯU TRỮ BOM' : 'QUẢN LÝ MÃ HÀNG (BOM)'}
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Hệ thống Bình Vương ERP Production</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Tìm mã hàng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-6 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold focus:border-blue-600 outline-none w-56 shadow-sm"
            />
          </div>
          {!isArchiveView && canManageModels && (
            <button onClick={() => { setNewModel(initialModel); setEditingId(null); setShowForm(true); }} className="px-6 py-2.5 bg-slate-950 text-white rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-lg border-b-4 border-slate-800">
              <Plus size={16} /> Tạo mã mới
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredModels.map(model => (
          <div key={model.id} onClick={() => startEdit(model)} className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-sm overflow-hidden group hover:border-blue-600 transition-all duration-300 cursor-pointer relative">
             <div className="aspect-square relative overflow-hidden bg-slate-50 border-b-2">
                <img src={model.productImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                   {model.editHistory && model.editHistory.length > 0 && (
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border border-blue-900 flex items-center gap-1 shadow-md"><History size={8} /> {model.editHistory.length} Cải tiến</span>
                   )}
                </div>
             </div>
             <div className="p-5">
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">{model.itemCode}</h3>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={10} />
                      <span className="text-[8px] font-bold uppercase">{new Date(model.createdAt).toLocaleDateString('vi-VN')}</span>
                   </div>
                   <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{model.gender}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-6xl rounded-[2.5rem] border-[4px] border-slate-950 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
            <div className="p-5 bg-slate-950 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3 px-2">
                  <Box size={20} className="text-blue-400" />
                  <h3 className="text-lg font-black uppercase tracking-tight leading-none">{editingId ? `MÃ HÀNG: ${newModel.itemCode}` : 'Thiết Lập Mã Hàng Mới'}</h3>
               </div>
               <button type="button" onClick={closeForm} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <div className="bg-slate-100 px-8 py-0 border-b border-slate-200 flex gap-6 shrink-0">
               <TabButton active={activeTab === 'info'} label="Thông số & Cải tiến" onClick={() => handleTabChange('info')} />
               <TabButton active={activeTab === 'document'} label="Tài liệu kỹ thuật (Word)" onClick={() => handleTabChange('document')} />
               {editingId && (
                 <TabButton active={activeTab === 'history'} label={`Lịch sử cải tiến (${newModel.editHistory?.length || 0})`} onClick={() => handleTabChange('history')} />
               )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {activeTab === 'info' ? (
                <div className="p-6 lg:p-10 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Ảnh đại diện</label>
                        <div onClick={() => !isArchiveView && canManageModels && fileInputRef.current?.click()} className="aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                          {newModel.productImage ? (
                            <img src={newModel.productImage} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="text-center text-slate-300"><ImageIcon size={40} /><p className="text-[8px] font-black uppercase mt-1">Tải ảnh mẫu</p></div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                      </div>
                      <div className="space-y-4">
                        <ModelInput disabled={isArchiveView || !canManageModels} label="Mã Hàng *" value={newModel.itemCode} onChange={v => setNewModel(p => ({...p, itemCode: v}))} highlight />
                        <div className="space-y-1.5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Giới tính</label>
                           <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button type="button" onClick={() => setNewModel(p => ({...p, gender: Gender.FEMALE}))} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${newModel.gender === Gender.FEMALE ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>NỮ</button>
                              <button type="button" onClick={() => setNewModel(p => ({...p, gender: Gender.MALE}))} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${newModel.gender === Gender.MALE ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}>NAM</button>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-9 space-y-8">
                      <div className="bg-slate-50 p-6 lg:p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                           <Scissors size={16} className="text-emerald-600" />
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Thông số cấu tạo (BOM)</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Mã dao quai" value={newModel.bom?.knifeCode} onChange={v => updateBOM('knifeCode', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Mã Form" value={newModel.bom?.formCode} onChange={v => updateBOM('formCode', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Mã Đế" value={newModel.bom?.soleCode} onChange={v => updateBOM('soleCode', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Mã Sườn" value={newModel.bom?.frameCode} onChange={v => updateBOM('frameCode', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Loại Gót" value={newModel.bom?.heel} onChange={v => updateBOM('heel', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Khóa / Nơ" value={newModel.bom?.accessory} onChange={v => updateBOM('accessory', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Talong" value={newModel.bom?.talong} onChange={v => updateBOM('talong', v)} compact />
                          <ModelInput disabled={isArchiveView || !canManageModels} label="Ghi chú kỹ thuật" value={newModel.bom?.technicalNote} onChange={v => updateBOM('technicalNote', v)} compact />
                        </div>
                      </div>

                      {editingId && !isArchiveView && canManageModels && (
                        <div className="bg-white p-6 lg:p-8 rounded-[2rem] border-4 border-slate-950 shadow-xl space-y-6">
                           <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                              <MessageSquare className="text-blue-600" size={20} />
                              <h4 className="text-base font-black uppercase tracking-tight text-slate-950">Ghi nhận cải tiến sản phẩm</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button type="button" onClick={() => setLogType('BOM_CHANGE')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${logType === 'BOM_CHANGE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><Wrench size={12}/> Thay đổi BOM</button>
                                    <button type="button" onClick={() => setLogType('ISSUE_FIX')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${logType === 'ISSUE_FIX' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}><AlertCircle size={12}/> Khắc phục lỗi</button>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{logType === 'BOM_CHANGE' ? 'Lý do thay đổi kỹ thuật' : 'Tên khách hàng phản hồi'}</label>
                                    <input value={logType === 'BOM_CHANGE' ? editReason : customerName} onChange={e => logType === 'BOM_CHANGE' ? setEditReason(e.target.value) : setCustomerName(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 shadow-inner" placeholder="..." />
                                 </div>
                              </div>
                              {logType === 'ISSUE_FIX' && (
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Mô tả lỗi</label>
                                      <textarea value={issueDesc} onChange={e => setIssueDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-[10px] font-medium outline-none h-24" />
                                   </div>
                                   <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Cách xử lý</label>
                                      <textarea value={solution} onChange={e => setSolution(e.target.value)} className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-[10px] font-medium outline-none h-24" />
                                   </div>
                                </div>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeTab === 'document' ? (
                <div className="p-10 bg-slate-200 min-h-full">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between border-x-4 border-t-4 border-slate-950 shadow-xl">
                      <div className="flex items-center gap-1">
                        <ToolbarButton icon={<Bold size={14}/>} onClick={() => execCommand('bold')} />
                        <ToolbarButton icon={<Italic size={14}/>} onClick={() => execCommand('italic')} />
                        <ToolbarButton icon={<Underline size={14}/>} onClick={() => execCommand('underline')} />
                        <div className="w-px h-5 bg-slate-700 mx-2" />
                        <ToolbarButton icon={<List size={14}/>} onClick={() => execCommand('insertUnorderedList')} />
                        <div className="w-px h-5 bg-slate-700 mx-2" />
                        <ToolbarButton icon={<AlignLeft size={14}/>} onClick={() => execCommand('justifyLeft')} />
                        <ToolbarButton icon={<AlignCenter size={14}/>} onClick={() => execCommand('justifyCenter')} />
                        <ToolbarButton icon={<AlignRight size={14}/>} onClick={() => execCommand('justifyRight')} />
                        <div className="w-px h-5 bg-slate-700 mx-2" />
                        <ToolbarButton icon={<ImagePlus size={16} className="text-yellow-400" />} onClick={() => editorImageInputRef.current?.click()} />
                        <input type="file" ref={editorImageInputRef} className="hidden" accept="image/*" onChange={handleEditorImageInsert} />
                      </div>
                      <span className="text-[8px] font-black uppercase text-blue-400 flex items-center gap-2"><FileText size={12}/> Chế độ soạn thảo văn bản</span>
                    </div>
                    <div className="bg-white border-x-4 border-b-4 border-slate-950 shadow-2xl min-h-[1000px] p-20 font-serif">
                       <style>{`
                         .technical-editor-content img {
                           max-width: 100%;
                           height: auto;
                           border-radius: 12px;
                           border: 2px solid #f1f5f9;
                           margin: 1.5rem 0;
                           display: block;
                         }
                       `}</style>
                       <div className="border-b-2 border-slate-100 pb-6 mb-10 flex justify-between items-end">
                          <div>
                             <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950">TÀI LIỆU KỸ THUẬT: {newModel.itemCode}</h1>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Lưu hành nội bộ - Xưởng Bình Vương</p>
                          </div>
                          <Box size={40} className="text-slate-100" />
                       </div>
                       <div 
                         ref={editorRef}
                         contentEditable 
                         className="technical-editor-content outline-none text-base text-slate-800 leading-relaxed min-h-[800px]"
                         dangerouslySetInnerHTML={{ __html: newModel.technicalDocument || '<p>Bắt đầu viết hướng dẫn kỹ thuật cho mã hàng này...</p>' }}
                       />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 max-w-4xl mx-auto space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Lịch sử các phiên bản cải tiến</h4>
                   {newModel.editHistory?.length === 0 ? (
                     <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-300">Chưa có bản ghi lịch sử nào.</div>
                   ) : (
                     newModel.editHistory?.map((log, i) => (
                       <div key={i} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex gap-6 group hover:border-blue-600 transition-all">
                          <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white ${log.type === 'ISSUE_FIX' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                             {log.type === 'ISSUE_FIX' ? <AlertCircle size={20}/> : <Wrench size={20}/>}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-center mb-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(log.date).toLocaleString('vi-VN')}</p>
                             </div>
                             <p className="text-base font-black text-slate-900 mb-2">{log.reason}</p>
                             {log.customerName && (
                               <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                                  <p className="text-[10px] font-black text-rose-600 uppercase">Khách phản hồi: {log.customerName}</p>
                                  <p className="text-xs text-slate-500 italic">"{log.issueDescription}"</p>
                                  <p className="text-xs font-bold text-emerald-600 mt-2">→ {log.solution}</p>
                               </div>
                             )}
                          </div>
                       </div>
                     ))
                   )}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t-2 border-slate-100 flex justify-end gap-3 shrink-0">
               <button type="button" onClick={closeForm} className="px-6 py-2.5 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600">Đóng</button>
               <button type="submit" className="px-10 py-3 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-slate-800 active:scale-95 transition-all flex items-center gap-2">
                  <Save size={16} /> {editingId ? 'CẬP NHẬT HỆ THỐNG' : 'TẠO MỚI MÃ HÀNG'}
               </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const TabButton = ({active, label, onClick}: {active: boolean, label: string, onClick: () => void}) => (
  <button type="button" onClick={onClick} className={`py-4 text-[9px] font-black uppercase tracking-widest border-b-4 transition-all ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
    {label}
  </button>
);

const ToolbarButton = ({icon, onClick}: {icon: React.ReactNode, onClick: () => void}) => (
  <button type="button" onClick={onClick} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white">
    {icon}
  </button>
);

const ModelInput = ({label, value, onChange, disabled, compact, highlight}: {label: string, value?: string, onChange: (v: string) => void, disabled?: boolean, compact?: boolean, highlight?: boolean}) => (
  <div className="space-y-1.5">
    <label className={`text-[8px] font-black uppercase tracking-widest px-1 ${highlight ? 'text-blue-600' : 'text-slate-400'}`}>{label}</label>
    <input 
      disabled={disabled} 
      value={value || ''} 
      onChange={e => onChange(e.target.value)} 
      className={`w-full ${compact ? 'p-2.5 text-xs' : 'p-3.5 text-sm'} bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 outline-none transition-all shadow-sm ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'hover:border-slate-300'}`} 
      placeholder="---" 
    />
  </div>
);

export default ModelManager;
