import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { organizePdf } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import { Trash2, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const RemovePagesTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!file) {
      setPageCount(0);
      setMarkedForDeletion(new Set());
      return;
    }
    async function load() {
      try {
        const buffer = await file!.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        setPageCount(doc.numPages);
        setMarkedForDeletion(new Set());
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [file]);

  const togglePage = (index: number) => {
    const updated = new Set(markedForDeletion);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setMarkedForDeletion(updated);
  };

  const handleRemove = async () => {
    if (!file) return;
    if (markedForDeletion.size === pageCount) {
      alert('모든 페이지를 삭제할 수는 없습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      const initialOrder = Array.from({ length: pageCount }, (_, i) => i);
      const res = await organizePdf(file, initialOrder, {}, markedForDeletion);
      savePdfFile(res, `${file.name.replace('.pdf', '')}_removed.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('페이지 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">페이지 삭제</h2>
        <p className="text-sm text-slate-500 mt-2">
          삭제하고 싶은 페이지를 클릭하여 선택한 후 즉시 제거합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="페이지를 삭제할 PDF 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">
                총 {pageCount}페이지 중 {markedForDeletion.size}개 페이지 삭제 선택됨
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFile(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
              </button>

              <button
                onClick={handleRemove}
                disabled={isProcessing || markedForDeletion.size === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>삭제 처리 중...</span>
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>다시 다운로드</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>선택한 {markedForDeletion.size}개 페이지 삭제</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[600px] overflow-y-auto p-2">
            {Array.from({ length: pageCount }, (_, i) => i).map((idx) => {
              const isMarked = markedForDeletion.has(idx);

              return (
                <div
                  key={idx}
                  onClick={() => togglePage(idx)}
                  className={`relative group bg-slate-50 rounded-xl p-2 border-2 cursor-pointer transition-all ${
                    isMarked
                      ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/30'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  <PageThumbnail
                    file={file}
                    pageNumber={idx + 1}
                    className="w-full aspect-[1/1.4]"
                  />

                  {isMarked && (
                    <div className="absolute inset-0 bg-rose-600/30 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center text-white font-black text-xs gap-1">
                      <Trash2 className="w-5 h-5 text-white" />
                      <span>삭제</span>
                    </div>
                  )}

                  <div className="mt-1.5 text-center text-xs font-bold text-slate-600">
                    {idx + 1}p
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
