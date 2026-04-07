import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, Trash2, Film, Tv, DownloadCloud, 
  Image as ImageIcon, Link as LinkIcon, Users, Settings, Type
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../../components/ImageUpload';

export default function Movies() {
  const [contentList, setContentList] = useState<any[]>([]);
  const [movieLists, setMovieLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [activeTab, setActiveTab] = useState('basic');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', type: 'Movie', genre: '', year: '', description: '', rating: '', image: '', backdrop: '', duration: '',
    list_name: '',
    servers: [{ name: 'Server 1', url: '', quality: 'Auto' }]
  });

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: <Film size={18} /> },
    { id: 'sources', name: 'Video Sources', icon: <LinkIcon size={18} /> },
    { id: 'subtitles', name: 'Subtitles', icon: <Type size={18} /> },
    { id: 'cast', name: 'Cast & Crew', icon: <Users size={18} /> },
    { id: 'advanced', name: 'Advanced Settings', icon: <Settings size={18} /> },
  ];

  useEffect(() => {
    fetchMovies();
    fetchMovieLists();
  }, []);

  const fetchMovieLists = async () => {
    const { data } = await supabase.from('movie_lists').select('*').order('order_index', { ascending: true });
    if (data) setMovieLists(data);
  };

  const fetchMovies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error("Error fetching movies:", error);
      setErrorMsg(`Error loading movies: ${error.message}`);
    }
    if (data) {
      setContentList(data);
    }
    setLoading(false);
  };

  const handleAddNew = () => {
    setFormData({ 
      title: '', type: 'Movie', genre: '', year: '', description: '', rating: '', image: '', backdrop: '', duration: '',
      list_name: '',
      servers: [{ name: 'Server 1', url: '', quality: 'Auto' }]
    });
    setEditingId(null);
    setErrorMsg(null);
    setActiveTab('basic');
    setView('form');
  };

  const handleEdit = (item: any) => {
    let parsedServers = [{ name: 'Server 1', url: item.video_url || '', quality: 'Auto' }];
    try {
      if (item.video_url && item.video_url.startsWith('[')) {
        parsedServers = JSON.parse(item.video_url);
      }
    } catch (e) {
      console.error("Error parsing servers", e);
    }

    setFormData({
      title: item.title || '',
      type: item.type || 'Movie',
      genre: item.genre || '',
      year: item.year?.toString() || '',
      description: item.description || '',
      rating: item.rating?.toString() || '',
      image: item.image || '',
      backdrop: item.backdrop || '',
      duration: item.duration || '',
      list_name: item.list_name || '',
      servers: parsedServers
    });
    setEditingId(item.id);
    setErrorMsg(null);
    setActiveTab('basic');
    setView('form');
  };

  const handleDelete = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase.from('movies').delete().eq('id', id);
      if (!error) {
        setContentList(contentList.filter(item => item.id !== id));
      } else {
        alert('Error deleting movie');
      }
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setErrorMsg(null);
    if (!formData.title) {
      setErrorMsg('Title is required!');
      return;
    }

    setSaving(true);
    const payload = {
      title: formData.title,
      type: formData.type,
      genre: formData.genre,
      year: formData.year && !isNaN(parseInt(formData.year)) ? parseInt(formData.year) : null,
      description: formData.description,
      rating: formData.rating && !isNaN(parseFloat(formData.rating)) ? parseFloat(formData.rating) : null,
      image: formData.image,
      backdrop: formData.backdrop,
      list_name: formData.list_name,
      video_url: JSON.stringify(formData.servers)
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('movies').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('movies').insert([payload]);
        if (error) throw error;
      }
      
      fetchMovies();
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{editingId ? 'Edit Content' : 'Add New Content'}</h1>
            <p className="text-neutral-400 text-sm mt-1">Fill in the details or import from TMDB</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-2">
              <DownloadCloud size={18} />
              <span>Import from TMDB</span>
            </button>
            <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 rounded-lg transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Content Type Selector */}
        <div className="flex p-1 bg-[#1a1d24] rounded-lg w-fit border border-neutral-800">
          <button 
            onClick={() => setFormData({...formData, type: 'Movie'})}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md transition ${formData.type === 'Movie' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <Film size={18} />
            <span>Movie</span>
          </button>
          <button 
            onClick={() => setFormData({...formData, type: 'Series'})}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md transition ${formData.type === 'Series' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <Tv size={18} />
            <span>TV Series</span>
          </button>
        </div>

        {/* Main Form Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 shrink-0 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'text-neutral-400 hover:bg-[#1a1d24] hover:text-white border border-transparent'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-[#1a1d24] border border-neutral-800 rounded-xl p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Inception" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Release Year</label>
                    <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="e.g. 2010" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Description</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Synopsis..." className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition resize-none"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Genre</label>
                    <input type="text" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} placeholder="Action, Sci-Fi" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Rating (IMDb)</label>
                    <input type="text" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} placeholder="8.8" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Home List / Category</label>
                    <select 
                      value={formData.list_name} 
                      onChange={e => setFormData({...formData, list_name: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-red-500 transition"
                    >
                      <option value="">None (Default)</option>
                      {movieLists.map(list => (
                        <option key={list.id} value={list.name}>{list.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-300">Posters & Covers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload 
                      label="Vertical Poster" 
                      value={formData.image} 
                      onChange={(val) => setFormData({...formData, image: val})} 
                    />
                    <ImageUpload 
                      label="Backdrop Image (Horizontal)" 
                      value={formData.backdrop} 
                      onChange={(val) => setFormData({...formData, backdrop: val})} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Video Servers</h3>
                  <button 
                    onClick={() => setFormData({
                      ...formData, 
                      servers: [...formData.servers, { name: `Server ${formData.servers.length + 1}`, url: '', quality: 'Auto' }]
                    })}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition flex items-center space-x-1"
                  >
                    <Plus size={16} />
                    <span>Add Server</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.servers.map((server, index) => (
                    <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 relative">
                      {formData.servers.length > 1 && (
                        <button 
                          onClick={() => {
                            const newServers = [...formData.servers];
                            newServers.splice(index, 1);
                            setFormData({...formData, servers: newServers});
                          }}
                          className="absolute top-4 right-4 text-neutral-500 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                        <div className="space-y-1">
                          <label className="text-xs text-neutral-400">Server Name (e.g. YouTube, OK.ru)</label>
                          <input 
                            type="text" 
                            value={server.name}
                            onChange={(e) => {
                              const newServers = [...formData.servers];
                              newServers[index].name = e.target.value;
                              setFormData({...formData, servers: newServers});
                            }}
                            placeholder="Server Name" 
                            className="w-full bg-[#1a1d24] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-red-500 transition" 
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs text-neutral-400">URL (Telegram link, m3u8, mp4, etc.)</label>
                          <input 
                            type="text" 
                            value={server.url} 
                            onChange={(e) => {
                              const newServers = [...formData.servers];
                              newServers[index].url = e.target.value;
                              setFormData({...formData, servers: newServers});
                            }}
                            placeholder="https://t.me/channel/123 or https://..." 
                            className="w-full bg-[#1a1d24] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-red-500 transition" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-neutral-400">Quality Label</label>
                          <input 
                            type="text" 
                            value={server.quality}
                            onChange={(e) => {
                              const newServers = [...formData.servers];
                              newServers[index].quality = e.target.value;
                              setFormData({...formData, servers: newServers});
                            }}
                            placeholder="1080p, 4K, Auto" 
                            className="w-full bg-[#1a1d24] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-red-500 transition" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Access & Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div>
                      <p className="font-medium">Access Type</p>
                      <p className="text-sm text-neutral-400">Who can watch this content?</p>
                    </div>
                    <select className="bg-[#1a1d24] border border-neutral-800 rounded-md px-3 py-2 text-sm text-white outline-none">
                      <option>Free</option>
                      <option>Premium Only</option>
                      <option>Unlock with Video Ad</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div>
                      <p className="font-medium">Featured Content</p>
                      <p className="text-sm text-neutral-400">Show in the top slider on home page</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {(activeTab === 'subtitles' || activeTab === 'cast') && (
              <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                <p>This section will allow managing {activeTab}.</p>
                <p className="text-sm mt-2">UI coming in next iterations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="text-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Movies & Series</h1>
        <button 
          onClick={handleAddNew}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Add New Content</span>
        </button>
      </div>

      <div className="bg-[#1a1d24] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 w-full sm:w-80">
            <Search size={18} className="text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search movies or series..." 
              className="bg-transparent border-none outline-none text-sm ml-2 w-full text-white"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none">
              <option>All Types</option>
              <option>Movies</option>
              <option>Series</option>
            </select>
            <select className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900/50 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Genre</th>
                <th className="px-6 py-4 font-medium">Views</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {contentList.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/50 transition">
                  <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.type === 'Movie' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{item.genre}</td>
                  <td className="px-6 py-4 text-neutral-400">{item.views}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => handleEdit(item)} className="text-neutral-400 hover:text-white transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-neutral-400 hover:text-red-500 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-400">
          <span>Showing 1 to {contentList.length} of {contentList.length} entries</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 rounded bg-red-600 text-white">1</button>
            <button className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
