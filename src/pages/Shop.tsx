import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { formatPrice } from '@/data/mockData';
import { Product, Brand } from '@/types';

function fuzzyFilter(products: Product[], query: string): Product[] {
  const terms = query.toLowerCase().trim().split(/\s+/);
  return products.filter(p => {
    const haystack = [p.name, p.brand_name, p.category_name].filter(Boolean).join(' ').toLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}

const scentFamilies = ['floral', 'woody', 'oriental', 'fresh', 'gourmand'];
const genderList = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBrands, setSelectedBrands] = useState<number[]>(
    searchParams.get('brand_id') ? [Number(searchParams.get('brand_id'))] : []
  );
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    searchParams.get('gender') ? [searchParams.get('gender')!] : []
  );
  const [selectedScents, setSelectedScents] = useState<string[]>(
    searchParams.get('scent_family') ? [searchParams.get('scent_family')!] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const isNewArrival = searchParams.get('is_new_arrival') === 'true';
  const isFeatured = searchParams.get('is_featured') === 'true';
  const isBestSeller = searchParams.get('bestSeller') === 'true';
  const search = searchParams.get('search') || '';

  // Fetch brands once
  useEffect(() => {
    fetch('http://localhost:5000/api/brands')
      .then(r => r.json())
      .then(data => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, []);

  // Fetch products whenever filters change — sort is NOT a dependency because
  // all sorting is handled client-side in the useMemo below (instant, no re-fetch).
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();

    if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
    if (selectedGenders.length) params.set('genders', selectedGenders.join(','));
    if (selectedScents.length) params.set('scents', selectedScents.join(','));
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 20000) params.set('maxPrice', String(priceRange[1]));
    if (isNewArrival) params.set('newArrival', 'true');
    if (isFeatured) params.set('featured', 'true');
    if (isBestSeller) params.set('bestSeller', 'true');
    // No sort param — all sorting done client-side for instant response

    fetch(`http://localhost:5000/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedBrands, selectedGenders, selectedScents, priceRange, isNewArrival, isFeatured, isBestSeller]);

  // Apply fuzzy search then sort — all client-side, no re-fetch needed
  const displayProducts = useMemo(() => {
    const filtered = search ? fuzzyFilter(products, search) : products;

    const sorted = [...filtered];

    if (sort === 'newest') {
      sorted.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === 'price_asc') {
      sorted.sort((a, b) => {
        const pa = a.discount_price != null && a.discount_price > 0 ? a.discount_price : a.price;
        const pb = b.discount_price != null && b.discount_price > 0 ? b.discount_price : b.price;
        return pa - pb;
      });
    } else if (sort === 'price_desc') {
      sorted.sort((a, b) => {
        const pa = a.discount_price != null && a.discount_price > 0 ? a.discount_price : a.price;
        const pb = b.discount_price != null && b.discount_price > 0 ? b.discount_price : b.price;
        return pb - pa;
      });
    } else if (sort === 'rating') {
      sorted.sort((a, b) => {
        const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (Number(b.review_count) || 0) - (Number(a.review_count) || 0);
      });
    }

    return sorted;
  }, [products, search, sort]);

  const toggleBrand = (id: number) => setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  const toggleGender = (g: string) => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const toggleScent = (s: string) => setSelectedScents(prev => prev.includes(s) ? prev.filter(sc => sc !== s) : [...prev, s]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedGenders([]);
    setSelectedScents([]);
    setPriceRange([0, 20000]);
  };

  const hasFilters = selectedBrands.length > 0 || selectedGenders.length > 0 || selectedScents.length > 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            {search ? `Results for "${search}"` : isNewArrival ? 'New Arrivals' : isFeatured ? 'Best Picks' : isBestSeller ? 'Best Sellers' : 'Shop All'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{displayProducts.length} fragrances</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm bg-muted px-3 py-2 rounded-lg border-none outline-none">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden p-2 bg-muted rounded-lg">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-background p-6 overflow-auto' : 'hidden'} md:block md:relative md:w-56 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-heading text-lg font-semibold">Filters</h2>
            <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-accent hover:underline mb-4 block">Clear all filters</button>
          )}

          {/* Brands */}
          <div className="mb-6">
            <h3 className="font-heading text-sm font-semibold mb-3">Brands</h3>
            {brands.map(b => (
              <label key={b.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={selectedBrands.includes(b.id)} onChange={() => toggleBrand(b.id)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary" />
                <span className="text-sm text-muted-foreground">{b.name}</span>
              </label>
            ))}
          </div>

          {/* Gender / Category */}
          <div className="mb-6">
            <h3 className="font-heading text-sm font-semibold mb-3">Category</h3>
            {genderList.map(g => (
              <label key={g.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={selectedGenders.includes(g.value)} onChange={() => toggleGender(g.value)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary" />
                <span className="text-sm text-muted-foreground">{g.label}</span>
              </label>
            ))}
          </div>

          {/* Scent Family */}
          <div className="mb-6">
            <h3 className="font-heading text-sm font-semibold mb-3">Scent Family</h3>
            {scentFamilies.map(s => (
              <label key={s} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={selectedScents.includes(s)} onChange={() => toggleScent(s)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary" />
                <span className="text-sm text-muted-foreground capitalize">{s}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-heading text-sm font-semibold mb-3">Price Range</h3>
            <input type="range" min={0} max={20000} step={500} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹0</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button onClick={() => setFiltersOpen(false)} className="md:hidden w-full btn-gold text-sm mt-4">Apply Filters</button>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading fragrances...</p>
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {displayProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-3xl mb-2">🌸</p>
              <p className="text-muted-foreground">No fragrances found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
