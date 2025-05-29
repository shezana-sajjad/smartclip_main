
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoIcon, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-4 bg-gradient-to-r from-brand-purple/20 to-brand-blue/20">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl">
                Transform Your Videos with <span className="gradient-text">AI Technology</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl">
                Smart video editing tools that let you clip, create avatars, and generate
                professional videos in minutes, not hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/smart-clipper">
                  <Button size="lg" className="bg-gradient-purple-blue hover:opacity-90 transition-opacity">
                    Start Creating Now
                  </Button>
                </Link>
                <Link to="/video-generator">
                  <Button size="lg" variant="outline">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-brand-dark">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              All-in-One <span className="gradient-text">Video Creator</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Smart Clipper"
                description="Upload any video and our AI will identify and clip the most engaging segments automatically."
                icon={<VideoIcon className="h-12 w-12 text-primary" />}
                linkTo="/smart-clipper"
              />
              
              <FeatureCard 
                title="Avatar Creator"
                description="Generate split-screen videos with AI avatars that look and sound natural with your custom script."
                icon={<VideoIcon className="h-12 w-12 text-primary" />}
                linkTo="/avatar-creator"
              />
              
              <FeatureCard 
                title="Video Generator"
                description="Turn your video ideas into compelling videos with AI-generated visuals that bring them to life."
                icon={<VideoIcon className="h-12 w-12 text-primary" />}
                linkTo="/video-generator"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              How It <span className="gradient-text">Works</span>
            </h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-xl font-bold mb-3">1. Choose Your Tool</h3>
                  <p className="text-foreground/70">
                    Select whether you want to clip videos, create avatar videos, or generate videos from scratch.
                  </p>
                </div>
                <div className="flex-1 order-1 md:order-2 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">1</span>
                  </div>
                </div>
              </div>
              
              <div className="h-12 md:h-24 flex justify-center">
                <div className="h-full w-px bg-border"></div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 order-1">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">2</span>
                  </div>
                </div>
                <div className="flex-1 order-2">
                  <h3 className="text-xl font-bold mb-3">2. Follow Simple Steps</h3>
                  <p className="text-foreground/70">
                    Our intuitive flow system guides you through the process, making it easy to create professional videos.
                  </p>
                </div>
              </div>
              
              <div className="h-12 md:h-24 flex justify-center">
                <div className="h-full w-px bg-border"></div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-xl font-bold mb-3">3. Download & Share</h3>
                  <p className="text-foreground/70">
                    Get your finished video in seconds and share it directly to social media or download for later use.
                  </p>
                </div>
                <div className="flex-1 order-1 md:order-2 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-brand-purple/20 to-brand-blue/20">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Create Amazing Videos?
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              Start transforming your video content today with our powerful AI tools.
            </p>
            <Link to="/smart-clipper">
              <Button size="lg" className="bg-gradient-purple-blue hover:opacity-90 transition-opacity">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center gap-2">
                <VideoIcon className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl gradient-text">SmartClips.io</span>
              </Link>
              <p className="text-foreground/60 mt-2">AI-powered video transformation</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold mb-3">Tools</h3>
                <ul className="space-y-2">
                  <li><Link to="/smart-clipper" className="text-foreground/60 hover:text-foreground transition-colors">Smart Clipper</Link></li>
                  <li><Link to="/avatar-creator" className="text-foreground/60 hover:text-foreground transition-colors">Avatar Creator</Link></li>
                  <li><Link to="/video-generator" className="text-foreground/60 hover:text-foreground transition-colors">Video Generator</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-foreground/60 hover:text-foreground transition-colors">About</Link></li>
                  <li><Link to="/contact" className="text-foreground/60 hover:text-foreground transition-colors">Contact</Link></li>
                  <li><Link to="/privacy" className="text-foreground/60 hover:text-foreground transition-colors">Privacy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-border/30 text-center text-foreground/60">
            <p>© {new Date().getFullYear()} SmartClips.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  linkTo 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
  linkTo: string;
}) => {
  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 transition-all group">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/70 mb-4">{description}</p>
      <Link 
        to={linkTo} 
        className="flex items-center text-primary hover:underline group-hover:translate-x-1 transition-transform"
      >
        Try it now <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
};

export default Index;
