import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products, brands, categories, getProductsByFilter } from '@/data/mockData';

const scentFamilies = ['floral', 'woody', 'oriental', 'fresh', 'gourmand'];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>(
    searchParams.get('brand_id') ? [Number(searchParams.get('brand_id'))] : []
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    searchParams.get('category_id') ? [Number(searchParams.get('category_id'))] : []
  );
  const [selectedScents, setSelectedScents] = useState<string[]>(
    searchParams.get('scent_family') ? [searchParams.get('scent_family')!] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const isNewArrival = searchParams.get('is_new_arrival') === 'true';
  const isFeatured = searchParams.get('is_featured') === 'true';
  const search = searchParams.get('search') || '';

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length) result = result.filter(p => selectedBrands.includes(p.brand_id));
    if (selectedCategories.length) result = result.filter(p => selectedCategories.includes(p.category_id));
    if (selectedScents.length) result = result.filter(p => selectedScents.includes(p.scent_family));
    if (priceRange[0] > 0) result = result.filter(p => (p.discount_price || p.price) >= priceRange[0]);
    if (priceRange[1] < 20000) result = result.filter(p => (p.discount_price || p.price) <= priceRange[1]);
    if (isNewArrival) result = result.filter(p => p.is_new_arrival);
    if (isFeatured) result = result.filter(p => p.is_featured);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(s) || p.brand_name.toLowerCase().includes(s));
    }

    if (sort === 'price_asc') result.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    else if (sort === 'price_desc') result.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [selectedBrands, selectedCategories, selectedScents, priceRange, sort, isNewArrival, isFeatured, search]);

  const toggleBrand = (id: number) => setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  const toggleCategory = (id: number) => setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleScent = (s: string) => setSelectedScents(prev => prev.includes(s) ? prev.filter(sc => sc !== s) : [...prev, s]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedScents([]);
    setPriceRange([0, 20000]);
  };

  const hasFilters = selectedBrands.length > 0 || selectedCategories.length > 0 || selectedScents.length > 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">
            {search ? `Results for "${search}"` : isNewArrival ? 'New Arrivals' : isFeatured ? 'Best Picks' : 'Shop All'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} fragrances</p>
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

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-heading text-sm font-semibold mb-3">Category</h3>
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)}
                  className="w-4 h-4 rounded border-border text-primary accent-primary" />
                <span className="text-sm text-muted-foreground">{c.name}</span>
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
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
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
