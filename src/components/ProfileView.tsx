import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Zap, Clock, Mail, Key, Hash, LogOut, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SoftwareUser } from './Login';

export default function ProfileView({ user, onLogout }: { user: SoftwareUser, onLogout: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = user.endDate - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user.endDate]);

  const stats = [
    { label: 'Server Uplink', value: 'STABLE', icon: Activity, color: 'text-green-500' },
    { label: 'License Type', value: user.packageId.toUpperCase(), icon: Shield, color: 'text-brand-primary' },
    { label: 'Network API', value: 'SECURE_UNIVERSAL_S1', icon: Zap, color: 'text-yellow-500' },
  ];

  return (
    <div className="p-12 h-full overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[32px] bg-brand-primary/10 flex items-center justify-center border-2 border-brand-primary/20 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
                <User size={48} className="text-brand-primary" />
              </div>
              <div>
                <h2 className="text-5xl font-black tracking-tight uppercase text-white leading-none">
                  User <span className="text-brand-primary">Profile</span>
                </h2>
                <div className="flex items-center gap-3 mt-4">
                   <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                     Operator Active
                   </span>
                   <span className="bg-white/5 w-1.5 h-1.5 rounded-full" />
                   <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest font-mono">
                     ID: {(user?.id || 'ANONYMOUS').substring(0, 12)}... (TERMINAL VERIFIED)
                   </span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="group flex items-center gap-4 glass-dark px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-red-500/80 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 transition-all active:scale-95"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[40px] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -translate-y-16 translate-x-16 blur-3xl opacity-50" />
              <stat.icon className={cn("mb-4", stat.color)} size={24} />
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-white mt-1 tracking-tight">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Neural Credentials */}
          <div className="glass-dark p-10 rounded-[44px] space-y-8 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <Shield className="text-brand-primary" size={24} />
                <h3 className="text-xl font-black uppercase tracking-widest text-white">General Credentials</h3>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Software User', value: user.softwareUser },
                  { icon: Key, label: 'Access Key', value: '••••••••••••' },
                  { icon: Mail, label: 'Secondary Email', value: user.userEmail },
                  { icon: Hash, label: 'Core ID', value: user.userId },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white/30">
                      <item.icon size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white/80 tracking-widest font-mono">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="mt-8 text-[9px] italic text-white/20 uppercase tracking-widest leading-relaxed">
              * System credentials are hard-locked to this interface. <br/> 
              Unauthorized modification is strictly prohibited by central firewall.
            </p>
          </div>

          {/* License & Terminal Timer */}
          <div className="flex flex-col gap-8">
             <div className="glass p-10 rounded-[44px] space-y-6 border border-white/5 relative overflow-hidden bg-brand-primary/5">
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-primary)_0%,transparent_70%)]" />
                
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="text-brand-primary" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-widest text-white">Software License</h3>
                </div>

                <div className="space-y-8">
                  <div className="text-center py-8">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60 block mb-2">Time Remaining</span>
                     <h4 className="text-5xl font-black text-white font-mono tracking-tighter glow-sm whitespace-nowrap">
                       {timeLeft}
                     </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/60 rounded-3xl p-5 border border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Activation</span>
                      <span className="text-xs font-bold text-white/80">{new Date(user.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="bg-black/60 rounded-3xl p-5 border border-white/5 text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">Termination</span>
                      <span className="text-xs font-bold text-white/80">{new Date(user.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '65%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-brand-primary)]" 
                       />
                    </div>
                    <div className="flex justify-between mt-3">
                       <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Cycle Status</span>
                       <span className="text-[8px] font-black text-brand-primary animate-pulse uppercase tracking-widest">Active Link</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="glass-dark p-8 rounded-[44px] border border-white/5 flex items-center justify-between group cursor-help">
                <div className="space-y-1">
                   <h4 className="text-sm font-black uppercase tracking-widest text-white">Lumina Core v4.8</h4>
                   <p className="text-[10px] text-white/30 font-medium tracking-tight">System hardware encryption: ENABLED</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-all">
                   <ChevronRight size={20} className="text-white/20 group-hover:text-brand-primary transition-all" />
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
