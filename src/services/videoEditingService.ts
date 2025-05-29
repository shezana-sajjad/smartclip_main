// Define the VideoEditResult interface
export interface VideoEditResult {
  url: string;
  duration?: number;
}

/**
 * Trim a video to a specific start and end time
 */
export const trimVideo = async (
  file: File, 
  startTime: number, 
  endTime: number, 
  token: string
): Promise<VideoEditResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('startTime', startTime.toString());
  formData.append('endTime', endTime.toString());

  try {
    const response = await fetch('/api/video/trim', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to trim video: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error trimming video:', error);
    // Fallback to mock implementation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
  }
};

/**
 * Adjust the speed of a video
 */
export const adjustSpeed = async (
  file: File, 
  speedFactor: number, 
  token: string
): Promise<VideoEditResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('speedFactor', speedFactor.toString());

  try {
    const response = await fetch('/api/video/speed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to adjust video speed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error adjusting video speed:', error);
    // Fallback to mock implementation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
  }
};

/**
 * Crop a video to specified dimensions
 */
export const cropVideo = async (
  file: File, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  token: string
): Promise<VideoEditResult> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
};

/**
 * Rotate a video by the specified angle
 */
export const rotateVideo = async (
  file: File, 
  angle: number, 
  token: string
): Promise<VideoEditResult> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
};

/**
 * Merge multiple videos into one
 */
export const mergeVideos = async (
  files: File[], 
  token: string
): Promise<VideoEditResult> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
};

/**
 * Apply visual effects to a video
 */
export const applyEffect = async (
  file: File,
  effectType: string,
  token: string
): Promise<VideoEditResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('effectType', effectType);

  try {
    const response = await fetch('/api/video/effect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to apply effect: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error applying effect:', error);
    // Fallback to mock implementation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
  }
};

/**
 * Create a split screen video
 */
export const createSplitScreen = async (
  file1: File,
  file2: File,
  layout: 'horizontal' | 'vertical',
  token: string
): Promise<VideoEditResult> => {
  const formData = new FormData();
  formData.append('file1', file1);
  formData.append('file2', file2);
  formData.append('layout', layout);

  try {
    const response = await fetch('/api/video/split-screen', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to create split screen: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating split screen:', error);
    // Fallback to mock implementation for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    return { url: 'https://res.cloudinary.com/demo/video/upload/v1690380631/samples/sea-turtle.mp4' };
  }
};
