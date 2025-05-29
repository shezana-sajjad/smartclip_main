
import { supabase, useMockData } from '@/lib/supabase';

export interface VideoProcessingOptions {
  min_duration?: number;
  max_duration?: number;
  storage_type?: string;
}

export interface VideoProcessingResult {
  success: boolean;
  message: string;
  video_urls?: string[];
  videoId?: string | number;
}

// Update VideoData interface to include both string and number ID types
export interface VideoData {
  id: string | number;
  filename: string;
  duration: number;
  created_at: string;
  status: string;
  original_url?: string;
  clips: Array<{
    id: string | number;
    url: string;
    duration: number;
  }>;
}

/**
 * Upload and process a video
 */
export const uploadVideo = async (
  file: File, 
  token: string, 
  options: VideoProcessingOptions = {}
): Promise<VideoProcessingResult> => {
  // Use mock data in development mode or when Supabase isn't configured
  if (useMockData()) {
    console.log('Using mock data - Supabase not configured or in development mode');
    
    // Create a 2-second delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data
    return {
      success: true,
      message: 'Video processed successfully',
      video_urls: [
        'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4',
        'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/elephants.mp4'
      ]
    };
  }

  try {
    // Get the user ID
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Upload to Supabase storage with user folder structure
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);
    
    if (uploadError) throw new Error(uploadError.message);
    
    // Get the URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    const originalUrl = urlData.publicUrl;
    
    // Create a record in the videos table
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert([
        { 
          filename: fileName,
          original_url: originalUrl,
          status: 'processing',
          user_id: userId
        }
      ])
      .select()
      .single();
      
    if (videoError) throw new Error(videoError.message);

    // In a real app, you would trigger a serverless function to process the video
    // For now, we'll simulate with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock the processed clips data
    // In a real application, these clips would be processed from the original video
    const mockClips = [
      `https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4`,
      `https://res.cloudinary.com/demo/video/upload/v1690380631/samples/elephants.mp4`
    ];
    
    // Update the video status and add the clips
    for (const clipUrl of mockClips) {
      await supabase
        .from('video_clips')
        .insert([
          {
            video_id: videoData.id,
            url: clipUrl,
            status: 'completed'
          }
        ]);
    }
    
    // Update the video status
    await supabase
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoData.id);
      
    return {
      success: true,
      message: 'Video processed successfully',
      video_urls: mockClips,
      videoId: videoData.id
    };
    
  } catch (error) {
    console.error('API Error:', error);
    
    // If in development, return mock data as fallback
    if (useMockData()) {
      console.log('Using mock data due to API error');
      return {
        success: true,
        message: 'Video processed successfully (mock)',
        video_urls: [
          'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4',
          'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/elephants.mp4'
        ]
      };
    }
    
    throw error;
  }
};
