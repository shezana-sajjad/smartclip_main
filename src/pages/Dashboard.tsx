import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Video, Clock, Scissors, Image, BookOpen, CreditCard, Users, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    videosGenerated: 0,
    clipsCreated: 0,
    minutesSaved: 0,
    totalUsers: 0,
    totalVideos: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch user's videos
        const { data: videos, error: videosError } = await supabase
          .from("videos")
          .select("*")
          .eq("user_id", user?.id);
          
        if (videosError) throw videosError;
        
        // Fetch user's clips - fixed the join query
        const { data: clips, error: clipsError } = await supabase
          .from("video_clips")
          .select("*")
          .in("video_id", videos?.map(video => video.id) || []);
        
        if (clipsError) throw clipsError;
        
        // Calculate minutes saved (rough estimate - 5 min per clip)
        const minutesSaved = clips?.length ? clips.length * 5 : 0;
        
        setStats(prev => ({
          ...prev,
          videosGenerated: videos?.length || 0,
          clipsCreated: clips?.length || 0,
          minutesSaved
        }));
        
        // Fetch admin stats if user is admin
        if (isAdmin) {
          const { count: userCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
            
          const { count: videoCount } = await supabase
            .from("videos")
            .select("*", { count: "exact", head: true });
          
          setStats(prev => ({
            ...prev,
            totalUsers: userCount || 0,
            totalVideos: videoCount || 0
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    
    if (user) {
      fetchUserStats();
    }
  }, [user, isAdmin]);

  const userStats = [
    {
      title: "Videos Generated",
      value: stats.videosGenerated.toString(),
      icon: Video,
    },
    {
      title: "Clips Created",
      value: stats.clipsCreated.toString(),
      icon: Scissors,
    },
    {
      title: "Minutes Saved",
      value: stats.minutesSaved.toString(),
      icon: Clock,
    },
  ];

  const adminStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
    },
    {
      title: "Total Videos",
      value: stats.totalVideos.toString(),
      icon: Video,
    },
  ];

  const features = [
    {
      title: "Smart Clipper",
      description: "Extract the most interesting segments from your videos",
      icon: Scissors,
      link: "/smart-clipper",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Avatar Creator",
      description: "Create engaging avatar videos with AI-generated visuals",
      icon: Image,
      link: "/avatar-creator",
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Script Generator",
      description: "Generate compelling scripts and turn them into videos",
      icon: BookOpen,
      link: "/script-generator",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username || 'User'}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/editor">
              <Button variant="outline">
                <Video className="mr-2 h-4 w-4" />
                Editor
              </Button>
            </Link>
            <Link to="/credits">
              <Button className="bg-gradient-purple-blue hover:opacity-90">
                <CreditCard className="mr-2 h-4 w-4" />
                <span className="font-medium">{user?.credits || 0} Credits</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userStats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isAdmin && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {adminStats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">{stat.title}</p>
                      <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Detailed analytics dashboard coming soon</p>
                  <Button className="mt-4" variant="outline">
                    View All Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Content Creation Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link} className="block">
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className={`${feature.bgColor} p-3 rounded-full w-fit mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't created any projects yet.</p>
              <Button className="mt-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
