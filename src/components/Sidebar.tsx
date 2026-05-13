import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Wallet, 
  History, 
  ShoppingBag, 
  Bell, 
  MessageSquare,
  LogOut,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ isOpen, onClose, profile, onNavigate, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'upload_profile', icon: <Camera size={20} />, label: 'Upload Profile', view: 'profile' },
    { id: 'change_password', icon: <Lock size={20} />, label: 'Change Password', view: 'change_password' },
    { id: 'add_balance', icon: <Wallet size={20} />, label: 'Add Balance', view: 'topup' },
    { id: 'all_history', icon: <History size={20} />, label: 'All History', view: 'history' },
    { id: 'my_order', icon: <ShoppingBag size={20} />, label: 'My Order', view: 'history' },
    { id: 'notification', icon: <Bell size={20} />, label: 'Notification', view: 'notification' },
    { id: 'admin_sms', icon: <MessageSquare size={20} />, label: 'Admin SMS', view: 'agent' },
  ];

  if (profile?.role === 'admin') {
    menuItems.unshift({ id: 'admin_panel', icon: <ShieldCheck size={20} />, label: 'Admin Panel', view: 'admin' });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[1002] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#006400] p-6 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-white/20 rounded-full border-4 border-white/30 p-1 relative group">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <User size={32} className="text-[#006400]" />
                    </div>
                  )}
                  <button 
                    onClick={() => { onNavigate('profile'); onClose(); }}
                    className="absolute bottom-0 right-0 bg-white text-[#006400] p-1.5 rounded-full shadow-lg border border-[#006400]/10"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="font-black text-lg uppercase tracking-tight">{profile?.name || 'Guest'}</h3>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{profile?.mobile || 'No Number'}</p>
                  <div className="mt-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block">
                    Balance: {profile?.balance || 0} TK
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.view === 'admin') {
                        onNavigate('admin');
                      } else {
                        onNavigate(item.view);
                      }
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:text-[#006400] transition-colors group"
                  >
                    <div className={`p-2 rounded-lg transition-colors ${item.id === 'admin_panel' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-gray-100 text-gray-400 group-hover:bg-[#006400]/10 group-hover:text-[#006400]'}`}>
                      {item.icon}
                    </div>
                    <span className={`uppercase text-xs tracking-wider ${item.id === 'admin_panel' ? 'text-red-700' : ''}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
