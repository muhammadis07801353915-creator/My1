import { movies } from '../data/mockData';
import { Star, Trash2 } from 'lucide-react';

export default function Watchlist({ onSelect }: { onSelect: (item: any) => void }) {
  const watchlist = movies.slice(2, 5); // Mock watchlist

  return (
    <div className="p-4 pt-8 pb-24">
      <h1 className="text-3xl font-bold mb-6">Watchlist</h1>
      
      <div className="space-y-4">
        {watchlist.map(movie => (
          <div key={movie.id} className="flex space-x-4 bg-neutral-900/50 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 rounded-xl p-3 relative transition group">
            <img src={movie.image} alt={movie.title} className="w-24 h-32 object-cover rounded-lg cursor-pointer" onClick={() => onSelect(movie)} />
            <div className="flex-1 py-2 cursor-pointer" onClick={() => onSelect(movie)}>
              <h3 className="font-semibold text-lg pr-8">{movie.title}</h3>
              <div className="flex items-center text-sm text-neutral-400 mt-1 mb-2">
                <span className="flex items-center text-yellow-500 mr-3"><Star size={14} className="mr-1 fill-current" /> {movie.rating}</span>
                <span>{movie.year}</span>
              </div>
              <p className="text-sm text-neutral-500">{movie.genre}</p>
            </div>
            <button className="absolute top-4 right-4 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
