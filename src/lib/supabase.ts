
import { createClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from '@/lib/env';

// Initialize Supabase client with better error handling
const createSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not fully configured. Some features may not work correctly.');
    // For development, return a client with placeholder values
    return createClient(
      'https://ilwlliquljbgikgybbfm.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsd2xsaXF1bGpiZ2lrZ3liYmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NjU4NjIsImV4cCI6MjA1OTI0MTg2Mn0.O1pEpoXG0UoO3RmxIy0QD78aZ4UVf-oViJk5ce4NNLI'
    );
  }
  
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
};

// Initialize and export Supabase client
export const supabase = createSupabaseClient();

// Export a helper for mock data in development
export const useMockData = (): boolean => {
  return !isSupabaseConfigured() || ENV.IS_DEV;
};
