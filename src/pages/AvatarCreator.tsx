import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Video, 
  Upload, 
  Sparkles, 
  SplitSquareVertical, 
  Loader, 
  ArrowRight, 
  Wand2,
  LayoutPanelLeft,
  Layout,
  ImageDown,
  PictureInPicture,
  VideoIcon,
  UserCircle2
} from "lucide-react";
import { 
  generateAvatarPreview, 
  generateFinalAvatarVideo,
  getHeygenAvatars 
} from "@/services/avatarService";
import { mockGenerateAvatarScript } from "@/services/avatarScriptService";
import AvatarSelection from "@/components/avatar-creator/AvatarSelection";
import VideoUploaderWithAPI from "@/components/VideoUploaderWithAPI";
import MinimalPromptInterface from "@/components/MinimalPromptInterface";
import { RadioCard } from "@/components/ui/radio-card";

const AvatarCreator = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [avatars, setAvatars] = useState(getHeygenAvatars());
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [videoMode, setVideoMode] = useState<"upload" | "generate">("generate");
  const [backgroundVideo, setBackgroundVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [voiceType, setVoiceType] = useState<string>("natural");
  const [platform, setPlatform] = useState<string>("youtube");
  const [caption, setCaption] = useState<string>("");
  const [creationMode, setCreationMode] = useState<"advanced" | "prompt">("advanced");
  const [avatarPosition, setAvatarPosition] = useState<string>("right");
  const [videoType, setVideoType] = useState<"avatar-only" | "with-video">("with-video");
  const [scriptTopic, setScriptTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  const handleNext = () => {
    if (currentStep === 1 && !selectedAvatar) {
      toast({
        title: "Avatar required",
        description: "Please select an avatar to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2 && !script.trim()) {
      toast({
        title: "Script required",
        description: "Please write a script for your avatar",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 3 && videoType === "with-video" && videoMode === "upload" && !backgroundVideo) {
      toast({
        title: "Background video required",
        description: "Please upload a background video or switch to generate mode",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleGeneratePreview = async () => {
    if (!selectedAvatar || !script.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an avatar and write a script",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateAvatarPreview({
        avatarId: selectedAvatar,
        script,
        voiceType,
        backgroundVideo
      });
      
      if (result.status === 'success') {
        setPreviewUrl(result.previewUrl);
        toast({
          title: "Preview generated",
          description: "Your avatar preview is ready"
        });
      } else {
        throw new Error(result.message || "Failed to generate preview");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Preview generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateFinal = async () => {
    if (!selectedAvatar || !script.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const result = await generateFinalAvatarVideo({
        avatarId: selectedAvatar,
        script,
        voiceType,
        backgroundVideo
      });
      
      if (result.status === 'success') {
        setFinalVideoUrl(result.previewUrl);
        toast({
          title: "Video generated",
          description: "Your avatar video is ready"
        });
        setCurrentStep(4);
      } else {
        throw new Error(result.message || "Failed to generate video");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Video generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleVideoUpload = (file: File) => {
    setBackgroundVideo(file);
  };

  const handlePromptSubmit = async (promptText: string) => {
    if (!promptText.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for your avatar video",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Make API call to backend for prompt-based avatar video generation
      const response = await fetch("https://smartclips.onrender.com/generate-avatar-from-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate avatar video: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Set the final video URL and skip to the final step
      setFinalVideoUrl(data.video_url);
      setCurrentStep(4);
      
      toast({
        title: "Avatar video generated",
        description: "Your avatar video is ready to watch",
      });
    } catch (error) {
      console.error("Error generating avatar video:", error);
      toast({
        title: "Failed to generate avatar video",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateScript = async () => {
    if (!scriptTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your script",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingScript(true);

    try {
      // Use the avatar script service instead of directly calling an API
      const result = await mockGenerateAvatarScript({
        topic: scriptTopic,
        targetAudience: targetAudience || "general audience",
        voiceType: voiceType || "professional",
        platform: platform || "youtube",
        duration: "1-2 minutes",
        callToAction: caption || "Learn more about this topic"
      });

      if (result.status === 'success') {
        setScript(result.script);
        
        toast({
          title: "Script generated",
          description: "A script has been generated based on your topic",
        });
      } else {
        throw new Error(result.message || "Failed to generate script");
      }
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "Script generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };
  
  const renderAdvancedMode = () => {
    if (currentStep === 1) return renderStep1();
    if (currentStep === 2) return renderStep2();
    if (currentStep === 3) return renderStep3();
    return renderStep4();
  };

  const renderPromptMode = () => (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Create an Avatar Video with AI</h2>
          <p className="text-muted-foreground">
            Describe what you want your avatar to say and how it should look. Our AI will handle the rest.
          </p>
        </div>

        <MinimalPromptInterface
          title="What kind of avatar video would you like to create?"
          description="Include details about the avatar, script, background, and any special requirements"
          placeholder="e.g., Create a professional-looking female avatar explaining the benefits of solar energy with a modern office background. The avatar should sound enthusiastic and the video should be optimized for LinkedIn."
          onSubmit={handlePromptSubmit}
          disabled={isGenerating}
          suggestions={[
            "Create a business avatar explaining my company's services",
            "Generate an educational video with a teacher avatar",
            "Make a promotional avatar video for social media"
          ]}
        />

        {isGenerating && (
          <div className="text-center mt-8">
            <Loader className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">
              Generating your avatar video... This may take a few minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Choose Your Avatar</h2>
        <p className="text-muted-foreground mb-6">
          Select the AI avatar that will present your content
        </p>
      </div>
      
      <AvatarSelection 
        avatars={avatars}
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
      />
      
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Video Type</h3>
        <RadioCard
          value={videoType}
          onValueChange={(value) => {
            // Ensure we only set valid values for our state
            if (value === "avatar-only" || value === "with-video") {
              setVideoType(value);
            }
          }}
          options={[
            {
              value: "avatar-only",
              label: "Avatar Only",
              icon: <UserCircle2 className="h-10 w-10 text-primary" />,
              description: "Just the avatar with a simple background",
            },
            {
              value: "with-video",
              label: "Avatar with Background Video",
              icon: <VideoIcon className="h-10 w-10 text-primary" />,
              description: "Avatar appears alongside background video content",
            }
          ]}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedAvatar}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Write Your Script</h2>
        <p className="text-muted-foreground mb-6">
          Create the script your avatar will say in the video
        </p>
      </div>
      
      <div className="space-y-4">
        {/* AI Script Generator */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
          <h3 className="text-md font-medium mb-3">Generate a Script with AI</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <Input 
                placeholder="Enter the main topic for your script..."
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Target Audience (Optional)</label>
              <Input 
                placeholder="Who is this video for? (e.g. beginners, professionals)"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleGenerateScript} 
              disabled={isGeneratingScript || !scriptTopic.trim()}
              variant="secondary"
              className="w-full"
            >
              {isGeneratingScript ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate Script
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Script</label>
          <Textarea
            placeholder="Write what you want your avatar to say..."
            className="min-h-[200px]"
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Write natural conversational text. Include pauses with [pause] where needed.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice Type</label>
          <Select value={voiceType} onValueChange={setVoiceType}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Natural</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!script.trim()}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Background & Settings</h2>
        <p className="text-muted-foreground mb-6">
          Choose how to create your video background
        </p>
      </div>
      
      <div className="mb-6">
        {/* Video Platform Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium block">Target Platform</label>
          <RadioCard
            value={platform}
            onValueChange={setPlatform}
            options={[
              {
                value: "youtube",
                label: "YouTube",
                description: "Landscape 16:9 format",
              },
              {
                value: "tiktok",
                label: "TikTok/Reels",
                description: "Vertical 9:16 format",
              },
              {
                value: "linkedin",
                label: "LinkedIn",
                description: "Professional style",
              },
              {
                value: "instagram",
                label: "Instagram",
                description: "Square 1:1 format",
              }
            ]}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          />
        </div>
        
        {videoType === "with-video" && (
          <div className="bg-muted p-4 rounded-md mb-6">
            <div className="flex space-x-4 mb-4">
              <Button
                variant={videoMode === "generate" ? "default" : "outline"}
                onClick={() => setVideoMode("generate")}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Generate Background
              </Button>
              <Button
                variant={videoMode === "upload" ? "default" : "outline"}
                onClick={() => setVideoMode("upload")}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Background
              </Button>
            </div>
            
            {videoMode === "upload" ? (
              <VideoUploaderWithAPI 
                onUploadComplete={handleVideoUpload}
                uploadToServer={false}
              />
            ) : (
              <div className="space-y-4">
                <p className="text-sm">We'll generate a fitting background based on your content</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Background Style</label>
                    <Select defaultValue="office">
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium block mb-2">Avatar Position</label>
            {platform === "tiktok" ? (
              <p className="text-sm text-muted-foreground mb-2">
                For vertical video formats like TikTok, the avatar will appear centered or at the bottom.
              </p>
            ) : null}
            
            <RadioCard
              value={avatarPosition}
              onValueChange={setAvatarPosition}
              options={
                platform === "tiktok" ? 
                [
                  {
                    value: "center",
                    label: "Centered",
                    icon: <Layout className="h-10 w-10 text-primary" />,
                    description: "Avatar appears in center of vertical video",
                  },
                  {
                    value: "bottom",
                    label: "Bottom Overlay",
                    icon: <PictureInPicture className="h-10 w-10 text-primary" />,
                    description: "Small avatar overlay at the bottom",
                  }
                ] : 
                [
                  {
                    value: "left",
                    label: "Left Side",
                    icon: <LayoutPanelLeft className="h-10 w-10 text-primary" />,
                    description: "Position the avatar on the left side of the video",
                  },
                  {
                    value: "right",
                    label: "Right Side",
                    icon: <Layout className="h-10 w-10 text-primary" />,
                    description: "Position the avatar on the right side of the video",
                  },
                  {
                    value: "bottom",
                    label: "Small Overlay",
                    icon: <PictureInPicture className="h-10 w-10 text-primary" />,
                    description: "Small avatar overlay in the bottom corner",
                  }
                ]
              }
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Caption Style</label>
            <Select defaultValue="subtitles">
              <SelectTrigger>
                <SelectValue placeholder="Select caption style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Captions</SelectItem>
                <SelectItem value="subtitles">Subtitles</SelectItem>
                <SelectItem value="highlighted">Highlighted Words</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Custom Caption (Optional)</label>
            <Textarea 
              placeholder="Add custom text to appear on your video..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleGeneratePreview} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              Generate Preview <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {previewUrl && (
        <div className="mt-8 border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Preview</h3>
          <div className="relative">
            <video controls className="w-full h-auto rounded-md">
              <source src={previewUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 right-4 text-xs bg-black/60 text-white px-2 py-1 rounded">
              Platform: {platform} | Position: {avatarPosition}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerateFinal} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Create Final Video <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Your Avatar Video is Ready!</h2>
      
      <div className="border border-border rounded-lg p-6 mx-auto max-w-xl">
        {finalVideoUrl ? (
          <video controls className="w-full h-auto rounded-md mb-6">
            <source src={finalVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p>Your video is being processed...</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            Create New Video
          </Button>
          <Button disabled={!finalVideoUrl}>
            Download Video
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Avatar Creator</h1>
        <p className="text-muted-foreground mb-8">
          Create engaging avatar videos with AI-generated visuals
        </p>
        
        <div className="bg-card border border-border rounded-lg p-8">
          {/* In Step 1, show the mode selection tabs */}
          {(creationMode === "prompt" || currentStep === 1) && (
            <Tabs 
              defaultValue={creationMode} 
              onValueChange={(value) => setCreationMode(value as "advanced" | "prompt")}
              className="mb-8"
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="advanced">
                  <span className="flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Advanced
                  </span>
                </TabsTrigger>
                <TabsTrigger value="prompt">
                  <span className="flex items-center">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Quick Prompt
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {/* Progress indicator (only show on advanced mode) */}
          {creationMode === "advanced" && (
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  >
                    {step}
                  </div>
                  {index < 3 && (
                    <div 
                      className={`h-1 w-16
                        ${step < currentStep ? 'bg-primary' : 'bg-secondary'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          
          {/* Content based on mode */}
          {creationMode === "advanced" ? renderAdvancedMode() : renderPromptMode()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AvatarCreator;