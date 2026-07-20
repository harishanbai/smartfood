import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from './models/Food.js';

dotenv.config();

const seedDishes = [
  {
    name: "Butter Chicken with Garlic Naan",
    category: "Main Course",
    description: "Tender chicken cooked in a rich, creamy, spiced tomato butter gravy, served alongside fresh tandoori garlic naan.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Crispy Grilled Salmon",
    category: "Main Course",
    description: "Pan-seared Atlantic salmon fillet with crispy skin, drizzled in lemon-herb butter sauce and served with roasted asparagus.",
    image: "https://images.unsplash.com/photo-1485921325814-a50433396582?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Premium Veg Hakka Noodles",
    category: "Main Course",
    description: "Stir-fried wheat noodles tossed with crisp colorful bell peppers, cabbage, carrots, scallions, and signature soy-sesame glaze.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Caesar Salad with Crispy Bacon",
    category: "Salad",
    description: "Fresh romaine lettuce tossed with creamy Caesar dressing, garlic croutons, crispy smoked bacon pieces, and shaved parmesan.",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Classic Italian Tiramisu",
    category: "Dessert",
    description: "Delicate espresso-dipped ladyfinger biscuits layered with a whipped mixture of egg yolks, sugar, mascarpone, and cocoa powder.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Double Chocolate Lava Cake",
    category: "Dessert",
    description: "Warm chocolate sponge cake with a liquid chocolate core, served with a scoop of premium Madagascan vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Classic Garlic Butter Garlic Bread",
    category: "Starter",
    description: "Toasted baguette slices smothered in garlic, fresh parsley, and melted unsalted butter, topped with bubbling mozzarella.",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Spiced Mango Smoothie",
    category: "Beverage",
    description: "Creamy blend of ripe Alphonso mangoes, Greek yogurt, honey, and a pinch of ground cardamom, served chilled.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Creamy Roasted Tomato Soup",
    category: "Soup",
    description: "Vibrant soup prepared with vine-roasted tomatoes, garlic, extra virgin olive oil, fresh basil leaves, and a dash of double cream.",
    image: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=800&q=80",
    available: true
  },
  {
    name: "Signature Spicy Chicken Wings",
    category: "Starter",
    description: "Deep-fried chicken wings glazed in a spicy honey sriracha marinade, served with creamy blue cheese dip.",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    available: true
  }
];

(async () => {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully! Seeding premium food items...');
    
    // Clear existing
    await Food.deleteMany({});
    console.log('Deleted all old food items.');

    // Insert new
    const createdFoods = await Food.insertMany(seedDishes);
    console.log(`Seeded ${createdFoods.length} premium food items successfully!`);
  } catch (err) {
    console.error('Seeding Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
})();
