// In-memory collections
let mockFoods = [];
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
