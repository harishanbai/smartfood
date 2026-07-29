import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ShieldAlert, Sparkles, ChefHat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/imageUtils';

const PremiumCarousel = ({ foods = [], onSelectionComplete, isSpinning, setIsSpinning }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(null);
  const spinIntervalRef = useRef(null);
  const { t } = useLanguage();

  // If foods array changes or initializes, reset currentIndex
  useEffect(() => {
    if (foods.length > 0) {
      setCurrentIndex(0);
    }
  }, [foods]);

  const triggerConfetti = () => {
    // Premium multi-burst confetti
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#A855F7', '#F97316', '#22C55E']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#A855F7', '#F97316', '#22C55E']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const startSpin = (targetFoodId) => {
    if (foods.length === 0 || isSpinning) return;

    setIsSpinning(true);
    
    // Find target index in foods list
    const foundTargetIndex = foods.findIndex(f => f._id === targetFoodId);
    const finalTargetIdx = foundTargetIndex !== -1 ? foundTargetIndex : Math.floor(Math.random() * foods.length);
    setTargetIndex(finalTargetIdx);

    let speed = 60; // starting speed in ms
    let elapsed = 0;
    const duration = 3000; // 3 seconds spin

    const spin = () => {
      setCurrentIndex(prev => (prev + 1) % foods.length);
      elapsed += speed;

      // Apply ease-out effect towards the end
      if (elapsed > duration - 800) {
        speed += 60; // slow down
      } else if (elapsed > duration - 1500) {
        speed += 30; // start slowing
      }

      if (elapsed >= duration) {
        // Complete the spin by snapping exactly to target index
        setCurrentIndex(finalTargetIdx);
        setIsSpinning(false);
        triggerConfetti();
        if (onSelectionComplete) {
          onSelectionComplete(foods[finalTargetIdx]);
        }
      } else {
        spinIntervalRef.current = setTimeout(spin, speed);
      }
    };

    spinIntervalRef.current = setTimeout(spin, speed);
  };

  // Expose startSpin trigger to parent if needed via ref or trigger props.
  // We will handle spin control directly in Parent Dashboard.
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  // Auto-play slideshow when not spinning
  useEffect(() => {
    if (isSpinning || foods.length <= 1) return;

    const slideshowInterval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % foods.length);
    }, 3500); // transitions slide every 3.5s

    return () => clearInterval(slideshowInterval);
  }, [isSpinning, foods.length]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (foods.length === 0) {
    return (
      <div className="glass-panel rounded-[24px] p-8 flex flex-col items-center justify-center text-center h-[350px]">
        <ShieldAlert className="h-12 w-12 text-accentOrange mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.noAvailableFoods')}</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          {t('dashboard.noAvailableFoodsSub')}
        </p>
      </div>
    );
  }

  // Get circular indexes for Prev, Curr, Next
  const length = foods.length;
  const getPrevIndex = () => (currentIndex - 1 + length) % length;
  const getNextIndex = () => (currentIndex + 1) % length;

  const prevItem = foods[getPrevIndex()];
  const currentItem = foods[currentIndex];
  const nextItem = foods[getNextIndex()];

  // Cards to render with relative positions: -1 (prev), 0 (current), 1 (next)
  const visibleCards = [
    { item: prevItem, position: -1 },
    { item: currentItem, position: 0 },
    { item: nextItem, position: 1 }
  ];

  return (
    <div className="relative w-full py-6 sm:py-10 flex flex-col items-center justify-center overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-accentPurple/10 rounded-full blur-[75px] sm:blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-60 h-40 sm:h-60 bg-accentOrange/10 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none" />

      {/* 3D Container */}
      <div className="carousel-container relative w-full max-w-4xl h-[330px] sm:h-[360px] flex items-center justify-center">
        <AnimatePresence initial={false}>
          {visibleCards.map(({ item, position }) => {
            if (!item) return null;

            // Set transformations based on 3D placement and screen width
            const isCenter = position === 0;
            
            let xOffset = '0%';
            let scale = 1;
            let rotateY = 0;

            if (windowWidth < 480) { // Small mobile
              xOffset = position === -1 ? '-48%' : position === 1 ? '48%' : '0%';
              scale = isCenter ? 0.95 : 0.65;
              rotateY = position === -1 ? 18 : position === 1 ? -18 : 0;
            } else if (windowWidth < 768) { // Tablet/Medium mobile
              xOffset = position === -1 ? '-58%' : position === 1 ? '58%' : '0%';
              scale = isCenter ? 1.02 : 0.72;
              rotateY = position === -1 ? 22 : position === 1 ? -22 : 0;
            } else { // Desktop
              xOffset = position === -1 ? '-75%' : position === 1 ? '75%' : '0%';
              scale = isCenter ? 1.05 : 0.8;
              rotateY = position === -1 ? 25 : position === 1 ? -25 : 0;
            }

            const zIndex = isCenter ? 30 : 10;
            const opacity = isCenter ? 1 : 0.35;
            const blurEffect = isCenter ? 'blur(0px)' : 'blur(4px)';

            return (
              <motion.div
                key={`${item._id}-${position}`}
                style={{
                  position: 'absolute',
                  zIndex: zIndex,
                  filter: blurEffect,
                }}
                animate={{
                  x: xOffset,
                  scale: scale,
                  opacity: opacity,
                  rotateY: rotateY,
                  z: isCenter ? 100 : -100
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
                className={`carousel-card w-[205px] xs:w-[245px] sm:w-[285px] md:w-[320px] h-[300px] sm:h-[340px] rounded-[24px] overflow-hidden glass-panel p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer border
                  ${isCenter 
                    ? 'border-accentPurple bg-gradient-to-b from-[#1E1B4B]/80 to-[#111827]/90 shadow-[0_0_40px_rgba(168,85,247,0.25)] glow-active-purple' 
                    : 'border-white/5 bg-[#111827]/50'
                  }
                `}
              >
                {/* Image Section */}
                <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-3 group bg-black/20">
                  {item.image ? (
                    <motion.img 
                      src={getImageUrl(item)} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      animate={isCenter && !isSpinning ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                      <ChefHat className="h-10 w-10 text-gray-600" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}

                  {/* Category tag */}
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] text-accentOrange px-2.5 py-1 rounded-full border border-accentOrange/30 font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>

                  {isCenter && !isSpinning && (
                    <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-accentPurple/20 backdrop-blur-md flex items-center justify-center border border-accentPurple/40">
                      <Sparkles className="h-3.5 w-3.5 text-accentPurple animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight line-clamp-1 mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  
                  {isCenter && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-accentGreen" />
                        {t('dashboard.available')}
                      </span>
                      <span className="text-accentPurple font-semibold">{t('topSection.active')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Control hook for parent layout */}
      <div className="hidden">
        <button id="carousel-spin-trigger" onClick={(e) => startSpin(e.target.dataset.foodId)} />
      </div>
    </div>
  );
};

export default PremiumCarousel;
