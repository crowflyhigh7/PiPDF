import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { rotatePdf } from '../../utils/pdfOperations';
import { RotateCw, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import { PageThumbnail } from '../PageThumbnail';
import confetti from 'canvas-confetti';

export const RotateTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<number>(90);
  const [target, setTarget] = useState<'all' | 'odd' | 'even'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleRotate = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const rotatedBytes = await rotatePdf(file, angle, target);
      savePdfFile(rotatedBytes, `${file.name.replace('.pdf', '')}_rotated.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('PDF 회전 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 회전</h2>
        <p className="text-sm text-slate-500 mt-2">
          잘못 스캔되었거나 방향이 어긋난 문서를 원하는 각도로 영구 회전시킵니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="회전할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
            </button>
          </div>

          <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Visual Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <PageThumbnail
                file={file}
                pageNumber={1}
                rotation={angle}
                className="w-48 aspect-[1/1.4] shadow-md"
              />
              <span className="text-xs font-semibold text-slate-500 mt-3">
                1페이지 미리보기 (현재 {angle}° 회전됨)
              </span>
            </div>

            {/* Rotation Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">회전 각도</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '90° 시계방향', val: 90 },
                    { label: '180° 반전', val: 180 },
                    { label: '270° 반시계', val: 270 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAngle(item.val)}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        angle === item.val
                          ? 'border-brand-500 bg-brand-50 text-brand-600 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">대상 페이지</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '모든 페이지', val: 'all' },
                    { label: '홀수 페이지만', val: 'odd' },
                    { label: '짝수 페이지만', val: 'even' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setTarget(item.val as 'all' | 'odd' | 'even')}
                      className={`py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                        target === item.val
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleRotate}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>회전 적용 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-5 h-5" />
                  <span>회전 적용 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
