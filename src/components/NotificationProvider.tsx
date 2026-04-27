import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type NotificationType = 'success' | 'error' | 'info' | 'process';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-24 right-8 z-[1000] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onClose={() => removeNotification(n.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationItem({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-green-400" size={18} />,
    error: <AlertCircle className="text-red-400" size={18} />,
    info: <Info className="text-blue-400" size={18} />,
    process: <Loader2 className="text-brand-primary animate-spin" size={18} />
  };

  const borders = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20',
    process: 'border-brand-primary/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 20 }}
      className={cn(
        "glass-dark px-6 py-4 rounded-[24px] border border-white/5 min-w-[320px] max-w-[400px] flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto",
        borders[notification.type]
      )}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">{icons[notification.type]}</div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/90 leading-relaxed">
          {notification.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 p-1 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
