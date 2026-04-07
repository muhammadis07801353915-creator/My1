import { Play, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/LanguageContext';

export default function Home({ onSelect }: { onSelect: (item: any) => void }) {
  const { t } = useLanguage();
  const [movies, setMovies] = useState<any[]>([]);
  const [movieLists, setMovieLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex items-center justify-center h-[65vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
  }

  if (movies.length === 0) {
    return <div className="flex items-center justify-center h-[65vh] text-neutral-400">No content available</div>;
  }

  const featured = movies[0];

  return (
    <div className="pb-24">
      {/* Featured Hero */}
      <div className="relative h-[65vh] w-full cursor-pointer" onClick={() => onSelect(featured)}>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
        <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{featured.title}</h1>
          <div className="flex items-center space-x-3 text-sm text-neutral-300 mb-6">
            <span className="flex items-center text-yellow-500"><Star size={14} className="mr-1 fill-current" /> {featured.rating}</span>
            <span>|</span>
            <span>{featured.year}</span>
            <span>|</span>
            <span>{featured.genre}</span>
          </div>
          <div className="flex space-x-4 w-full max-w-xs">
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-full flex items-center justify-center font-semibold transition">
              <Play size={18} className="mr-2 fill-current" /> {t.watchNow}
            </button>
            <button className="w-12 h-12 bg-neutral-800/80 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition">
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

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
