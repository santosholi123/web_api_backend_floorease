import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/web_api_backend',
  jwt: {
    secret: (process.env.JWT_SECRET || 'your_secret_here') as string,
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  },
};
//