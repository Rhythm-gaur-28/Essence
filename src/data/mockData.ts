import { Brand, Category, Product, Review, User, Coupon, Banner, Order } from '@/types';

export const brands: Brand[] = [
  { id: 1, name: 'Forest Essentials', logo_url: '', description: 'Luxury Ayurvedic fragrances from India', country: 'India' },
  { id: 2, name: 'Ajmal', logo_url: '', description: 'Heritage perfumery since 1951', country: 'India' },
  { id: 3, name: 'Chanel', logo_url: '', description: 'Iconic French luxury house', country: 'France' },
  { id: 4, name: 'Tom Ford', logo_url: '', description: 'Bold, modern luxury fragrances', country: 'USA' },
  { id: 5, name: 'Jo Malone', logo_url: '', description: 'British elegance in every bottle', country: 'UK' },
];

export const categories: Category[] = [
  { id: 1, name: 'Men', image_url: '' },
  { id: 2, name: 'Women', image_url: '' },
  { id: 3, name: 'Unisex', image_url: '' },
];

export const products: Product[] = [
  {
    id: 1, name: 'Mysore Sandalwood Eau de Parfum', brand_id: 1, brand_name: 'Forest Essentials',
    category_id: 3, category_name: 'Unisex', description: 'A rich, creamy sandalwood fragrance that captures the essence of Indian heritage. Warm, meditative, and deeply comforting.',
    scent_family: 'woody', top_notes: 'Bergamot, Cardamom', middle_notes: 'Sandalwood, Rose', base_notes: 'Musk, Amber',
    price: 4500, discount_price: 3825, stock: 25, size_ml: 50, image_url: '', is_featured: true, is_new_arrival: false, rating: 4.5, review_count: 28, created_at: '2024-01-15',
  },
  {
    id: 2, name: 'Oudh Mukhallat', brand_id: 2, brand_name: 'Ajmal',
    category_id: 1, category_name: 'Men', description: 'An opulent oriental blend featuring precious oudh with warm spices and amber. A statement of refined masculinity.',
    scent_family: 'oriental', top_notes: 'Saffron, Pink Pepper', middle_notes: 'Oudh, Rose Absolute', base_notes: 'Amber, Sandalwood, Musk',
    price: 6200, discount_price: null, stock: 15, size_ml: 100, image_url: '', is_featured: true, is_new_arrival: true, rating: 4.8, review_count: 42, created_at: '2024-03-01',
  },
  {
    id: 3, name: 'Chance Eau Tendre', brand_id: 3, brand_name: 'Chanel',
    category_id: 2, category_name: 'Women', description: 'A delicate and radiant floral fragrance with a tender and sparkling trail. The essence of a chance encounter.',
    scent_family: 'floral', top_notes: 'Grapefruit, Quince', middle_notes: 'Jasmine, Hyacinth', base_notes: 'White Musk, Iris, Amber',
    price: 12500, discount_price: 10625, stock: 10, size_ml: 100, image_url: '', is_featured: true, is_new_arrival: false, rating: 4.7, review_count: 95, created_at: '2023-11-20',
  },
  {
    id: 4, name: 'Oud Wood', brand_id: 4, brand_name: 'Tom Ford',
    category_id: 3, category_name: 'Unisex', description: 'A composition of exotic rosewood and Eastern spices wrapped in sensual oud and sandalwood. Utterly luxurious.',
    scent_family: 'woody', top_notes: 'Rosewood, Chinese Pepper', middle_notes: 'Oud, Sandalwood', base_notes: 'Tonka Bean, Amber',
    price: 18999, discount_price: null, stock: 8, size_ml: 50, image_url: '', is_featured: true, is_new_arrival: false, rating: 4.9, review_count: 67, created_at: '2023-09-10',
  },
  {
    id: 5, name: 'English Pear & Freesia', brand_id: 5, brand_name: 'Jo Malone',
    category_id: 2, category_name: 'Women', description: 'The sensuous freshness of just-ripe pears wrapped in a bouquet of white freesias. Elegant and playful.',
    scent_family: 'fresh', top_notes: 'King William Pear', middle_notes: 'Freesia', base_notes: 'Patchouli, Amber',
    price: 9800, discount_price: 8330, stock: 20, size_ml: 100, image_url: '', is_featured: false, is_new_arrival: true, rating: 4.6, review_count: 53, created_at: '2024-02-14',
  },
  {
    id: 6, name: 'Nargis Eau de Toilette', brand_id: 1, brand_name: 'Forest Essentials',
    category_id: 2, category_name: 'Women', description: 'Inspired by the delicate narcissus flowers of Kashmir. A poetic floral with green undertones.',
    scent_family: 'floral', top_notes: 'Green Leaves, Bergamot', middle_notes: 'Narcissus, Jasmine Sambac', base_notes: 'Vetiver, White Musk',
    price: 3800, discount_price: null, stock: 30, size_ml: 50, image_url: '', is_featured: false, is_new_arrival: true, rating: 4.3, review_count: 19, created_at: '2024-03-10',
  },
  {
    id: 7, name: 'Dahn Al Oudh Moattaq', brand_id: 2, brand_name: 'Ajmal',
    category_id: 1, category_name: 'Men', description: 'An aged oudh fragrance with deep woody and leathery notes. For the true connoisseur of oriental perfumery.',
    scent_family: 'oriental', top_notes: 'Oudh, Spices', middle_notes: 'Leather, Amber', base_notes: 'Sandalwood, Musk',
    price: 8500, discount_price: 7225, stock: 12, size_ml: 60, image_url: '', is_featured: false, is_new_arrival: false, rating: 4.7, review_count: 35, created_at: '2023-12-05',
  },
  {
    id: 8, name: 'Bleu de Chanel', brand_id: 3, brand_name: 'Chanel',
    category_id: 1, category_name: 'Men', description: 'A woody aromatic fragrance for the man who defies convention. Fresh, clean, and undeniably magnetic.',
    scent_family: 'fresh', top_notes: 'Citrus, Mint', middle_notes: 'Ginger, Nutmeg, Jasmine', base_notes: 'Incense, Cedar, Sandalwood',
    price: 11000, discount_price: null, stock: 18, size_ml: 100, image_url: '', is_featured: true, is_new_arrival: false, rating: 4.8, review_count: 112, created_at: '2023-08-15',
  },
  {
    id: 9, name: 'Black Orchid', brand_id: 4, brand_name: 'Tom Ford',
    category_id: 2, category_name: 'Women', description: 'A luxurious and sensual fragrance of rich dark accords and an alluring potion of black orchids and spice.',
    scent_family: 'gourmand', top_notes: 'Black Truffle, Ylang Ylang', middle_notes: 'Black Orchid, Spicy Notes', base_notes: 'Patchouli, Vanilla, Chocolate',
    price: 16500, discount_price: 14025, stock: 6, size_ml: 50, image_url: '', is_featured: false, is_new_arrival: true, rating: 4.6, review_count: 78, created_at: '2024-01-28',
  },
  {
    id: 10, name: 'Peony & Blush Suede', brand_id: 5, brand_name: 'Jo Malone',
    category_id: 2, category_name: 'Women', description: 'The irresistible charm of flirtatious peonies and the seductiveness of soft, blush suede.',
    scent_family: 'floral', top_notes: 'Red Apple', middle_notes: 'Peony, Jasmine, Rose, Gillyflower', base_notes: 'Suede',
    price: 9500, discount_price: null, stock: 22, size_ml: 100, image_url: '', is_featured: false, is_new_arrival: false, rating: 4.5, review_count: 41, created_at: '2023-10-10',
  },
  {
    id: 11, name: 'Parijat Night Jasmine', brand_id: 1, brand_name: 'Forest Essentials',
    category_id: 2, category_name: 'Women', description: 'The intoxicating scent of night-blooming jasmine from Indian gardens. Romantic and ethereal.',
    scent_family: 'floral', top_notes: 'Night Jasmine, Green Notes', middle_notes: 'Tuberose, Ylang Ylang', base_notes: 'Sandalwood, Vanilla',
    price: 4200, discount_price: 3570, stock: 28, size_ml: 50, image_url: '', is_featured: false, is_new_arrival: false, rating: 4.4, review_count: 23, created_at: '2023-07-20',
  },
  {
    id: 12, name: 'Wisal Dhahab', brand_id: 2, brand_name: 'Ajmal',
    category_id: 3, category_name: 'Unisex', description: 'Golden union of Eastern and Western perfumery traditions. Sweet, warm, and universally charming.',
    scent_family: 'gourmand', top_notes: 'Pineapple, Apple', middle_notes: 'Rose, Jasmine, Lily', base_notes: 'Vanilla, Musk, Sandalwood',
    price: 3200, discount_price: null, stock: 35, size_ml: 50, image_url: '', is_featured: false, is_new_arrival: false, rating: 4.2, review_count: 31, created_at: '2023-06-15',
  },
  {
    id: 13, name: 'Coco Mademoiselle', brand_id: 3, brand_name: 'Chanel',
    category_id: 2, category_name: 'Women', description: 'An irresistibly fresh and elegant oriental fragrance for the bold and free-spirited woman.',
    scent_family: 'oriental', top_notes: 'Orange, Bergamot', middle_notes: 'Rose, Jasmine, Lychee', base_notes: 'Patchouli, Vetiver, Vanilla, White Musk',
    price: 13200, discount_price: null, stock: 14, size_ml: 100, image_url: '', is_featured: true, is_new_arrival: false, rating: 4.9, review_count: 134, created_at: '2023-05-01',
  },
  {
    id: 14, name: 'Neroli Portofino', brand_id: 4, brand_name: 'Tom Ford',
    category_id: 3, category_name: 'Unisex', description: 'Vibrant Italian Riviera in a bottle. Sparkling citrus and floral notes create an escape to paradise.',
    scent_family: 'fresh', top_notes: 'Bergamot, Mandarin, Lemon', middle_notes: 'Neroli, African Orange Flower', base_notes: 'Amber, Angelica',
    price: 19500, discount_price: 16575, stock: 5, size_ml: 50, image_url: '', is_featured: false, is_new_arrival: false, rating: 4.7, review_count: 45, created_at: '2023-04-12',
  },
  {
    id: 15, name: 'Wood Sage & Sea Salt', brand_id: 5, brand_name: 'Jo Malone',
    category_id: 3, category_name: 'Unisex', description: 'Escape the everyday along a windswept shore. Mineral sea salt blended with aromatic sage.',
    scent_family: 'woody', top_notes: 'Ambrette Seeds', middle_notes: 'Sea Salt', base_notes: 'Sage, Red Algae',
    price: 9200, discount_price: null, stock: 19, size_ml: 100, image_url: '', is_featured: false, is_new_arrival: true, rating: 4.5, review_count: 38, created_at: '2024-02-28',
  },
];

export const reviews: Review[] = [
  { id: 1, user_id: 2, user_name: 'Priya Sharma', product_id: 1, rating: 5, comment: 'Absolutely divine! The sandalwood is so authentic and long-lasting.', created_at: '2024-02-10' },
  { id: 2, user_id: 3, user_name: 'Rahul Mehta', product_id: 1, rating: 4, comment: 'Beautiful fragrance, perfect for daily wear. Wish it lasted a bit longer.', created_at: '2024-02-15' },
  { id: 3, user_id: 4, user_name: 'Ananya Iyer', product_id: 2, rating: 5, comment: 'The oudh is rich and complex. Gets so many compliments!', created_at: '2024-03-05' },
  { id: 4, user_id: 2, user_name: 'Priya Sharma', product_id: 3, rating: 5, comment: 'Classic Chanel elegance. Worth every rupee.', created_at: '2024-01-20' },
  { id: 5, user_id: 3, user_name: 'Rahul Mehta', product_id: 4, rating: 5, comment: 'Tom Ford never disappoints. This is pure luxury.', created_at: '2024-01-25' },
  { id: 6, user_id: 4, user_name: 'Ananya Iyer', product_id: 5, rating: 4, comment: 'Light and fresh, perfect for Indian summers!', created_at: '2024-03-01' },
];

export const users: User[] = [
  { id: 1, name: 'Admin', email: 'admin@brandessence.com', role: 'admin', created_at: '2024-01-01' },
  { id: 2, name: 'Priya Sharma', email: 'priya@email.com', role: 'user', created_at: '2024-01-10' },
  { id: 3, name: 'Rahul Mehta', email: 'rahul@email.com', role: 'user', created_at: '2024-01-15' },
  { id: 4, name: 'Ananya Iyer', email: 'ananya@email.com', role: 'user', created_at: '2024-02-01' },
];

export const coupons: Coupon[] = [
  { id: 1, code: 'FIRST10', discount_percent: 10, max_uses: 100, used_count: 23, expiry_date: '2025-12-31', is_active: true },
  { id: 2, code: 'LUXURY20', discount_percent: 20, max_uses: 50, used_count: 12, expiry_date: '2025-06-30', is_active: true },
];

export const banners: Banner[] = [
  { id: 1, title: 'New Arrivals', subtitle: 'Discover the latest fragrances from top brands', image_url: '', link: '/shop?is_new_arrival=true', is_active: true },
];

export const sampleOrders: Order[] = [
  {
    id: 1001, user_id: 2, total_amount: 14450, status: 'delivered', payment_method: 'upi', payment_status: 'paid',
    shipping_address: { full_name: 'Priya Sharma', phone: '9876543210', street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    items: [
      { id: 1, order_id: 1001, product_id: 1, product_name: 'Mysore Sandalwood Eau de Parfum', product_image: '', quantity: 1, price_at_purchase: 3825 },
      { id: 2, order_id: 1001, product_id: 3, product_name: 'Chance Eau Tendre', product_image: '', quantity: 1, price_at_purchase: 10625 },
    ],
    created_at: '2024-02-20',
  },
  {
    id: 1002, user_id: 2, total_amount: 6200, status: 'shipped', payment_method: 'cod', payment_status: 'pending',
    shipping_address: { full_name: 'Priya Sharma', phone: '9876543210', street: '42 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    items: [
      { id: 3, order_id: 1002, product_id: 2, product_name: 'Oudh Mukhallat', product_image: '', quantity: 1, price_at_purchase: 6200 },
    ],
    created_at: '2024-03-05',
  },
];

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export const getProductsByFilter = (filters: {
  brand_id?: number;
  category_id?: number;
  scent_family?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): { products: Product[]; total: number } => {
  let filtered = [...products];

  if (filters.brand_id) filtered = filtered.filter(p => p.brand_id === filters.brand_id);
  if (filters.category_id) filtered = filtered.filter(p => p.category_id === filters.category_id);
  if (filters.scent_family) filtered = filtered.filter(p => p.scent_family === filters.scent_family);
  if (filters.min_price) filtered = filtered.filter(p => (p.discount_price || p.price) >= filters.min_price!);
  if (filters.max_price) filtered = filtered.filter(p => (p.discount_price || p.price) <= filters.max_price!);
  if (filters.is_featured) filtered = filtered.filter(p => p.is_featured);
  if (filters.is_new_arrival) filtered = filtered.filter(p => p.is_new_arrival);
  if (filters.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.brand_name.toLowerCase().includes(s));
  }

  if (filters.sort === 'price_asc') filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
  else if (filters.sort === 'price_desc') filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
  else if (filters.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const start = (page - 1) * limit;
  filtered = filtered.slice(start, start + limit);

  return { products: filtered, total };
};
