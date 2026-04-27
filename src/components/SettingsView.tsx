import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Zap, Globe, Github, Terminal, Sliders, Save, Database, Key } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function SettingsView({ onClear, history = [] }: { onClear?: () => void, history?: { query: string, source: string, timestamp: string, type: string }[] }) {
  const [apiKey, setApiKey] = useState('••••••••••••••••');
  const [accuracy, setAccuracy] = useState(85);
  const [proxy, setProxy] = useState('US-NORTH-ORBIT');

  return (
    <div className="p-12 h-full overflow-y-auto animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-5xl font-black tracking-tight flex items-center gap-6 uppercase">
              <Settings size={48} className="text-brand-primary" />
              System Control
            </h2>
            <p className="text-white/40 mt-3 text-lg font-medium">Fine-tune high-level extraction nodes and monitor search history.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History Section - Full Width top or side */}
          <div className="lg:col-span-3 glass p-8 rounded-[44px] space-y-6 relative overflow-hidden border-brand-primary/10">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Database className="text-brand-primary" size={24} />
                  <h3 className="text-xl font-bold uppercase tracking-widest text-white">Recent Search History</h3>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{history.length} RECORDS CACHED</span>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom mask-fade-right">
                {history.length > 0 ? history.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-dark p-6 rounded-[28px] border border-white/5 min-w-[300px] shrink-0 group hover:border-brand-primary/30 transition-all border-l-4 border-l-brand-primary/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex gap-2">
                         <span className="px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest border border-brand-primary/20">
                            {item.source}
                         </span>
                         <span className="px-3 py-1 rounded-lg bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest border border-white/10">
                            {item.type}
                         </span>
                       </div>
                       <span className="text-[9px] font-mono text-white/20">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2 line-clamp-1 italic">"{item.query}"</h4>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-primary/30 w-full animate-pulse" />
                    </div>
                  </motion.div>
                )) : (
                  <div className="w-full py-10 flex items-center justify-center text-white/10 italic font-mono uppercase tracking-[0.3em] text-xs">
                    No Search Nodes Recorded
                  </div>
                )}
             </div>
          </div>

          {/* AI Configuration */}
          <div className="glass p-8 rounded-[40px] space-y-6">
             <div className="flex items-center gap-4 mb-4">
                <Zap className="text-yellow-400" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Scraping Engine</h3>
             </div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Network Accuracy</label>
                <div className="flex items-center gap-6">
                    <input 
                      type="range" 
                      min="1" max="100" 
                      value={accuracy} 
                      onChange={(e) => setAccuracy(parseInt(e.target.value))}
                      className="flex-1 accent-brand-primary" 
                    />
                    <span className="text-brand-primary font-mono font-bold text-xl">{accuracy}%</span>
                </div>
             </div>

             <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-xs text-white/40 leading-relaxed italic">
                    The scraping engine uses an AI-powered neural network to identify and verify business email and phone numbers in real-time.
                </p>
             </div>
          </div>

          {/* Network Settings */}
          <div className="glass p-8 rounded-[40px] space-y-6">
             <div className="flex items-center gap-4 mb-4">
                <Shield className="text-brand-primary" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Safety & Proxy</h3>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Active Proxy Node</label>
                <select 
                   value={proxy}
                   onChange={(e) => setProxy(e.target.value)}
                   className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary appearance-none text-white"
                >
                    <option value="US-NORTH-ORBIT">US-NORTH-ORBIT (Stable)</option>
                    <option value="EU-WEST-MATRIX">EU-WEST-MATRIX (Fast)</option>
                    <option value="ASIA-SOUTH-NODE">ASIA-SOUTH-NODE (Secure)</option>
                </select>
             </div>

             <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-2xl border border-green-500/20">
                <div className="flex gap-3 items-center">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-bold text-green-400">ENCRYPTION ACTIVE</span>
                </div>
                <Globe size={18} className="text-green-400/40" />
             </div>
          </div>

          {/* Advanced Integrations */}
          <div className="glass p-8 rounded-[40px] md:col-span-2 space-y-6">
             <div className="flex items-center gap-4 mb-4" id="integrations-header">
                <Database className="text-brand-secondary" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Global Data Sources</h3>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ToggleButton icon={Github} label="GitHub API" isActive={true} />
                <ToggleButton icon={Globe} label="LinkedIn Pro" isActive={true} />
                <ToggleButton icon={Terminal} label="Social Scraper" isActive={true} />
                <ToggleButton icon={Sliders} label="Custom Web" isActive={false} />
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pb-12">
            <button 
                onClick={onClear}
                className="px-10 py-5 rounded-[24px] glass-dark text-red-500 font-bold uppercase tracking-[0.2em] text-xs hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all border border-red-500/20 shadow-xl hover:shadow-red-500/10"
            >
                Clear Intelligence Vault
            </button>
            <button className="px-12 py-5 rounded-[24px] bg-brand-primary text-black font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Save size={18} /> Sync to Cloud
            </button>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ icon: Icon, label, isActive }: { icon: any, label: string, isActive: boolean }) {
    return (
        <div className={cn(
            "p-5 rounded-3xl flex flex-col items-center gap-3 transition-all cursor-pointer border",
            isActive ? "bg-white/10 border-brand-primary/40" : "bg-black/20 border-white/5 opacity-40 hover:opacity-100"
        )}>
            <div className={cn("p-3 rounded-2xl", isActive ? "bg-brand-primary text-black" : "bg-white/10")}>
                <Icon size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{label}</span>
            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-brand-primary" : "bg-white/20")} />
        </div>
    );
}
