
import React from "react";
import { Link } from "react-router-dom";
import { X, LogIn, UserPlus, Scissors, Image, BookOpen, Film, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col p-6 animate-fade-in">
      <div className="flex justify-between mb-8">
        <span className="font-bold text-lg gradient-text">SmartClips.io</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <nav className="flex flex-col items-start gap-6 text-lg mb-8">
        <Link
          to="/smart-clipper"
          className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <Scissors className="h-4 w-4" />
          <span>Clip Videos</span>
        </Link>
        <Link
          to="/avatar-creator"
          className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <Image className="h-4 w-4" />
          <span>Create Avatar</span>
        </Link>
        <Link
          to="/script-generator"
          className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <BookOpen className="h-4 w-4" />
          <span>Write Scripts</span>
        </Link>
        <Link
          to="/video-generator"
          className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <Film className="h-4 w-4" />
          <span>Generate Videos</span>
        </Link>
      </nav>
      
      <div className="flex items-center mt-auto">
        <ThemeToggle />
      </div>
      
      {isAuthenticated ? (
        <div className="space-y-3 mt-4">
          <Link to="/profile" onClick={onClose} className="block w-full">
            <Button variant="outline" className="w-full">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link to="/dashboard" onClick={onClose} className="block w-full">
            <Button className="w-full">
              Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground" 
            onClick={handleLogout}
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          <Link to="/login" onClick={onClose} className="block w-full">
            <Button variant="outline" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </Link>
          <Link to="/register" onClick={onClose} className="block w-full">
            <Button className="w-full bg-gradient-purple-blue hover:opacity-90">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign up
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
