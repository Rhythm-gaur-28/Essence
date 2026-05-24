import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { formatPrice } from '@/data/mockData';
import { formatDate } from '@/utils/formatDate';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import ConfirmModal from '@/components/ConfirmModal';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user, isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Confirm delete modal state
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setQty(1);

    Promise.all([
      fetch(`http://localhost:5000/api/products/${id}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/reviews/${id}`).then(r => r.json()),
    ])
      .then(([prod, revs]) => {
        setProduct(prod || null);
        setReviews(Array.isArray(revs) ? revs : []);

        if (prod?.brand_id) {
          fetch(`http://localhost:5000/api/products?brands=${prod.brand_id}`)
            .then(r => r.json())
            .then(data => {
              const related = (Array.isArray(data) ? data : [])
                .filter((p: Product) => p.id !== prod.id)
                .slice(0, 4);
              setRelatedProducts(related);
            })
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch(() => {
        setProduct(null);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-2">🌸</p>
          <p className="text-muted-foreground">Product not found</p>
          <Link to="/shop" className="text-primary text-sm hover:underline mt-2 block">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const isBestSeller = Boolean(product.is_best_seller);

  // Computed live from reviews state
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Login required'); return; }
    if (outOfStock) { toast.error('Out of stock'); return; }
    addToCart(product, qty);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Login required'); return; }
    toggleWishlist(product);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to write a review'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }

    const token = localStorage.getItem('be_token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      const data = await res.json();

      if (res.ok) {
        // Use real DB-assigned id so delete works immediately without refresh
        const newReview: Review = {
          id: data.id,
          user_id: user!.id,
          user_name: user!.name,
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment,
          created_at: new Date().toISOString(),
        };
        setReviews(prev => [newReview, ...prev]);
        setReviewComment('');
        setReviewRating(5);
        toast.success('Review submitted!');
      } else {
        toast.error('Failed to submit review');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const token = localStorage.getItem('be_token');
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success('Review deleted');
      } else {
        toast.error('Failed to delete review');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Delete confirm modal */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          onConfirm={() => handleDeleteReview(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        {/* Image */}
        <div className="bg-muted rounded-xl overflow-hidden aspect-square max-w-[400px] mx-auto w-full flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blush to-warm-beige flex items-center justify-center">
              <span className="text-6xl opacity-30">🌸</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{product.brand_name}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

          {/* Gender + Best Seller + Stock badges */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            {product.gender && (
              <span className="text-xs bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full capitalize">
                {product.gender}
              </span>
            )}
            {isBestSeller && (
              <span className="text-xs bg-red-600 text-white font-semibold px-2 py-0.5 rounded-full">
                Best Seller
              </span>
            )}
            {outOfStock ? (
              <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">Out of Stock</span>
            ) : (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">In Stock</span>
            )}
          </div>

          {/* Rating — computed live from reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-primary text-primary' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {reviews.length > 0
                ? `${avgRating.toFixed(1)} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                : '0 reviews'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold">
              {formatPrice(product.discount_price != null && product.discount_price > 0 ? product.discount_price : product.price)}
            </span>
            {product.discount_price != null && product.discount_price > 0 && (
              <span className="text-price-original text-lg">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
          )}

          {/* Notes */}
          {(product.top_notes || product.middle_notes || product.base_notes) && (
            <div className="mb-4 space-y-1 text-sm">
              {product.top_notes && <p><span className="font-medium">Top Notes:</span> <span className="text-muted-foreground">{product.top_notes}</span></p>}
              {product.middle_notes && <p><span className="font-medium">Heart Notes:</span> <span className="text-muted-foreground">{product.middle_notes}</span></p>}
              {product.base_notes && <p><span className="font-medium">Base Notes:</span> <span className="text-muted-foreground">{product.base_notes}</span></p>}
            </div>
          )}

          {/* Qty */}
          {!outOfStock && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2.5">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-gold flex items-center gap-2 text-sm flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={handleWishlist}
              className={`btn-outline-gold p-3 ${wishlisted ? 'bg-accent/10' : ''}`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current text-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="font-heading text-xl font-bold mb-6">
          Reviews ({reviews.length}){reviews.length > 0 && <span className="text-base font-normal text-muted-foreground ml-2">· {avgRating.toFixed(1)} avg</span>}
        </h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="bg-card rounded-xl p-6 border border-border mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)}>
                    <Star className={`w-5 h-5 cursor-pointer ${star <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full bg-muted rounded-lg p-3 text-sm outline-none"
            />
            <button type="submit" className="btn-gold text-xs py-2 px-6 mt-3">
              Submit Review
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => {
              const canDelete = isAuthenticated && (user?.id === review.user_id || isAdmin);
              return (
                <div key={review.id} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.user_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                      {canDelete && (
                        <button
                          onClick={() => setConfirmDeleteId(review.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-xl font-bold mb-6">
            More from {product.brand_name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
