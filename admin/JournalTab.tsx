import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Upload, 
  Image as ImageIcon,
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Check
} from 'lucide-react';

interface JournalTabProps {
  // Add any props if needed
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-display text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-6 text-sm">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const JournalTab: React.FC<JournalTabProps> = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journal_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (article: any) => {
    setItemToDelete(article);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const article = itemToDelete;
    setItemToDelete(null);
    
    setDeletingId(article.id);
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Delete image from storage if exists (optional, if you want to clean up storage)
    // ...

    const { error } = await supabase.from('journal_posts').delete().eq('id', article.id);
    
    if (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
      setDeletingId(null);
    } else {
      fetchArticles();
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-luxury transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-luxury focus:ring-1 focus:ring-luxury/50 w-64 placeholder:text-white/20 transition-all duration-300"
          />
        </div>
        <button 
          onClick={() => { setEditingArticle(null); setIsModalOpen(true); }}
          className="bg-luxury hover:bg-white hover:text-void text-void px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all duration-300 shadow-[0_0_15px_rgba(232,207,160,0.2)] hover:shadow-[0_0_25px_rgba(232,207,160,0.4)] active:scale-95"
        >
          <Plus size={18} /> New Article
        </button>
      </div>

      <div className="hidden md:block bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-white/40 text-xs uppercase font-semibold tracking-wider border-b border-white/10">
            <tr>
              <th className="p-4">Article</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {articles.map(article => (
              <tr 
                key={article.id} 
                className={`hover:bg-white/5 transition-all duration-500 ease-in-out hover:shadow-lg bg-transparent ${
                  deletingId === article.id ? 'opacity-0 -translate-x-full pointer-events-none' : 'opacity-100'
                }`}
              >
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded bg-white/5 overflow-hidden border border-white/10 group-hover:border-luxury/30 transition-colors">
                        {article.image_url ? (
                            <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={16} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white line-clamp-1">{article.title}</p>
                        <p className="text-xs text-white/40 line-clamp-1">{article.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/60 text-sm">{article.category}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/60 text-sm">{article.author}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className="text-white/60 text-sm">{new Date(article.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.is_featured ? 'bg-luxury/10 text-luxury border border-luxury/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                      {article.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </div>
                </td>
                <td className={`transition-all duration-500 ease-in-out ${deletingId === article.id ? 'p-0 border-none' : 'p-4'}`}>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${deletingId === article.id ? 'max-h-0 opacity-0' : 'max-h-24 opacity-100'}`}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingArticle(article); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"><Edit size={16} /></button>
                      <button onClick={() => initiateDelete(article)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 hover:scale-110 active:scale-95"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && !loading && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-white/40">No articles found. Create one to get started.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {articles.map(article => (
          <div 
            key={article.id} 
            className={`bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-500 ${
              deletingId === article.id ? 'opacity-0 -translate-x-full' : 'opacity-100'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-16 rounded bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
                 {article.image_url ? (
                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={20} /></div>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{article.title}</h3>
                <p className="text-xs text-white/40 mb-1 line-clamp-1">{article.subtitle}</p>
                <span className="text-xs text-luxury">{article.category}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/60 text-sm">{new Date(article.created_at).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.is_featured ? 'bg-luxury/10 text-luxury border border-luxury/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                {article.is_featured ? 'Featured' : 'Standard'}
              </span>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
              <button 
                onClick={() => { setEditingArticle(article); setIsModalOpen(true); }} 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-all duration-200 active:scale-95 text-sm"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => initiateDelete(article)} 
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/10 text-red-400 rounded transition-all duration-200 active:scale-95 text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Article"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
      />

      <JournalEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={editingArticle}
        onSave={() => {
            setIsModalOpen(false);
            fetchArticles();
        }}
      />
    </div>
  );
};

const JournalEditorModal = ({ isOpen, onClose, article, onSave }: any) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: 'Featured',
        image_url: '',
        excerpt: '',
        author: 'Admin',
        read_time: '5 min read',
        content: '',
        is_featured: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title || '',
                subtitle: article.subtitle || '',
                category: article.category || 'Featured',
                image_url: article.image_url || '',
                excerpt: article.excerpt || '',
                author: article.author || 'Admin',
                read_time: article.read_time || '5 min read',
                content: article.content || '',
                is_featured: article.is_featured || false
            });
        } else {
            setFormData({
                title: '',
                subtitle: '',
                category: 'Featured',
                image_url: '',
                excerpt: '',
                author: 'Admin',
                read_time: '5 min read',
                content: '',
                is_featured: false
            });
        }
    }, [article, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (article) {
                const { error } = await supabase
                    .from('journal_posts')
                    .update(formData)
                    .eq('id', article.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('journal_posts')
                    .insert([formData]);
                if (error) throw error;
            }
            onSave();
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1a1a1a] z-10">
                    <h2 className="text-xl font-display text-white">{article ? 'Edit Article' : 'New Article'}</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Title</label>
                            <input 
                                type="text" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors"
                                placeholder="Article Title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Subtitle</label>
                            <input 
                                type="text" 
                                value={formData.subtitle}
                                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors"
                                placeholder="Article Subtitle"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors appearance-none"
                            >
                                <option value="Featured">Featured</option>
                                <option value="Events">Events</option>
                                <option value="Fragrance">Fragrance</option>
                                <option value="Maison">Maison</option>
                                <option value="Craftsmanship">Craftsmanship</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Author</label>
                            <input 
                                type="text" 
                                value={formData.author}
                                onChange={e => setFormData({...formData, author: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors"
                                placeholder="Author Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Read Time</label>
                            <input 
                                type="text" 
                                value={formData.read_time}
                                onChange={e => setFormData({...formData, read_time: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors"
                                placeholder="e.g. 5 min read"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Image URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={formData.image_url}
                                onChange={e => setFormData({...formData, image_url: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors"
                                placeholder="https://..."
                            />
                        </div>
                        {formData.image_url && (
                            <div className="mt-2 h-40 w-full rounded-lg overflow-hidden border border-white/10">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Excerpt</label>
                        <textarea 
                            value={formData.excerpt}
                            onChange={e => setFormData({...formData, excerpt: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors h-24 resize-none"
                            placeholder="Short summary of the article..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-white/40 font-medium">Content (HTML supported)</label>
                        <textarea 
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxury transition-colors h-64 font-mono text-sm"
                            placeholder="<p>Article content goes here...</p>"
                        />
                        <p className="text-xs text-white/30">Tip: Use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h3&gt;, &lt;blockquote&gt;)</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer" onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.is_featured ? 'bg-luxury border-luxury text-void' : 'border-white/20 text-transparent'}`}>
                            <Check size={14} />
                        </div>
                        <span className="text-white/80 select-none">Feature this article on the main page</span>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-luxury text-void hover:bg-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
