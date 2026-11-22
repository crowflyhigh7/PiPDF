export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'organize'
  | 'remove'
  | 'rotate'
  | 'pdf-to-img'
  | 'img-to-pdf'
  | 'watermark'
  | 'page-numbers'
  | 'sign'
  | 'add-text'
  | 'protect'
  | 'unlock'
  | 'pdf-to-text';

export type ToolCategory = 'organize' | 'optimize' | 'convert' | 'edit' | 'security';

export interface ToolItem {
  id: ToolId;
  title: string;
  shortDesc: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  popular?: boolean;
}

export interface WatermarkOptions {
  type: 'text';
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'repeat';
}

export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'n' | 'n-of-total' | 'page-n' | 'page-n-of-total';
  startNumber: number;
  fontSize: number;
}
