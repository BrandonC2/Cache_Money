// React Native environment configuration
const ENV = {
  dev: {
    apiUrl: 'http://localhost:5001',
    // Add other development environment variables here
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    // Add staging environment variables here
  },
  prod: {
    apiUrl: 'https://api.example.com',
    // Add production environment variables here
  }
};

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
  if (env === 'development' || env === 'dev') {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'production' || env === 'prod') {
    return ENV.prod;
  }
};

export default getEnvVars;