
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface HeygenAvatar {
  id: string;
  name: string;
  image: string;
}

interface AvatarSelectionProps {
  avatars: HeygenAvatar[];
  selectedAvatar: string | null;
  onSelect: (id: string) => void;
}

const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  avatars,
  selectedAvatar,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      {avatars.map(avatar => (
        <div 
          key={avatar.id} 
          className={`relative aspect-square cursor-pointer transition-all duration-200 ${
            selectedAvatar === avatar.id ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
          }`}
          onClick={() => onSelect(avatar.id)}
        >
          <img 
            src={avatar.image} 
            alt={avatar.name} 
            className="w-full h-full object-cover rounded-md"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 rounded-b-md">
            <p className="text-white text-sm text-center">{avatar.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvatarSelection;
