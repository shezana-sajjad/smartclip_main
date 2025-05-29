
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle, ChevronRight, User, FileText } from "lucide-react";

const steps = [
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Tell us more about yourself",
  },
  {
    id: "social",
    title: "Social Media Integration",
    description: "Connect your social media accounts",
  },
  {
    id: "complete",
    title: "All Done!",
    description: "Your account is now set up",
  }
];

type OnboardingStatus = {
  id: string;
  completed_steps: string[];
  is_completed: boolean;
}

const Onboarding = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    socialMedia: {
      twitter: "",
      instagram: "",
      tiktok: ""
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("onboarding_status")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setOnboardingStatus(data);
          
          // Find the first incomplete step
          const completedSteps = data.completed_steps || [];
          const firstIncompleteIndex = steps.findIndex(step => 
            !completedSteps.includes(step.id)
          );
          
          // If all steps are complete or it's the final step, go to the last step
          setCurrentStepIndex(firstIncompleteIndex === -1 ? steps.length - 1 : firstIncompleteIndex);
          
          // If onboarding is completed, redirect to dashboard
          if (data.is_completed) {
            navigate("/dashboard");
          }
        } else {
          // Create onboarding status
          await supabase
            .from("onboarding_status")
            .insert({
              id: user.id,
              completed_steps: [],
              is_completed: false
            });
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
      }
    };

    fetchOnboardingStatus();
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCompleteStep = async () => {
    if (!user || !onboardingStatus) return;
    
    setIsLoading(true);
    const currentStep = steps[currentStepIndex];
    
    try {
      // Mark step as completed
      const updatedSteps = [
        ...new Set([...onboardingStatus.completed_steps, currentStep.id])
      ];
      
      // Update onboarding status
      await supabase
        .from("onboarding_status")
        .update({
          completed_steps: updatedSteps,
          is_completed: currentStepIndex === steps.length - 2 // Mark as complete on the second-to-last step
        })
        .eq("id", user.id);
      
      // Update user profile data
      if (currentStep.id === "profile") {
        await updateProfile({
          full_name: form.fullName,
          bio: form.bio
        });
      }
      
      // Update social media preferences if we implement that feature later
      if (currentStep.id === "social") {
        // This could be stored in a separate table in the future
        console.log("Social media preferences:", form.socialMedia);
      }
      
      // Go to next step
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        toast({
          title: "Step completed",
          description: `${currentStep.title} completed successfully`,
        });
      } else {
        // If it's the last step, redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error completing step:", error);
      toast({
        title: "Error",
        description: "Failed to complete this step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const currentStep = steps[currentStepIndex];
    
    switch (currentStep.id) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="pl-10 min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );
      case "social":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your social media accounts to share your videos easily.
            </p>
            
            <div className="space-y-2">
              <label htmlFor="twitter" className="text-sm font-medium">
                Twitter/X username (optional)
              </label>
              <Input
                id="twitter"
                name="socialMedia.twitter"
                value={form.socialMedia.twitter}
                onChange={handleInputChange}
                placeholder="@username"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="instagram" className="text-sm font-medium">
                Instagram username (optional)
              </label>
              <Input
                id="instagram"
                name="socialMedia.instagram"
                value={form.socialMedia.instagram}
                onChange={handleInputChange}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tiktok" className="text-sm font-medium">
                TikTok username (optional)
              </label>
              <Input
                id="tiktok"
                name="socialMedia.tiktok"
                value={form.socialMedia.tiktok}
                onChange={handleInputChange}
                placeholder="@username"
              />
            </div>
          </div>
        );
      case "complete":
        return (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 rounded-full p-6 w-24 h-24 mx-auto">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium">All set!</h3>
            <p className="text-muted-foreground">
              Your account is now ready. You can now start using QuikClips.
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="font-bold text-2xl gradient-text">Welcome to QuikClips</h1>
          <p className="text-muted-foreground mt-2">Let's set up your account</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center ${index === currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStepIndex ? 'bg-primary text-primary-foreground' : 
                  index === currentStepIndex ? 'border-2 border-primary text-primary' : 
                  'border border-muted-foreground'
                }`}>
                  {index < currentStepIndex ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStepIndex].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              {renderStepContent()}
            </div>
            
            <div className="flex justify-end gap-4">
              {currentStepIndex > 0 && currentStepIndex < steps.length - 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button 
                onClick={handleCompleteStep} 
                disabled={isLoading}
                className={`${currentStepIndex === steps.length - 1 ? 'bg-gradient-purple-blue' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    Processing<span className="animate-pulse-opacity">...</span>
                  </span>
                ) : currentStepIndex === steps.length - 1 ? (
                  "Go to Dashboard"
                ) : (
                  <>
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
