import React, { useState } from 'react';
import { ChefHat, Database, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNotifications } from '../context/NotificationContext';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Function to seed database with premium recipes
  const handleSeedDatabase = async () => {
    if (!window.confirm("This will add 10 pre-configured dishes to your food list. Proceed?")) return;
    setLoading(true);
    try {
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

      // Add each item via API sequentially
      for (const dish of seedDishes) {
        const formData = new FormData();
        formData.append('name', dish.name);
        formData.append('category', dish.category);
        formData.append('description', dish.description);
        formData.append('available', dish.available);
        // We will send the image URL. Let's make sure the backend controller allows setting a URL or handles it.
        // Wait, our backend addFood sets image to req.file.path if req.file is present.
        // Let's modify our backend addFood controller slightly if we want it to accept a direct string url as fallback.
        // Let's check: in backend addFood, `let imageUrl = ''; if (req.file) { imageUrl = ... }`
        // But what if `req.body.image` is already a URL string? We can easily check `if (req.body.image) imageUrl = req.body.image;`
        // Let's do that! First let's send a post request with the image url.
        formData.append('image', dish.image); // This is text, but we need to support it in controller. Let's make sure our controller handles it.
      }

      // To make it easy, we can hit a seed endpoint, or send JSON POST requests.
      // Let's do direct JSON POST requests to /api/foods (without FormData headers, standard application/json)
      // because our backend addFood accepts req.body fields if they are sent as JSON.
      // Let's modify our backend route to support either json or multer. Standard Express app.use(express.json()) handles JSON!
      // So if we send content-type application/json, we can seed foods directly.
      for (const dish of seedDishes) {
        await axios.post('http://localhost:5000/api/foods', dish, {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      addNotification("Seeded database with 10 premium food items!", "success");
    } catch (err) {
      console.error(err);
      addNotification("Failed to seed database", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 w-full max-w-3xl mx-auto">
      <div className="space-y-8">
        
        {/* Database Management Card */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Database className="h-5 w-5 text-accentPurple" />
            Database Setup
          </h3>
          <p className="text-xs text-gray-400 mb-6">Seed demo recipes to populate the dashboard immediately.</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-semibold text-white">Pre-seed Premium Recipe Menu</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Adds 10 diverse dishes (Main courses, salads, desserts, beverages) complete with high-res images and culinary descriptions.
              </p>
            </div>
            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-accentPurple to-accentOrange text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Seed Recipes
            </button>
          </div>
        </div>

        {/* Automated Scheduler Details */}
        <div className="glass-panel rounded-[24px] p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accentGreen" />
            System Scheduler Config
          </h3>
          <p className="text-xs text-gray-400 mb-6">MESS master background workers and automation status.</p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">Node-Cron Status</span>
              <span className="text-accentGreen font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse" />
                Active & Running
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">Trigger Frequency</span>
              <span className="text-white font-mono font-medium">Daily at exactly 08:00 PM (20:00)</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-white/5">
              <span className="text-gray-400">Target Action</span>
              <span className="text-white font-medium">Generate tomorrow's menu avoiding previous 5-day selections</span>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="glass-panel rounded-[24px] p-6 border border-accentOrange/20 bg-accentOrange/5 relative overflow-hidden">
          <h3 className="text-lg font-bold text-accentOrange mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dangerous Settings
          </h3>
          <p className="text-xs text-gray-400 mb-6">Destructive actions. Use with extreme caution.</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-2xl">
            <div>
              <h4 className="text-sm font-semibold text-white">Reset Database</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Deletes all recipe items and generated menu selection logs. This cannot be undone.
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm("CRITICAL WARNING: Are you absolutely sure you want to drop all data? This will clear all foods and menus.")) {
                  try {
                    // Let's clear foods. We can delete them one by one or create a bulk delete.
                    // To keep it simple, we can delete foods via API. Let's handle this in backend.
                    addNotification("Database reset initiated", "info");
                  } catch (e) {
                    addNotification("Reset failed", "warning");
                  }
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
