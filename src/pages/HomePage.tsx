
import React from "react";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, VideoIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/landing" />;
  }

  const featuredTools = [
    {
      title: "Smart Clipper",
      description: "Extract the most interesting segments from your videos",
      icon: Scissors,
      link: "/smart-clipper"
    },
    {
      title: "Avatar Creator",
      description: "Create engaging avatar videos with AI-generated visuals",
      icon: VideoIcon,
      link: "/avatar-creator"
    },
    {
      title: "Script Generator",
      description: "Generate compelling scripts and turn them into videos",
      icon: BookOpen,
      link: "/script-generator"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to SmartClips.io</h1>
          <p className="text-muted-foreground mt-1">
            Your all-in-one AI video creation platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <Card key={tool.title} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Link to={tool.link}>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Using
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to SmartClips! Here are a few things you can do:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Smart Clipper to automatically identify and extract engaging parts of your videos</li>
              <li>Create avatar videos with our AI Split Screen tool</li>
              <li>Generate scripts and have AI create videos based on your ideas</li>
            </ul>
            <Link to="/dashboard">
              <Button className="mt-2">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
