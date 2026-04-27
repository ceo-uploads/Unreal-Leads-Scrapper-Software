import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ShieldAlert, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { db as rtdb } from '../lib/firebase';
import { useNotifications } from './NotificationProvider';
import { cn } from '@/src/lib/utils';

export interface SoftwareUser {
  id: string;
  softwareUser: string;
  softwarePass: string;
  packageId: string;
  endDate: number;
  startDate: number;
  status: string;
  userEmail: string;
  userId: string;
}

interface LoginProps {
  onLoginSuccess: (user: SoftwareUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expiredPackage, setExpiredPackage] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setErrorMsg(null);
    setExpiredPackage(null);

    try {
      addNotification('AUTHENTICATING WITH CENTRAL KERNEL...', 'process');
      
      const usersRef = ref(rtdb, 'softwareUsers');
      const userQuery = query(usersRef, orderByChild('softwareUser'), equalTo(username));
      const snapshot = await get(userQuery);

      if (snapshot.exists()) {
        const usersData = snapshot.val() as Record<string, SoftwareUser>;
        let authenticatedUser: SoftwareUser | null = null;

        // Iterate through all matches to find one with the correct password
        for (const [key, userData] of Object.entries(usersData)) {
          if (userData.softwarePass === password) {
            authenticatedUser = { ...userData, id: key };
            break;
          }
        }

        if (authenticatedUser) {
          const currentTime = Date.now();
          if (authenticatedUser.endDate < currentTime) {
            setExpiredPackage(authenticatedUser.packageId);
            addNotification('SYSTEM ALERT: PACKAGE EXPIRED', 'error');
          } else if (authenticatedUser.status !== 'active' && authenticatedUser.status !== 'activa') {
            setErrorMsg('ACCOUNT INACTIVE. CONTACT COMMAND CENTER.');
            addNotification('ACCESS DENIED: ACCOUNT INACTIVE', 'error');
          } else {
            addNotification(`WELCOME BACK, ${username.toUpperCase()}`, 'success');
            onLoginSuccess(authenticatedUser);
          }
        } else {
          setErrorMsg('INVALID ACCESS CREDENTIALS');
          addNotification('AUTH FAILURE: INVALID PASSWORD', 'error');
        }
      } else {
        setErrorMsg('USERNAME NOT FOUND');
        addNotification('AUTH FAILURE: USER NOT FOUND', 'error');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('COMMUNICATION UPLINK FAILED');
      addNotification('KERNEL PANIC: DATABASE OFFLINE', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_100%)] z-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-20"
      >
        <div className="glass-dark rounded-[44px] p-10 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20" style={{ backgroundSize: '100% 2px, 3px 100%' }} />
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 mb-6 group transition-all duration-500 hover:scale-110">
              <Lock className="text-brand-primary" size={36} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">LUMINA<span className="text-brand-primary">AUTH</span></h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">Login to continue. Extraction Protocol 4.8</p>
          </div>

          {expiredPackage ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex flex-col items-center text-center gap-4">
                <ShieldAlert className="text-red-500" size={32} />
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                  Your <span className="text-white">{expiredPackage.toUpperCase()}</span> package is ended. <br/>
                  Visit <a href="https://unreal-studio.com/pricing" className="underline text-white hover:text-red-400 transition-colors">unreal-studio.com</a> to activate and purchase new package.
                </p>
              </div>
              <a 
                href="https://wa.me/your-number" 
                target="_blank"
                rel="noreferrer"
                className="w-full h-14 glass flex items-center justify-center gap-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-green-400 hover:bg-green-500/10 transition-all border border-green-500/20"
              >
                <MessageCircle size={18} />
                Contact Support
              </a>
              <button 
                onClick={() => setExpiredPackage(null)}
                className="w-full text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Return to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">USERNAME</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USERNAME@LUMINA"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-14 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-brand-primary/50 focus:bg-black/60 transition-all placeholder:text-white/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">PASSWORD</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-14 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-brand-primary/50 focus:bg-black/60 transition-all placeholder:text-white/5"
                  />
                </div>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 py-3 rounded-xl text-center"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{errorMsg}</p>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "w-full h-14 bg-brand-primary rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-black hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
                  isLoading && "bg-brand-primary/50"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Syncing...
                  </>
                ) : (
                  <>
                    Initialize Extraction
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-white/20">
            <span>UNREAL STUDIO SECURE SYSTEM</span>
            <span>OS_BUILD_4.8</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
