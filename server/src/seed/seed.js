import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

const categories = [
  {
    name: 'Herbs',
    description: 'Traditional herbs for teas, wellness blends, and home remedies.',
  },
  {
    name: 'Spices',
    description: 'Fresh whole and ground spices for everyday cooking.',
  },
  {
    name: 'Seeds',
    description: 'Nutritious seeds used in food, drinks, and natural remedies.',
  },
  {
    name: 'Oils',
    description: 'Cold-pressed and traditional oils for kitchen and care routines.',
  },
  {
    name: 'Dry Fruits',
    description: 'Premium dry fruits and pantry staples.',
  },
];

const image = (id) => ({
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`,
  filename: '',
});

const products = (categoryMap) => [
  {
    name: 'Organic Ajwain Seeds',
    price: 280,
    description:
      'Cleaned ajwain seeds with a strong aroma, commonly used in traditional digestion blends and savoury recipes.',
    image: image('photo-1596040033229-a9821ebd058d'),
    category: categoryMap.Seeds,
    stock: 35,
    unit: '250g',
    tags: ['ajwain', 'seeds', 'digestion'],
    featured: true,
  },
  {
    name: 'Kalonji Black Seeds',
    price: 320,
    description:
      'Premium black seeds selected for freshness, suitable for herbal mixes, pickles, and daily pantry use.',
    image: image('photo-1506806732259-39c2d0268443'),
    category: categoryMap.Seeds,
    stock: 28,
    unit: '250g',
    tags: ['kalonji', 'black seeds'],
    featured: true,
  },
  {
    name: 'Dried Mint Leaves',
    price: 180,
    description:
      'Naturally dried mint leaves with a bright fragrance for teas, chutneys, spice blends, and cooling drinks.',
    image: image('photo-1627894006066-b4572e736a02'),
    category: categoryMap.Herbs,
    stock: 42,
    unit: '100g',
    tags: ['mint', 'tea', 'herbs'],
    featured: true,
  },
  {
    name: 'Mulethi Licorice Root',
    price: 390,
    description:
      'Cut licorice root pieces used in traditional herbal teas and seasonal wellness preparations.',
    image: image('photo-1600185365926-3a2ce3cdb9eb'),
    category: categoryMap.Herbs,
    stock: 18,
    unit: '200g',
    tags: ['mulethi', 'licorice', 'tea'],
    featured: true,
  },
  {
    name: 'Cold Pressed Coconut Oil',
    price: 950,
    description:
      'Pure coconut oil with a clean aroma, useful for cooking, hair care, and skin care routines.',
    image: image('photo-1622467827417-bbe2237067a9'),
    category: categoryMap.Oils,
    stock: 16,
    unit: '500ml',
    tags: ['coconut oil', 'cold pressed'],
    featured: true,
  },
  {
    name: 'Pure Almond Oil',
    price: 1150,
    description:
      'Light almond oil packaged for freshness, suitable for massage, hair care, and traditional care blends.',
    image: image('photo-1608571423902-eed4a5ad8108'),
    category: categoryMap.Oils,
    stock: 12,
    unit: '250ml',
    tags: ['almond oil', 'care'],
    featured: false,
  },
  {
    name: 'Ceylon Cinnamon Sticks',
    price: 440,
    description:
      'Aromatic cinnamon sticks for tea, desserts, spice blends, and everyday kitchen use.',
    image: image('photo-1605826832916-d0fd1e251b7d'),
    category: categoryMap.Spices,
    stock: 30,
    unit: '200g',
    tags: ['cinnamon', 'spice'],
    featured: true,
  },
  {
    name: 'Whole Cloves',
    price: 520,
    description:
      'Fragrant whole cloves with a warm flavour for teas, pulao, desserts, and herbal blends.',
    image: image('photo-1506368249639-73a05d6f6488'),
    category: categoryMap.Spices,
    stock: 24,
    unit: '100g',
    tags: ['cloves', 'spice'],
    featured: false,
  },
  {
    name: 'Premium Almonds',
    price: 1850,
    description:
      'Whole almonds selected for crunch and freshness, ideal for snacks, desserts, and winter mixes.',
    image: image('photo-1508061253366-f7da158b6d46'),
    category: categoryMap['Dry Fruits'],
    stock: 20,
    unit: '500g',
    tags: ['almonds', 'dry fruits'],
    featured: true,
  },
  {
    name: 'Golden Raisins',
    price: 780,
    description:
      'Sweet golden raisins for baking, breakfast bowls, rice dishes, and healthy snacking.',
    image: image('photo-1591348278999-ee1d0c06ed7b'),
    category: categoryMap['Dry Fruits'],
    stock: 26,
    unit: '500g',
    tags: ['raisins', 'dry fruits'],
    featured: false,
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);

  const [admin, customer] = await User.create([
    {
      name: 'Pansar Admin',
      email: 'admin@pansarbazar.pk',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+923007574363',
    },
    {
      name: 'Demo Customer',
      email: 'customer@pansarbazar.pk',
      password: 'Customer@12345',
      role: 'user',
      phone: '+923007574363',
    },
  ]);

  const createdCategories = await Category.create(categories);
  const categoryMap = createdCategories.reduce((map, category) => {
    map[category.name] = category._id;
    return map;
  }, {});

  await Product.create(products(categoryMap));

  console.log('Seed completed');
  console.log('Admin:', admin.email, 'Password: Admin@12345');
  console.log('Customer:', customer.email, 'Password: Customer@12345');

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
