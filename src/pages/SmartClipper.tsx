import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WithChildren } from "@/components/types";
import VideoUploaderWithAPI from "@/components/VideoUploaderWithAPI";
import AIPromptInterface from "@/components/AIPromptInterface";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Form schema
const clipFormSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
  maxClips: z.number().min(1).max(10).default(3),
  clipDuration: z.number().min(10).max(60).default(30),
});

type ClipFormValues = z.infer<typeof clipFormSchema>;

interface VideoClip {
  id: string;
  url: string;
  title: string;
  duration: string;
}

const Layout = ({ children }: WithChildren) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Smart Clipper</h1>
      <p className="text-foreground/70 mb-8">
        Upload a video and use AI prompts to automatically clip it into engaging
        segments.
      </p>
      {children}
    </div>
  );
};

const SmartClipper = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clips, setClips] = useState<VideoClip[]>([]);

  const form = useForm<ClipFormValues>({
    resolver: zodResolver(clipFormSchema),
    defaultValues: {
      prompt: "",
      maxClips: 3,
      clipDuration: 30,
    },
  });

  const handleUpload = async (file: File) => {
    try {
      setVideoFile(file);
      setIsProcessing(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_cloudinary_upload_preset"); // Replace with your upload preset

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dnr6jc1yr/video/upload`, // Replace with your cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) throw new Error("Upload to Cloudinary failed");

      const uploadResult = await uploadResponse.json();
      setCloudinaryUrl(uploadResult.secure_url);

      toast({
        title: "Video uploaded",
        description:
          "Your video has been uploaded successfully. Now fill out the form to clip it.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (values: ClipFormValues) => {
    if (!cloudinaryUrl) {
      toast({
        title: "Error",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:8080/api/clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: cloudinaryUrl,
          prompt: values.prompt,
          maxClips: values.maxClips,
          clipDuration: values.clipDuration,
        }),
      });

      if (!response.ok) throw new Error("Failed to process video");

      const data = await response.json();

      setClips(
        data.clips.map((clip: any, index: number) => ({
          id: `clip-${index}`,
          url: clip.url,
          title: `Clip ${index + 1}`,
          duration: clip.duration,
        }))
      );

      toast({
        title: "Processing complete",
        description: `Generated ${data.clips.length} clips based on your prompt.`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description:
          error instanceof Error ? error.message : "Failed to process video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <Layout>
        {!videoFile ? (
          <VideoUploaderWithAPI
            description="Upload a video file to get started. We support MP4, MOV, and AVI formats."
            onUploadComplete={handleUpload}
            uploadToServer={false}
            acceptedFormats="video/mp4,video/quicktime,video/avi"
            minDuration={10}
            maxDuration={600}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Configure Clip Settings
              </h2>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how you want the video to be clipped..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about what content you want to extract
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxClips"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Clips</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clipDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clip Duration (seconds)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Generate Clips"}
                  </Button>
                </form>
              </Form>
            </div>

            {clips.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Clips</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clips.map((clip) => (
                    <div key={clip.id} className="border rounded-lg p-4">
                      <video
                        src={clip.url}
                        controls
                        className="w-full rounded-lg mb-2"
                      />
                      <p className="font-medium">{clip.title}</p>
                      <p className="text-sm text-foreground/70">
                        Duration: {clip.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setVideoFile(null);
                  setCloudinaryUrl(null);
                  setClips([]);
                  form.reset();
                }}
              >
                Upload Different Video
              </Button>
            </div>
          </div>
        )}
      </Layout>
    </DashboardLayout>
  );
};

export default SmartClipper;
