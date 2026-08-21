import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const SplashScreen = ({ onFinish }) => {
  const [visible, setVisible] = useState(() => {
    // Show splash screen only on initial load per browser session
    return !sessionStorage.getItem('smartlunch_splash_shown');
  });

  useEffect(() => {
    if (!visible) {
      if (onFinish) onFinish();
      return;
    }

    // Set session storage flag to prevent repeating on sub-navigation
    sessionStorage.setItem('smartlunch_splash_shown', 'true');

    // Total sequence duration ~3.9s
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 3900);

    return () => clearTimeout(timer);
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="master-splash-overlay"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 w-screen h-[100dvh] overflow-hidden flex flex-col items-center justify-center z-50 px-4 select-none"
          style={{
            background: 'radial-gradient(ellipse at center, #064e3b 0%, #022c22 55%, #01140e 100%)'
          }}
        >
          {/* Background Visual Effects (Ambient Aura & Non-Overflowing Concentric Ripples) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            
            {/* Ambient Radial Glowing Aura */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{
                scale: [0.8, 1.15, 1.05, 1.1],
                opacity: [0, 0.85, 0.6, 0.7]
              }}
              transition={{
                duration: 3.8,
                ease: 'easeInOut'
              }}
              className="w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] rounded-full blur-3xl max-w-[85vw] max-h-[85vw]"
              style={{
                background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(217,119,6,0.2) 40%, rgba(2,44,34,0.15) 70%, transparent 80%)'
              }}
            />

            {/* Concentric Circular Ripple Rings (Constrained by max-w-[85vw] max-h-[85vw]) */}
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.35, opacity: 0 }}
                animate={{
                  scale: [0.35, 1.5, 2.3],
                  opacity: [0, 0.45, 0]
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  delay: index * 0.75,
                  ease: [0.215, 0.61, 0.355, 1]
                }}
                className="absolute w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] md:w-[440px] md:h-[440px] rounded-full border border-emerald-400/30 max-w-[85vw] max-h-[85vw] pointer-events-none"
                style={{
                  boxShadow: '0 0 25px rgba(16,185,129,0.15), inset 0 0 20px rgba(251,191,36,0.08)'
                }}
              />
            ))}
          </div>

          {/* Central Vertically Stacked Content Container with Breathing Micro-Hover */}
          <motion.div
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              delay: 2.8,
              duration: 2.0,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Logo Crest (0.0s – 1.2s: Slow-Mo Scale & Float) */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 16 }}
              animate={{
                scale: [0.85, 1.0, 1.025, 1.0],
                opacity: [0, 1, 1, 1],
                y: [16, 0, 0, 0]
              }}
              transition={{
                duration: 1.6,
                times: [0, 0.6, 0.85, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center"
            >
              <img
                src={logo}
                alt="SmartLunch Crest"
                className="w-full h-full object-contain drop-shadow-[0_16px_35px_rgba(0,0,0,0.65)]"
              />

              {/* Metallic Sheen Sweep Light on Badge */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full">
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  animate={{
                    x: ['-150%', '200%'],
                    opacity: [0, 0.95, 0]
                  }}
                  transition={{
                    delay: 1.1,
                    duration: 1.3,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="w-full h-full transform -skew-x-25 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.75) 45%, rgba(251,191,36,0.6) 55%, transparent 80%)'
                  }}
                />
              </div>
            </motion.div>

            {/* Main Title "SMARTLUNCH" (1.0s – 2.0s: Typography Float & Shimmer) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.0,
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative overflow-hidden mt-4"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-wider sm:tracking-widest whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-emerald-400 drop-shadow-[0_4px_18px_rgba(212,175,55,0.4)] leading-tight">
                SMARTLUNCH
              </h1>

              {/* Golden Sheen Reflection Sweep over Title */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{
                  x: ['-100%', '200%'],
                  opacity: [0, 0.75, 0]
                }}
                transition={{
                  delay: 1.4,
                  duration: 1.2,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)'
                }}
              />
            </motion.div>

            {/* Tagline "Powered by Tech Vaseegrah" (1.8s – 2.8s: Branding Fade & Tracking Expansion) */}
            <motion.div
              initial={{ opacity: 0, y: 8, letterSpacing: '0.18em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.25em' }}
              transition={{
                delay: 1.8,
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="mt-2 flex items-center justify-center whitespace-nowrap"
            >
              <p className="text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.2em] sm:tracking-[0.25em] text-emerald-200/80 uppercase">
                Powered by{' '}
                <span className="text-amber-300 font-bold tracking-wider ml-1 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]">
                  Tech Vaseegrah
                </span>
              </p>
            </motion.div>
          </motion.div>

          {/* Subtle Bottom Status Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ delay: 1.5, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-8 flex items-center gap-1.5 pointer-events-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-300/60">
              Loading
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
