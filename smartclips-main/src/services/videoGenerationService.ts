
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface ScriptGenerationOptions {
  prompt: string;
  mediaType?: 'stock' | 'ai';
  audience?: string;
  platform?: string;
  duration?: string;
  style?: string;
  callToAction?: string;
  existingContent?: string;
}

export interface ScriptGenerationResult {
  script: string;
  scenes?: string;
  status: 'success' | 'error';
  message?: string;
}

export interface VideoGenerationOptions {
  script: string;
  mediaType: 'stock' | 'ai';
  style?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  duration?: string;
}

export interface VideoGenerationResult {
  videoUrl: string;
  thumbnailUrl: string;
  status: 'success' | 'error';
  message?: string;
}

export const generateVideoScript = async (options: ScriptGenerationOptions): Promise<ScriptGenerationResult> => {
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke("generate-video-script", {
      body: options
    });
    
    if (error) {
      throw new Error(`Error: ${error.message}`);
    }
    
    return {
      script: data.script,
      scenes: data.scenes,
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating script:', error);
    toast({
      title: 'Script Generation Failed',
      description: error instanceof Error ? error.message : 'Failed to generate script',
      variant: 'destructive',
    });
    
    return {
      script: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const generateVideo = async (options: VideoGenerationOptions): Promise<VideoGenerationResult> => {
  try {
    // In a real implementation, this would call a backend API for video generation
    // For now, we'll use a mock implementation
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock response
    return {
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1690380631/samples/animals/kitten-playing.gif',
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating video:', error);
    toast({
      title: 'Video Generation Failed',
      description: error instanceof Error ? error.message : 'Failed to generate video',
      variant: 'destructive',
    });
    
    return {
      videoUrl: '',
      thumbnailUrl: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Mock implementations for development
export const mockGenerateScript = async (options: ScriptGenerationOptions): Promise<ScriptGenerationResult> => {
  console.log('Generating script with options:', options);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockScript = `# ${options.prompt}

## INTRO
[Open with engaging shot related to topic]
Welcome to our video about ${options.prompt}. Today we're going to explore this fascinating subject and learn why it matters.

## BODY
[Show relevant imagery]
First, let's talk about the key aspects of ${options.prompt}.

[Transition to next point]
Next, we'll dive deeper into how this impacts ${options.audience || 'our viewers'}.

[Show examples/demonstrations]
Here you can see real-world examples of this concept in action.

## CONCLUSION
[Zoom out to bigger picture]
As we've seen, ${options.prompt} is important because it affects so many aspects of our world.

## CTA
[Close-up shot]
${options.callToAction || 'Thanks for watching! Like and subscribe for more content like this.'}
`;

  const mockScenes = `
1. Opening Scene: A captivating visual introduction related to ${options.prompt} with bright colors and movement
2. Expert Introduction: A professional-looking setting with charts or graphics 
3. Example Showcase: Visual demonstrations of the concept in real-world settings
4. Comparison Scene: Split screen showing before/after or with/without examples
5. User Testimonial: Simulated testimonial or quote from satisfied users
6. Closing Visual: Brand logo or memorable image with call-to-action text overlay
`;
  
  return {
    script: mockScript,
    scenes: mockScenes,
    status: 'success'
  };
};

export const mockGenerateVideo = async (options: VideoGenerationOptions): Promise<VideoGenerationResult> => {
  console.log('Generating video with options:', options);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4',
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1690380631/samples/animals/kitten-playing.gif',
    status: 'success'
  };
};
