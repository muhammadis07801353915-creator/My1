import { useState } from 'react';
import Home from './components/Home';
import Search from './components/Search';
import LiveTV from './components/LiveTV';
import Watchlist from './components/Watchlist';
import Profile from './components/Profile';
import Detail from './components/Detail';
import BottomNav from './components/BottomNav';

export default function ClientApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="bg-neutral-950 light-mode:bg-gray-50 text-white light-mode:text-black min-h-screen flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {selectedItem ? (
          <Detail item={selectedItem} onBack={() => setSelectedItem(null)} />
        ) : (
          <>
            {currentTab === 'home' && <Home onSelect={setSelectedItem} />}
            {currentTab === 'search' && <Search onSelect={setSelectedItem} />}
            {currentTab === 'livetv' && <LiveTV />}
            {currentTab === 'watchlist' && <Watchlist onSelect={setSelectedItem} />}
            {currentTab === 'profile' && <Profile />}
          </>
        )}
      </div>
      {!selectedItem && <BottomNav currentTab={currentTab} onChange={setCurrentTab} />}
    </div>
  );
}
