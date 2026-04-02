import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

import heroImg from '@/assets/perfume-hero.png';
import floralImg from '@/assets/perfume-floral.png';
import woodyImg from '@/assets/perfume-woody.png';
import orientalImg from '@/assets/perfume-oriental.png';
import freshImg from '@/assets/perfume-fresh.png';
import gourmandImg from '@/assets/perfume-gourmand.png';

const scentImages: Record<string, string> = {
  floral: floralImg,
  woody: woodyImg,
  oriental: orientalImg,
  fresh: freshImg,
  gourmand: gourmandImg,
};

const API = 'http://localhost:5000';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const wishlisted = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const isBestSeller = Boolean(product.is_best_seller);
  const isNewArrival = Boolean(product.is_new_arrival);
  // is_featured intentionally unused — featured badge removed from card UI

  const discountPercent =
    product.discount_price != null && product.discount_price > 0 && product.price > 0
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;

  const getImage = () => {
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url.startsWith('http')
        ? product.image_url
        : `${API}${product.image_url}`;
    }
    return scentImages[product.scent_family] || heroImg;
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Login required'); return; }
    toggleWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Login required'); return; }
    if (outOfStock) { toast.error('Out of stock'); return; }
    addToCart(product);
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border card-hover relative">
      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow ${
          wishlisted
            ? 'bg-red-500 text-white'
            : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-[4/5] bg-secondary/30 overflow-hidden">
          <img
            src={getImage()}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'opacity-60' : ''}`}
            onError={e => {
              (e.target as HTMLImageElement).src = scentImages[product.scent_family] || heroImg;
            }}
          />
        </div>

        {/* Out of Stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-background/40 flex items-end justify-center pb-4">
            <span className="bg-red-100 text-red-700 text-[11px] font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            {discountPercent}% OFF
          </span>
        )}

        {/* New arrival badge */}
        {isNewArrival && (
          <span className={`absolute ${discountPercent > 0 ? 'top-10' : 'top-3'} left-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full`}>
            NEW
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.brand_name}
          </p>
          {product.gender && (
            <span className="text-[10px] bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded capitalize">
              {product.gender}
            </span>
          )}
          {isBestSeller && (
            <span className="text-[10px] bg-red-600 text-white font-semibold px-1.5 py-0.5 rounded">
              Best Seller
            </span>
          )}
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-sm font-semibold leading-tight mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Stock badge */}
        <div className="mb-2">
          {outOfStock ? (
            <span className="text-[10px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          ) : (
            <span className="text-[10px] bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-sm font-bold text-foreground">
              {formatPrice(product.discount_price != null && product.discount_price > 0 ? product.discount_price : product.price)}
            </span>
            {product.discount_price != null && product.discount_price > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through ml-1.5">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-green-600 font-medium ml-1">
                  Save {formatPrice(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={outOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
