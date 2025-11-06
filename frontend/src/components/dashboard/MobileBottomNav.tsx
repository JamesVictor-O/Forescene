import React from 'react';
import { Home, Compass, Bell, User, Plus } from 'lucide-react';

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800/50 lg:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        <MobileNavItem icon={<Home className="w-5 h-5" />} label="Feed" active />
        <MobileNavItem icon={<Compass className="w-5 h-5" />} label="Discover" />
        <button className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center -mt-6 rounded-full hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg">
          <Plus className="w-6 h-6" />
        </button>
        <MobileNavItem icon={<Bell className="w-5 h-5" />} label="Alerts" />
        <MobileNavItem icon={<User className="w-5 h-5" />} label="Profile" />
      </div>
    </nav>
  );
}

function MobileNavItem({ icon, label, active }: { icon: React.ReactNode; label?: string; active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 ${active ? 'text-cyan-400' : 'text-zinc-400'}`}>
      {icon}
      {label && <span className="text-[10px] font-medium">{label}</span>}
    </button>
  );
}


