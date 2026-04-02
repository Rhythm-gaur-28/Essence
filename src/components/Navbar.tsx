import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!userDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="font-heading text-xl md:text-2xl font-bold tracking-wide text-foreground">
            Essence
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Shop</Link>
            <Link to="/shop" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Search className="w-[18px] h-[18px]" />
            </button>
            <Link to="/wishlist" className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative">
              <Heart className="w-[18px] h-[18px]" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-peony text-accent-foreground text-[10px] flex items-center justify-center font-semibold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors relative">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setUserDropdown(!userDropdown)} className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1">
                <User className="w-[18px] h-[18px]" />
                <ChevronDown className="w-3 h-3 hidden md:block" />
              </button>
              {userDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 animate-fade-in">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">My Profile</Link>
                      <Link to="/profile" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">My Orders</Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm text-primary font-medium hover:bg-muted/50 transition-colors">Admin Panel</Link>
                      )}
                      <button onClick={() => { logout(); setUserDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Login</Link>
                      <Link to="/register" onClick={() => setUserDropdown(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 text-muted-foreground">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="py-3 border-t border-border animate-fade-in">
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fragrances, brands..."
              className="w-full px-4 py-2.5 bg-muted/50 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              autoFocus
            />
          </form>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Shop</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">Brands</Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
