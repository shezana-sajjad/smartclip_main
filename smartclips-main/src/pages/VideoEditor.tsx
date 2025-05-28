
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard";

const VideoEditor = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Video Editor</h1>
        <p className="text-muted-foreground mb-8">
          Edit your videos with powerful tools
        </p>
        
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-muted-foreground">
            <p>Video editing features coming soon!</p>
            <p className="mt-2">Check back later for updates.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoEditor;
