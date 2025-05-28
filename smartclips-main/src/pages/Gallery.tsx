
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/Dashboard";

const Gallery = () => {
  const { isAuthenticated } = useAuth();

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Gallery</h1>
        
        
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-muted-foreground">
            <p>Your gallery is empty.</p>
            <p className="mt-2">Start creating videos to see them here!</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Gallery;
