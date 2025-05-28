
import { supabase, useMockData } from '@/lib/supabase';
import { VideoData } from './videoProcessingService';

export interface VideoClip {
  id: string | number;
  url: string;
  duration?: number;
}

export interface Video {
  id: string | number;
  filename: string;
  duration?: number;
  created_at: string;
  status: string;
  clips: VideoClip[];
  original_url?: string;
}

/**
 * List videos for the current user
 */
export const listVideos = async (token: string, skip = 0, limit = 20): Promise<VideoData[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_clips (*)
      `)
      .range(skip, skip + limit - 1);
      
    if (error) throw error;
    
    return data.map(video => ({
      id: video.id,
      filename: video.filename,
      duration: video.duration || 0,
      created_at: video.created_at,
      status: video.status,
      original_url: video.original_url,
      clips: video.video_clips.map((clip: any) => ({
        id: clip.id,
        url: clip.url,
        duration: clip.duration || 0
      }))
    }));
  } catch (error) {
    console.error('List videos error:', error);
    
    // Return mock data in development
    if (useMockData()) {
      return [
        {
          id: 1,
          filename: 'sample-video.mp4',
          duration: 0,
          created_at: new Date().toISOString(),
          status: 'completed',
          clips: [
            {
              id: 1,
              url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4',
              duration: 15
            },
            {
              id: 2,
              url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/elephants.mp4',
              duration: 12
            }
          ]
        }
      ];
    }
    
    throw error;
  }
};

/**
 * Delete a video and its clips
 */
export const deleteVideo = async (videoId: number, token: string): Promise<{ success: boolean, message: string }> => {
  try {
    // Get the video to find the original file path
    const { data: video, error: videoFetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();
      
    if (videoFetchError) throw videoFetchError;
    
    // If there's an original URL that's from our storage, extract the path and delete the file
    if (video.original_url) {
      try {
        const url = new URL(video.original_url);
        const pathMatch = url.pathname.match(/\/videos\/([^/]+)$/);
        if (pathMatch && pathMatch[1]) {
          const filePath = decodeURIComponent(pathMatch[1]);
          const { error: deleteFileError } = await supabase.storage
            .from('videos')
            .remove([filePath]);
            
          if (deleteFileError) {
            console.error('Failed to delete original video file:', deleteFileError);
          }
        }
      } catch (e) {
        console.error('Error parsing video URL:', e);
      }
    }
    
    // First delete the clips
    const { error: clipsError } = await supabase
      .from('video_clips')
      .delete()
      .eq('video_id', videoId);
      
    if (clipsError) throw clipsError;
    
    // Then delete the video
    const { error: videoError } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);
      
    if (videoError) throw videoError;
    
    return { success: true, message: 'Video deleted successfully' };
  } catch (error) {
    console.error('Delete video error:', error);
    
    // In development mode, pretend it succeeded
    if (useMockData()) {
      return { success: true, message: 'Video deleted successfully (mock)' };
    }
    
    throw error;
  }
};
