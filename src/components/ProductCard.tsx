import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const productImage = scentImages[product.scent_family] || heroImg;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border card-hover">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-[4/5] bg-secondary/30 flex items-center justify-center p-6 overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-peony text-accent-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
        {product.is_new_arrival && (
          <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
            NEW
          </span>
        )}
        {/* Wishlist floating button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all shadow-sm ${wishlisted ? 'bg-peony/90 text-accent-foreground' : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-peony'}`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{product.brand_name}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-heading text-sm font-semibold leading-tight mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + Add to Cart row */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-price text-sm">{formatPrice(product.discount_price || product.price)}</span>
            {product.discount_price && (
              <span className="text-price-original ml-1.5">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
