import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Search, 
  Trash2, 
  Heart,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  MapPin,
  Mail,
  Phone,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotifications } from './NotificationProvider';

export interface Lead {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  source: string;
  scrapedAt: string;
  isLiked: boolean;
}

export default function LeadDatabase({ leads, onDelete, onToggleLike }: { 
  leads: Lead[], 
  onDelete: (id: string) => void,
  onToggleLike: (id: string) => void
}) {
  const { addNotification } = useNotifications();
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedSource, setSelectedSource] = useState('All');

  const sources = ['All', ...Array.from(new Set(leads.map(l => l.source)))];

  const filteredLeads = leads.filter(l => {
    const matchesFilter = (l.name || "").toLowerCase().includes((filter || "").toLowerCase()) || 
                         (l.category || "").toLowerCase().includes((filter || "").toLowerCase());
    const matchesSource = selectedSource === 'All' || l.source === selectedSource;
    return matchesFilter && matchesSource;
  });

  const getSourceIcon = (source: string) => {
    switch ((source || "").toLowerCase()) {
        case 'facebook': return Facebook;
        case 'instagram': return Instagram;
        case 'linkedin': return Linkedin;
        case 'github': return Github;
        case 'map selection':
        case 'google satellite':
        case 'google maps': return MapPin;
        default: return Globe;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
        case 'facebook': return 'text-blue-600';
        case 'instagram': return 'text-pink-500';
        case 'linkedin': return 'text-blue-700';
        case 'github': return 'text-white';
        case 'map selection': return 'text-brand-primary';
        default: return 'text-white/40';
    }
  };

  const downloadCSV = () => {
    if (filteredLeads.length === 0) {
      addNotification('NO DATA AVAILABLE FOR EXPORT', 'error');
      return;
    }
    
    addNotification(`PREPARING EXPORT: ${filteredLeads.length} ENTITIES...`, 'process');
    
    const headers = ['Name', 'Category', 'Address', 'Phone', 'Email', 'Source', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => [
        `"${l.name.replace(/"/g, '""')}"`, 
        `"${l.category.replace(/"/g, '""')}"`, 
        `"${l.address.replace(/"/g, '""')}"`, 
        `"${l.phone}"`, 
        `"${l.email}"`, 
        `"${l.source}"`,
        `"${l.scrapedAt}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      addNotification('INTELLIGENCE EXPORTED SUCCESSFULLY', 'success');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full gap-8 p-12 overflow-y-auto scrollbar-custom animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 max-w-[1600px] mx-auto w-full">
        <div>
          <h2 className="text-6xl font-black tracking-tight flex items-center gap-6 uppercase">
            Intelligence <span className="text-brand-primary">Vault</span>
          </h2>
          <p className="text-white/40 mt-2 text-lg font-medium">Secured extraction database containing {leads.length} entities.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            <div className="glass px-6 py-4 rounded-[28px] flex items-center gap-4 border border-white/10 w-full lg:w-96">
                <Search className="text-white/20" size={20} />
                <input 
                    type="text" 
                    placeholder="Search intelligence cache..." 
                    className="bg-transparent border-none text-lg focus:outline-none w-full font-mono font-bold"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="flex gap-1 glass p-2 rounded-[24px] border border-white/10">
                <button 
                  onClick={() => setView('grid')}
                  className={cn("p-3 rounded-2xl transition-all", view === 'grid' ? "bg-white/10 text-brand-primary" : "text-white/30 hover:text-white")}
                >
                    <LayoutGrid size={22} />
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={cn("p-3 rounded-2xl transition-all", view === 'list' ? "bg-white/10 text-brand-primary" : "text-white/30 hover:text-white")}
                >
                    <List size={22} />
                </button>
            </div>

            <button 
                onClick={downloadCSV}
                className="bg-white text-black px-10 py-5 rounded-[28px] font-black text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl"
            >
                <Download size={20} />
                Export Intelligence
            </button>
        </div>
      </div>

    <div className="sticky top-0 z-[110] bg-gradient-to-b from-[#050505] via-[#050505]/95 to-transparent pt-8 pb-16">
      <div className="flex gap-6 overflow-x-auto scrollbar-none max-w-[1700px] mx-auto w-full px-8">
          {sources.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSource(s)}
                className={cn(
                    "px-10 py-5 rounded-[22px] text-[13px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap border shrink-0",
                    selectedSource === s 
                      ? "bg-brand-primary text-black border-brand-primary shadow-[0_0_40px_rgba(0,242,255,0.5)] scale-105" 
                      : "glass text-white/40 border-white/5 hover:border-white/20 hover:bg-white/10 hover:text-white/70"
                )}
              >
                  {s}
              </button>
          ))}
      </div>
    </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full">
        <div className={cn(
            "grid gap-6 pb-24",
            view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          <AnimatePresence>
            {filteredLeads.map((lead, i) => {
              const SourceIcon = getSourceIcon(lead.source);
              return (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: (i % 20) * 0.03 }}
                  className="glass p-8 rounded-[44px] border border-white/5 group hover:border-brand-primary/30 transition-all relative overflow-hidden flex flex-col justify-between h-full"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                          <div className={cn("p-4 rounded-2xl bg-white/5 shadow-inner", getSourceColor(lead.source))}>
                              <SourceIcon size={24} />
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => onToggleLike(lead.id)}
                            className={cn(
                              "p-3 rounded-2xl transition-all",
                              lead.isLiked ? "text-red-500 bg-red-500/10 shadow-lg shadow-red-500/10" : "text-white/20 hover:text-red-400 hover:bg-white/5"
                            )}
                          >
                              <Heart size={20} fill={lead.isLiked ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => onDelete(lead.id)}
                            className="p-3 rounded-2xl text-white/20 hover:text-red-400 hover:bg-white/5 transition-all"
                          >
                              <Trash2 size={20} />
                          </button>
                      </div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">{lead.id}</span>
                        <h3 className="font-black text-2xl tracking-tight group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">{lead.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] mt-2">
                            <Filter size={10} />
                            {lead.category || 'Lead'}
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4 text-sm text-white/70 font-medium">
                        <Mail size={16} className="text-brand-primary/50" />
                        <a 
                          href={lead.email ? `mailto:${lead.email}` : '#'} 
                          className={cn("truncate hover:text-brand-primary transition-colors", !lead.email && "opacity-40 cursor-default")}
                          onClick={(e) => !lead.email && e.preventDefault()}
                        >
                          {lead.email || 'No email found'}
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70 font-medium">
                        <Phone size={16} className="text-brand-primary/50" />
                        <a 
                          href={lead.phone ? `tel:${lead.phone}` : '#'} 
                          className={cn("hover:text-brand-primary transition-colors", !lead.phone && "opacity-40 cursor-default")}
                          onClick={(e) => !lead.phone && e.preventDefault()}
                        >
                          {lead.phone || 'No phone found'}
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70 font-medium">
                        <Globe size={16} className="text-brand-primary/50" />
                        <a 
                          href={lead.website ? (lead.website.startsWith('http') ? lead.website : `https://${lead.website}`) : '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cn("truncate hover:text-brand-primary transition-colors underline decoration-brand-primary/30 underline-offset-4", !lead.website && "opacity-40 cursor-default no-underline")}
                          onClick={(e) => !lead.website && e.preventDefault()}
                        >
                          {lead.website || 'No website found'}
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70 font-medium">
                        <MapPin size={16} className="text-brand-primary/50" />
                        <span className="line-clamp-1">{lead.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Source</span>
                        <span className={cn("text-[10px] font-bold uppercase", getSourceColor(lead.source))}>{lead.source}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Date</span>
                        <span className="text-[10px] font-bold text-white/60 uppercase">{lead.scrapedAt}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20 space-y-8">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                <Database size={48} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-[0.3em]">No Intelligence Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
