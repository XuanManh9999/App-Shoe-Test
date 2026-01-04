
import React, { useState } from 'react';
import { User, UserRole, UserPermissions } from '../types';
import { generateId } from '../utils';
import { Users, Plus, Shield, User as UserIcon, Trash2, Edit, X, Lock, Check, ShieldCheck, UserCheck } from 'lucide-react';

interface Props {
  users: User[];
  currentUser: User; // Thêm currentUser để nhận diện người đang thao tác
  onAdd: (user: User) => void;
  onUpdate: (user: User) => void;
  onDelete: (id: string) => void;
}

const UserManager: React.FC<Props> = ({ users, currentUser, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialPermissions: UserPermissions = {
    dashboard: true,
    orders: true,
    models: true,
    customers: false,
    returns: true,
    // Fix: Added missing shipping permission
    shipping: false,
    canEdit: false,
    canDelete: false
  };

  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    fullName: '',
    password: '123',
    role: UserRole.PRODUCTION,
    permissions: { ...initialPermissions }
  });

  const togglePermission = (key: keyof UserPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        [key]: !prev.permissions![key]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData as User, id: editingId });
    } else {
      onAdd({
        ...formData as User,
        id: generateId(),
        createdAt: new Date().toISOString()
      });
    }
    closeForm();
  };

  const startEdit = (user: User) => {
    setFormData({ ...user });
    setEditingId(user.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      username: '',
      fullName: '',
      password: '123',
      role: UserRole.PRODUCTION,
      permissions: { ...initialPermissions }
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Quản Lý Nhân Sự</h2>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Phân quyền chi tiết cho từng thành viên hệ thống</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-8 py-3.5 bg-slate-950 text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl border-4 border-slate-800">
          <Plus size={20} /> Tạo tài khoản mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => {
          const isMe = user.id === currentUser.id;
          return (
            <div key={user.id} className={`bg-white rounded-[2.5rem] border-[4px] shadow-xl overflow-hidden group hover:-translate-y-2 transition-all ${isMe ? 'border-blue-600' : 'border-slate-950'}`}>
              <div className={`p-6 flex items-center gap-4 ${user.role === UserRole.ADMIN ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-900'} ${isMe ? 'relative' : ''}`}>
                 <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl border-2 border-white/30 uppercase">
                    {user.username.substring(0, 2)}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-tight truncate flex items-center gap-2">
                      {user.fullName}
                      {isMe && <span className="bg-white text-blue-600 text-[8px] px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">BẠN</span>}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">@{user.username} • {user.role}</p>
                 </div>
                 {isMe && <UserCheck className="absolute top-4 right-4 text-white/40" size={20} />}
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quyền truy cập module:</p>
                    <div className="flex flex-wrap gap-2">
                       <PermissionBadge label="Dashboard" active={user.permissions.dashboard} />
                       <PermissionBadge label="Lệnh SX" active={user.permissions.orders} />
                       <PermissionBadge label="Mã hàng/BOM" active={user.permissions.models} />
                       <PermissionBadge label="Khách hàng" active={user.permissions.customers} />
                       <PermissionBadge label="Trả hàng" active={user.permissions.returns} />
                       {/* Fix: Display shipping permission badge */}
                       <PermissionBadge label="Xuất hàng" active={user.permissions.shipping} />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${user.permissions.canEdit ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Sửa</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${user.permissions.canDelete ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                          <span className="text-[9px] font-black uppercase text-slate-500">Xóa</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => startEdit(user)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="Chỉnh sửa quyền"><Edit size={16} /></button>
                       {/* Chỉ hiện nút xóa nếu KHÔNG PHẢI là chính mình và KHÔNG PHẢI là Admin khác */}
                       {!isMe && user.role !== UserRole.ADMIN && (
                          <button onClick={() => { if(confirm(`Xác nhận xóa tài khoản [${user.fullName}]?`)) onDelete(user.id); }} className="p-2.5 bg-slate-100 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all" title="Xóa tài khoản"><Trash2 size={16} /></button>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[3rem] border-[6px] border-slate-950 shadow-2xl overflow-hidden my-auto">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <ShieldCheck size={24} className="text-blue-400" />
                  <h3 className="text-xl font-black uppercase tracking-tight">{editingId ? 'Cập nhật tài khoản' : 'Tạo nhân sự mới'}</h3>
               </div>
               <button type="button" onClick={closeForm} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên đăng nhập</label>
                    <input value={formData.username} onChange={e => setFormData(p => ({...p, username: e.target.value}))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600" placeholder="VD: vanphong" required disabled={editingId !== null && formData.role === UserRole.ADMIN && formData.id === currentUser.id} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu</label>
                    <input type="password" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600" placeholder="••••••" required />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Họ và tên đầy đủ</label>
                    <input value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600" placeholder="VD: Nguyễn Văn A" required />
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">Phân quyền module</p>
                  <div className="grid grid-cols-2 gap-4">
                     <PermissionToggle label="Bảng điều khiển" active={formData.permissions?.dashboard} onToggle={() => togglePermission('dashboard')} />
                     <PermissionToggle label="Lệnh Sản Xuất" active={formData.permissions?.orders} onToggle={() => togglePermission('orders')} />
                     <PermissionToggle label="Mã hàng/BOM" active={formData.permissions?.models} onToggle={() => togglePermission('models')} />
                     <PermissionToggle label="Khách hàng" active={formData.permissions?.customers} onToggle={() => togglePermission('customers')} />
                     <PermissionToggle label="Trả hàng" active={formData.permissions?.returns} onToggle={() => togglePermission('returns')} />
                     {/* Fix: Added shipping permission toggle in form */}
                     <PermissionToggle label="Xuất hàng" active={formData.permissions?.shipping} onToggle={() => togglePermission('shipping')} />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t-2 border-slate-50">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900">Quyền hạn thao tác dữ liệu</p>
                  <div className="flex gap-6">
                     <PermissionToggle label="Cho phép Sửa/Tạo" active={formData.permissions?.canEdit} onToggle={() => togglePermission('canEdit')} highlight="emerald" />
                     <PermissionToggle label="Cho phép Xóa/Hủy" active={formData.permissions?.canDelete} onToggle={() => togglePermission('canDelete')} highlight="rose" />
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t-2 border-slate-100 flex justify-end gap-4">
               <button type="button" onClick={closeForm} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-slate-400">Hủy</button>
               <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-blue-800 active:scale-95 transition-all">Lưu nhân sự</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const PermissionBadge = ({ label, active }: { label: string, active?: boolean }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
     {label}
  </span>
);

const PermissionToggle = ({ label, active, onToggle, highlight = 'blue' }: { label: string, active?: boolean, onToggle: () => void, highlight?: string }) => {
  const hMap: any = {
    blue: active ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-slate-200',
    emerald: active ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border-slate-200',
    rose: active ? 'bg-rose-600 text-white' : 'bg-white text-slate-400 border-slate-200'
  };
  return (
    <button type="button" onClick={onToggle} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 font-bold text-xs transition-all ${hMap[highlight]}`}>
       {label}
       {active ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />}
    </button>
  );
};

export default UserManager;
