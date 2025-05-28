
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Share2,
} from "lucide-react";

const SocialIntegration = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const socialPlatforms = [
    {
      name: "YouTube",
      icon: Youtube,
      color: "text-red-500",
      connected: false,
      url: "#",
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-500",
      connected: false,
      url: "#",
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "text-blue-400",
      connected: false,
      url: "#",
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      connected: false,
      url: "#",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      connected: false,
      url: "#",
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Social Integration</h1>
        <p className="text-muted-foreground mb-8">
          Connect your social media accounts for seamless video sharing
        </p>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2 h-5 w-5" />
                Connect Your Accounts
              </CardTitle>
              <CardDescription>
                Connect your social media accounts to directly share your videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialPlatforms.map((platform) => (
                  <div key={platform.name} className="flex justify-between items-center p-4 border rounded-md">
                    <div className="flex items-center">
                      <platform.icon className={`h-8 w-8 ${platform.color} mr-4`} />
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.connected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">
                      {platform.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sharing Preferences</CardTitle>
              <CardDescription>
                Configure how your content is shared to social platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-share new videos</p>
                    <p className="text-sm text-muted-foreground">Automatically share your new videos to connected platforms</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Include video hashtags</p>
                    <p className="text-sm text-muted-foreground">Add auto-generated hashtags to your social media posts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Custom branding</p>
                    <p className="text-sm text-muted-foreground">Include your brand watermark on shared videos</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SocialIntegration;
