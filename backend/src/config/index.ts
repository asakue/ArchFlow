
export const config = {
  port: parseInt(process.env.PORT || '5002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5001']
};
