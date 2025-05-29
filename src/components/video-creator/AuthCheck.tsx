
import React from "react";
import { Button } from "@/components/ui/button";

const AuthCheck: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Login Required</h2>
      <p className="text-muted-foreground mb-6">
        Please log in or register to access the video creation tools.
      </p>
      <div className="flex justify-center gap-4">
        <Button onClick={() => window.location.href = "/login"}>
          Login
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/register"}>
          Register
        </Button>
      </div>
    </div>
  );
};

export default AuthCheck;
