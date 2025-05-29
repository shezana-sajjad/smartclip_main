
import { ReactNode } from 'react';

// Common types
export interface WithChildren {
  children: ReactNode;
}

// VideoUploader props
export interface VideoUploaderProps {
  title: string;
  description: string;
  onUploadComplete?: (file: File, cloudinaryUrls?: string[]) => void;
  onUpload?: (file: File) => void;
  acceptedFormats?: string;
  uploadToServer?: boolean;
  maxSizeMB?: number;
  apiEndpoint?: string;
}

// MinimalPromptInterface props
export interface MinimalPromptInterfaceProps {
  title: string;
  description: string;
  onSubmit?: (prompt: string) => void;
}

// AIPromptInterface props
export interface AIPromptInterfaceProps {
  onSubmit: (prompt: string) => void;
}

// FeatureFlow props
export interface FeatureFlowProps {
  steps: Step[];
  onComplete: (data: any) => void;
  title: string;
  subtitle: string;
  onStepChange?: (stepIndex: number) => void;
}

// Step type for FeatureFlow
export interface Step {
  id: string;
  title: string;
  description: string;
  component: ReactNode;
  isComplete?: () => boolean;
}

// UnifiedFlow props
export interface UnifiedFlowProps {
  steps: {
    title: string;
    component: React.ReactNode;
  }[];
  onComplete: (data: any) => void;
  title: string;
  subtitle?: string;
}
