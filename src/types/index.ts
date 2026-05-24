export interface Brand {
  id: number;
  name: string;
  logo_url: string;
  description: string;
  country: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
}

export interface Product {
  id: number;
  name: string;
  brand_id: number;
  brand_name: string;
  category_id: number;
  category_name: string;
  description: string;
  scent_family: 'floral' | 'woody' | 'oriental' | 'fresh' | 'gourmand';
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  price: number;
  discount_price: number | null;
  stock: number;
  size_ml: number;
  image_url: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  gender: 'men' | 'women' | 'unisex';
  rating: number;
  review_count: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'upi' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: {
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price_at_purchase: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expiry_date: string;
  is_active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  is_active: boolean;
}
