
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Film, Scissors, Wand2, Layers, Split, Play, Pause, Clock, Save, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import VideoPreview from "@/components/VideoPreview";
import { trimVideo, adjustSpeed, applyEffect, createSplitScreen } from "@/services/videoEditingService";

interface VideoEditorProps {
  onBack: () => void;
  selectedVideo: string | null;
  selectedFile: File | null;
  isProcessing: boolean;
  handleTrimVideo: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  onBack,
  selectedVideo,
  selectedFile,
  isProcessing,
  handleTrimVideo
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  const [speedFactor, setSpeedFactor] = useState(1);
  const [selectedEffect, setSelectedEffect] = useState("normal");
  const [videoUrl, setVideoUrl] = useState<string | null>(selectedVideo);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [splitScreenFile, setSplitScreenFile] = useState<File | null>(null);
  const [splitLayout, setSplitLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  // Effects for video playback control
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setEndTime(Math.min(30, videoElement.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoRef.current, selectedVideo]);

  // Handle play/pause
  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  // Format time from seconds to MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle trimming video
  const handleTrim = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "No video selected",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction("trimming");
    
    try {
      // Assuming handleTrimVideo is now using our trimVideo service
      const result = await trimVideo(selectedFile, startTime, endTime, "dummy-token");
      setVideoUrl(result.url);
      toast({
        title: "Success",
        description: "Video trimmed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trim video",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle adjusting speed
  const handleAdjustSpeed = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "No video selected",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction("adjusting speed");
    
    try {
      const result = await adjustSpeed(selectedFile, speedFactor, "dummy-token");
      setVideoUrl(result.url);
      toast({
        title: "Success",
        description: `Video speed adjusted to ${speedFactor}x`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to adjust video speed",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle applying effects
  const handleApplyEffect = async () => {
    if (!selectedFile || selectedEffect === "normal") {
      toast({
        title: "Error",
        description: "No video or effect selected",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction("applying effect");
    
    try {
      const result = await applyEffect(selectedFile, selectedEffect, "dummy-token");
      setVideoUrl(result.url);
      toast({
        title: "Success",
        description: `${selectedEffect} effect applied`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply effect",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle split screen creation
  const handleCreateSplitScreen = async () => {
    if (!selectedFile || !splitScreenFile) {
      toast({
        title: "Error",
        description: "Both videos are required for split screen",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction("creating split screen");
    
    try {
      const result = await createSplitScreen(selectedFile, splitScreenFile, splitLayout, "dummy-token");
      setVideoUrl(result.url);
      toast({
        title: "Success",
        description: "Split screen video created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create split screen",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Handle second video upload for split screen
  const handleSplitScreenFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSplitScreenFile(event.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Video Editor</h1>
          <p className="text-muted-foreground mt-1">
            Edit your videos with powerful tools
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Video Creator
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[400px] flex items-center justify-center">
            <CardContent className="text-center p-6 w-full h-full">
              {videoUrl ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative">
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      className="w-full h-full object-contain"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</div>
                      <div className="flex-1">
                        <Slider 
                          value={[currentTime]} 
                          max={duration || 100} 
                          step={0.1} 
                          onValueChange={handleSeek}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedFile ? (
                <VideoPreview file={selectedFile} />
              ) : (
                <div className="rounded-lg border border-dashed border-border p-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Edit className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No video selected</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <Tabs defaultValue="trim">
              <TabsList className="w-full">
                <TabsTrigger value="trim" className="flex-1">
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim
                </TabsTrigger>
                <TabsTrigger value="speed" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Speed
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex-1">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Effects
                </TabsTrigger>
                <TabsTrigger value="split" className="flex-1">
                  <Split className="h-4 w-4 mr-2" />
                  Split
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="trim" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Trim Video</CardTitle>
                    <CardDescription>
                      Adjust the start and end points of your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-8 w-full bg-secondary rounded-md"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Time (sec)</Label>
                          <Input 
                            type="number" 
                            min={0} 
                            max={duration} 
                            value={startTime} 
                            onChange={e => setStartTime(Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>End Time (sec)</Label>
                          <Input 
                            type="number" 
                            min={startTime + 0.1} 
                            max={duration} 
                            value={endTime}
                            onChange={e => setEndTime(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleTrim}
                        disabled={!selectedFile || processingAction === "trimming"}
                      >
                        {processingAction === "trimming" ? "Processing..." : "Apply Trim"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speed" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Adjust Speed</CardTitle>
                    <CardDescription>
                      Change the playback speed of your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Speed Factor: {speedFactor}x</Label>
                        <Slider
                          min={0.25}
                          max={4}
                          step={0.25}
                          value={[speedFactor]}
                          onValueChange={([value]) => setSpeedFactor(value)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Slower (0.25x)</span>
                          <span>Normal (1x)</span>
                          <span>Faster (4x)</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleAdjustSpeed}
                        disabled={!selectedFile || processingAction === "adjusting speed"}
                      >
                        {processingAction === "adjusting speed" ? "Processing..." : "Apply Speed Change"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="effects">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Effects</CardTitle>
                    <CardDescription>
                      Apply visual effects to your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {["normal", "vintage", "dramatic", "blackwhite", "sepia", "vhs", "glitch", "blur"].map((effect) => (
                          <div 
                            key={effect} 
                            className={`aspect-video bg-secondary rounded flex items-center justify-center text-xs p-2 cursor-pointer ${selectedEffect === effect ? 'border-2 border-primary' : ''}`}
                            onClick={() => setSelectedEffect(effect)}
                          >
                            {effect.charAt(0).toUpperCase() + effect.slice(1)}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleApplyEffect}
                        disabled={!selectedFile || selectedEffect === "normal" || processingAction === "applying effect"}
                      >
                        {processingAction === "applying effect" ? "Processing..." : "Apply Effect"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="split">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Split Screen</CardTitle>
                    <CardDescription>
                      Create split-screen effects with two videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-video bg-secondary rounded flex items-center justify-center">
                          {selectedFile ? (
                            <span className="text-xs">Main Video Selected</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No Video</span>
                          )}
                        </div>
                        <div className="aspect-video bg-secondary rounded flex items-center justify-center">
                          {splitScreenFile ? (
                            <span className="text-xs">Second Video Selected</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No Video</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Second Video</Label>
                        <Input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleSplitScreenFileUpload} 
                        />
                      </div>

                      <div>
                        <Label>Layout</Label>
                        <Select 
                          value={splitLayout} 
                          onValueChange={(value) => setSplitLayout(value as 'horizontal' | 'vertical')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horizontal">Horizontal Split</SelectItem>
                            <SelectItem value="vertical">Vertical Split</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleCreateSplitScreen}
                        disabled={!selectedFile || !splitScreenFile || processingAction === "creating split screen"}
                      >
                        {processingAction === "creating split screen" ? "Processing..." : "Create Split Screen"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
              <CardDescription>
                Save your edited video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Format</Label>
                  <Select defaultValue="mp4">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">MP4</SelectItem>
                      <SelectItem value="webm">WebM</SelectItem>
                      <SelectItem value="gif">GIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quality</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    disabled={!videoUrl}
                    onClick={() => {
                      if (videoUrl) {
                        window.open(videoUrl, '_blank');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    className="w-full"
                    disabled={!videoUrl}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Video Properties</CardTitle>
              <CardDescription>
                Details about your video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {selectedFile && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedFile.type}</span>
                    </div>
                  </>
                )}
                {duration > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                )}
              </div>
              {!selectedFile && !videoUrl && (
                <p className="text-center text-muted-foreground text-sm mt-4">
                  No video selected
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
