import React, { useEffect, useRef, useState } from 'react';
import { pdfjsLib } from '../utils/pdfWorker';
import { Loader2 } from 'lucide-react';

interface PageThumbnailProps {
  file: File;
  pageNumber: number; // 1-based
  rotation?: number; // 0, 90, 180, 270
  className?: string;
  onLoaded?: (aspectRatio: number) => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  file,
  pageNumber,
  rotation = 0,
  className = '',
  onLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        if (isCancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (isCancelled) return;

        const page = await pdf.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: 0.6, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!isCancelled) {
          setLoading(false);
          onLoaded?.(viewport.width / viewport.height);
        }
      } catch (err) {
        console.error('Error rendering page thumbnail:', err);
        if (!isCancelled) setLoading(false);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [file, pageNumber, rotation, onLoaded]);

  return (
    <div className={`relative flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden shadow-sm ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
    </div>
  );
};
