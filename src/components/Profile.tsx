import { Bell, Download, Shield, FileText, Star, LogOut, ChevronRight, Crown, LayoutDashboard, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProSubscriptionModal from './ProSubscriptionModal';
import { getProStatusLocal } from '../lib/pro';

export default function Profile() {
  const navigate = useNavigate();
  const [showProModal, setShowProModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.classList.contains('light-mode')) {
      setIsDarkMode(false);
    }
    
    // Check PRO status
    setIsPro(getProStatusLocal());
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out? This will also deactivate PRO on this device.')) {
      localStorage.removeItem('pro_data');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 pt-8 pb-24 text-white light-mode:text-black">
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-24 h-24 rounded-full border-2 border-red-600 object-cover" />
          <button className="absolute bottom-0 right-0 bg-red-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-neutral-950 light-mode:border-white hover:bg-red-700 transition">
            <span className="text-white text-lg leading-none mb-1">+</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold mt-4">Anderson Cooper</h2>
        <p className="text-neutral-500 text-sm mt-1">anderson@example.com</p>
      </div>

      <div 
        onClick={() => !isPro && setShowProModal(true)}
        className={`${isPro ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-gradient-to-r from-red-900/40 to-red-600/20 border-red-900/50 hover:from-red-900/50 hover:to-red-600/30'} border rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer transition group`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${isPro ? 'bg-emerald-600/20 text-emerald-500' : 'bg-red-600/20 text-red-500'} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Crown size={24} />
          </div>
          <div>
            <h3 className={`font-semibold ${isPro ? 'text-emerald-500' : 'text-red-500'} text-lg`}>
              {isPro ? 'تەواو چالاک کراوە' : 'Become a PRO'}
            </h3>
            <p className="text-sm text-neutral-400 light-mode:text-neutral-600">
              {isPro ? 'Enjoy all premium features' : 'Unlock all premium features'}
            </p>
          </div>
        </div>
        {!isPro && <ChevronRight size={24} className="text-red-500" />}
      </div>

      <div className="space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 bg-neutral-900/30 light-mode:bg-neutral-100 hover:bg-neutral-900/80 light-mode:hover:bg-neutral-200 rounded-xl transition border border-transparent hover:border-neutral-800 light-mode:hover:border-neutral-300"
        >
          <div className="flex items-center space-x-4">
            {isDarkMode ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-indigo-500" />}
            <span className="font-medium text-neutral-200 light-mode:text-neutral-800">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
        </button>

        {/* Admin Panel Link for Testing */}
        <ProfileMenuItem 
          icon={LayoutDashboard} 
          label="Admin Panel (Test)" 
          textClass="text-blue-400"
          onClick={() => navigate('/admin')}
        />
        
        <ProfileMenuItem icon={Bell} label="Notifications" />
        <ProfileMenuItem icon={Download} label="Downloads" />
        <ProfileMenuItem icon={Shield} label="Privacy Policy" />
        <ProfileMenuItem icon={FileText} label="Terms & Conditions" />
        <ProfileMenuItem icon={Star} label="Rate this app" />
        <ProfileMenuItem icon={LogOut} label="Log out" textClass="text-red-500" onClick={handleLogout} />
      </div>

      <ProSubscriptionModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
    </div>
  );
}

function ProfileMenuItem({ icon: Icon, label, textClass = "text-neutral-200 light-mode:text-neutral-800", onClick }: { icon: any, label: string, textClass?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-neutral-900/30 light-mode:bg-neutral-100 hover:bg-neutral-900/80 light-mode:hover:bg-neutral-200 rounded-xl transition border border-transparent hover:border-neutral-800 light-mode:hover:border-neutral-300"
    >
      <div className="flex items-center space-x-4">
        <Icon size={22} className={textClass === 'text-red-500' ? 'text-red-500' : textClass === 'text-blue-400' ? 'text-blue-400' : 'text-neutral-400 light-mode:text-neutral-600'} />
        <span className={`font-medium ${textClass}`}>{label}</span>
      </div>
      <ChevronRight size={20} className="text-neutral-600 light-mode:text-neutral-400" />
    </button>
  );
}
