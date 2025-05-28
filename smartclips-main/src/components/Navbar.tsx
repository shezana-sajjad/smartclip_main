
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoIcon, Menu, LogIn, Scissors, BookOpen, Image, Film, User } from "lucide-react";
import MobileNav from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full bg-background/60 backdrop-blur-md z-50 border-b border-border/30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <VideoIcon className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg gradient-text">SmartClips.io</span>
        </Link>

        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <MobileNav
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />
          </>
        ) : (
          <div className="flex items-center">
            <nav className="flex items-center gap-5 mr-4">
              <Link
                to="/smart-clipper"
                className="flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <Scissors className="h-3.5 w-3.5" />
                <span>Clip</span>
              </Link>
              <Link
                to="/avatar-creator"
                className="flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <Image className="h-3.5 w-3.5" />
                <span>Avatar</span>
              </Link>
              <Link
                to="/script-generator"
                className="flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Script</span>
              </Link>
              <Link
                to="/video-generator"
                className="flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <Film className="h-3.5 w-3.5" />
                <span>Generate</span>
              </Link>
            </nav>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <User className="h-3.5 w-3.5" /> Profile
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="sm" className="bg-gradient-purple-blue hover:opacity-90 transition-opacity">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="mr-2 h-3.5 w-3.5" /> Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-gradient-purple-blue hover:opacity-90 transition-opacity">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
