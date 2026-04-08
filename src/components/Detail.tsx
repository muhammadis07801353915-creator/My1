import { ArrowLeft, Share2, BookmarkPlus, BookmarkCheck, Play, Star, Download, MonitorPlay, X, Server } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReactPlayer from 'react-player';
import HlsPlayer from './HlsPlayer';
import { useWatchlist } from '../lib/useWatchlist';

export default function Detail({ item, onBack }: { item: any, onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showServersModal, setShowServersModal] = useState(false);
  const [selectedServerUrl, setSelectedServerUrl] = useState('');
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const isBookmarked = isInWatchlist(item.id);

  const servers = useMemo(() => {
    try {
      if (item.video_url && item.video_url.startsWith('[')) {
        return JSON.parse(item.video_url);
      }
    } catch (e) {
      console.error("Error parsing servers", e);
    }
    return [{ name: 'Default Server', url: item.video_url || '', quality: 'Auto' }];
  }, [item.video_url]);

  const handlePlayClick = () => {
    if (servers.length > 1) {
      setShowServersModal(true);
    } else {
      setSelectedServerUrl(servers[0]?.url || '');
      setIsPlaying(true);
    }
  };

  const handleServerSelect = (url: string) => {
    setSelectedServerUrl(url);
    setShowServersModal(false);
    setIsPlaying(true);
  };

  const isIframeLink = selectedServerUrl?.includes('t.me') || 
                       selectedServerUrl?.includes('telegram.me') || 
                       selectedServerUrl?.includes('ok.ru');
  
  // Convert standard links to embed links if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('t.me') || url.includes('telegram.me')) {
      if (url.includes('embed=1')) return url;
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}embed=1`;
    }
    // For ok.ru and others, assume the user provided the correct embed link
    return url;
  };
  return (
    <div className="bg-neutral-950 min-h-screen text-white pb-24">
      {/* Header / Backdrop or Player */}
      <div className="relative w-full bg-black aspect-video md:h-[70vh] md:aspect-auto">
        {isPlaying ? (
          <div className="w-full h-full relative">
            <button 
              onClick={() => setIsPlaying(false)} 
              className="absolute top-4 right-4 z-[100] w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition"
            >
              <X size={20} />
            </button>
            
            {(() => {
              const isM3u8 = selectedServerUrl?.toLowerCase().includes('.m3u8');

              return !selectedServerUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-400 absolute inset-0">
                  No video source available
                </div>
              ) : isIframeLink ? (
                <iframe 
                  src={getEmbedUrl(selectedServerUrl)} 
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen
                ></iframe>
              ) : isM3u8 ? (
                <HlsPlayer 
                  url={selectedServerUrl} 
                  className="w-full h-full absolute inset-0 object-contain bg-black"
                  autoPlay 
                  controls 
                />
              ) : (
                (() => {
                  const Player = ReactPlayer as any;
                  return (
                    <Player 
                      url={selectedServerUrl} 
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
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent z-10" />
            <img src={item.backdrop || item.image} alt={item.title} className="w-full h-full object-cover opacity-70" />
            
            <div className="absolute top-0 left-0 w-full p-4 pt-6 z-[100] flex justify-between items-center pointer-events-none">
              <button onClick={onBack} className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-md transition pointer-events-auto">
                <ArrowLeft size={20} />
              </button>
              <div className="flex space-x-3 pointer-events-auto">
                <button 
                  onClick={() => toggleWatchlist(item)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition ${isBookmarked ? 'bg-red-600 text-white' : 'bg-black/40 hover:bg-black/60'}`}
                >
                  {isBookmarked ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />}
                </button>
                <button className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-md transition">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <button 
                onClick={handlePlayClick}
                className="w-16 h-16 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center pl-1 backdrop-blur-sm shadow-[0_0_30px_rgba(220,38,38,0.5)] transition hover:scale-105"
              >
                <Play size={28} className="fill-white" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Content Info */}
      <div className="px-5 -mt-8 relative z-30">
        <h1 className="text-3xl font-bold mb-3">{item.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-6">
          <span className="flex items-center text-yellow-500 font-medium"><Star size={16} className="mr-1 fill-current" /> {item.rating}</span>
          <span>{item.year}</span>
          <span>{item.genre}</span>
        </div>

        <button 
          onClick={handlePlayClick}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl flex items-center justify-center font-semibold transition mb-8 shadow-lg shadow-red-600/20"
        >
          <Play size={20} className="mr-2 fill-current" /> Watch Now
        </button>

        <div className="flex justify-around border-y border-neutral-800/60 py-5 mb-8">
          <button className="flex flex-col items-center text-neutral-400 hover:text-white transition group">
            <div className="w-12 h-12 rounded-full bg-neutral-900 group-hover:bg-neutral-800 flex items-center justify-center mb-2 transition">
              <Download size={20} />
            </div>
            <span className="text-xs font-medium">Download</span>
          </button>
          <button className="flex flex-col items-center text-neutral-400 hover:text-white transition group">
            <div className="w-12 h-12 rounded-full bg-neutral-900 group-hover:bg-neutral-800 flex items-center justify-center mb-2 transition">
              <MonitorPlay size={20} />
            </div>
            <span className="text-xs font-medium">Trailer</span>
          </button>
          <button className="flex flex-col items-center text-neutral-400 hover:text-white transition group">
            <div className="w-12 h-12 rounded-full bg-neutral-900 group-hover:bg-neutral-800 flex items-center justify-center mb-2 transition">
              <Share2 size={20} />
            </div>
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Story Line</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Star cast</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center space-x-3 bg-neutral-900/50 pr-5 p-2 rounded-full border border-neutral-800/50 flex-none">
                <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="Actor" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">Actor Name</p>
                  <p className="text-xs text-neutral-500">Character</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Servers Modal */}
      {showServersModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1d24] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[80vh] border border-neutral-800 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-[#22252D]">
              <div>
                <h3 className="text-xl font-bold text-white">Choose Server</h3>
                <p className="text-sm text-neutral-400 mt-1">{servers.length} servers available</p>
              </div>
              <button 
                onClick={() => setShowServersModal(false)}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {servers.map((server: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleServerSelect(server.url)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/50 transition group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition">
                      <Server size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{server.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{server.url.includes('youtube') ? 'YouTube' : server.url.includes('t.me') ? 'Telegram' : server.url.includes('ok.ru') ? 'OK.ru' : 'Direct Stream'}</p>
                    </div>
                  </div>
                  <div className="bg-neutral-800 group-hover:bg-neutral-700 px-3 py-1 rounded-full text-xs font-medium text-neutral-300 transition">
                    {server.quality}
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-800 bg-[#22252D]">
              <button 
                onClick={() => setShowServersModal(false)}
                className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
