import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { renderPdfToImages } from '../../utils/pdfOperations';
import { Download, Loader2, Image, Archive, RefreshCw } from 'lucide-react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

export const PdfToImgTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(2.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<{ pageNumber: number; dataUrl: string; blob: Blob }[]>([]);

  const handleConvert = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const converted = await renderPdfToImages(file, scale);
      setImages(converted);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('이미지 변환 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (images.length === 0 || !file) return;

    const zip = new JSZip();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    images.forEach((img) => {
      zip.file(`${baseName}_page_${img.pageNumber}.jpg`, img.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${baseName}_images.zip`);
  };

  const handleDownloadSingle = (pageNumber: number, blob: Blob) => {
    if (!file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    saveAs(blob, `${baseName}_page_${pageNumber}.jpg`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF to JPG 변환</h2>
        <p className="text-sm text-slate-500 mt-2">
          PDF의 모든 페이지를 선명한 JPG 이미지로 변환하여 개별 또는 ZIP 파일로 다운로드합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="변환할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => {
            setFile(files[0]);
            setImages([]);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setImages([]);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
              </button>

              {images.length > 0 ? (
                <button
                  onClick={handleDownloadAllZip}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm"
                >
                  <Archive className="w-4 h-4" />
                  <span>전체 이미지 ZIP 다운로드</span>
                </button>
              ) : (
                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>변환 중...</span>
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4" />
                      <span>이미지로 변환 시작</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Scale Quality Selector */}
          {images.length === 0 && (
            <div className="my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-slate-800 block">이미지 해상도 설정</span>
                <span className="text-xs text-slate-500">
                  선명한 출력을 위해 고해상도(2.0x)를 권장합니다.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: '표준 (1.0x)', val: 1.0 },
                  { label: '고해상도 (2.0x)', val: 2.0 },
                  { label: '초고해상도 (3.0x)', val: 3.0 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setScale(opt.val)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      scale === opt.val
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Converted Images Grid */}
          {images.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800">
                  변환 완료: 총 {images.length}장의 이미지
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2">
                {images.map((img) => (
                  <div
                    key={img.pageNumber}
                    className="group bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[1/1.4] bg-white rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center mb-2">
                      <img
                        src={img.dataUrl}
                        alt={`Page ${img.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-600">
                        페이지 {img.pageNumber}
                      </span>
                      <button
                        onClick={() => handleDownloadSingle(img.pageNumber, img.blob)}
                        className="p-1.5 text-brand-600 hover:text-white hover:bg-brand-600 rounded-lg transition-colors"
                        title="이 페이지만 다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
