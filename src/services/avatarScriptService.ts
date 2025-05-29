import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export interface ScriptGenerationRequest {
  topic: string;
  voiceType?: string;
  platform?: string;
  targetAudience?: string;
  duration?: string;
  callToAction?: string;
}

export interface ScriptGenerationResponse {
  script: string;
  status: "success" | "error";
  message?: string;
}

export const generateAvatarScript = async (
  request: ScriptGenerationRequest
): Promise<ScriptGenerationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-avatar-script",
      {
        body: request,
      }
    );

    if (error) {
      throw new Error(`Error: ${error.message}`);
    }

    return {
      script: data.script,
      status: "success",
    };
  } catch (error) {
    console.error("Error generating script:", error);
    toast({
      title: "Script Generation Failed",
      description:
        error instanceof Error ? error.message : "Failed to generate script",
      variant: "destructive",
    });

    return {
      script: "",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Mock implementation for development or when Supabase is not configured
export const mockGenerateAvatarScript = async (
  request: ScriptGenerationRequest
): Promise<ScriptGenerationResponse> => {
  console.log("Generating avatar script with options:", request);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const platform = request.platform || "YouTube";
  const voiceType = request.voiceType || "professional";

  const script = `Hi there! [small pause] I'm excited to talk to you today about ${
    request.topic
  }.

As someone who's passionate about this subject, I want to share some key insights with you.

[pause briefly]

${
  request.topic
} is becoming increasingly important in today's world. Whether you're new to this topic or have some experience, there's always something new to learn.

[gesture with hands]

First, let's talk about why this matters. Many people don't realize how ${
    request.topic
  } can impact their daily lives and future opportunities.

[pause for emphasis]

${
  request.targetAudience
    ? `As a ${request.targetAudience}, you might be wondering how this applies specifically to you.`
    : "You might be wondering how this applies specifically to you."
}

The answer is that understanding ${
    request.topic
  } gives you an advantage in navigating today's complex world.

[smile]

${
  request.callToAction
    ? request.callToAction
    : "Thanks for watching! If you found this helpful, make sure to like and subscribe for more content like this."
}`;

  return {
    script: script,
    status: "success",
  };
};
