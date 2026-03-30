import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('be_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('be_token');
      localStorage.removeItem('be_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

// ==================== PRODUCT APIs ====================
export const productAPI = {
  getAll: async (filters: {
    brand_id?: number;
    category_id?: number;
    scent_family?: string;
    min_price?: number;
    max_price?: number;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const { data } = await apiClient.get(`/products?${params.toString()}`);
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  create: async (productData: FormData) => {
    const { data } = await apiClient.post('/admin/products', productData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, productData: FormData | object) => {
    const { data } = await apiClient.put(`/admin/products/${id}`, productData, {
      headers: productData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/products/${id}`);
    return data;
  },
};

// ==================== BRAND APIs ====================
export const brandAPI = {
  getAll: async () => {
    const { data } = await apiClient.get('/brands');
    return data;
  },

  create: async (brandData: FormData) => {
    const { data } = await apiClient.post('/admin/brands', brandData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, brandData: FormData | object) => {
    const { data } = await apiClient.put(`/admin/brands/${id}`, brandData, {
      headers: brandData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/brands/${id}`);
    return data;
  },
};

// ==================== CATEGORY APIs ====================
export const categoryAPI = {
  getAll: async () => {
    const { data } = await apiClient.get('/categories');
    return data;
  },

  create: async (categoryData: FormData) => {
    const { data } = await apiClient.post('/admin/categories', categoryData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, categoryData: FormData | object) => {
    const { data } = await apiClient.put(`/admin/categories/${id}`, categoryData, {
      headers: categoryData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/categories/${id}`);
    return data;
  },
};

// ==================== CART APIs ====================
export const cartAPI = {
  getAll: async () => {
    const { data } = await apiClient.get('/cart');
    return data;
  },

  add: async (product_id: number, quantity: number = 1) => {
    const { data } = await apiClient.post('/cart', { product_id, quantity });
    return data;
  },

  update: async (id: number, quantity: number) => {
    const { data } = await apiClient.put(`/cart/${id}`, { quantity });
    return data;
  },

  remove: async (id: number) => {
    const { data } = await apiClient.delete(`/cart/${id}`);
    return data;
  },
};

// ==================== WISHLIST APIs ====================
export const wishlistAPI = {
  getAll: async () => {
    const { data } = await apiClient.get('/wishlist');
    return data;
  },

  add: async (product_id: number) => {
    const { data } = await apiClient.post('/wishlist', { product_id });
    return data;
  },

  remove: async (productId: number) => {
    const { data } = await apiClient.delete(`/wishlist/${productId}`);
    return data;
  },
};

// ==================== ORDER APIs ====================
export const orderAPI = {
  create: async (orderData: {
    items: Array<{ product_id: number; quantity: number }>;
    payment_method: string;
    shipping_address: object;
    coupon_code?: string;
  }) => {
    const { data } = await apiClient.post('/orders', orderData);
    return data;
  },

  getMyOrders: async () => {
    const { data } = await apiClient.get('/orders/my-orders');
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  getAll: async (filters: { status?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    const { data } = await apiClient.get(`/admin/orders?${params.toString()}`);
    return data;
  },

  updateStatus: async (id: number, status: string) => {
    const { data } = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return data;
  },
};

// ==================== REVIEW APIs ====================
export const reviewAPI = {
  getByProduct: async (productId: number) => {
    const { data } = await apiClient.get(`/reviews/${productId}`);
    return data;
  },

  create: async (product_id: number, rating: number, comment?: string) => {
    const { data } = await apiClient.post('/reviews', { product_id, rating, comment });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/reviews/${id}`);
    return data;
  },
};

// ==================== COUPON APIs ====================
export const couponAPI = {
  validate: async (code: string, cart_total: number) => {
    const { data } = await apiClient.post('/coupons/validate', { code, cart_total });
    return data;
  },

  getAll: async () => {
    const { data } = await apiClient.get('/admin/coupons');
    return data;
  },

  create: async (couponData: {
    code: string;
    discount_percent: number;
    max_uses?: number;
    expiry_date?: string;
  }) => {
    const { data } = await apiClient.post('/admin/coupons', couponData);
    return data;
  },

  update: async (id: number, couponData: object) => {
    const { data } = await apiClient.put(`/admin/coupons/${id}`, couponData);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/coupons/${id}`);
    return data;
  },
};

// ==================== BANNER APIs ====================
export const bannerAPI = {
  getActive: async () => {
    const { data } = await apiClient.get('/banners');
    return data;
  },

  create: async (bannerData: FormData) => {
    const { data } = await apiClient.post('/admin/banners', bannerData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, bannerData: FormData | object) => {
    const { data } = await apiClient.put(`/admin/banners/${id}`, bannerData, {
      headers: bannerData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/admin/banners/${id}`);
    return data;
  },
};

// ==================== ANALYTICS APIs ====================
export const analyticsAPI = {
  getSummary: async () => {
    const { data } = await apiClient.get('/admin/analytics/summary');
    return data;
  },

  getRevenue: async () => {
    const { data } = await apiClient.get('/admin/analytics/revenue');
    return data;
  },

  getTopProducts: async () => {
    const { data } = await apiClient.get('/admin/analytics/top-products');
    return data;
  },

  getUserSignups: async () => {
    const { data } = await apiClient.get('/admin/analytics/users');
    return data;
  },
};

// ==================== USER APIs ====================
export const userAPI = {
  getAll: async (filters: { search?: string; page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get(`/admin/users/${id}`);
    return data;
  },

  update: async (id: number, userData: { role?: string; [key: string]: any }) => {
    const { data } = await apiClient.put(`/admin/users/${id}`, userData);
    return data;
  },
};

export default apiClient;
