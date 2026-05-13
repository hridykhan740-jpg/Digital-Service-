import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, BellOff, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export const NotificationView = ({ onBack }: { onBack: () => void }) => {
  const notifications = [
    { 
      id: 1, 
      type: 'info', 
      title: 'Welcome to Abdullah Al Hossain', 
      message: 'Get the best SIM offers and digital services here!', 
      time: '2 hours ago' 
    },
    { 
      id: 2, 
      type: 'success', 
      title: 'Balance Added Successfully', 
      message: 'Your payment of 500 TK has been approved.', 
      time: '1 day ago' 
    },
    { 
      id: 3, 
      type: 'warning', 
      title: 'System Maintenance', 
      message: 'System will be under maintenance tonight at 12 AM.', 
      time: '2 days ago' 
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" />;
      case 'warning': return <AlertTriangle className="text-amber-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#006400]">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-[#006400]">
          <Bell size={20} />
          <h2 className="font-black uppercase tracking-widest text-sm">Notifications</h2>
        </div>
        <div className="w-8" />
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <BellOff className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-4"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{notif.title}</h4>
                <p className="text-xs text-gray-500 font-bold mt-1 leading-relaxed">{notif.message}</p>
                <p className="text-[9px] font-black text-gray-300 uppercase mt-2">{notif.time}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
