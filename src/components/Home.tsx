import { Plus, Star, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Home({ onSelect }: { onSelect: (item: any) => void }) {
  const { t } = useLanguage();
  const [movies, setMovies] = useState<any[]>([]);
  const [movieLists, setMovieLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Movies
      const { data: moviesData } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (moviesData) setMovies(moviesData);

      // Fetch Lists
      const { data: listsData } = await supabase
        .from('movie_lists')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (listsData) setMovieLists(listsData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const featuredMovies = movies.filter(m => m.is_featured);
  
  const nextFeatured = useCallback(() => {
    if (featuredMovies.length === 0) return;
    setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies.length]);

  const prevFeatured = useCallback(() => {
    if (featuredMovies.length === 0) return;
    setCurrentFeaturedIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(nextFeatured, 5000);
    return () => clearInterval(interval);
  }, [featuredMovies.length, nextFeatured]);

  const currentFeatured = featuredMovies.length > 0 ? featuredMovies[currentFeaturedIndex] : movies[0];
  const topContents = movies.filter(m => m.top_rank).sort((a, b) => (a.top_rank || 99) - (b.top_rank || 99));

  if (loading) {
    return <div className="flex items-center justify-center h-[65vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
  }

  if (movies.length === 0) {
    return <div className="flex items-center justify-center h-[65vh] text-neutral-400">No content available</div>;
  }

  return (
    <div className="pb-24">
      {/* Featured Hero Slider - Video Style */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeatured.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) prevFeatured();
              else if (info.offset.x < -50) nextFeatured();
            }}
          >
            {/* Blurred Background */}
            <div className="absolute inset-0 z-0">
              <img 
                src={currentFeatured.image} 
                className="w-full h-full object-cover blur-3xl scale-110 opacity-50" 
                alt=""
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 h-full flex flex-col items-center justify-start pt-12 px-6">
              {/* Large Vertical Poster */}
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-[320px] aspect-[2/3] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 cursor-pointer"
                onClick={() => onSelect(currentFeatured)}
              >
                <img 
                  src={currentFeatured.image} 
                  alt={currentFeatured.title} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>

              {/* Metadata Below Poster */}
              <div className="mt-6 text-center w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md truncate px-4">{currentFeatured.title}</h1>
                
                <div className="flex items-center justify-center space-x-2 text-neutral-400 text-xs mb-3">
                  <span>{currentFeatured.genre?.split(',')[0] || 'Action'}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>{currentFeatured.genre?.split(',')[1] || 'Adventure'}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span>{currentFeatured.genre?.split(',')[2] || 'Sci-Fi'}</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center text-yellow-500 font-bold text-base">
                    <Star size={16} className="mr-1.5 fill-current" />
                    {currentFeatured.rating}
                  </div>
                  <span className="text-neutral-600 text-lg">|</span>
                  <span className="text-neutral-400 text-base">{currentFeatured.year}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Contents Section - Video Style */}
      {topContents.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Top Contents</h2>
          <div className="flex space-x-4 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4">
            {topContents.map((movie, index) => (
              <div key={movie.id} className="flex-none w-44 relative cursor-pointer group" onClick={() => onSelect(movie)}>
                <div className="relative overflow-hidden rounded-xl shadow-lg aspect-[2/3] border border-white/5">
                  <img 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                    {movie.type}
                  </div>
                  
                  {/* Large Outline Number */}
                  <div className="absolute -bottom-4 -right-2 z-10 select-none pointer-events-none">
                    <span className="text-[140px] font-black text-white leading-none tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] opacity-90">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Movie Lists */}
      {movieLists.map((list) => {
        const listMovies = movies.filter(m => m.list_name === list.name);
        if (listMovies.length === 0) return null;

        return (
          <div key={list.id} className="mt-8 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{list.name}</h2>
              <button className="text-red-500 text-sm font-medium">{t.all}</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {listMovies.map((movie) => (
                <div key={movie.id} className="flex-none w-32 cursor-pointer group" onClick={() => onSelect(movie)}>
                  <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                    <img 
                      src={movie.image} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium truncate text-neutral-200 group-hover:text-white transition-colors">{movie.title}</h3>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Default Movies Section (if not in any list) */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t.movies}</h2>
          <button className="text-red-500 text-sm font-medium">{t.all}</button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {movies.filter(m => !m.list_name || m.list_name === '').map((movie) => (
            <div key={movie.id} className="flex-none w-32 cursor-pointer group" onClick={() => onSelect(movie)}>
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3]">
                <img 
                  src={movie.image} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium truncate text-neutral-200">{movie.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
