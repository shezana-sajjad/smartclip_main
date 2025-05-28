
import { toast } from "@/hooks/use-toast";

export interface ScriptGenerationRequest {
  topic: string;
  targetAudience: string;
  tone: string;
  targetDuration: string;
  keyPoints?: string;
  callToAction?: string;
}

export interface ScriptGenerationResponse {
  script: string;
  status: 'success' | 'error';
  message?: string;
}

export const generateScript = async (request: ScriptGenerationRequest): Promise<ScriptGenerationResponse> => {
  try {
    // In production, this would call a backend API endpoint that contains the API key
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      script: data.script,
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

// Mock function for development - in a real app this would call the OpenAI API via backend
export const mockGenerateScript = async (request: ScriptGenerationRequest): Promise<ScriptGenerationResponse> => {
  console.log('Generating script with:', request);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Sample script templates based on tone
  const scriptTemplates: Record<string, string> = {
    informative: `# ${request.topic}: An Informative Guide\n\nHello ${request.targetAudience}! Today, we're diving into ${request.topic}.\n\n${request.keyPoints ? request.keyPoints : "Let's explore the key aspects of this topic."}\n\n${request.callToAction || "Thanks for watching! Don't forget to subscribe for more content like this."}`,
    
    entertaining: `# ${request.topic}: Fun Facts You Didn't Know\n\nHey there ${request.targetAudience}! Are you ready for some mind-blowing facts about ${request.topic}?\n\n${request.keyPoints ? request.keyPoints : "Let's jump right into some amazing facts that will surprise you!"}\n\n${request.callToAction || "That's all for today! Hit that like button if you enjoyed this video."}`,
    
    professional: `# ${request.topic}: A Professional Analysis\n\nGreetings ${request.targetAudience}, today's presentation covers ${request.topic}.\n\n${request.keyPoints ? request.keyPoints : "Let's examine this topic methodically and draw some professional insights."}\n\n${request.callToAction || "For more professional analyses, please consider subscribing to our channel."}`,
    
    casual: `# Let's Chat About ${request.topic}\n\nWhat's up ${request.targetAudience}? Today we're just hanging out and talking about ${request.topic}.\n\n${request.keyPoints ? request.keyPoints : "I wanted to share some thoughts on this topic in a casual way."}\n\n${request.callToAction || "Anyway, that's it for now. Drop a comment below with your thoughts!"}`,
  };
  
  return {
    script: scriptTemplates[request.tone] || scriptTemplates.informative,
    status: 'success'
  };
};
