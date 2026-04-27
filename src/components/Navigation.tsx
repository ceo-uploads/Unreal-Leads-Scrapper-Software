import React from 'react';
import { motion } from 'motion/react';
import { Search, Map, Database, Settings, Hexagon, Terminal, User, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative flex items-center justify-center p-3 rounded-2xl transition-all duration-500",
      isActive ? "bg-brand-primary text-black" : "text-white/50 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className={cn("w-6 h-6 transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
    <span className="absolute left-16 px-3 py-1 rounded-lg bg-white text-black text-xs font-bold opacity-0 -translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
      {label}
    </span>
  </button>
);

export default function Navigation({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 h-fit glass rounded-3xl p-3 flex flex-col gap-6 z-50 shadow-2xl">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center glow">
          <Hexagon className="text-black fill-black" size={28} />
        </div>
        <div className="w-full h-[1px] bg-white/10 mt-2" />
      </div>

      <NavItem icon={Search} label="Search Scraper" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
      <NavItem icon={Map} label="Map Scraper" isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} />
      <NavItem icon={Database} label="Lead Database" isActive={activeTab === 'database'} onClick={() => setActiveTab('database')} />
      <NavItem icon={Terminal} label="Process Logs" isActive={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} />
      <NavItem icon={User} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      
      <div className="mt-auto pt-4 border-t border-white/10">
        <NavItem icon={Settings} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </nav>
  );
}
