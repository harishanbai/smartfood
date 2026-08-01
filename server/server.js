import './config/env.js'; // ← MUST be first: loads .env before any other module reads process.env
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './config/db.js';
import foodRoutes from './routes/foodRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import tamilCalendarRoutes from './routes/tamilCalendarRoutes.js';
import { generateLunchForDate } from './services/generatorService.js';
import { clearCache } from './services/tamilCalendarService.js';
import Menu from './models/Menu.js';

import authRoutes from './routes/authRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { verifySmtpConnection } from './services/emailService.js';


// Connect to MongoDB
connectDB().catch(err => {
  console.error('Fatal Database Connection Error during server startup:', err.message);
  process.exit(1);
});

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'http://192.168.1.91:5000',
  'https://doorbell-spry-judgingly.ngrok-free.dev',
  'https://vaseegrah-veda-catering-xer9.vercel.app',
  'https://vaseegrah-veda-catering.vercel.app',
  process.env.CLIENT_URL // Vercel URL
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});


// Images are served from MongoDB via /api/foods/:id/image

// Routes
app.use('/api', authRoutes);
app.use('/api', webhookRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendar', tamilCalendarRoutes);
app.use('/api/tamil-calendar', tamilCalendarRoutes);

// Health Check Endpoints
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'Smart Lunch Generator API is healthy and operational.',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Smart Lunch Generator API is running...');
});

// Helper to get YYYY-MM-DD date in Asia/Kolkata timezone
export const getKolkataDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
};

// Setup Cron Job for 08:00 PM IST daily auto-generation of tomorrow's lunch menu
cron.schedule('0 20 * * *', async () => {
  const tomorrowStr = getKolkataDateStr(1);
  console.log(`[Cron Job] 8:00 PM IST Triggered: Initiating auto-generation for tomorrow's lunch (${tomorrowStr})...`);
  
  try {
    // Check if tomorrow's menu already exists
    const existingMenu = await Menu.findOne({ date: tomorrowStr, status: 'active' });
    if (existingMenu) {
      console.log(`[Cron Job] Active menu already exists for tomorrow (${tomorrowStr}). Skipping duplicate generation.`);
      return;
    }

    const menu = await generateLunchForDate(tomorrowStr, 'automatic');
    const foodName = menu.foodId?.name || menu.vegFoodId?.name || menu.nonVegFoodId?.name || 'Selected Dish';
    console.log(`[Cron Job] Successfully auto-generated tomorrow's lunch menu: "${foodName}" for target date ${tomorrowStr}`);
  } catch (error) {
    console.error(`[Cron Job] Failed to auto-generate menu for ${tomorrowStr}:`, error.message);
  }
}, {
  timezone: "Asia/Kolkata"
});

// Clear Tamil Calendar cache at midnight IST
cron.schedule('0 0 * * *', () => {
  clearCache();
  console.log('[Cron Job] Tamil Calendar cache cleared at midnight IST.');
}, {
  timezone: "Asia/Kolkata"
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  // Verify SMTP connection after server starts
  verifySmtpConnection();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   A previous server instance may still be running.`);
    console.error(`   Run this command to free the port, then restart:\n`);
    console.error(`   PowerShell: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    console.error(`   CMD/bash:   netstat -ano | findstr :${PORT}   then   taskkill /PID <PID> /F\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});
