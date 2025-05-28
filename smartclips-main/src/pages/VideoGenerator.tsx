import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Loader,
  ArrowRight,
  CheckCircle,
  Video,
  Image,
  Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockGenerateScript,
  ScriptGenerationOptions,
} from "@/services/videoGenerationService";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/Dashboard";
import PromptBasedGenerator from "@/components/video-generator/PromptBasedGenerator";

const Step1Schema = z.object({
  prompt: z
    .string()
    .min(10, "Please enter a more detailed prompt (at least 10 characters)"),
  image: z
    .string()
    .min(10, "Please enter a more detailed prompt (at least 10 characters)"),
  platform: z.string(),
  duration: z.string(),
});

const Step2Schema = z.object({
  voice: z.any(),
  mediaType: z.enum(["stock", "ai"]),
});

const VideoGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedScenes, setGeneratedScenes] = useState("");
  const [elevenLabVoices, setElevenLabVoices] = useState(null);
  const [step1Data, setStep1Data] = useState<z.infer<
    typeof Step1Schema
  > | null>(null);
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string>("");
  const [platform, setPlatform] = useState("");
  const [generationMode, setGenerationMode] = useState<"advanced" | "prompt">(
    "advanced"
  );

  const handleVoiceChange = (voiceId: string) => {
    const selectedVoice = elevenLabVoices.find((v) => v.voice_id === voiceId);
    if (selectedVoice) {
      setCurrentPreview(selectedVoice.preview_url);

      // Stop previous audio if playing
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const newAudio = new Audio(selectedVoice.preview_url);
      setAudio(newAudio);
      // newAudio.play();
    }
  };

  const step1Form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      prompt: "",
      platform: "youtube",
      duration: "medium",
      image: "",
    },
  });

  const step2Form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      platform: "",
      voice: null,
      mediaType: "ai",
    },
  });

  const onSubmitStep1 = async (values: z.infer<typeof Step1Schema>) => {
    setIsLoading(true);

    try {
      // Map duration string to an integer
      const durationMap = {
        short: 30, // 15-30 seconds
        medium: 60, // 30-90 seconds
        long: 180, // 2-5 minutes
      };

      const requestData = {
        image: values.image,
        prompt: values.prompt,
        platform: values.platform,
        duration: durationMap[values.duration], // Convert duration to an integer
      };

      // Make the API call to your FastAPI /generate endpoint
      // const response = await fetch("https://smartclips.onrender.com/generate", {
      //   // Update with your API's base URL
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(requestData),
      // });

      await fetch("https://smartclips.onrender.com/get-el-voices")
        .then((res) => res.json())
        .then((data) => setElevenLabVoices(data.voices));

      console.log(elevenLabVoices, "Hello");

      // // Check if the response is successful
      // if (!response.ok) {
      //   throw new Error(`Failed to generate script: ${response.statusText}`);
      // }

      // // Parse the response as JSON
      // const data = await response.json();

      // // Assuming the response has 'script' and 'scenes'
      // setGeneratedScript(data.script);
      // setGeneratedScenes(data.scenes || ""); // You can adjust if you want scenes or not
      setStep1Data(values);

      toast({
        title: "Script generated successfully",
        description: "Review the script and select media options",
      });

      setCurrentStep(2);
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "Failed to generate script",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptGenerateComplete = (url: string) => {
    setVideoUrl(url);
    setCurrentStep(3);
  };

  const onSubmitStep2 = async (values: z.infer<typeof Step2Schema>) => {
    setIsLoading(true);

    try {
      // Parse the script into scenes and narrations
      const scenes: { scene: string; narration: string }[] = [];
      const sceneBlocks = generatedScript.split(/SCENE \d+:/g).filter(Boolean);

      sceneBlocks.forEach((block) => {
        const [scenePart, narratorPart] = block.split(/NARRATOR:/);
        if (scenePart && narratorPart) {
          scenes.push({
            scene: scenePart.trim(),
            narration: narratorPart.trim(),
          });
        }
      });

      // Collect all audio and image file paths for each scene
      const audioFiles: string[] = [];
      const imageFiles: string[] = [];

      // Sequentially send each scene to generate-audio and generate-image
      for (let i = 0; i < scenes.length; i++) {
        const { scene, narration } = scenes[i];

        const audioResponse = await fetch(
          "https://smartclips.onrender.com/generate-audio",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: step1Data?.platform || "",
              script_text: narration,
              session_name: "example_session", // <-- Add your session name here
              scene_number: i + 1, // <-- Scene number starts from 1
              voice_type: values.voice || "",
            }),
          }
        );

        const audioData = await audioResponse.json();
        audioFiles.push(audioData.audio_path); // Collect the audio file path

        const imageResponse = await fetch(
          "https://smartclips.onrender.com/generate-image",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              script: { script: scene },
              session_name: "example_session", // <-- Add your session name here
              scene_number: i + 1, // <-- Scene number starts from 1
              mediaType: values.mediaType,
              platform: step1Data?.platform || "",
            }),
          }
        );

        const imageData = await imageResponse.json();
        imageFiles.push(imageData.image_path); // Collect the image file path
      }

      // After all audio and images are generated, trigger the video generation
      const videoResponse = await fetch(
        "https://smartclips.onrender.com/generate-video",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_name: "example_session",
            audio_files: audioFiles,
            image_files: imageFiles,
            platform: step1Data?.platform || "",
          }),
        }
      );

      const videoData = await videoResponse.json();
      setVideoUrl(
        `https://smartclips.onrender.com/${videoData.final_video_path}`
      ); // Set the video URL after generation
      toast({
        title: "Video generation started",
        description: "Your video is being created and will be ready soon",
      });

      setCurrentStep(3);
    } catch (error) {
      console.error("Error generating video:", error);
      toast({
        title: "Failed to generate video",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto w-full mt-20">
      <h1 className="text-3xl font-bold mb-2 gradient-text">
        Create Your Video
      </h1>l
      <p className="text-muted-foreground mb-8">
        Enter your video details to generate a script
      </p>
Cide
      <Form {...step1Form}>
        <form
          onSubmit={step1Form.handleSubmit(onSubmitStep1)}
          className="space-y-8"
        >
          <FormField
            control={step1Form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  What's your video about?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you want in your video..."
                    className="min-h-[150px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Be specific about the topic, style, and key points to cover
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={step1Form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">
                  Describe the type of visuals you'd like to have?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you want the visuals to look like in your video..."
                    className="min-h-[150pppx] text-base"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Be specific about the style of the images
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={step1Form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Platform</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The platform where you'll post your video
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={step1Form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="short">Short (15-30s)</SelectItem>
                      <SelectItem value="medium">Medium (30-90s)</SelectItem>
                      <SelectItem value="long">Long (2-5 min)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How long should your video be
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                Generate Video Script <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2 gradient-text">
        Review Your Script
      </h1>
      <p className="text-muted-foreground mb-6">
        Choose voice and media options for your video
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Generated Script</h2>
          <div className="bg-muted p-4 rounded-md overflow-y-auto max-h-[500px]">
            <pre className="text-sm whitespace-pre-wrap">{generatedScript}</pre>
          </div>

          {generatedScenes && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Visual Scenes</h3>
              <div className="bg-muted p-4 rounded-md overflow-y-auto max-h-[200px]">
                <pre className="text-sm whitespace-pre-wrap">
                  {generatedScenes}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div>
          <Form {...step2Form}>
            <form
              onSubmit={step2Form.handleSubmit(onSubmitStep2)}
              className="space-y-8"
            >
              <FormField
                control={step2Form.control}
                name="voice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Voice</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        handleVoiceChange(val);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {elevenLabVoices.map((voice: any) => (
                          <SelectItem
                            key={voice.voice_id}
                            value={voice.voice_id}
                          >
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a voice to preview how it will sound
                    </FormDescription>
                    {currentPreview && (
                      <div className="mt-2">
                        <audio controls src={currentPreview} />
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={step2Form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Media Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                          <RadioGroupItem
                            value="ai"
                            id="ai"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="ai"
                            className="cursor-pointer text-center"
                          >
                            <Image size={32} className="mx-auto mb-2" />
                            <div className="font-medium">AI Generated</div>
                            <div className="text-xs text-muted-foreground">
                              Create unique visuals with AI
                            </div>
                          </Label>
                        </div>
                        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
                          <RadioGroupItem
                            value="stock"
                            id="stock"
                            className="sr-only"
                          />
                          <Label
                            htmlFor="stock"
                            className="cursor-pointer text-center"
                          >
                            <Video size={32} className="mx-auto mb-2" />
                            <div className="font-medium">Stock Media</div>
                            <div className="text-xs text-muted-foreground">
                              Use professional stock footage
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose what type of media to use in your video
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back to Script
                </Button>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Create Video <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto w-full text-center">
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2 gradient-text">
          Your Video is Ready!
        </h1>
        <p className="text-muted-foreground mb-8">
          We're creating your video with{" "}
          {step2Form.getValues().mediaType === "ai" ? "AI-generated" : "stock"}{" "}
          media and a {step2Form.getValues().voice} voice narration.
        </p>

        {/* Video Player Section */}
        {videoUrl ? (
          <div className="mb-8">
            <video controls className="w-full h-auto">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground">
              Video is being processed. Please wait.
            </div>
            <div className="relative w-full h-4 bg-secondary rounded-full overflow-hidden mb-8">
              <div className="absolute top-0 left-0 h-full bg-primary animate-progress"></div>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              This process typically takes 2-5 minutes. You'll receive a
              notification when your video is ready.
            </p>
          </>
        )}

        <Button onClick={() => setCurrentStep(1)} variant="outline">
          Create Another Video
        </Button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">AI Video Generator</h1>
        <p className="text-muted-foreground mb-8">
          Describe your video to generate it.
        </p>
        <div className="bg-card border border-border rounded-lg p-8">
          {currentStep === 1 ? (
            <Tabs
              defaultValue="advanced"
              onValueChange={(value) =>
                setGenerationMode(value as "advanced" | "prompt")
              }
            >
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
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

              <TabsContent value="advanced">{renderStep1()}</TabsContent>

              <TabsContent value="prompt">
                <PromptBasedGenerator
                  onGenerateComplete={handlePromptGenerateComplete}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="pt-12">
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoGenerator;
