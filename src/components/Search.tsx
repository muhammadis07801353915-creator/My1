import { Search as SearchIcon, Star } from 'lucide-react';
import { useState } from 'react';
import { movies } from '../data/mockData';
import { useLanguage } from '../lib/LanguageContext';

export default function Search({ onSelect }: { onSelect: (item: any) => void }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filters = [t.all, t.movies, t.series];

  const filteredMovies = movies.filter(m => {
    if (filter === t.movies && m.type !== 'Movie') return false;
    if (filter === t.series && m.type !== 'Series') return false;
    if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 pt-8 pb-24">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-full py-3.5 pl-12 pr-4 rtl:pl-4 rtl:pr-12 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide mb-4 -mx-4 px-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-red-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMovies.map(movie => (
          <div key={movie.id} className="flex space-x-4 rtl:space-x-reverse bg-neutral-900/50 hover:bg-neutral-900 rounded-xl p-3 cursor-pointer transition border border-transparent hover:border-neutral-800" onClick={() => onSelect(movie)}>
            <img src={movie.image} alt={movie.title} className="w-24 h-32 object-cover rounded-lg" />
            <div className="flex-1 py-2">
              <h3 className="font-semibold text-lg">{movie.title}</h3>
              <div className="flex items-center text-sm text-neutral-400 mt-1 mb-2">
                <span className="flex items-center text-yellow-500 mr-3 rtl:mr-0 rtl:ml-3"><Star size={14} className="mr-1 rtl:mr-0 rtl:ml-1 fill-current" /> {movie.rating}</span>
                <span>{movie.year}</span>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2">{movie.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
