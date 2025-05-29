
import { useState, useEffect } from 'react';
import { cloudinaryService, CloudinaryConfig } from '@/config/cloudinary';

export const useCloudinary = () => {
  const [credentials, setCredentials] = useState<CloudinaryConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const config = cloudinaryService.getConfig();
    setCredentials(config);
    setIsConfigured(cloudinaryService.isConfigured());
    setIsLoading(false);
  }, []);

  const configureCloudinary = (newCredentials: CloudinaryConfig) => {
    try {
      cloudinaryService.initialize(newCredentials);
      setCredentials(newCredentials);
      setIsConfigured(true);
      return true;
    } catch (e) {
      console.error('Failed to configure Cloudinary:', e);
      return false;
    }
  };

  const clearCloudinaryConfig = () => {
    try {
      cloudinaryService.clear();
      setCredentials(null);
      setIsConfigured(false);
      return true;
    } catch (e) {
      console.error('Failed to clear Cloudinary config:', e);
      return false;
    }
  };

  const uploadFile = async (file: File) => {
    return await cloudinaryService.uploadFile(file);
  };

  const deleteFile = async (publicId: string) => {
    return await cloudinaryService.deleteFile(publicId);
  };

  return {
    credentials,
    isConfigured,
    isLoading,
    configureCloudinary,
    clearCloudinaryConfig,
    uploadFile,
    deleteFile,
  };
};
