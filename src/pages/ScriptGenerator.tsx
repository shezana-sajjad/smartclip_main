
import React from 'react';
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import AIPromptInterface from "@/components/AIPromptInterface";
import { toast } from "@/hooks/use-toast";

const ScriptGenerator = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handlePromptSubmit = (prompt) => {
    toast({
      title: "Generating script",
      description: "Your script is being generated...",
    });
    
    // Simulate script generation
    setTimeout(() => {
      toast({
        title: "Script generated",
        description: "Your script has been generated successfully.",
      });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Script Generator</h1>
        <p className="text-muted-foreground mb-8">
          Generate compelling scripts and turn them into videos
        </p>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generate a Script</h2>
            <p className="text-muted-foreground mb-6">
              Describe what kind of video you want to create, and our AI will generate a script for you.
            </p>
            <AIPromptInterface 
              placeholder="Describe the video you want to create..."
              onSubmit={handlePromptSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ScriptGenerator;
