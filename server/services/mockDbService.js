let mockFoods = [
  {
    _id: "mock_food_1",
    name: "Butter Chicken with Garlic Naan",
    category: "Main Course",
    description: "Tender chicken cooked in a rich, creamy, spiced tomato butter gravy, served alongside fresh tandoori garlic naan.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_2",
    name: "Crispy Grilled Salmon",
    category: "Main Course",
    description: "Pan-seared Atlantic salmon fillet with crispy skin, drizzled in lemon-herb butter sauce and served with roasted asparagus.",
    image: "https://images.unsplash.com/photo-1485921325814-a50433396582?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_3",
    name: "Premium Veg Hakka Noodles",
    category: "Main Course",
    description: "Stir-fried wheat noodles tossed with crisp colorful bell peppers, cabbage, carrots, scallions, and signature soy-sesame glaze.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_4",
    name: "Caesar Salad with Crispy Bacon",
    category: "Salad",
    description: "Fresh romaine lettuce tossed with creamy Caesar dressing, garlic croutons, crispy smoked bacon pieces, and shaved parmesan.",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_5",
    name: "Classic Italian Tiramisu",
    category: "Dessert",
    description: "Delicate espresso-dipped ladyfinger biscuits layered with a whipped mixture of egg yolks, sugar, mascarpone, and cocoa powder.",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_6",
    name: "Double Chocolate Lava Cake",
    category: "Dessert",
    description: "Warm chocolate sponge cake with a liquid chocolate core, served with a scoop of premium Madagascan vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_7",
    name: "Classic Garlic Butter Garlic Bread",
    category: "Starter",
    description: "Toasted baguette slices smothered in garlic, fresh parsley, and melted unsalted butter, topped with bubbling mozzarella.",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_8",
    name: "Spiced Mango Smoothie",
    category: "Beverage",
    description: "Creamy blend of ripe Alphonso mangoes, Greek yogurt, honey, and a pinch of ground cardamom, served chilled.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_9",
    name: "Creamy Roasted Tomato Soup",
    category: "Soup",
    description: "Vibrant soup prepared with vine-roasted tomatoes, garlic, extra virgin olive oil, fresh basil leaves, and a dash of double cream.",
    image: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  },
  {
    _id: "mock_food_10",
    name: "Signature Spicy Chicken Wings",
    category: "Starter",
    description: "Deep-fried chicken wings glazed in a spicy honey sriracha marinade, served with creamy blue cheese dip.",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80",
    available: true,
    createdAt: new Date()
  }
];
let mockMenus = [];

export const mockDb = {
  // Foods Collection Mock Operations
  getFoods: (search = '') => {
    let list = [...mockFoods];
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.category.toLowerCase().includes(searchLower) ||
        f.description.toLowerCase().includes(searchLower)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addFood: (foodData) => {
    const newFood = {
      _id: 'mock_food_' + Math.random().toString(36).substr(2, 9),
      name: foodData.name,
      category: foodData.category,
      description: foodData.description,
      image: foodData.image || '',
      available: foodData.available !== undefined ? foodData.available : true,
      createdAt: new Date()
    };
    mockFoods.push(newFood);
    return newFood;
  },

  updateFood: (id, foodData) => {
    const idx = mockFoods.findIndex(f => f._id === id);
    if (idx === -1) return null;

    mockFoods[idx] = {
      ...mockFoods[idx],
      ...foodData
    };
    return mockFoods[idx];
  },

  deleteFood: (id) => {
    const idx = mockFoods.findIndex(f => f._id === id);
    if (idx === -1) return false;
    mockFoods.splice(idx, 1);
    // Also remove associated menu entries
    mockMenus = mockMenus.filter(m => m.foodId !== id);
    return true;
  },

  patchAvailability: (id, available) => {
    const idx = mockFoods.findIndex(f => f._id === id);
    if (idx === -1) return null;
    mockFoods[idx].available = available;
    return mockFoods[idx];
  },

  // Menu Collection Mock Operations
  getToday: () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const menu = mockMenus.find(m => m.date === todayStr && m.status === 'active');
    if (!menu) return null;

    const food = mockFoods.find(f => f._id === menu.foodId);
    return { ...menu, foodId: food };
  },

  getTomorrow: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const menu = mockMenus.find(m => m.date === tomorrowStr && m.status === 'active');
    if (!menu) return null;

    const food = mockFoods.find(f => f._id === menu.foodId);
    return { ...menu, foodId: food };
  },

  generateLunchForDate: (dateStr) => {
    // 1. Calculate previous 5 dates
    const targetDate = new Date(dateStr);
    const previousDates = [];
    for (let i = 1; i <= 5; i++) {
      const prevDate = new Date(targetDate);
      prevDate.setDate(targetDate.getDate() - i);
      previousDates.push(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`);
    }

    // 2. Find food IDs served in the previous 5 days
    const recentMenus = mockMenus.filter(m => previousDates.includes(m.date) && m.status === 'active');
    const excludedFoodIds = recentMenus.map(m => m.foodId);

    // 3. Find food IDs already generated for target date
    const todayMenus = mockMenus.filter(m => m.date === dateStr);
    const skippedOrActiveTodayIds = todayMenus.map(m => m.foodId);

    // Combine exclusions
    const allExcludedIds = Array.from(new Set([...excludedFoodIds, ...skippedOrActiveTodayIds]));

    // 4. Query available foods not excluded
    let candidateFoods = mockFoods.filter(f => f.available && !allExcludedIds.includes(f._id));

    // Fallback: relax 5-day constraint
    if (candidateFoods.length === 0) {
      candidateFoods = mockFoods.filter(f => f.available && !skippedOrActiveTodayIds.includes(f._id));
    }

    // Fallback 2: absolute fallback
    if (candidateFoods.length === 0) {
      candidateFoods = mockFoods.filter(f => f.available);
    }

    if (candidateFoods.length === 0) {
      throw new Error('No available food items found in the database. Please add or mark food items as available first.');
    }

    // 5. Select a random food
    const randomIndex = Math.floor(Math.random() * candidateFoods.length);
    const selectedFood = candidateFoods[randomIndex];

    // 6. Deactivate existing active menus for this date
    mockMenus.forEach(m => {
      if (m.date === dateStr && m.status === 'active') {
        m.status = 'skipped';
      }
    });

    // 7. Save new menu
    const newMenu = {
      _id: 'mock_menu_' + Math.random().toString(36).substr(2, 9),
      date: dateStr,
      foodId: selectedFood._id,
      generatedAt: new Date(),
      status: 'active'
    };
    mockMenus.push(newMenu);

    return { ...newMenu, foodId: selectedFood };
  },

  skipTomorrow: () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Find active tomorrow menu
    const activeIndex = mockMenus.findIndex(m => m.date === tomorrowStr && m.status === 'active');
    if (activeIndex !== -1) {
      mockMenus[activeIndex].status = 'skipped';
    }

    // Generate another
    return mockDb.generateLunchForDate(tomorrowStr);
  },

  assignMenu: (dateStr, foodId) => {
    // Deactivate existing active menus for this date
    mockMenus.forEach(m => {
      if (m.date === dateStr && m.status === 'active') {
        m.status = 'skipped';
      }
    });

    const food = mockFoods.find(f => f._id === foodId);
    if (!food) {
      throw new Error("Food item not found");
    }

    // Save new menu
    const newMenu = {
      _id: 'mock_menu_' + Math.random().toString(36).substr(2, 9),
      date: dateStr,
      foodId: foodId,
      generatedAt: new Date(),
      status: 'active'
    };
    mockMenus.push(newMenu);

    return { ...newMenu, foodId: food };
  },

  deleteMenuRecord: (id) => {
    const idx = mockMenus.findIndex(m => m._id === id);
    if (idx === -1) return false;
    mockMenus.splice(idx, 1);
    return true;
  },

  getHistory: (month = '', search = '') => {
    let list = mockMenus.filter(m => m.status === 'active');
    
    if (month) {
      list = list.filter(m => m.date.startsWith(month));
    }

    let populated = list.map(m => {
      const food = mockFoods.find(f => f._id === m.foodId);
      return { ...m, foodId: food };
    }).filter(m => m.foodId !== undefined);

    if (search) {
      const searchLower = search.toLowerCase();
      populated = populated.filter(m => 
        m.foodId.name.toLowerCase().includes(searchLower) ||
        m.foodId.category.toLowerCase().includes(searchLower)
      );
    }

    return populated.sort((a, b) => b.date.localeCompare(a.date));
  },

  getStats: () => {
    const totalFoods = mockFoods.length;
    const availableFoods = mockFoods.filter(f => f.available).length;
    const unavailableFoods = totalFoods - availableFoods;
    const activeMenus = mockMenus.filter(m => m.status === 'active');
    const menusGenerated = activeMenus.length;
    const menusSkipped = mockMenus.filter(m => m.status === 'skipped').length;

    // Most generated
    const occurrences = {};
    activeMenus.forEach(m => {
      occurrences[m.foodId] = (occurrences[m.foodId] || 0) + 1;
    });

    let mostGeneratedFood = null;
    let maxCount = 0;
    let mostGenId = null;

    Object.entries(occurrences).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostGenId = id;
      }
    });

    if (mostGenId) {
      const food = mockFoods.find(f => f._id === mostGenId);
      if (food) {
        mostGeneratedFood = {
          name: food.name,
          category: food.category,
          image: food.image,
          count: maxCount
        };
      }
    }

    // Category stats
    const categoriesMap = {};
    mockFoods.forEach(f => {
      categoriesMap[f.category] = (categoriesMap[f.category] || 0) + 1;
    });
    const categoryStats = Object.entries(categoriesMap).map(([name, value]) => ({ name, value }));

    // Weekly stats
    const weeklyStats = activeMenus.slice(-7).map(m => {
      const food = mockFoods.find(f => f._id === m.foodId);
      return {
        date: m.date,
        food: food ? food.name : 'Unknown'
      };
    });

    return {
      totalFoods,
      availableFoods,
      unavailableFoods,
      menusGenerated,
      menusSkipped,
      mostGeneratedFood,
      categoryStats,
      weeklyStats
    };
  }
};
