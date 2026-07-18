import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Image as ImageIcon,
  ChefHat
} from 'lucide-react';
import { foodApi } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedFoodId, setSelectedFoodId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [description, setDescription] = useState('');
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    'Main Course',
    'Starter',
    'Dessert',
    'Beverage',
    'Salad',
    'Soup',
    'Special'
  ];

  useEffect(() => {
    fetchFoods();
  }, [search]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await foodApi.getFoods(search);
      setFoods(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setFoods([]);
      addNotification('Failed to fetch food items', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedFoodId(null);
    setName('');
    setCategory('Main Course');
    setDescription('');
    setAvailable(true);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setModalMode('edit');
    setSelectedFoodId(food._id);
    setName(food.name);
    setCategory(food.category);
    setDescription(food.description);
    setAvailable(food.available);
    setImageFile(null);
    setImagePreview(food.image || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      const newStatus = !food.available;
      await foodApi.patchAvailability(food._id, newStatus);
      setFoods(prev => prev.map(f => f._id === food._id ? { ...f, available: newStatus } : f));
      addNotification(`"${food.name}" marked as ${newStatus ? 'Available' : 'Unavailable'}`, 'info');
    } catch (err) {
      addNotification('Failed to update food status', 'warning');
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await foodApi.deleteFood(id);
      setFoods(prev => prev.filter(f => f._id !== id));
      addNotification(`"${name}" deleted successfully`, 'success');
    } catch (err) {
      addNotification('Failed to delete food item', 'warning');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !description) {
      addNotification('Please fill in all required fields', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('available', available);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (modalMode === 'add') {
        const res = await foodApi.addFood(formData);
        setFoods(prev => [res.data, ...prev]);
        addNotification(`"${name}" added successfully!`, 'success');
      } else {
        const res = await foodApi.updateFood(selectedFoodId, formData);
        setFoods(prev => prev.map(f => f._id === selectedFoodId ? res.data : f));
        addNotification(`"${name}" updated successfully!`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addNotification(err.response?.data?.message || 'Operation failed', 'warning');
    }
  };

  return (
    <div className="min-h-screen pb-12 w-full overflow-x-hidden">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search food by name, category or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all"
          />
        </div>

        {/* Add food button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-accentPurple to-accentOrange text-white text-sm font-bold hover:opacity-95 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Add Food Item
        </button>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="glass-panel rounded-[24px] h-[340px] p-4 flex flex-col justify-between animate-pulse">
              <div className="w-full h-[180px] bg-white/5 rounded-2xl" />
              <div className="space-y-2 mt-4 flex-1">
                <div className="h-4 bg-white/5 rounded-full w-2/3" />
                <div className="h-3 bg-white/5 rounded-full w-full" />
                <div className="h-3 bg-white/5 rounded-full w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="glass-panel rounded-[24px] p-12 text-center max-w-lg mx-auto flex flex-col items-center">
          <ChefHat className="h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No food items found</h3>
          <p className="text-gray-400 text-sm">
            {search ? 'Try adjusting your search criteria.' : 'Get started by clicking Add Food Item.'}
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
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {foods.map(food => (
                    <tr key={food._id} className={`hover:bg-white/5 transition-colors ${!food.available ? 'opacity-70' : ''}`}>
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                          )}
                        </div>
                        <span className="font-bold text-white">{food.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] bg-accentOrange/10 border border-accentOrange/30 text-accentOrange px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider whitespace-nowrap">
                          {food.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 max-w-xs truncate">{food.description}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(food)}
                          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {food.available ? (
                            <ToggleRight className="h-6 w-6 text-accentGreen" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-gray-500" />
                          )}
                          <span className={food.available ? "text-accentGreen font-semibold" : "text-gray-500"}>
                            {food.available ? 'Available' : 'Unavailable'}
                          </span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(food)}
                            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food._id, food.name)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Grid/Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {foods.map(food => (
              <div 
                key={food._id}
                className={`glass-panel rounded-[24px] p-4 border border-white/5 flex flex-col justify-between group transition-all duration-300 relative
                  ${food.available 
                    ? 'hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:border-accentPurple/20' 
                    : 'opacity-65 hover:opacity-100 hover:shadow-[0_0_20px_rgba(249,115,22,0.05)]'
                  }
                `}
              >
                {/* Image Section */}
                <div className="w-full h-[180px] rounded-2xl overflow-hidden bg-black/20 relative mb-3">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                      <ImageIcon className="h-8 w-8 text-gray-700" />
                      <span className="text-xs">No image uploaded</span>
                    </div>
                  )}

                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] text-accentOrange px-2.5 py-1 rounded-full border border-accentOrange/30 font-semibold uppercase tracking-wider">
                    {food.category}
                  </span>

                  {/* Availability status tag */}
                  <span className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-md border
                    ${food.available 
                      ? 'bg-accentGreen/20 border-accentGreen/30 text-accentGreen' 
                      : 'bg-accentOrange/20 border-accentOrange/30 text-accentOrange'
                    }
                  `}>
                    {food.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Information Section */}
                <div className="flex-1 flex flex-col justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight line-clamp-1 mb-1">{food.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{food.description}</p>
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  {/* Switch availability toggler */}
                  <button
                    onClick={() => handleToggleAvailability(food)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer min-h-[44px]"
                  >
                    {food.available ? (
                      <ToggleRight className="h-6 w-6 text-accentGreen" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-500" />
                    )}
                    <span>Status</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(food)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Edit className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food._id, food.name)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] p-5 sm:p-6 border border-white/10 relative shadow-2xl max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">
              {modalMode === 'add' ? 'Add New Food Item' : 'Edit Food Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Food Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Caesar Salad"
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 transition-all [&>option]:bg-bgCard"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description *</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the ingredients, preparation or flavor notes..."
                  className="w-full glass-panel px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-accentPurple/50 focus:shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all resize-none"
                />
              </div>

              {/* File Upload / Image Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Food Image</label>
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/25 border border-white/10 flex-shrink-0 flex items-center justify-center text-gray-500">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="food-image-input"
                    />
                    <label
                      htmlFor="food-image-input"
                      className="inline-block px-4 py-2 bg-white/5 border border-white/10 text-xs text-white font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Choose Image File
                    </label>
                    <span className="text-[10px] text-gray-500 block mt-1">Accepts PNG, JPG or WEBP up to 5MB</span>
                  </div>
                </div>
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl">
                <div>
                  <h5 className="text-xs font-semibold text-white">Item Availability</h5>
                  <p className="text-[10px] text-gray-400">Determines if this item can be chosen for lunch generations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className="cursor-pointer"
                >
                  {available ? (
                    <ToggleRight className="h-8 w-8 text-accentGreen" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white rounded-xl transition-all cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-gradient-to-r from-accentPurple to-accentOrange text-xs font-bold text-white rounded-xl shadow-lg shadow-purple-500/10 transition-all cursor-pointer min-h-[44px]"
                >
                  {modalMode === 'add' ? 'Save Food' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foods;
