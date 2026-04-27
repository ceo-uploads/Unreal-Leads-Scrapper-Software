import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Facebook, 
  Instagram, 
  Github, 
  Linkedin, 
  Globe, 
  Shield, 
  Filter, 
  SearchCode, 
  Users, 
  Briefcase,
  Zap,
  ChevronRight,
  Database,
  SearchCheck,
  LayoutGrid,
  Twitter,
  Video,
  Send,
  MapPin,
  Ghost
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const platforms = [
  { id: 'web', name: 'Web Search', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', description: 'Universal web crawling & data mining' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10', description: 'Business pages & community extraction' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10', description: 'Influencer & visual brand discovery' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-700/10', description: 'Professional network & B2B leads' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-white', bg: 'bg-white/10', description: 'Real-time social intelligence' },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-brand-primary', bg: 'bg-brand-primary/10', description: 'Viral trend & creator data' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-400', bg: 'bg-sky-400/10', description: 'Channel & group analytics' },
  { id: 'snapchat', name: 'Snapchat', icon: Ghost, color: 'text-yellow-400', bg: 'bg-yellow-400/10', description: 'Local story & user discovery' },
  { id: 'github', name: 'GitHub', icon: Github, color: 'text-white', bg: 'bg-white/10', description: 'Developer talent & repository data' },
];

const categories = [
  { name: "Software Engineer", icon: SearchCode, group: "Tech" },
  { name: "Marketing Manager", icon: Users, group: "Growth" },
  { name: "Real Estate Agent", icon: Globe, group: "Property" },
  { name: "E-commerce Owner", icon: LayoutGrid, group: "Sales" },
  { name: "Content Creator", icon: Instagram, group: "Media" },
  { name: "Startup Founder", icon: Zap, group: "Tech" },
  { name: "Human Resources", icon: Briefcase, group: "Talent" },
];

export default function UniversalSearch({ onScrape, isScraping }: { onScrape: (query: string, source: string, location?: string) => void, isScraping: boolean }) {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleLaunch = () => {
    if (!query || isScraping) return;
    onScrape(query, selectedPlatform.name, location);
  };

  return (
    <div className="flex flex-col h-full gap-8 p-12 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="max-w-6xl mx-auto w-full space-y-12 pb-24">
        {/* Hero Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <h2 className="text-6xl font-black tracking-tight leading-tight uppercase">
              Omni-Source <br />
              <span className="text-brand-primary">Grounded Leads</span>
            </h2>
            <p className="text-white/40 text-xl max-w-xl leading-relaxed">
              Target specific platforms with real-time web-grounded extraction engines. 
              Synchronized multi-channel Lead Gen starts here.
            </p>
          </div>
          <div className="hidden lg:flex gap-4">
              <div className="p-4 glass rounded-3xl border-white/5 flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Postgres</span>
                  <div className="flex -space-x-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-brand-primary flex items-center justify-center text-xs font-bold text-black ring-2 ring-brand-primary/20">
                              {i}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>

        {/* Platform Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p)}
              disabled={isScraping}
              className={cn(
                "group relative p-6 rounded-[32px] border transition-all duration-500 flex flex-col items-start gap-4 text-left overflow-hidden",
                selectedPlatform.id === p.id 
                  ? "bg-white/10 border-brand-primary/50 shadow-2xl scale-105" 
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20",
                isScraping && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn("p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110", p.bg, p.color)}>
                <p.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-xs text-white/40 mt-1 line-clamp-1">{p.description}</p>
              </div>
              {selectedPlatform.id === p.id && (
                <div className="absolute top-4 right-4 text-brand-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="glass p-8 rounded-[44px] space-y-8 relative overflow-hidden shadow-2xl border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />
          
          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            <div className="flex-[2] relative group">
              <div className={cn("absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors z-10", selectedPlatform.bg, selectedPlatform.color)}>
                <selectedPlatform.icon size={20} />
              </div>
              <input 
                type="text" 
                placeholder={`Search ${selectedPlatform.name} for professions, keywords, or roles...`}
                className="w-full bg-black/40 border border-white/10 rounded-[28px] pl-20 pr-8 py-7 text-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-white/10 font-bold disabled:opacity-50"
                value={query}
                disabled={isScraping}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
              />
              
              {/* Expanding Loader Overlay */}
              <AnimatePresence>
                {isScraping && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-brand-primary/5 rounded-[28px] pointer-events-none overflow-hidden"
                  >
                    <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full w-1/3 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 text-white/40 transition-colors z-10">
                <MapPin size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Location (e.g. Noakhali)"
                className="w-full bg-black/40 border border-white/10 rounded-[28px] pl-20 pr-8 py-7 text-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-white/10 font-bold disabled:opacity-50"
                value={location}
                disabled={isScraping}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
              />
            </div>
            
            <button 
              onClick={handleLaunch}
              disabled={!query || isScraping}
              className={cn(
                "px-12 py-7 rounded-[28px] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 group min-w-[240px]",
                !query 
                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                  : isScraping 
                    ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30 cursor-wait"
                    : "bg-brand-primary text-black shadow-xl shadow-brand-primary/20 hover:scale-105"
              )}
            >
              {isScraping ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Zap size={20} className="group-hover:animate-pulse" />
                  Initialize Scrape
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mr-4 border-r border-white/10 pr-6">
              <Filter size={14} />
              Protocol Pre-sets
            </div>
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setQuery(c.name)}
                className={cn(
                    "px-5 py-2.5 rounded-2xl glass hover:bg-brand-primary hover:text-black border border-white/5 text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                    query === c.name ? "bg-brand-primary text-black" : "text-white/60"
                )}
              >
                <c.icon size={14} />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={SearchCheck} 
            title="Real-Time Verification" 
            description="Every lead is passed through our verification node to check email deliverability and phone formatting."
            color="text-emerald-400"
          />
          <FeatureCard 
            icon={Users} 
            title="Identity Mapping" 
            description="Our engine cross-references social profiles across platforms to build a comprehensive identity graph."
            color="text-blue-400"
          />
          <FeatureCard 
            icon={Database} 
            title="Big Data Ready" 
            description="Optimized for million-lead operations."
            color="text-purple-400"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <div className="glass p-8 rounded-[40px] flex gap-6 group hover:border-white/20 transition-all border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
      <div className={cn("p-4 rounded-2xl bg-white/5 h-fit group-hover:scale-110 transition-transform duration-500", color)}>
        <Icon size={24} />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold tracking-tight">{title}</h4>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}
