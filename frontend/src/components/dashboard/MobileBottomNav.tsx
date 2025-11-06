import React from 'react';
import { Home, Compass, Bell, User, Plus } from 'lucide-react';

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-zinc-950 border-t border-zinc-800 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <MobileNavItem icon={<Home className="w-6 h-6" />} active />
        <MobileNavItem icon={<Compass className="w-6 h-6" />} />
        <button className="w-12 h-12 bg-cyan-500 text-zinc-950 flex items-center justify-center -mt-6">
          <Plus className="w-6 h-6" />
        </button>
        <MobileNavItem icon={<Bell className="w-6 h-6" />} />
        <MobileNavItem icon={<User className="w-6 h-6" />} />
      </div>
    </nav>
  );
}

function MobileNavItem({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`w-10 h-10 ${active ? 'text-white' : 'text-zinc-400'}`}>{icon}</button>
  );
}


