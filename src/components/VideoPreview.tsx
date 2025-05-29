
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPreviewProps {
  file: File;
  className?: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ file, className = "" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  useEffect(() => {
    if (videoRef.current) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      
      return () => {
        URL.revokeObjectURL(videoURL);
      };
    }
  }, [file]);
  
  useEffect(() => {
    const video = videoRef.current;
    
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className={`rounded-lg overflow-hidden bg-black ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-auto" 
        muted={isMuted}
        playsInline
      />
      
      <div className="p-2 bg-black/90 flex items-center gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-white" 
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        <span className="text-xs text-white">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-white"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoPreview;
