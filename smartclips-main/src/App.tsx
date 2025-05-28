
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ConfigurationBanner from './components/ConfigurationBanner';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import VideoCreator from './pages/VideoCreator';
import VideoEditor from './pages/VideoEditor';
import Gallery from './pages/Gallery';
import NotFound from './pages/NotFound';
import SmartClipper from './pages/SmartClipper';
import AvatarCreator from './pages/AvatarCreator';
import ScriptGenerator from './pages/ScriptGenerator';
import VideoGenerator from './pages/VideoGenerator';
import CloudinaryConfig from './pages/CloudinaryConfig';
import SocialIntegration from './pages/SocialIntegration';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import DashboardLayout from './components/Dashboard';
import HomePage from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ConfigurationBanner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/landing" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<VideoCreator />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/smart-clipper" element={<SmartClipper />} />
            <Route path="/avatar-creator" element={<AvatarCreator />} />
            <Route path="/script-generator" element={<ScriptGenerator />} />
            <Route path="/video-generator" element={<VideoGenerator />} />
            <Route path="/video-editor" element={<VideoEditor />} />
            <Route path="/editor" element={<VideoCreator />} />
            <Route path="/cloudinary" element={<CloudinaryConfig />} />
            <Route path="/social-integration" element={<SocialIntegration />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
