import { useState, useEffect } from 'react';
import { Plus, Trash2, List as ListIcon, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MovieLists() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('movie_lists')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (data) {
      setLists(data);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    
    const nextOrder = lists.length > 0 ? Math.max(...lists.map(l => l.order_index || 0)) + 1 : 0;
    
    const { error } = await supabase
      .from('movie_lists')
      .insert([{ name: newName, order_index: nextOrder }]);
    
    if (!error) {
      setNewName('');
      fetchLists();
    } else {
      alert('Error creating list. Make sure "movie_lists" table exists in Supabase.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure? Movies in this list will no longer be categorized.')) {
      const { error } = await supabase.from('movie_lists').delete().eq('id', id);
      if (!error) {
        fetchLists();
      }
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newLists = [...lists];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLists.length) return;
    
    const temp = newLists[index].order_index;
    newLists[index].order_index = newLists[targetIndex].order_index;
    newLists[targetIndex].order_index = temp;
    
    // Update both in DB
    await supabase.from('movie_lists').update({ order_index: newLists[index].order_index }).eq('id', newLists[index].id);
    await supabase.from('movie_lists').update({ order_index: newLists[targetIndex].order_index }).eq('id', newLists[targetIndex].id);
    
    fetchLists();
  };

  return (
    <div className="text-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Movie Lists</h1>
        <p className="text-neutral-400 text-sm">Create sections for your home screen</p>
      </div>

      <div className="bg-[#1a1d24] border border-neutral-800 rounded-xl p-6">
        <div className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. New Movies, Cartoon, Action..." 
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500 transition"
          />
          <button 
            onClick={handleAdd}
            disabled={saving}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus size={20} />
            <span>{saving ? 'Adding...' : 'Add List'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-neutral-500">Loading lists...</div>
          ) : lists.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">No lists created yet.</div>
          ) : (
            lists.map((list, index) => (
              <div key={list.id} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg group">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button onClick={() => moveItem(index, 'up')} className="text-neutral-600 hover:text-white transition"><ArrowUp size={14} /></button>
                    <button onClick={() => moveItem(index, 'down')} className="text-neutral-600 hover:text-white transition"><ArrowDown size={14} /></button>
                  </div>
                  <ListIcon size={20} className="text-red-500" />
                  <span className="font-medium">{list.name}</span>
                </div>
                <button 
                  onClick={() => handleDelete(list.id)}
                  className="p-2 text-neutral-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-400">
        <p className="font-bold mb-1">Note for Developer:</p>
        <p>Make sure you have a table named <strong>movie_lists</strong> with columns: <strong>id</strong> (int8, primary key), <strong>name</strong> (text), and <strong>order_index</strong> (int4).</p>
        <p className="mt-2">Also, add a <strong>list_id</strong> (int8) column to your <strong>movies</strong> table to link them.</p>
      </div>
    </div>
  );
}
