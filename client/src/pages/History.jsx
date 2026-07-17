import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChefHat, Filter } from 'lucide-react';
import { menuApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const History = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(''); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Generate a list of months for filtering (current month and last 12 months)
  const getMonthFilterOptions = () => {
    const options = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value: `${yyyy}-${mm}`, label });
      date.setMonth(date.getMonth() - 1);
    }
    return options;
  };

  useEffect(() => {
    fetchHistory();
  }, [search, month]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await menuApi.getHistory(month, search);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      addNotification('Failed to fetch history logs', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Search & Month Filter section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search history by dish name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accentPurple/50 transition-all"
          />
        </div>

        {/* Month Filter */}
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accentPurple" />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full glass-panel pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard cursor-pointer"
          >
            <option value="">All Months</option>
            {getMonthFilterOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Grid/List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="glass-panel rounded-2xl p-4 flex gap-4 animate-pulse h-24" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-[24px] p-12 text-center max-w-lg mx-auto flex flex-col items-center">
          <ChefHat className="h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No history records found</h3>
          <p className="text-gray-400 text-sm">
            Make sure you have generated lunch menus for yesterday, today or tomorrow.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block glass-panel rounded-[24px] overflow-hidden border border-white/5 shadow-xl">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Served On</th>
                    <th className="p-4 text-right">Generated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {history.map(menu => {
                    const food = menu.foodId;
                    if (!food) return null;
                    return (
                      <tr key={menu._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                            {food.image ? (
                              <img src={food.image} alt={food.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{food.name}</span>
                            <span className="text-xs text-gray-400 max-w-xs truncate block mt-0.5">{food.description}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] bg-accentOrange/10 border border-accentOrange/30 text-accentOrange px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap">
                            {food.category}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-200">{formatDateLabel(menu.date)}</td>
                        <td className="p-4 text-right font-mono text-gray-300">
                          {new Date(menu.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-4 md:hidden">
            {history.map(menu => {
              const food = menu.foodId;
              if (!food) return null;
              return (
                <div 
                  key={menu._id}
                  className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-col items-stretch gap-4 hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all"
                >
                  {/* Left section: Food details */}
                  <div className="flex flex-row items-center gap-4">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                      {food.image ? (
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[10px] bg-accentOrange/10 border border-accentOrange/30 text-accentOrange px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        {food.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1 truncate">{food.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{food.description}</p>
                    </div>
                  </div>

                  {/* Right section: Generation metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accentPurple flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Served On</div>
                        <span className="text-gray-200 font-semibold">{formatDateLabel(menu.date)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Generated At</div>
                      <span className="text-gray-300 font-mono font-medium">
                        {new Date(menu.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
