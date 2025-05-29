
import { toast } from "@/hooks/use-toast";

export interface AvatarRequest {
  avatarId: string;
  script: string;
  voiceType: string;
  backgroundVideo?: File;
}

export interface AvatarResponse {
  previewUrl: string;
  status: 'success' | 'error';
  message?: string;
}

// This is a mock service for now, but would connect to HeyGen API in production
export const generateAvatarPreview = async (request: AvatarRequest): Promise<AvatarResponse> => {
  try {
    // In a real implementation, this would be an API call to HeyGen
    console.log('Generating avatar preview with:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock response
    return {
      previewUrl: 'https://storage.googleapis.com/heygen-public-asset/preview.mp4',
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating avatar preview:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to generate avatar preview',
      variant: 'destructive',
    });
    
    return {
      previewUrl: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const generateFinalAvatarVideo = async (request: AvatarRequest): Promise<AvatarResponse> => {
  try {
    // In a real implementation, this would be an API call to HeyGen
    console.log('Generating final avatar video with:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return mock response
    return {
      previewUrl: 'https://storage.googleapis.com/heygen-public-asset/final.mp4',
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating final avatar video:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to generate final avatar video',
      variant: 'destructive',
    });
    
    return {
      previewUrl: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Repository of available HeyGen avatars
export const getHeygenAvatars = () => [
  { id: "anna", name: "Anna", image: "https://storage.googleapis.com/heygen-public-asset/female_ai_avatars/Anna.jpg" },
  { id: "daniel", name: "Daniel", image: "https://storage.googleapis.com/heygen-public-asset/male_ai_avatars/Daniel.jpg" },
  { id: "sarah", name: "Sarah", image: "https://storage.googleapis.com/heygen-public-asset/female_ai_avatars/Sarah.jpg" },
  { id: "mike", name: "Mike", image: "https://storage.googleapis.com/heygen-public-asset/male_ai_avatars/Mike.jpg" },
  { id: "jenna", name: "Jenna", image: "https://storage.googleapis.com/heygen-public-asset/female_ai_avatars/Jenna.jpg" },
  { id: "ryan", name: "Ryan", image: "https://storage.googleapis.com/heygen-public-asset/male_ai_avatars/Ryan.jpg" },
];
