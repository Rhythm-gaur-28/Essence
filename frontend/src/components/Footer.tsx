import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-xl font-bold mb-3">Essence</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium fragrances from India and around the world. Discover your signature scent.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-5 uppercase tracking-wider text-foreground">Shop</h4>
            <div className="flex flex-col gap-2.5">
              <Link to="/shop?is_new_arrival=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">New Arrivals</Link>
              <Link to="/shop?is_featured=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">Best Sellers</Link>
              <Link to="/shop?category_id=2" className="text-sm text-muted-foreground hover:text-primary transition-colors">For Her</Link>
              <Link to="/shop?category_id=1" className="text-sm text-muted-foreground hover:text-primary transition-colors">For Him</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-5 uppercase tracking-wider text-foreground">Help</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-muted-foreground">Shipping & Returns</span>
              <span className="text-sm text-muted-foreground">Contact Us</span>
              <span className="text-sm text-muted-foreground">FAQs</span>
              <span className="text-sm text-muted-foreground">Track Order</span>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-heading text-sm font-semibold mb-5 uppercase tracking-wider text-foreground">Connect</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-muted-foreground">Instagram</span>
              <span className="text-sm text-muted-foreground">Facebook</span>
              <span className="text-sm text-muted-foreground">Pinterest</span>
              <span className="text-sm text-muted-foreground">hello@brandessence.com</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">© 2024 Brand Essence. All rights reserved. Crafted in India.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
