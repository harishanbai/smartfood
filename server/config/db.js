import mongoose from 'mongoose';
import dns from 'dns';

// Handle connection errors to prevent process crash
mongoose.connection.on('error', err => {
  console.error('MongoDB Connection Error Event:', err.message);
});

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_lunch';
    if (uri && uri.startsWith('mongodb+srv://')) {
      try {
        const parts = uri.split('@');
        if (parts.length > 1) {
          const host = parts[1].split('/')[0].split('?')[0];
          await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
        }
      } catch (dnsErr) {
        if (dnsErr.code === 'ECONNREFUSED' || dnsErr.code === 'ENOTFOUND') {
          console.warn('Default DNS failed to resolve MongoDB SRV. Switching to public DNS servers (8.8.8.8, 1.1.1.1)...');
          dns.setServers(['8.8.8.8', '1.1.1.1']);
        }
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
