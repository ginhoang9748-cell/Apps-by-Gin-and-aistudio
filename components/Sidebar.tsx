import React from 'react';
import { LayoutDashboard, Target, BarChart3, MessageSquareText, Zap, Settings } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.GOALS, label: 'My Goals', icon: Target },
    { id: View.ANALYTICS, label: 'Progress', icon: BarChart3 },
    { id: View.COACH, label: 'AI Coach', icon: MessageSquareText },
    { id: View.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6 flex items-center space-x-2 text-indigo-600">
        <Zap className="w-8 h-8 fill-indigo-600" />
        <span className="text-xl font-bold tracking-tight text-slate-900">FocusFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <p className="text-xs font-medium text-slate-400 mb-1">Pro Tip</p>
          <p className="text-sm leading-snug">"Consistency beats intensity."</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;