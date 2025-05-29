
import { toast } from "@/hooks/use-toast";

export interface TranscriptionResponse {
  text: string;
  status: 'success' | 'error';
  message?: string;
}

export const transcribeAudio = async (audioFile: File): Promise<TranscriptionResponse> => {
  try {
    // Call the backend API endpoint for transcription
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.text,
      status: 'success'
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    toast({
      title: 'Transcription Failed',
      description: error instanceof Error ? error.message : 'Failed to transcribe audio',
      variant: 'destructive',
    });
    
    return {
      text: '',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function for development that simulates AI-based segmentation
export const segmentTranscript = async (transcript: string): Promise<Array<{text: string, startTime: number, endTime: number}>> => {
  // This would call the backend API in production
  // For now we'll use a mock implementation
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple algorithm to split transcript into segments
  // In production, this would be handled by a more sophisticated AI model
  const sentences = transcript
    .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
    .split("|")
    .filter(s => s.trim().length > 0);
  
  const segments = [];
  let currentTime = 0;
  
  for (const sentence of sentences) {
    // Estimate roughly 3 seconds per 10 words (very simplified)
    const words = sentence.split(/\s+/).length;
    const duration = Math.max(2, Math.round(words * 0.3));
    
    segments.push({
      text: sentence.trim(),
      startTime: currentTime,
      endTime: currentTime + duration
    });
    
    currentTime += duration;
  }
  
  return segments;
};

// Enhanced mock function for development - in a real app this would call the Google Speech-to-Text API via backend
export const mockTranscribeAudio = async (audioFile: File): Promise<TranscriptionResponse> => {
  console.log('Transcribing audio file:', audioFile.name);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response based on file type/name for development
  let mockText = '';
  
  if (audioFile.name.includes('intro')) {
    mockText = "Welcome to this video about modern web development. Today we're going to explore React, Next.js, and how to build scalable applications.";
  } else if (audioFile.name.includes('tutorial')) {
    mockText = "In this tutorial, I'll show you step-by-step how to create a beautiful user interface using Tailwind CSS and React components.";
  } else if (audioFile.name.includes('product')) {
    mockText = "Our new product offers unmatched performance and reliability. With cutting-edge AI technology, we've created a solution that transforms how businesses operate in the digital landscape.";
  } else if (audioFile.name.includes('promo')) {
    mockText = "Don't miss this limited time offer! Subscribe now and get 50% off your first three months, plus access to exclusive content and premium features.";
  } else {
    mockText = "Thank you for watching this video. If you found it helpful, please like and subscribe for more content like this.";
  }
  
  return {
    text: mockText,
    status: 'success'
  };
};
