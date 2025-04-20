import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';

// Database configuration
const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog',
  useInMemory: !isProduction,
  options: {
    // Common options
    autoIndex: !isProduction, // Don't build indexes in production
    maxPoolSize: isProduction ? 50 : 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    
    // Production specific options
    ...(isProduction && {
      connectTimeoutMS: 30000,
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      retryWrites: true,
      w: 'majority',
    }),
  },
};

// Server configuration
const serverConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: '0.0.0.0',
  reusePort: true,
};

// Security configuration
const securityConfig = {
  sessionSecret: process.env.SESSION_SECRET || 'dev-blog-secret-key',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-key',
  cookieSecure: isProduction,
  cookieSameSite: isProduction ? 'strict' : 'lax',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
};

// Common application settings
const appConfig = {
  postsPerPage: 10,
  maxCommentLength: 2000,
  maxPostLength: 50000,
  defaultImageUrl: '/images/default-post.jpg',
};

// Export configurations
export {
  environment,
  isProduction,
  dbConfig,
  serverConfig,
  securityConfig,
  appConfig,
};