import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { imagesToPdf } from '../../utils/pdfOperations';
import { ArrowUp, ArrowDown, Trash2, Plus, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const ImgToPdfTool: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'large'>('small');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleImagesSelected = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
    setIsDone(false);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setImages(updated);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    try {
      setIsProcessing(true);
      const pdfBytes = await imagesToPdf(images, orientation, margin);
      savePdfFile(pdfBytes, `PiPDF_Images_${Date.now()}.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('PDF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">JPG to PDF 변환</h2>
        <p className="text-sm text-slate-500 mt-2">
          여러 장의 JPG, PNG 이미지를 정갈한 하나의 PDF 문서로 변환합니다.
        </p>
      </div>

      {images.length === 0 ? (
        <FileUploader
          accept="image/jpeg,image/png,image/webp"
          multiple
          buttonLabel="이미지 파일들 선택"
          description="또는 여기에 여러 장의 JPG/PNG 이미지를 끌어다 놓으세요"
          onFilesSelected={handleImagesSelected}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                선택된 이미지 ({images.length}개)
              </h3>
              <p className="text-xs text-slate-400">순서를 조정하거나 옵션을 변경하세요.</p>
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <Plus className="w-4 h-4" />
              <span>이미지 추가</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleImagesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          {/* Options */}
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">페이지 방향</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    orientation === 'portrait'
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  세로 (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    orientation === 'landscape'
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  가로 (Landscape)
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">여백 크기</label>
              <div className="flex gap-2">
                {[
                  { id: 'none', label: '여백 없음' },
                  { id: 'small', label: '좁은 여백' },
                  { id: 'large', label: '넓은 여백' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMargin(item.id as 'none' | 'small' | 'large')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      margin === item.id
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Images List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {images.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 font-black flex items-center justify-center text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveImage(index, 'up')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-white"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === images.length - 1}
                    onClick={() => moveImage(index, 'down')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-white"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setImages([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              모두 비우기
            </button>

            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>PDF로 변환 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
