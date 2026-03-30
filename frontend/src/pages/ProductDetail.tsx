import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft } from 'lucide-react';
import { productAPI, reviewAPI } from '@/lib/api';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load product details, reviews, and related products
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const [productData, reviewsData] = await Promise.all([
          productAPI.getById(Number(id!)),
          reviewAPI.getByProduct(Number(id!)),
        ]);

        setProduct(productData);
        setReviews(reviewsData);

        // Load related products from same brand
        if (productData.brand_id) {
          const relatedData = await productAPI.getAll({
            brand_id: productData.brand_id,
            limit: 4,
          });
          setRelatedProducts(relatedData.products?.filter(p => p.id !== productData.id).slice(0, 4) || []);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, qty);
      toast.success('Added to cart!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    
    if (!product) return;

    try {
      setIsSubmittingReview(true);
      const newReview = await reviewAPI.create(product.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      
      setReviews(prev => [newReview, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
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
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
        {/* Image */}
        <div className="bg-muted rounded-xl overflow-hidden aspect-square max-w-[400px] mx-auto w-full flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-blush to-warm-beige flex items-center justify-center">
            <span className="text-6xl opacity-30">🌸</span>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{product.brand_name}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(avgRating) ? 'fill-primary text-primary' : 'text-border'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold">{formatPrice(product.discount_price || product.price)}</span>
            {product.discount_price && (
              <span className="text-price-original text-lg">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs px-3 py-1 bg-muted rounded-full">{product.size_ml} ml</span>
            <span className="text-xs px-3 py-1 bg-muted rounded-full capitalize">{product.scent_family}</span>
            <span className={`text-xs px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Scent Notes */}
          <div className="mb-6 space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[80px]">Top</span>
              <span className="text-sm">{product.top_notes}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[80px]">Middle</span>
              <span className="text-sm">{product.middle_notes}</span>
            </div>
            <div className="flex gap-2 items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[80px]">Base</span>
              <span className="text-sm">{product.base_notes}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

          {/* Qty + Actions */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5"><Minus className="w-4 h-4" /></button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2.5"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleAddToCart} className="btn-gold flex items-center gap-2 text-sm flex-1 justify-center">
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product)}
              className={`btn-outline-gold p-3 ${wishlisted ? 'bg-accent/10' : ''}`}>
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current text-accent' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <h2 className="font-heading text-xl font-bold mb-6">Reviews ({reviews.length})</h2>

        {isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="bg-card rounded-xl p-6 border border-border mb-8">
            <h3 className="font-heading text-sm font-semibold mb-3">Write a Review</h3>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewRating(s)}>
                  <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your thoughts..." rows={3}
              className="w-full bg-muted rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 mb-3 resize-none" />
            <button type="submit" disabled={isSubmittingReview} className="btn-gold text-xs py-2 px-6">
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length > 0 ? reviews.map(r => (
            <div key={r.id} className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{r.user_name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading text-xl font-bold mb-6">More from {product.brand_name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
