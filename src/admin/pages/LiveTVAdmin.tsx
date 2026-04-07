import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tv } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/ImageUpload';

export default function LiveTVAdmin() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', category: 'News', status: 'Active', stream_url: '', image: ''
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error fetching channels:", error);
      setErrorMsg(`Error loading channels: ${error.message}`);
    }
    if (data) {
      setChannels(data);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setFormData({ name: '', category: 'News', status: 'Active', stream_url: '', image: '' });
    setEditingId(null);
    setErrorMsg(null);
    setView('form');
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name || '',
      category: item.category || 'News',
      status: item.status || 'Active',
      stream_url: item.stream_url || '',
      image: item.image || ''
    });
    setEditingId(item.id);
    setErrorMsg(null);
    setView('form');
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this channel?')) {
      const { error } = await supabase.from('channels').delete().eq('id', id);
      if (!error) {
        setChannels(channels.filter(item => item.id !== id));
      } else {
        alert('Error deleting channel');
      }
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setErrorMsg(null);
    if (!formData.name) {
      setErrorMsg('Channel name is required!');
      return;
    }

    setSaving(true);
    const payload = {
      name: formData.name,
      category: formData.category,
      status: formData.status,
      stream_url: formData.stream_url,
      image: formData.image
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('channels').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('channels').insert([payload]);
        if (error) throw error;
      }
      
      fetchChannels();
      setView('list');
    } catch (err: any) {
      console.error('Supabase save error:', err);
      setErrorMsg(`کێشەیەک هەیە: ${err.message || 'هەڵەیەکی نەزانراو'}`);
    } finally {
      setSaving(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="text-white space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{editingId ? 'Edit Channel' : 'Add New Channel'}</h1>
            <p className="text-neutral-400 text-sm mt-1">Configure Live TV channel details</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setView('list')} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition">Cancel</button>
            <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 rounded-lg transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Channel'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="bg-[#1a1d24] border border-neutral-800 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Channel Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. K24 News" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition">
                <option>News</option>
                <option>Entertainment</option>
                <option>Sports</option>
                <option>Kids</option>
                <option>Movies</option>
                <option>Education</option>
                <option>Cooking</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Stream URL (m3u8)</label>
            <input type="text" value={formData.stream_url} onChange={e => setFormData({...formData, stream_url: e.target.value})} placeholder="https://..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
          </div>

          <div className="space-y-2">
            <ImageUpload 
              label="Channel Logo" 
              value={formData.image} 
              onChange={(val) => setFormData({...formData, image: val})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Live TV Management</h1>
        <button onClick={handleAddNew} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center space-x-2">
          <Plus size={20} /><span>Add Channel</span>
        </button>
      </div>

      <div className="bg-[#1a1d24] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full sm:w-80">
            <Search size={18} className="text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/50 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Channel Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">Loading channels...</td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">No channels found</td>
                </tr>
              ) : channels.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/50 transition">
                  <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                    <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Tv size={16} className="text-neutral-400" />}
                    </div>
                    <span>{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-400'}`}>
                      {item.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => handleEdit(item)} className="text-neutral-400 hover:text-white transition"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-neutral-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
