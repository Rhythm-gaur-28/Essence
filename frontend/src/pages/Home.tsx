import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { productAPI, brandAPI, bannerAPI } from '@/lib/api';
import { Product, Brand, Banner } from '@/types';
import heroImg from '@/assets/perfume-hero.png';
import floralImg from '@/assets/perfume-floral.png';
import woodyImg from '@/assets/perfume-woody.png';
import orientalImg from '@/assets/perfume-oriental.png';
import freshImg from '@/assets/perfume-fresh.png';
import gourmandImg from '@/assets/perfume-gourmand.png';
import collectionImg from '@/assets/perfume-collection.png';

const scentFamilies = [
  { key: 'floral', label: 'Floral', image: floralImg },
  { key: 'woody', label: 'Woody', image: woodyImg },
  { key: 'oriental', label: 'Oriental', image: orientalImg },
  { key: 'fresh', label: 'Fresh', image: freshImg },
  { key: 'gourmand', label: 'Gourmand', image: gourmandImg },
];

const Home = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [arrivals, featuredData, bannersData, brandsData] = await Promise.all([
          productAPI.getAll({ is_new_arrival: true, limit: 4 }),
          productAPI.getAll({ is_featured: true, limit: 4 }),
          bannerAPI.getActive(),
          brandAPI.getAll(),
        ]);

        setNewArrivals(arrivals.products || []);
        setFeatured(featuredData.products || []);
        setBanners(bannersData || []);
        setBrands(brandsData || []);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero section-padding relative overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[65vh]">
            {/* Left */}
            <div className="animate-fade-in z-10">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium mb-6">Premium Perfumery</p>
              <h1 className="font-heading text-5xl md:text-7xl font-bold leading-[1.1] text-foreground mb-6">
                The Fragrance<br />
                <em className="text-primary italic">of Life</em>
              </h1>
              <p className="text-muted-foreground text-base mb-8 max-w-md leading-relaxed">
                Discover premium fragrances from India and around the world. Find the scent that speaks to your soul.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/shop" className="btn-peach inline-flex items-center gap-2 text-sm">
                  Explore Collection <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/shop?is_new_arrival=true" className="btn-outline text-sm">
                  New Arrivals
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">150+</p>
                  <p className="text-xs text-muted-foreground">Fragrances</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">5</p>
                  <p className="text-xs text-muted-foreground">Premium Brands</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex items-center gap-1">
                  <div>
                    <p className="font-heading text-2xl font-bold text-foreground">4.8</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                  <Star className="w-4 h-4 fill-honey text-honey" />
                </div>
              </div>
            </div>
            {/* Right — Hero Image */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-peach/20 blur-3xl scale-75" />
              <img
                src={heroImg}
                alt="Luxury perfume bottle"
                className="relative z-10 max-h-[480px] object-contain animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-10 md:gap-20 flex-wrap">
            {brands.map(brand => (
              <Link key={brand.id} to={`/shop?brand_id=${brand.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors text-center group">
                <p className="font-heading text-lg md:text-xl font-semibold group-hover:text-primary transition-colors tracking-wide">{brand.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Just Landed</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">New Arrivals</h2>
            </div>
            <Link to="/shop?is_new_arrival=true" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-10 bg-peach/20">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              25% Off <span className="italic text-primary">on all New Arrivals</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Use code <span className="font-semibold text-foreground">FIRST10</span> at checkout</p>
          </div>
          <Link to="/shop?is_new_arrival=true" className="btn-primary text-sm">
            Explore More
          </Link>
        </div>
      </section>

      {/* Best Picks */}
      <section className="section-padding bg-card/50">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Curated For You</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">Best Selling Products</h2>
            </div>
            <Link to="/shop?is_featured=true" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Shop by Scent Family */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Find Your Profile</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Shop by Scent Family</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {scentFamilies.map(sf => (
              <Link key={sf.key} to={`/shop?scent_family=${sf.key}`}
                className="bg-card rounded-2xl p-5 text-center card-hover border border-border group flex flex-col items-center">
                <div className="w-20 h-20 mb-3 overflow-hidden">
                  <img src={sf.image} alt={sf.label} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-heading text-sm font-semibold group-hover:text-primary transition-colors">{sf.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="section-padding bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-3">Our Promise</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-6">
                High quality is the only core value for us.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Every fragrance in our collection is handpicked from the finest perfumeries across India and the world. We believe luxury should be accessible, authentic, and unforgettable.
              </p>
              <Link to="/shop" className="btn-peach text-sm inline-flex items-center gap-2">
                Explore More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <img src={collectionImg} alt="Perfume collection" className="max-h-[350px] object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
