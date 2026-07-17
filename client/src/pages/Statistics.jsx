import React, { useState, useEffect } from 'react';
import { ChefHat, TrendingUp, Sparkles, PieChart as PieIcon, BarChart2, LineChart as LineIcon } from 'lucide-react';
import { statsApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await statsApi.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      addNotification('Failed to retrieve system statistics', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel h-24 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel h-64 rounded-[24px] animate-pulse bg-white/5" />
          <div className="glass-panel h-64 rounded-[24px] animate-pulse bg-white/5" />
        </div>
      </div>
    );
  }

  const {
    totalFoods = 0,
    availableFoods = 0,
    unavailableFoods = 0,
    menusGenerated = 0,
    menusSkipped = 0,
    mostGeneratedFood = null,
    categoryStats = [],
    weeklyStats = []
  } = stats || {};

  // Custom inline SVG rendering helper for Category Pie Chart
  const renderCategoryPie = () => {
    if (categoryStats.length === 0) {
      return (
        <div className="text-gray-500 text-xs py-10 flex flex-col items-center">
          <PieIcon className="h-8 w-8 mb-2 opacity-50" />
          No data available. Add foods in different categories.
        </div>
      );
    }

    const colors = ['#A855F7', '#F97316', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#10B981'];
    let cumulativePercent = 0;

    // Calculate coordinates for SVG pie segments
    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    const segments = categoryStats.map((item, idx) => {
      const percent = item.value / totalFoods;
      const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
      cumulativePercent += percent;
      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
      const largeArcFlag = percent > 0.5 ? 1 : 0;
      const pathData = [
        `M 0 0`,
        `L ${startX} ${startY}`,
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
        `Z`
      ].join(' ');

      return {
        path: pathData,
        color: colors[idx % colors.length],
        name: item.name,
        count: item.value
      };
    });

    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-40 h-40 transform -rotate-90">
          {segments.map((seg, i) => (
            <path key={i} d={seg.path} fill={seg.color} className="transition-transform duration-300 hover:scale-[1.05]" />
          ))}
          <circle cx="0" cy="0" r="0.45" fill="#111827" /> {/* Donut hole */}
        </svg>
        <div className="space-y-1.5 flex-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span>{seg.name}</span>
              </div>
              <span className="font-semibold text-white">{seg.count} ({Math.round((seg.count/totalFoods)*100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom inline SVG rendering helper for Availability Bar Chart
  const renderAvailabilityBar = () => {
    const data = [
      { label: 'Available', value: availableFoods, color: '#22C55E' },
      { label: 'Unavailable', value: unavailableFoods, color: '#F97316' }
    ];
    const maxVal = Math.max(availableFoods, unavailableFoods, 1);

    return (
      <div className="space-y-4">
        {data.map((bar, i) => {
          const widthPercent = (bar.value / maxVal) * 100;
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">{bar.label} Dishes</span>
                <span className="text-white font-bold">{bar.value}</span>
              </div>
              <div className="w-full h-3 bg-black/35 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${widthPercent}%`, backgroundColor: bar.color }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Custom Line Chart for weekly updates (last 7 menu selections)
  const renderWeeklyLine = () => {
    if (weeklyStats.length === 0) {
      return (
        <div className="text-gray-500 text-xs py-10 flex flex-col items-center">
          <LineIcon className="h-8 w-8 mb-2 opacity-50" />
          No recent generations recorded.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {weeklyStats.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-gray-400 font-medium font-mono">{item.date}</span>
              <span className="text-accentPurple font-semibold text-right truncate max-w-[180px]">{item.food}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12 space-y-6 sm:space-y-8 w-full overflow-x-hidden">
      {/* 4 Cards Summary Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Foods */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Recipes</div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalFoods}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accentPurple" />
            Database active records
          </div>
        </div>

        {/* Menus Generated */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Menus Served</div>
          <div className="text-3xl font-extrabold text-white mt-2">{menusGenerated}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accentGreen" />
            Successfully served
          </div>
        </div>

        {/* Menus Skipped */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Menus Skipped</div>
          <div className="text-3xl font-extrabold text-white mt-2 text-accentOrange">{menusSkipped}</div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accentOrange" />
            Recipe updates skipped
          </div>
        </div>

        {/* Availability Ratio */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider">Availability</div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {totalFoods > 0 ? `${Math.round((availableFoods / totalFoods) * 100)}%` : '0%'}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accentPurple" />
            {availableFoods} / {totalFoods} foods available
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left column: Categories & Availability */}
        <div className="col-span-1 lg:col-span-7 space-y-6 sm:space-y-8">
          
          {/* Category Pie Chart */}
          <div className="glass-panel rounded-[24px] p-4 sm:p-6 border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-accentPurple" />
              Category Distribution
            </h3>
            {renderCategoryPie()}
          </div>

          {/* Availability Status Bar */}
          <div className="glass-panel rounded-[24px] p-4 sm:p-6 border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-accentGreen" />
              Recipe Availability Status
            </h3>
            {renderAvailabilityBar()}
          </div>

        </div>

        {/* Right column: Most Generated Food & Weekly Activity */}
        <div className="col-span-1 lg:col-span-5 space-y-6 sm:space-y-8">
          
          {/* Most Generated Food Card */}
          <div className="glass-panel rounded-[24px] p-4 sm:p-6 border border-white/5 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-accentPurple/10 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accentPurple" />
              Most Generated Food
            </h3>

            {mostGeneratedFood ? (
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                  {mostGeneratedFood.image ? (
                    <img src={mostGeneratedFood.image} alt={mostGeneratedFood.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
                <div>
                  <span className="text-[10px] bg-accentPurple/25 border border-accentPurple/40 text-accentPurple px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {mostGeneratedFood.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5">{mostGeneratedFood.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Chosen <span className="text-accentPurple font-bold">{mostGeneratedFood.count}</span> times</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500 text-xs">
                <ChefHat className="h-8 w-8 mb-2 opacity-50" />
                No selection history recorded yet.
              </div>
            )}
          </div>

          {/* Weekly Generation Log */}
          <div className="glass-panel rounded-[24px] p-4 sm:p-6 border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accentOrange" />
              Recent Generations
            </h3>
            {renderWeeklyLine()}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Statistics;
