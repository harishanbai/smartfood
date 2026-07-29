import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import { foodApi } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const FOOD_ITEMS = [
  {
    id: 1,
    name: 'Special Royal Thali',
    category: 'Full Meals',
    description: 'Authentic 12-item South Indian feast with Sambar, Rasam & Payasam.',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    badge: '🌿 Pure Veg'
  },
  {
    id: 2,
    name: 'Chettinad Chicken Biryani',
    category: 'Non-Veg Special',
    description: 'Fragrant Seeraga Samba rice with hand-ground Chettinad spices.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    badge: '🍗 Favorite'
  },
  {
    id: 3,
    name: 'Crispy Ghee Roast Dosa',
    category: 'Tiffin Combo',
    description: 'Golden crispy dosa roasted in pure cow ghee with 3 chutneys & sambar.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    badge: '🔥 Chef Choice'
  },
  {
    id: 4,
    name: 'Paneer Butter Masala',
    category: 'North Indian',
    description: 'Rich creamy tomato gravy with soft paneer, butter naan & jeera rice.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    badge: '⭐ Top Rated'
  },
  {
    id: 5,
    name: 'Traditional Meals Combo',
    category: 'Lunch Combo',
    description: 'Balanced lunch with Vatha Kuzhambu, Poriyal, Kootu & Appalam.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    badge: '🌱 Balanced'
  }
];

const FoodCarousel = () => {
  const [carouselItems, setCarouselItems] = useState(FOOD_ITEMS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const total = carouselItems.length;

  // Fetch actual food items from backend database on mount
  useEffect(() => {
    let active = true;
    const loadItems = async () => {
      try {
        const res = await foodApi.getFoods();
        if (!active) return;
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          // Map MongoDB food documents to match Carousel items structure
          const mapped = res.data.slice(0, 6).map((food, index) => ({
            id: food._id || index,
            name: food.name,
            category: food.category || 'Special',
            description: food.description,
            image: getImageUrl(food),
            badge: food.foodType === 'non-veg' ? '🍗 Non-Veg' : '🌿 Pure Veg'
          }));
          setCarouselItems(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch food items for carousel, falling back to mock data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadItems();
    return () => {
      active = false;
    };
  }, []);

  // Clamping activeIndex on items list change to avoid index out of bounds
  useEffect(() => {
    setActiveIndex(0);
  }, [carouselItems.length]);

  // Continuous smooth orbit rotation
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setOrbitRotation(prev => (prev + 0.28) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Auto-advance featured dish every 5s
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex(prev => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setActiveIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const handleSelect = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const currentFood = carouselItems[activeIndex] || carouselItems[0] || FOOD_ITEMS[0];
  const orbitRadius = 148;

  return (
    <div className="w-full flex flex-col items-center select-none">

      {/* ── ORBITAL SHOWCASE ── */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] flex items-center justify-center">

        {/* Outer ambient glow */}
        <motion.div
          animate={{ scale: [1, 1.14, 1], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-28px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)' }}
        />

        {/* Orbit ring 1 — outer green */}
        <div
          className="absolute rounded-full border border-dashed pointer-events-none"
          style={{
            inset: '2px',
            borderColor: 'rgba(34,197,94,0.25)',
          }}
        />
        {/* Orbit ring 2 — inner emerald glow */}
        <div
          className="absolute rounded-full border pointer-events-none"
          style={{
            inset: '22px',
            borderColor: 'rgba(22,163,74,0.22)',
            boxShadow: '0 0 25px rgba(22,163,74,0.1), inset 0 0 25px rgba(22,163,74,0.05)',
          }}
        />

        {/* Rotating satellite container */}
        <div
          className="absolute inset-0"
          style={{ transform: `rotate(${orbitRotation}deg)` }}
        >
          {carouselItems.map((food, idx) => {
            const angleDeg = (idx * 360) / total;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.cos(angleRad) * orbitRadius;
            const y = Math.sin(angleRad) * orbitRadius;
            const isActive = idx === activeIndex;

            return (
              <div
                key={food.id}
                onClick={() => handleSelect(idx)}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - 30px)`,
                  top: `calc(50% + ${y}px - 30px)`,
                  transform: `rotate(${-orbitRotation}deg)`,
                }}
                className="cursor-pointer z-20 group"
              >
                <motion.div
                  animate={{ scale: isActive ? 1.38 : 0.92 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  className="relative"
                >
                  <div
                    className={`w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full overflow-hidden transition-all duration-300 ${
                      isActive
                        ? 'shadow-[0_0_22px_rgba(34,197,94,0.65)] ring-[3px] ring-emerald-400/30'
                        : 'opacity-80 group-hover:opacity-100'
                    }`}
                    style={{
                      border: isActive
                        ? '2.5px solid rgba(34,197,94,0.9)'
                        : '2px solid rgba(134,239,172,0.35)',
                    }}
                  >
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {isActive && (
                    <div
                      className="absolute -inset-1.5 rounded-full border border-emerald-400/45 animate-ping pointer-events-none"
                    />
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Floating green particles */}
        <motion.div
          animate={{ y: [0, -10, 0], x: [0, 5, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-12 w-2 h-2 rounded-full pointer-events-none"
          style={{ background: 'rgba(134,239,172,0.5)', filter: 'blur(1px)' }}
        />
        <motion.div
          animate={{ y: [0, 12, 0], x: [0, -6, 0], opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="absolute bottom-14 left-8 w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(34,197,94,0.4)', filter: 'blur(1px)' }}
        />
        <motion.div
          animate={{ y: [0, -7, 0], opacity: [0.1, 0.38, 0.1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute top-20 left-14 w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(22,163,74,0.38)', filter: 'blur(0.5px)' }}
        />

        {/* ── CENTER MAIN IMAGE ── */}
        <div
          className="relative z-10 rounded-full overflow-hidden"
          style={{
            width: '188px',
            height: '188px',
            boxShadow: '0 0 55px rgba(0,0,0,0.5), 0 0 28px rgba(22,163,74,0.25)',
          }}
        >
          {/* Emerald border */}
          <div className="absolute inset-0 rounded-full z-20 pointer-events-none" style={{ border: '3px solid rgba(134,239,172,0.6)' }} />
          <div className="absolute inset-[-3px] rounded-full z-20 pointer-events-none" style={{ border: '2px solid rgba(22,163,74,0.3)' }} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentFood.id}
              initial={{ opacity: 0, scale: 0.84, rotate: direction * 12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.84, rotate: -direction * 12 }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className="w-full h-full relative"
            >
              <img
                src={currentFood.image}
                alt={currentFood.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── FOOD INFO ── */}
      <div className="w-full text-center mt-3 space-y-1.5 min-h-[72px] px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFood.id}
            initial={{ opacity: 0, y: direction * 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 10 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className="text-[9.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5"
                style={{
                  background: 'rgba(22,163,74,0.15)',
                  color: 'rgba(187,247,208,0.95)',
                  border: '1px solid rgba(22,163,74,0.3)',
                }}
              >
                <Utensils className="h-3 w-3" />
                {currentFood.category}
              </span>
              <span
                className="text-[9.5px] font-semibold tracking-wide px-2.5 py-0.5 rounded-md"
                style={{
                  background: 'rgba(34,197,94,0.15)',
                  color: 'rgba(134,239,172,0.9)',
                  border: '1px solid rgba(34,197,94,0.25)',
                }}
              >
                {currentFood.badge}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
              {currentFood.name}
            </h3>
            <p className="text-[11px] sm:text-xs leading-relaxed max-w-sm mx-auto line-clamp-2" style={{ color: 'rgba(187,247,208,0.7)' }}>
              {currentFood.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex items-center gap-3 mt-2">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          aria-label="Previous"
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
          style={{
            background: 'rgba(22,163,74,0.15)',
            border: '1px solid rgba(22,163,74,0.3)',
            color: 'rgba(187,247,208,0.9)',
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <div className="flex items-center gap-1.5">
          {carouselItems.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: i === activeIndex ? '24px' : '7px',
                background: i === activeIndex
                  ? 'rgba(34,197,94,0.95)'
                  : 'rgba(255,255,255,0.22)',
                boxShadow: i === activeIndex ? '0 0 10px rgba(34,197,94,0.7)' : 'none',
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          aria-label="Next"
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
          style={{
            background: 'rgba(22,163,74,0.15)',
            border: '1px solid rgba(22,163,74,0.3)',
            color: 'rgba(187,247,208,0.9)',
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default FoodCarousel;
