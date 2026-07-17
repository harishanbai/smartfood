import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import connectDB from './config/db.js';
import foodRoutes from './routes/foodRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { generateLunchForDate } from './services/generatorService.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Setup static path for file uploads fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/foods', foodRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Smart Lunch Generator API is running...');
});

// Setup Cron Job for 08:00 PM daily auto-generation of tomorrow's menu
cron.schedule('0 20 * * *', async () => {
  console.log('Cron Job Triggered: Auto-generating tomorrow\'s lunch menu...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${yyyy}-${mm}-${dd}`;

    const menu = await generateLunchForDate(tomorrowStr);
    console.log(`Successfully generated tomorrow's lunch menu: ${menu.foodId.name} (${tomorrowStr})`);
  } catch (error) {
    console.error('Error during auto-generation cron job:', error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
