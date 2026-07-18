import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
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

    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/smart_lunch');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn("WARNING: Running in In-Memory Mock Database Mode. Changes will not persist across restarts.");
    process.env.USE_MOCK_DB = 'true';
  }
};

export default connectDB;
