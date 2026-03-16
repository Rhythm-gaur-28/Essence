import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Your wishlist is empty 🌸</h2>
          <p className="text-sm text-muted-foreground mb-4">Save your favorite fragrances here</p>
          <Link to="/shop" className="btn-gold text-sm">Explore Fragrances</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">My Wishlist ({wishlistItems.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map(item => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
