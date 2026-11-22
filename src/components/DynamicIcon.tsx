import React from 'react';
import {
  Combine,
  Scissors,
  LayoutGrid,
  Trash2,
  Minimize2,
  Image,
  FileImage,
  FileText,
  RotateCw,
  Hash,
  Stamp,
  PenTool,
  Type,
  Lock,
  Unlock,
  File,
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Combine':
      return <Combine className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'LayoutGrid':
      return <LayoutGrid className={className} />;
    case 'Trash2':
      return <Trash2 className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'Image':
      return <Image className={className} />;
    case 'FileImage':
      return <FileImage className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'RotateCw':
      return <RotateCw className={className} />;
    case 'Hash':
      return <Hash className={className} />;
    case 'Stamp':
      return <Stamp className={className} />;
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Type':
      return <Type className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Unlock':
      return <Unlock className={className} />;
    default:
      return <File className={className} />;
  }
};
