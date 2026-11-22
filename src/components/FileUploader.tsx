import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp, ShieldCheck } from 'lucide-react';

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  buttonLabel?: string;
  description?: string;
  onFilesSelected: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  accept = '.pdf,application/pdf',
  multiple = false,
  buttonLabel = 'PDF 파일 선택',
  description = '또는 여기에 PDF 파일을 끌어다 놓으세요',
  onFilesSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      // reset input value so re-selecting the same file triggers change
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-3xl mx-auto my-8 p-10 md:p-14 border-2 border-dashed rounded-2xl transition-all duration-200 text-center flex flex-col items-center justify-center ${
        isDragging
          ? 'border-brand-500 bg-brand-50/50 scale-[1.01]'
          : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/60 shadow-sm'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="w-20 h-20 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-brand-50/50">
        <UploadCloud className="w-10 h-10" />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-lg font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-500/25"
      >
        <FileUp className="w-5 h-5" />
        {buttonLabel}
      </button>

      <p className="mt-4 text-base font-medium text-slate-500">{description}</p>

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>100% 브라우저 로컬 안전 처리: 파일이 외부 서버로 전송되지 않습니다.</span>
      </div>
    </div>
  );
};
