
// This file is kept for backward compatibility and imports from the new services
import { ENV } from '@/lib/env';

// Re-export everything from the new services
export * from './videoProcessingService';
export * from './videoManagementService';
export * from './videoEditingService';

// Export the old API_URL for fallback/development
export const API_URL = 'https://smartclips.onrender.com';
