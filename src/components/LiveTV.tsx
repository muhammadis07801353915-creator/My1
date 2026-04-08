import { useState, useEffect } from 'react';
import { ChevronDown, CheckCircle2, ArrowLeft, Search, X, Users, Play } from 'lucide-react';
import { liveCategories, banners } from '../data/mockData';
import { supabase } from '../lib/supabase';
import ReactPlayer from 'react-player';
import HlsPlayer from './HlsPlayer';
import { useLanguage } from '../lib/LanguageContext';

export default function LiveTV() {
  const { t } = useLanguage();
  const [channels, setChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [viewAllCategory, setViewAllCategory] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Player State
  const [playingChannel, setPlayingChannel] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Categories
      const { data: catData } = await supabase
        .from('channel_categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (catData) setCategories(catData);

      // Fetch Channels
      const { data: chanData } = await supabase
        .from('channels')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (chanData) setChannels(chanData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  // Group channels by category
  const channelsByCategory = channels.reduce((acc, channel) => {
    if (!acc[channel.category]) {
      acc[channel.category] = [];
    }
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, any[]>);

  const categoriesToRender = selectedCategory === 'All' 
    ? categories.map(c => c.name)
    : [selectedCategory];

  const searchResults = searchQuery.trim()
    ? channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  if (loading) {
    return (
      <div className="bg-[#1A1D24] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (playingChannel) {
    return (
      <div className="bg-black min-h-screen text-white flex flex-col font-sans">
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-[100] pointer-events-none">
          <button 
            onClick={() => setPlayingChannel(null)}
            className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-md transition pointer-events-auto"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-2 bg-red-600/90 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-auto">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-wider">LIVE</span>
          </div>
        </div>

        <div className="w-full bg-black relative aspect-video md:h-[70vh] md:aspect-auto">
          {(() => {
            const isIframeLink = playingChannel.stream_url?.includes('t.me') || 
                                 playingChannel.stream_url?.includes('telegram.me') ||
                                 playingChannel.stream_url?.includes('ok.ru');
            
            const getEmbedUrl = (url: string) => {
              if (!url) return '';
              if (url.includes('t.me') || url.includes('telegram.me')) {
                if (url.includes('embed=1')) return url;
                const separator = url.includes('?') ? '&' : '?';
                return `${url}${separator}embed=1`;
              }
              return url;
            };

            const isM3u8 = playingChannel.stream_url?.toLowerCase().includes('.m3u8');

            return !playingChannel.stream_url ? (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400 absolute inset-0">
                No stream URL available
              </div>
            ) : isIframeLink ? (
              <iframe 
                src={getEmbedUrl(playingChannel.stream_url)} 
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
              ></iframe>
            ) : isM3u8 ? (
              <HlsPlayer 
                url={playingChannel.stream_url} 
                className="w-full h-full absolute inset-0 object-contain bg-black"
                autoPlay 
                controls 
              />
            ) : (
              (() => {
                const Player = ReactPlayer as any;
                return (
                  <Player 
                    url={playingChannel.stream_url} 
                    width="100%" 
                    height="100%" 
                    controls 
                    playing 
                    className="absolute inset-0"
                  />
                );
              })()
            );
          })()}
        </div>

        <div className="p-5 bg-neutral-900 border-t border-neutral-800 z-10 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold mb-1">{playingChannel.name}</h1>
              <p className="text-sm text-neutral-400">{playingChannel.category}</p>
            </div>
            <div className="flex items-center space-x-1.5 text-neutral-300 bg-neutral-800 px-3 py-1.5 rounded-lg">
              <Users size={16} className="text-red-500" />
              <span className="font-medium text-sm">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewAllCategory) {
    const categoryChannels = channelsByCategory[viewAllCategory] || [];
    return (
      <div className="bg-[#1A1D24] min-h-screen text-white pb-24 font-sans">
        {/* Header for View All */}
        <div className="flex items-center px-4 py-4 bg-[#22252D] sticky top-0 z-40 shadow-md">
          <button 
            onClick={() => setViewAllCategory(null)}
            className="mr-4 rtl:mr-0 rtl:ml-4 hover:text-red-400 transition"
          >
            <ArrowLeft size={24} className="rtl:rotate-180" />
          </button>
          <h1 className="text-xl font-bold">{viewAllCategory}</h1>
        </div>
        
        {/* Grid of all channels in category */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {categoryChannels.map(channel => (
              <div 
                key={channel.id} 
                onClick={() => setPlayingChannel(channel)}
                className="bg-[#2A2D34] border border-neutral-700/50 rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-[#333740] hover:border-neutral-500 transition group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 z-10">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span>LIVE</span>
                </div>
                {channel.image ? (
                  <img 
                    src={channel.image} 
                    alt={channel.name} 
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                  />
                ) : (
                  <span className="text-xs text-center text-neutral-400 font-medium">{channel.name}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <Play size={24} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1D24] min-h-screen text-white pb-24 font-sans">
      {/* Header */}
      {isSearchOpen ? (
        <div className="flex items-center w-full px-4 py-3 bg-[#22252D] sticky top-0 z-40 shadow-md space-x-3 rtl:space-x-reverse">
          <Search size={20} className="text-neutral-400" />
          <input 
            type="text" 
            autoFocus
            placeholder={t.searchChannels} 
            className="flex-1 bg-transparent text-white outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
            <X size={20} className="text-neutral-400 hover:text-white" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 bg-[#22252D] sticky top-0 z-40 shadow-md">
          <div className="flex-1 flex justify-start">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium hover:text-red-400 transition"
            >
              <ChevronDown size={16} />
              <span>{t.category}</span>
            </button>
          </div>
          
          <div className="flex shrink-0 justify-center items-center">
            <img 
              src="https://i.ibb.co/bMPPbYR2/with-text-wight-1.png" 
              alt="Logo" 
              className="h-6 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-xl font-bold italic tracking-tighter">
              <span className="text-red-500">my</span>TV+
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-1 text-sm font-medium hover:text-red-400 transition"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {searchQuery.trim() ? (
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">{t.searchResults}</h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {searchResults.map(channel => (
                <div 
                  key={channel.id} 
                  onClick={() => setPlayingChannel(channel)}
                  className="bg-[#2A2D34] border border-neutral-700/50 rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-[#333740] hover:border-neutral-500 transition group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 rtl:space-x-reverse z-10">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>
                  {channel.image ? (
                    <img 
                      src={channel.image} 
                      alt={channel.name} 
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                    />
                  ) : (
                    <span className="text-xs text-center text-neutral-400 font-medium">{channel.name}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Play size={24} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-neutral-500 py-10">
              No channels found for "{searchQuery}"
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Main Banner */}
          <div className="w-full bg-white">
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800&h=400" 
              alt="Main Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-48 object-cover"
            />
          </div>

          <div className="p-4 space-y-6">
        {categoriesToRender.length === 0 ? (
            <div className="text-center text-neutral-500 py-10">
              {t.noChannels}
            </div>
        ) : categoriesToRender.map((category, index) => {
          const categoryChannels = channelsByCategory[category] || [];
          if (categoryChannels.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{category}</h2>
                <button 
                  onClick={() => setViewAllCategory(category)}
                  className="text-red-500 text-sm hover:text-red-400 transition"
                >
                  + {t.viewAll}
                </button>
              </div>

              {/* Channel Grid */}
              <div className="grid grid-cols-3 gap-3">
                {categoryChannels.slice(0, 6).map(channel => (
                  <div 
                    key={channel.id} 
                    onClick={() => setPlayingChannel(channel)}
                    className="bg-[#2A2D34] border border-neutral-700/50 rounded-xl aspect-[4/3] flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-[#333740] hover:border-neutral-500 transition group relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] flex items-center space-x-1 z-10">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span>LIVE</span>
                    </div>
                    {channel.image ? (
                      <img 
                        src={channel.image} 
                        alt={channel.name} 
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all"
                      />
                    ) : (
                      <span className="text-xs text-center text-neutral-400 font-medium">{channel.name}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <Play size={24} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Interspersed Banners */}
              {index < categoriesToRender.length - 1 && banners[index % banners.length] && (
                <div className="pt-4 pb-2">
                  <img 
                    src={banners[index % banners.length].image} 
                    alt="Promo Banner" 
                    referrerPolicy="no-referrer"
                    className="w-full h-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#22252D] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold">{t.category}</h3>
            </div>
            <div className="overflow-y-auto p-2">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setIsCategoryModalOpen(false);
                }}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl hover:bg-[#2A2D34] transition text-left rtl:text-right"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCategory === 'All' ? 'border-red-500' : 'border-neutral-500'}`}>
                  {selectedCategory === 'All' && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                </div>
                <span className={selectedCategory === 'All' ? 'text-white font-medium' : 'text-neutral-400'}>
                  All
                </span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setIsCategoryModalOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl hover:bg-[#2A2D34] transition text-left rtl:text-right"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCategory === cat.name ? 'border-red-500' : 'border-neutral-500'}`}>
                    {selectedCategory === cat.name && <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />}
                  </div>
                  <span className={selectedCategory === cat.name ? 'text-white font-medium' : 'text-neutral-400'}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-800">
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-medium transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
