import { getEnv } from '@/lib/env';
import sha1 from 'crypto-js/sha1';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

class CloudinaryService {
  private config: CloudinaryConfig | null = null;

  constructor() {
    // Try to load config from localStorage
    const savedConfig = localStorage.getItem('cloudinaryConfig');
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse cloudinary config:', e);
      }
    }
  }

  initialize(config: CloudinaryConfig) {
    this.config = config;
    localStorage.setItem('cloudinaryConfig', JSON.stringify(config));
  }

  getUploadUrl(): string {
    if (!this.config?.cloudName) {
      throw new Error('Cloudinary not configured');
    }
    return `https://api.cloudinary.com/v1_1/${this.config.cloudName}/upload`;
  }

  getConfig(): CloudinaryConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return !!(
      this.config?.cloudName &&
      this.config?.apiKey &&
      this.config?.apiSecret
    );
  }

  private generateSignature(params: Record<string, string>): string {
    if (!this.config?.apiSecret) {
      throw new Error('Cloudinary not configured');
    }

    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return sha1(stringToSign + this.config.apiSecret).toString();
  }

  async uploadFile(file: File): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const params: Record<string, string> = {
      timestamp,
      api_key: this.config!.apiKey,
    };

    if (this.config?.uploadPreset) {
      params.upload_preset = this.config.uploadPreset;
    }

    const signature = this.generateSignature(params);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', this.config!.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    
    if (this.config?.uploadPreset) {
      formData.append('upload_preset', this.config.uploadPreset);
    }

    const response = await fetch(this.getUploadUrl(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const params: Record<string, string> = {
      public_id: publicId,
      timestamp,
      api_key: this.config!.apiKey,
    };

    const signature = this.generateSignature(params);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.config!.apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config!.cloudName}/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Delete failed: ${errorData.error?.message || 'Unknown error'}`);
    }
  }

  clear() {
    this.config = null;
    localStorage.removeItem('cloudinaryConfig');
  }
}

export const cloudinaryService = new CloudinaryService();
