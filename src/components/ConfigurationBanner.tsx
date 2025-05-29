
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConfigurationBannerProps {
  showOnlyWhenNotConfigured?: boolean;
}

const ConfigurationBanner: React.FC<ConfigurationBannerProps> = ({ 
  showOnlyWhenNotConfigured = true
}) => {
  const { isSupabaseConfigured } = useAuth();

  if (showOnlyWhenNotConfigured && isSupabaseConfigured) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Required</AlertTitle>
      <AlertDescription>
        Supabase is not properly configured. Please ensure you've connected your Supabase project 
        and set the environment variables in the Lovable interface.
      </AlertDescription>
    </Alert>
  );
};

export default ConfigurationBanner;
