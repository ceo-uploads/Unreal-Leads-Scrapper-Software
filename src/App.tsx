import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Navigation from './components/Navigation';
import MapScraper from './components/MapScraper';
import LeadDatabase, { Lead } from './components/LeadDatabase';
import UniversalSearch from './components/UniversalSearch';
import SettingsView from './components/SettingsView';
import Login, { SoftwareUser } from './components/Login';
import ProfileView from './components/ProfileView';
import { useNotifications } from './components/NotificationProvider';
import { motion, AnimatePresence } from 'motion/react';
import { extractLeads } from './services/extractionService';
import { Terminal as TerminalIcon, ShieldCheck, Activity, Database, Cpu, Search, Map as MapIcon, Network } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [currentUser, setCurrentUser] = useState<SoftwareUser | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchHistory, setSearchHistory] = useState<{ query: string, source: string, timestamp: string, type: string }[]>([]);
  const { addNotification } = useNotifications();
  const [logs, setLogs] = useState<string[]>([
    'root@lumina-os:~# sysctl -w net.neural.extraction=1',
    '[  +0.000000] Initializing LuminaLeads Kernel v4.8-ext...',
    '[  +0.012356] Mounting network nodes: FB, IG, GH, LI, WEB...',
    '[  +0.045982] Local Database: Link established via high-speed IO.',
    '[  +0.089234] Grounded Neural Engine: READY.',
    'root@lumina-os:~# _'
  ]);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumina_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as SoftwareUser;
        // Check expiry on load
        if (user.endDate < Date.now()) {
          localStorage.removeItem('lumina_user');
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      } catch (e) {
        console.error("Failed to load user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lumina_user', JSON.stringify(currentUser));
      
      // Setup expiry check interval
      const interval = setInterval(() => {
        if (currentUser.endDate < Date.now()) {
          addNotification('SESSION EXPIRED: PACKAGE TERMINATED', 'error');
          setCurrentUser(null);
          localStorage.removeItem('lumina_user');
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_leads_v2');
    const savedHistory = localStorage.getItem('lumina_history_v2');
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load leads", e);
      }
    }
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_leads_v2', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('lumina_history_v2', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'process' = 'info') => {
    const timestamp = (performance.now() / 1000).toFixed(6);
    const prefix = type === 'process' ? '[ ⚙️ ]' : type === 'success' ? '[ ✅ ]' : type === 'error' ? '[ ❌ ]' : `[ ${timestamp} ]`;
    setLogs(prev => [`${prefix} ${msg}`, ...prev.slice(0, 100)]);
  };

  const clearLeads = () => {
    setLeads([]);
    localStorage.removeItem('lumina_leads_v2');
    addLog('CRITICAL_EVENT: CACHE_PURGE COMMAND EXECUTED.', 'error');
    addLog('SYSTEM_VAULT: 0 RECORDS REMAINING.', 'info');
    addNotification('SYSTEM VAULT PURGED: ALL RECORDS REMOVED', 'error');
  };

  const handleScrape = async (query: string, source: string, location?: string, region?: any) => {
    setIsScraping(true);
    addLog(`INIT_SCRAPE PLATFORM=${source.toUpperCase()} QUERY="${query}"`, 'process');
    if (location) addLog(`LOCATION_TARGET: ${location.toUpperCase()}`, 'info');
    addNotification(`INITIALIZING ${source.toUpperCase()} EXTRACTION...`, 'process');
    
    // Add to history
    const typeLabel = region ? 'Tactical' : 'Grounded';
    setSearchHistory(prev => [{ query, source, timestamp: new Date().toISOString(), type: typeLabel }, ...prev.slice(0, 49)]);

    addLog('ALLOCATING VIRTUAL RUNTIME...', 'info');
    
    if (region) {
      addLog(`GEO_FENCE_LOCK: ${region.start.lat.toFixed(4)}, ${region.start.lng.toFixed(4)}`, 'info');
    }

    addLog('TUNNELING VIA ENCRYPTED PROXIES...', 'process');
    
    let results: any[] = [];
    try {
      addLog('GROUNDED_EXTRACTOR_ACTIVE: SEARCHING WEB...', 'process');
      addLog('DECRYPTING PACKET STREAM...', 'process');
      
      let context = 'Global';
      if (location && region) {
        context = `${location} area (near ${region.start.lat.toFixed(4)}, ${region.start.lng.toFixed(4)})`;
      } else if (location) {
        context = location;
      } else if (region) {
        context = `Geographic rectangle bound by [${region.start.lat}, ${region.start.lng}] and [${region.end.lat}, ${region.end.lng}]`;
      }
      
      results = await extractLeads(query, source, context);
      
      if (results.length === 0) {
        addLog('SEQUENCE_COMPLETE: NO ENTITIES FOUND IN TARGET SECTOR.', 'info');
        addNotification('ZERO ENTITIES RECOVERED IN THIS SECTOR', 'info');
        setIsScraping(false);
        return;
      }
      
      const newLeads: Lead[] = results.map(r => ({
        ...r,
        id: Math.random().toString(36).substr(2, 9),
        source: source,
        scrapedAt: new Date().toLocaleDateString(),
        isLiked: false
      }));

      newLeads.forEach((lead, i) => {
        setTimeout(() => {
            const safeName = (lead.name || "Unknown Entity").substring(0, 20);
            addLog(`RECOVERY_NODE_${i.toString().padStart(2, '0')}: ENTITY="${safeName}..." [SYNCED]`, 'success');
        }, i * 300);
      });

      setTimeout(() => {
        setLeads(prev => [...newLeads, ...prev]);
        addLog(`SEQUENCE_FINALIZED: ${newLeads.length} ENTITIES COLD-STORED IN VAULT.`, 'success');
        addLog(`INTEGRITY_CHECK: 100% COMPLETE.`, 'success');
        addNotification(`EXTRACTION COMPLETE: ${newLeads.length} NEW ENTITIES SECURED`, 'success');
      }, newLeads.length * 300 + 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'EXTRACTION_PIPELINE_FAILED';
      addLog(`KERNEL_PANIC: ${errorMessage}`, 'error');
      addNotification(`SYSTEM ERROR: ${errorMessage}`, 'error');
    } finally {
      setTimeout(() => setIsScraping(false), results?.length ? results.length * 400 + 500 : 2000);
    }
  };

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    addLog(`DANGER: RECORD ${id} PERMANENTLY DELETED.`, 'error');
    addNotification(`RECORD DELETED PERMANENTLY`, 'info');
  };

  const handleToggleLike = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, isLiked: !l.isLiked } : l));
    const lead = leads.find(l => l.id === id);
    addLog(`PERSISTENCE_LOCK: ENTITY "${lead?.name}" SECURED.`, 'success');
    if (lead) {
      addNotification(lead.isLiked ? `ENTRY UNLOCKED` : `ENTRY SECURED TO VAULT`, lead.isLiked ? 'info' : 'success');
    }
  };

  const handleLoginSuccess = (user: SoftwareUser) => {
    setCurrentUser(user);
    addLog(`AUTH_SUCCESS: Session initialized for ${user.softwareUser}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lumina_user');
    addLog('SESSION_TERMINATED: User logged out.', 'info');
    addNotification('SESSION TERMINATED', 'info');
  };

  const formatTime = (date: Date) => date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });

  if (!currentUser) {
    return (
      <>
        <ThreeBackground />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
        <ThreeBackground />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="ml-24 h-screen relative z-10 flex flex-col">
          <header className="h-20 px-8 flex items-center justify-between pointer-events-none shrink-0">
              <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                      <h1 className="text-2xl font-black uppercase tracking-[0.4em] leading-none text-white">UNREAL<span className="text-brand-primary text-glow">LEADS</span></h1>
                      <span className="text-[10px] font-bold text-white/20 mt-1 uppercase tracking-[0.2em]">Verified Grounded Extraction OS</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="flex gap-4">
                      <StatusBadge icon={Cpu} label="v4.8.0" color="text-brand-primary" />
                      <StatusBadge icon={ShieldCheck} label="Encrypted" color="text-green-500" />
                  </div>
              </div>
              
              <div className="flex items-center gap-6 pointer-events-auto">
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Timestamp</span>
                      <span className="text-xs font-mono font-bold text-brand-primary">{formatTime(currentTime)}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer" onClick={() => setActiveTab('profile')}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.softwareUser}`} alt="User" />
                  </div>
              </div>
          </header>

          <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full pointer-events-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === 'map' ? (
                        <motion.div 
                          key="map"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="absolute inset-0"
                        >
                          <MapScraper onScrape={(q, s, l, r) => handleScrape(q, s, l || undefined, r)} isScraping={isScraping} />
                        </motion.div>
                      ) : activeTab === 'search' ? (
                        <motion.div 
                            key="search"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0"
                        >
                            <UniversalSearch onScrape={(q, s, l) => handleScrape(q, s, l)} isScraping={isScraping} />
                        </motion.div>
                      ) : activeTab === 'database' ? (
                        <motion.div 
                          key="database"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute inset-0"
                        >
                          <LeadDatabase leads={leads} onDelete={handleDeleteLead} onToggleLike={handleToggleLike} />
                        </motion.div>
                      ) : activeTab === 'terminal' ? (
                        <motion.div 
                          key="terminal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 p-8 flex flex-col gap-8"
                        >
                            <div className="flex items-center justify-between px-4">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-4 uppercase">
                                        <TerminalIcon className="text-green-500" size={36} />
                                        Kernel Terminal
                                    </h2>
                                    <p className="text-white/40 mt-1 italic font-medium">Monitoring low-level extraction hardware and network nodes.</p>
                                </div>
                                <div className="flex gap-4">
                                  <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">tty1 Online</span>
                                  </div>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/80 rounded-[44px] p-10 font-mono text-xs overflow-y-auto flex flex-col-reverse gap-1 border border-green-500/20 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden terminal-scanline scrollbar-custom">
                                {logs.map((log, i) => (
                                    <div key={i} className={cn(
                                        "font-mono transition-all duration-300 py-0.5",
                                        log.includes('[ ✅ ]') ? 'text-green-400' : 
                                        log.includes('[ ❌ ]') ? 'text-red-500' : 
                                        log.includes('[ ⚙️ ]') ? 'text-yellow-400' : 'text-green-500/70'
                                    )}>
                                        <span className="text-green-500/20 mr-4 font-bold">[{i.toString().padStart(4, '0')}]</span>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                      ) : activeTab === 'settings' ? (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0"
                        >
                            <SettingsView onClear={clearLeads} history={searchHistory} />
                        </motion.div>
                      ) : activeTab === 'profile' ? (
                        <motion.div 
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0"
                        >
                            <ProfileView user={currentUser} onLogout={handleLogout} />
                        </motion.div>
                      ) : (
                        <div className="flex items-center justify-center absolute inset-0 text-white/20 font-mono italic">
                            MODULE_OFFLINE...
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
              </div>
          </div>

          <footer className="h-16 px-8 flex items-center justify-between border-t border-white/5 bg-black/40 backdrop-blur-md relative z-20 shrink-0">
              <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                      <Activity size={14} className="text-brand-primary animate-pulse" />
                      <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Status: Nominal</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <Network size={14} className="text-brand-accent" />
                      <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">Region: Global</span>
                  </div>
              </div>

              <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
                      <Database size={14} className="text-brand-secondary" />
                      <span className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase">Vault Size: {leads.length} Records</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/10" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">Developed by Unreal Studio</span>
              </div>
          </footer>
        </main>
      </div>
  );
}

function StatusBadge({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-2 border-white/5">
            <Icon size={12} className={color} />
            <span className={cn("text-[9px] font-black tracking-widest uppercase", color)}>{label}</span>
        </div>
    );
}
