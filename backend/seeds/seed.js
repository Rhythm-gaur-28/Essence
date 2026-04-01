require('dotenv').config();

const sequelize = require('../config/db');
const bcryptjs = require('bcryptjs');

// Import models
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    // Seed Brands
    const brands = await Brand.bulkCreate([
      { name: 'Forest Essentials', logo_url: '', description: 'Luxury Ayurvedic fragrances from India', country: 'India' },
      { name: 'Ajmal', logo_url: '', description: 'Heritage perfumery since 1951', country: 'India' },
      { name: 'Chanel', logo_url: '', description: 'Iconic French luxury house', country: 'France' },
      { name: 'Tom Ford', logo_url: '', description: 'Bold, modern luxury fragrances', country: 'USA' },
      { name: 'Jo Malone', logo_url: '', description: 'British elegance in every bottle', country: 'UK' },
    ]);
    console.log('✅ Brands seeded:', brands.length);

    // Seed Categories
    const categories = await Category.bulkCreate([
      { name: 'Men', image_url: '' },
      { name: 'Women', image_url: '' },
      { name: 'Unisex', image_url: '' },
    ]);
    console.log('✅ Categories seeded:', categories.length);

    // Seed Products
    const products = await Product.bulkCreate([
      {
        name: 'Mysore Sandalwood Eau de Parfum',
        brand_id: 1,
        category_id: 3,
        description: 'A rich, creamy sandalwood fragrance that captures the essence of Indian heritage. Warm, meditative, and deeply comforting.',
        scent_family: 'woody',
        top_notes: 'Bergamot, Cardamom',
        middle_notes: 'Sandalwood, Rose',
        base_notes: 'Musk, Amber',
        price: 4500,
        discount_price: 3825,
        stock: 25,
        size_ml: 50,
        image_url: '',
        is_featured: true,
        is_new_arrival: false,
      },
      {
        name: 'Oudh Mukhallat',
        brand_id: 2,
        category_id: 1,
        description: 'An opulent oriental blend featuring precious oudh with warm spices and amber. A statement of refined masculinity.',
        scent_family: 'oriental',
        top_notes: 'Saffron, Pink Pepper',
        middle_notes: 'Oudh, Rose Absolute',
        base_notes: 'Amber, Sandalwood, Musk',
        price: 6200,
        discount_price: null,
        stock: 15,
        size_ml: 100,
        image_url: '',
        is_featured: true,
        is_new_arrival: true,
      },
      {
        name: 'Chance Eau Tendre',
        brand_id: 3,
        category_id: 2,
        description: 'A delicate and radiant floral fragrance with a tender and sparkling trail. The essence of a chance encounter.',
        scent_family: 'floral',
        top_notes: 'Grapefruit, Quince',
        middle_notes: 'Jasmine, Hyacinth',
        base_notes: 'White Musk, Iris, Amber',
        price: 12500,
        discount_price: 10625,
        stock: 10,
        size_ml: 100,
        image_url: '',
        is_featured: true,
        is_new_arrival: false,
      },
      {
        name: 'Oud Wood',
        brand_id: 4,
        category_id: 3,
        description: 'A composition of exotic rosewood and Eastern spices wrapped in sensual oud and sandalwood. Utterly luxurious.',
        scent_family: 'woody',
        top_notes: 'Rosewood, Chinese Pepper',
        middle_notes: 'Oud, Sandalwood',
        base_notes: 'Tonka Bean, Amber',
        price: 18999,
        discount_price: null,
        stock: 8,
        size_ml: 50,
        image_url: '',
        is_featured: true,
        is_new_arrival: false,
      },
      {
        name: 'English Pear & Freesia',
        brand_id: 5,
        category_id: 2,
        description: 'The sensuous freshness of just-ripe pears wrapped in a bouquet of white freesias. Elegant and playful.',
        scent_family: 'fresh',
        top_notes: 'King William Pear',
        middle_notes: 'Freesia',
        base_notes: 'Patchouli, Amber',
        price: 9800,
        discount_price: 8330,
        stock: 20,
        size_ml: 100,
        image_url: '',
        is_featured: false,
        is_new_arrival: true,
      },
      {
        name: 'Nargis Eau de Toilette',
        brand_id: 1,
        category_id: 2,
        description: 'Inspired by the delicate narcissus flowers of Kashmir. A poetic floral with green undertones.',
        scent_family: 'floral',
        top_notes: 'Green Leaves, Bergamot',
        middle_notes: 'Narcissus, Jasmine Sambac',
        base_notes: 'Vetiver, White Musk',
        price: 3800,
        discount_price: null,
        stock: 30,
        size_ml: 50,
        image_url: '',
        is_featured: false,
        is_new_arrival: true,
      },
      {
        name: 'Dahn Al Oudh Moattaq',
        brand_id: 2,
        category_id: 1,
        description: 'An aged oudh fragrance with deep woody and leathery notes. For the true connoisseur of oriental perfumery.',
        scent_family: 'oriental',
        top_notes: 'Oudh, Spices',
        middle_notes: 'Leather, Amber',
        base_notes: 'Sandalwood, Musk',
        price: 8500,
        discount_price: 7225,
        stock: 12,
        size_ml: 60,
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
      },
      {
        name: 'Bleu de Chanel',
        brand_id: 3,
        category_id: 1,
        description: 'A woody aromatic fragrance for the man who defies convention. Fresh, clean, and undeniably magnetic.',
        scent_family: 'fresh',
        top_notes: 'Citrus, Mint',
        middle_notes: 'Ginger, Nutmeg, Jasmine',
        base_notes: 'Incense, Cedar, Sandalwood',
        price: 11000,
        discount_price: null,
        stock: 18,
        size_ml: 100,
        image_url: '',
        is_featured: true,
        is_new_arrival: false,
      },
      {
        name: 'Black Orchid',
        brand_id: 4,
        category_id: 2,
        description: 'A luxurious and sensual fragrance of rich dark accords and an alluring potion of black orchids and spice.',
        scent_family: 'gourmand',
        top_notes: 'Black Truffle, Ylang Ylang',
        middle_notes: 'Black Orchid, Spicy Notes',
        base_notes: 'Patchouli, Vanilla, Chocolate',
        price: 16500,
        discount_price: 14025,
        stock: 6,
        size_ml: 50,
        image_url: '',
        is_featured: false,
        is_new_arrival: true,
      },
      {
        name: 'Peony & Blush Suede',
        brand_id: 5,
        category_id: 2,
        description: 'The irresistible charm of flirtatious peonies and the seductiveness of soft, blush suede.',
        scent_family: 'floral',
        top_notes: 'Red Apple',
        middle_notes: 'Peony, Jasmine, Rose, Gillyflower',
        base_notes: 'Suede',
        price: 9500,
        discount_price: null,
        stock: 22,
        size_ml: 100,
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
      },
      {
        name: 'Parijat Night Jasmine',
        brand_id: 1,
        category_id: 2,
        description: 'The intoxicating scent of night-blooming jasmine from Indian gardens. Romantic and ethereal.',
        scent_family: 'floral',
        top_notes: 'Night Jasmine, Green Notes',
        middle_notes: 'Tuberose, Ylang Ylang',
        base_notes: 'Sandalwood, Vanilla',
        price: 4200,
        discount_price: 3570,
        stock: 28,
        size_ml: 50,
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
      },
      {
        name: 'Wisal Dhahab',
        brand_id: 2,
        category_id: 3,
        description: 'Golden union of Eastern and Western perfumery traditions. Sweet, warm, and universally charming.',
        scent_family: 'gourmand',
        top_notes: 'Pineapple, Apple',
        middle_notes: 'Rose, Jasmine, Lily',
        base_notes: 'Vanilla, Musk, Sandalwood',
        price: 3200,
        discount_price: null,
        stock: 35,
        size_ml: 50,
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
      },
      {
        name: 'Coco Mademoiselle',
        brand_id: 3,
        category_id: 2,
        description: 'An irresistibly fresh and elegant oriental fragrance for the bold and free-spirited woman.',
        scent_family: 'oriental',
        top_notes: 'Orange, Bergamot',
        middle_notes: 'Rose, Jasmine, Lychee',
        base_notes: 'Patchouli, Vetiver, Vanilla, White Musk',
        price: 13200,
        discount_price: null,
        stock: 14,
        size_ml: 100,
        image_url: '',
        is_featured: true,
        is_new_arrival: false,
      },
      {
        name: 'Neroli Portofino',
        brand_id: 4,
        category_id: 3,
        description: 'Vibrant Italian Riviera in a bottle. Sparkling citrus and floral notes create an escape to paradise.',
        scent_family: 'fresh',
        top_notes: 'Bergamot, Mandarin, Lemon',
        middle_notes: 'Neroli, African Orange Flower',
        base_notes: 'Amber, Angelica',
        price: 19500,
        discount_price: 16575,
        stock: 5,
        size_ml: 50,
        image_url: '',
        is_featured: false,
        is_new_arrival: false,
      },
      {
        name: 'Wood Sage & Sea Salt',
        brand_id: 5,
        category_id: 3,
        description: 'Escape the everyday along a windswept shore. Mineral sea salt blended with aromatic sage.',
        scent_family: 'woody',
        top_notes: 'Ambrette Seeds',
        middle_notes: 'Sea Salt',
        base_notes: 'Sage, Red Algae',
        price: 9200,
        discount_price: null,
        stock: 19,
        size_ml: 100,
        image_url: '',
        is_featured: false,
        is_new_arrival: true,
      },
    ]);
    console.log('✅ Products seeded:', products.length);

    // Seed Users (with hashed passwords)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('password123', salt);

    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@brandessence.com',
        password: hashedPassword,
        role: 'admin',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@email.com',
        password: hashedPassword,
        role: 'user',
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul@email.com',
        password: hashedPassword,
        role: 'user',
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya@email.com',
        password: hashedPassword,
        role: 'user',
      },
    ]);
    console.log('✅ Users seeded:', users.length);

    // Seed Reviews
    const reviews = await Review.bulkCreate([
      {
        user_id: 2,
        product_id: 1,
        rating: 5,
        comment: 'Absolutely divine! The sandalwood is so authentic and long-lasting.',
      },
      {
        user_id: 3,
        product_id: 1,
        rating: 4,
        comment: 'Beautiful fragrance, perfect for daily wear. Wish it lasted a bit longer.',
      },
      {
        user_id: 4,
        product_id: 2,
        rating: 5,
        comment: 'The oudh is rich and complex. Gets so many compliments!',
      },
      {
        user_id: 2,
        product_id: 3,
        rating: 5,
        comment: 'Classic Chanel elegance. Worth every rupee.',
      },
      {
        user_id: 3,
        product_id: 4,
        rating: 5,
        comment: 'Tom Ford never disappoints. This is pure luxury.',
      },
      {
        user_id: 4,
        product_id: 5,
        rating: 4,
        comment: 'Light and fresh, perfect for Indian summers!',
      },
    ]);
    console.log('✅ Reviews seeded:', reviews.length);

    // Seed Coupons
    const coupons = await Coupon.bulkCreate([
      {
        code: 'FIRST10',
        discount_percent: 10,
        max_uses: 100,
        used_count: 23,
        expiry_date: '2025-12-31',
        is_active: true,
      },
      {
        code: 'LUXURY20',
        discount_percent: 20,
        max_uses: 50,
        used_count: 12,
        expiry_date: '2025-06-30',
        is_active: true,
      },
    ]);
    console.log('✅ Coupons seeded:', coupons.length);

    // Seed Banners
    const banners = await Banner.bulkCreate([
      {
        title: 'New Arrivals',
        subtitle: 'Discover the latest fragrances from top brands',
        image_url: '',
        link: '/shop?is_new_arrival=true',
        is_active: true,
      },
      {
        title: 'Best Sellers',
        subtitle: 'Shop our most loved and best-selling fragrances',
        image_url: '',
        link: '/shop?is_featured=true',
        is_active: true,
      },
    ]);
    console.log('✅ Banners seeded:', banners.length);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@brandessence.com / password123');
    console.log('   User: priya@email.com / password123');
    console.log('   User: rahul@email.com / password123');
    console.log('   User: ananya@email.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
