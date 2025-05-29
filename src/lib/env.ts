
// Environment variable helper

/**
 * Helper function to safely access environment variables
 * Will throw an error if required variables are missing in production
 */
export const getEnv = (key: string, required = false): string => {
  const value = import.meta.env[key] || '';
  
  if (required && !value && import.meta.env.PROD) {
    throw new Error(`Environment variable ${key} is required in production mode`);
  }
  
  return value;
};

// Export commonly used environment variables
export const ENV = {
  SUPABASE_URL: "https://ilwlliquljbgikgybbfm.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsd2xsaXF1bGpiZ2lrZ3liYmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NjU4NjIsImV4cCI6MjA1OTI0MTg2Mn0.O1pEpoXG0UoO3RmxIy0QD78aZ4UVf-oViJk5ce4NNLI",
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
};

// Console log in development to help with debugging
if (ENV.IS_DEV) {
  console.log('Environment:', {
    NODE_ENV: ENV.NODE_ENV,
    SUPABASE_URL: ENV.SUPABASE_URL ? '✓ Set' : '✗ Missing',
    SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
  });
}
