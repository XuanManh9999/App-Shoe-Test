
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DEFAULT_USERS } from '../constants';
import { LogIn, ShieldCheck, Lock, User as UserIcon } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEFAULT_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] border-[6px] border-blue-600 shadow-2xl overflow-hidden">
          <div className="p-10 bg-blue-600 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-blue-700 rotate-3">
               <span className="font-black text-blue-600 text-3xl">BV</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Hệ Thống Bình Vương</h1>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mt-1 opacity-60">Xác thực quyền hạn truy cập</p>
          </div>

          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên tài khoản</label>
              <div className="relative">
                 <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all shadow-inner" 
                  placeholder="Nhập tên đăng nhập..."
                  required
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mật khẩu bảo mật</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all shadow-inner" 
                  placeholder="••••••••"
                  required
                 />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl border-b-4 border-blue-800 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95">
              <LogIn size={20} /> Đăng nhập ngay
            </button>
          </form>

          <div className="p-6 bg-slate-50 border-t-2 border-slate-100 text-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={12} /> Hệ thống quản lý nội bộ bảo mật cao
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
