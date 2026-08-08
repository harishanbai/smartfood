import './config/env.js'; // ← MUST be first: loads .env before any other module reads process.env
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './config/db.js';
import foodRoutes from './routes/foodRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import tamilCalendarRoutes from './routes/tamilCalendarRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { clearCache } from './services/tamilCalendarService.js';
import { verifySmtpConnection } from './services/emailService.js';
import mongoose from 'mongoose';
import { initScheduler } from './services/schedulerService.js';
import { getKolkataDateStr } from './utils/dateUtils.js';

// Re-export for backward compatibility
export { getKolkataDateStr };

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
  'https://smartfood-tech-8caa.vercel.app',
  'https://vaseegrah-veda-catering-xer9.vercel.app',
  'https://vaseegrah-veda-catering.vercel.app',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD
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

// Routes
app.use('/api', authRoutes);
app.use('/api', webhookRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/calendar', tamilCalendarRoutes);
app.use('/api/tamil-calendar', tamilCalendarRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', systemRoutes);

// Health Check Endpoints
app.get(['/api/health', '/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    success: isDbConnected,
    message: isDbConnected ? 'Smart Lunch Generator API is healthy and operational.' : 'Database connection error',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Smart Lunch Generator API is running...');
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
  const dbState = mongoose.connection.readyState;
  const dbStatusStr = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting...' : 'Disconnected';
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 [Backend Startup]`);
  console.log(`   Port Number   : ${PORT}`);
  console.log(`   MongoDB Status: ${dbStatusStr}`);
  console.log(`   Allowed Origins:`);
  allowedOrigins.forEach(o => console.log(`     • ${o}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize Auto Lunch Scheduler
  initScheduler();
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
