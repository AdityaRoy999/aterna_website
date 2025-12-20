import React, { useState, useEffect, useRef } from 'react';
import { Star, User, Trash2, Send } from 'lucide-react';
import { supabase } from '../src/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface ReviewsProps {
  productId: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchReviews();

    // Realtime subscription
    const subscription = supabase
      .channel('reviews_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reviews'
      }, (payload) => {
        // Filter manually to avoid type issues with the filter string
        if (payload.new && (payload.new as any).product_id === productId) {
          fetchReviews();
        } else if (payload.old && (payload.old as any).product_id === productId) {
          fetchReviews();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      // Insert and return the inserted row so we can optimistically update UI
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        })
        .select(`*, profiles (full_name)`) as any;

      if (error) throw error;

      // Supabase returns an array of inserted rows
      const inserted = Array.isArray(data) ? data[0] : data;
      if (inserted) {
        // Prepend to local state so user sees it instantly
        setReviews(prev => [inserted, ...prev]);
      } else {
        // Fallback to refetch if no returned row
        fetchReviews();
      }

      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (reviewId: string) => {
    // Optimistic update: Remove immediately from UI
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setDeleteConfirmation(null);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting review:', error);
      fetchReviews(); // Revert/Refresh on error
      alert('Failed to delete review');
    }
  };

  const StarRating = ({ value, onChange, readonly = false }: { value: number, onChange?: (val: number) => void, readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            size={readonly ? 14 : 20}
            className={`${star <= value ? 'fill-luxury text-luxury' : 'text-white/20'}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <h3 className="font-display text-2xl text-offwhite">Reviews ({reviews.length})</h3>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm uppercase tracking-widest text-white/60">Write a Review</h4>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:border-luxury focus:outline-none transition-colors min-h-[100px]"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-luxury text-void px-6 py-2 rounded-lg font-body text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Posting...' : 'Post Review'} <Send size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white/5 rounded-xl p-6 text-center border border-white/5">
          <p className="text-white/40">Please sign in to leave a review.</p>
        </div>
      )}

      {/* Reviews List (scrollable area) */}
      <div className="space-y-4">
        <div
          ref={scrollRef}
          className="max-h-[40vh] md:max-h-[60vh] overflow-y-auto space-y-4 pr-2 overscroll-contain"
          onWheel={(e) => {
            const el = scrollRef.current;
            if (!el) return;
            const delta = e.deltaY;
            const atTop = el.scrollTop <= 0;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
            if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
              e.stopPropagation();
            }
          }}
        >
          {loading ? (
            <div className="text-center py-8 text-white/40">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-white/40">No reviews yet. Be the first to review!</div>
          ) : (
            reviews.map((review, index) => (
              <div 
                key={review.id} 
                className="bg-white/5 rounded-xl p-6 border border-white/5"
                data-aos="fade-up"
                data-aos-delay={index * 50}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-luxury">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-display text-white">{review.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-white/40">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} readonly />
                </div>
                <p className="text-white/80 leading-relaxed">{review.comment}</p>
                
                {user?.id === review.user_id && (
                  <div className="mt-4 flex justify-end">
                    {deleteConfirmation === review.id ? (
                      <div className="flex items-center gap-3 animate-fade-in">
                        <span className="text-xs text-white/60 uppercase tracking-widest">Are you sure?</span>
                        <button
                          onClick={() => confirmDelete(review.id)}
                          className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest font-bold transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(null)}
                          className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmation(review.id)}
                        className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
