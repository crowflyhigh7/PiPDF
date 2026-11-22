import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { addPageNumbers } from '../../utils/pdfOperations';
import { PageNumberOptions } from '../../types';
import { Hash, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const PageNumberTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
  const [format, setFormat] = useState<PageNumberOptions['format']>('n');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(11);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleApply = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const res = await addPageNumbers(file, {
        position,
        format,
        startNumber,
        fontSize,
      });

      savePdfFile(res, `${file.name.replace('.pdf', '')}_numbered.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('페이지 번호 추가 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">페이지 번호 추가</h2>
        <p className="text-sm text-slate-500 mt-2">
          문서의 원하는 위치에 세련된 형식으로 페이지 번호를 일괄 삽입합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="번호를 삽입할 PDF 파일 선택"
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

          <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Options */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">번호 표시 위치</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top-left', label: '상단 좌측' },
                    { id: 'top-center', label: '상단 중앙' },
                    { id: 'top-right', label: '상단 우측' },
                    { id: 'bottom-left', label: '하단 좌측' },
                    { id: 'bottom-center', label: '하단 중앙' },
                    { id: 'bottom-right', label: '하단 우측' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id as PageNumberOptions['position'])}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        position === p.id
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">번호 표기 형식</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'n', label: '1 (단일 숫자)' },
                    { id: 'n-of-total', label: '1 / 10 (전체 대비)' },
                    { id: 'page-n', label: 'Page 1' },
                    { id: 'page-n-of-total', label: 'Page 1 of 10' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id as PageNumberOptions['format'])}
                      className={`p-2.5 text-xs font-bold rounded-lg border text-left transition-all ${
                        format === f.id
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">시작 번호</label>
                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    글자 크기 ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min="9"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-brand-600 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Preview Sheet */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-56 aspect-[1/1.4] bg-white rounded-lg shadow-md border border-slate-200 relative p-4 flex flex-col justify-between">
                {/* Top slots */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                  <span>{position === 'top-left' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                  <span>{position === 'top-center' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                  <span>{position === 'top-right' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                </div>

                <div className="space-y-2 opacity-15 w-full">
                  <div className="h-3 bg-slate-400 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-400 rounded w-full"></div>
                  <div className="h-3 bg-slate-400 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-400 rounded w-2/3"></div>
                </div>

                {/* Bottom slots */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                  <span>{position === 'bottom-left' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                  <span>{position === 'bottom-center' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                  <span>{position === 'bottom-right' ? (format === 'n' ? '1' : 'Page 1') : ''}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 mt-3">페이지 번호 위치 미리보기</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>번호 삽입 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Hash className="w-5 h-5" />
                  <span>페이지 번호 적용 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
