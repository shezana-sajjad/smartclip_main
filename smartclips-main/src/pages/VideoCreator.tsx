import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { listVideos, deleteVideo } from "@/services/videoManagementService";
import { trimVideo } from "@/services/videoEditingService";
import { VideoData } from "@/services/videoProcessingService";
import UnifiedFlow from "@/components/UnifiedFlow";
import ModeSelection from "@/components/video-creator/ModeSelection";
import ProcessingState from "@/components/video-creator/ProcessingState";
import VideoEditor from "@/components/video-creator/VideoEditor";
import VideoLibrary from "@/components/video-creator/VideoLibrary";
import GeneratedVideo from "@/components/video-creator/GeneratedVideo";
import GeneratedClips from "@/components/video-creator/GeneratedClips";
import AuthCheck from "@/components/video-creator/AuthCheck";
import DashboardLayout from "@/components/Dashboard";

// Define types for our video clip data for UI display (not to be confused with the API types)
interface VideoClip {
  id: string;
  url: string;
  title: string;
  duration: string;
}

// Using SimpleVideoData for local state to avoid conflicts with imported VideoData
const VideoCreator = () => {
  const [mode, setMode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoIdea, setVideoIdea] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  const [processedClips, setProcessedClips] = useState<VideoClip[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userVideos, setUserVideos] = useState<VideoData[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  
  // New state variables for the enhanced video generator flow
  const [mediaType, setMediaType] = useState<string>("stock");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [targetPlatform, setTargetPlatform] = useState<string>("youtube");
  const [videoDuration, setVideoDuration] = useState<string>("2-3 minutes");
  const [videoStyle, setVideoStyle] = useState<string>("informative");
  const [callToAction, setCallToAction] = useState<string>("Subscribe to our channel");
  
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();

  // Load user videos when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserVideos();
    }
  }, [isAuthenticated, token]);

  const fetchUserVideos = async () => {
    if (!token) return;
    
    setIsLoadingVideos(true);
    try {
      const videos = await listVideos(token);
      setUserVideos(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Failed to load videos',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // Handle video upload with API
  const handleVideoUpload = (file: File, urls?: string[]) => {
    setUploadedVideo(file);
    
    if (urls && urls.length > 0) {
      // Create clips from the uploaded video
      const clips = urls.map((url, i) => ({
        id: `clip-${i}`,
        url: url,
        title: `Clip ${i + 1}`,
        duration: `${Math.floor(Math.random() * 30 + 10)}s`
      }));
      
      setProcessedClips(clips);
      fetchUserVideos(); // Refresh video list
    }
  };

  // Handle deleting a video
  const handleDeleteVideo = async (videoId: string | number) => {
    if (!token) return;
    
    try {
      // Convert string ID to number if it's a string
      const numericId = typeof videoId === 'string' ? parseInt(videoId, 10) : videoId;
      await deleteVideo(numericId, token);
      toast({
        title: 'Video deleted',
        description: 'The video has been successfully deleted',
      });
      fetchUserVideos(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = (data: any) => {
    setIsProcessing(true);
    
    // Simulate processing for the generator flow since we don't have a real backend for this yet
    if (mode === "generator") {
      setTimeout(() => {
        setIsProcessing(false);
        setGeneratedVideo({
          id: "generated-" + Date.now(),
          title: videoIdea.substring(0, 30) + (videoIdea.length > 30 ? '...' : ''),
          thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop",
          url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop",
          duration: "45s"
        });
        
        toast({
          title: "Process completed",
          description: "Your video is ready."
        });
      }, 2000);
    } else {
      // For clipper, the VideoUploaderWithAPI component handles the API call
      setIsProcessing(false);
    }
  };

  const handleModeSelect = (selectedMode: string) => {
    setMode(selectedMode);
    setEditMode(selectedMode === "editor");
    
    // Reset state when switching modes
    setGeneratedVideo(null);
    
    if (selectedMode !== "clipper") {
      setUploadedVideo(null);
      setProcessedClips([]);
    }
    
    // If selection is "library", fetch user videos
    if (selectedMode === "library" && isAuthenticated) {
      fetchUserVideos();
    }
  };

  const handleDeleteClip = (id: string) => {
    setProcessedClips(clips => clips.filter(clip => clip.id !== id));
    toast({
      title: "Clip deleted",
      description: "The video clip has been removed"
    });
  };

  // Handle video editing operations
  const handleTrimVideo = async () => {
    if (!selectedFile || !token) return;
    
    setIsProcessing(true);
    try {
      const result = await trimVideo(selectedFile, 5, 15, token); // Example start and end times
      toast({
        title: 'Video trimmed',
        description: 'Video has been trimmed successfully',
      });
      setSelectedVideo(result.url);
    } catch (error) {
      toast({
        title: 'Trim failed',
        description: error instanceof Error ? error.message : 'Failed to trim video',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return <AuthCheck />;
  }

  const renderContent = () => {
    // If editing mode is active, show the editor
    if (editMode) {
      return (
        <VideoEditor 
          onBack={() => setEditMode(false)}
          selectedVideo={selectedVideo}
          selectedFile={selectedFile}
          isProcessing={isProcessing}
          handleTrimVideo={handleTrimVideo}
        />
      );
    }

    // If clips are processed, show them
    if (processedClips.length > 0) {
      return (
        <GeneratedClips 
          clips={processedClips}
          onEdit={() => setEditMode(true)}
          onCreateNew={() => {
            setProcessedClips([]);
            setUploadedVideo(null);
            setMode(null);
          }}
          onShare={(id) => {
            toast({
              title: "Link copied",
              description: "Video link has been copied to clipboard."
            });
          }}
          onDownload={(id) => {
            const clip = processedClips.find(c => c.id === id);
            if (clip) {
              window.open(clip.url, '_blank');
            }
          }}
          onDelete={handleDeleteClip}
        />
      );
    }

    // If generated video is available, show it
    if (generatedVideo) {
      return (
        <GeneratedVideo 
          video={generatedVideo}
          onEdit={() => setEditMode(true)}
          onCreateNew={() => {
            setGeneratedVideo(null);
            setMode(null);
          }}
        />
      );
    }

    // Video library mode - show user's videos
    if (mode === "library") {
      return (
        <VideoLibrary 
          videos={userVideos}
          isLoading={isLoadingVideos}
          onBack={() => setMode(null)}
          onChangeMode={handleModeSelect}
          onEdit={(videoUrl) => {
            setSelectedVideo(videoUrl);
            setEditMode(true);
          }}
          onDelete={handleDeleteVideo}
        />
      );
    }

    // If processing, show loading state
    if (isProcessing) {
      return <ProcessingState />;
    }

    // Mode selection screen
    if (!mode) {
      return <ModeSelection onModeSelect={handleModeSelect} />;
    }

    // Defining steps for each mode based on requirements
    let flowSteps = [];
  
    if (mode === "clipper") {
      flowSteps = [
        {
          id: "upload",
          title: "Upload Video",
          description: "Upload a video file to create clips from",
          component: ({ onNext, onComplete }) => (
            <div>
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onNext()}
                >
                  Continue
                </button>
              </div>
            </div>
          )
        },
        {
          id: "process",
          title: "Process Video",
          description: "Our AI will process your video and create clips",
          component: ({ onComplete }) => (
            <div>
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onComplete()}
                >
                  Create Clips
                </button>
              </div>
            </div>
          )
        }
      ];
    } else if (mode === "avatar") {
      flowSteps = [
        {
          id: "select-avatar",
          title: "Select Avatar",
          description: "Choose an AI avatar for your video",
          component: ({ onNext }) => (
            <div>
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onNext()}
                >
                  Continue
                </button>
              </div>
            </div>
          )
        },
        {
          id: "write-script",
          title: "Write Script",
          description: "Write a script for your avatar to speak",
          component: ({ onNext }) => (
            <div>
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onNext()}
                >
                  Continue
                </button>
              </div>
            </div>
          )
        },
        {
          id: "generate",
          title: "Generate Video",
          description: "Generate your avatar video",
          component: ({ onComplete }) => (
            <div>
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onComplete()}
                >
                  Generate Video
                </button>
              </div>
            </div>
          )
        }
      ];
    } else if (mode === "generator") {
      // Updated steps for the video generator flow based on requirements
      flowSteps = [
        {
          id: "prompt",
          title: "Video Topic",
          description: "What would you like to create a video about?",
          component: ({ onNext }) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="videoIdea" className="block text-sm font-medium">
                  Video Topic or Idea
                </label>
                <textarea
                  id="videoIdea"
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="Describe what your video should be about..."
                />
              </div>
              
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onNext()}
                  disabled={!videoIdea.trim()}
                >
                  Continue
                </button>
              </div>
            </div>
          )
        },
        {
          id: "media-audience",
          title: "Media & Audience",
          description: "Select media type and define your audience",
          component: ({ onNext }) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Media Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-4 border rounded-md text-center flex flex-col items-center ${
                      mediaType === "stock" ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => setMediaType("stock")}
                  >
                    <span className="text-lg">📚</span>
                    <span>Stock Footage</span>
                  </button>
                  <button
                    className={`p-4 border rounded-md text-center flex flex-col items-center ${
                      mediaType === "ai" ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => setMediaType("ai")}
                  >
                    <span className="text-lg">🤖</span>
                    <span>AI Generated</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="audience" className="block text-sm font-medium">
                  Target Audience
                </label>
                <input
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  placeholder="Who is this video for? (e.g., teens, professionals, parents)"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Target Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {["youtube", "tiktok", "instagram", "linkedin", "facebook", "twitter"].map(platform => (
                    <button
                      key={platform}
                      className={`p-2 border rounded-md text-center ${
                        targetPlatform === platform ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setTargetPlatform(platform)}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onNext()}
                >
                  Continue
                </button>
              </div>
            </div>
          )
        },
        {
          id: "style-details",
          title: "Style & Details",
          description: "Choose video style, duration and call to action",
          component: ({ onComplete }) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Video Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {["30s", "1 minute", "2-3 minutes", "5+ minutes"].map(duration => (
                    <button
                      key={duration}
                      className={`p-2 border rounded-md text-center ${
                        videoDuration === duration ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setVideoDuration(duration)}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Video Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {["informative", "entertaining", "promotional", "tutorial", "storytelling"].map(style => (
                    <button
                      key={style}
                      className={`p-2 border rounded-md text-center ${
                        videoStyle === style ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setVideoStyle(style)}
                    >
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cta" className="block text-sm font-medium">
                  Call to Action
                </label>
                <input
                  id="cta"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="w-full p-3 border rounded-md"
                  placeholder="What should viewers do after watching? (e.g., Subscribe, Visit website)"
                />
              </div>
              
              <div className="mt-6">
                <button
                  className="w-full bg-primary text-primary-foreground py-2 rounded-md"
                  onClick={() => onComplete()}
                >
                  Generate Video
                </button>
              </div>
            </div>
          )
        }
      ];
    }

    return (
      <UnifiedFlow
        title={
          mode === "clipper" 
            ? "Smart Clipper" 
            : mode === "avatar" 
            ? "Avatar Creator" 
            : "Video Generator"
        }
        subtitle={
          mode === "clipper" 
            ? "Extract the best parts of your video" 
            : mode === "avatar" 
            ? "Create an AI avatar video" 
            : "Generate a complete video from your idea"
        }
        steps={flowSteps}
        onComplete={handleComplete}
      />
    );
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default VideoCreator;
