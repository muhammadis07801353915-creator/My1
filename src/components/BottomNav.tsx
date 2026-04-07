import { Home, Search, Tv, Bookmark, User } from 'lucide-react';

export default function BottomNav({ currentTab, onChange }: { currentTab: string, onChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'livetv', icon: Tv, label: 'Live TV' },
    { id: 'watchlist', icon: Bookmark, label: 'Watchlist' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 bg-neutral-900 border-t border-neutral-800 flex justify-around items-center p-3 z-50 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center space-y-1 ${isActive ? 'text-red-500' : 'text-neutral-400 hover:text-neutral-200'}`}
          >
            <Icon size={24} className={isActive ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
