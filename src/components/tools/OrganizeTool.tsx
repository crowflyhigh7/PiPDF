import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { organizePdf } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, Download, Loader2, Undo2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const OrganizeTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]); // 0-based indices
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!file) {
      setPageOrder([]);
      setRotations({});
      setDeletedPages(new Set());
      return;
    }

    async function load() {
      try {
        const buffer = await file!.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        const initialOrder = Array.from({ length: doc.numPages }, (_, i) => i);
        setPageOrder(initialOrder);
        setRotations({});
        setDeletedPages(new Set());
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [file]);

  const movePage = (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= pageOrder.length) return;
    const updated = [...pageOrder];
    const temp = updated[currentIndex];
    updated[currentIndex] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPageOrder(updated);
  };

  const rotatePage = (pageIdx: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360,
    }));
  };

  const toggleDeletePage = (pageIdx: number) => {
    const updated = new Set(deletedPages);
    if (updated.has(pageIdx)) {
      updated.delete(pageIdx);
    } else {
      updated.add(pageIdx);
    }
    setDeletedPages(updated);
  };

  const handleSave = async () => {
    if (!file) return;
    const remainingCount = pageOrder.filter((idx) => !deletedPages.has(idx)).length;
    if (remainingCount === 0) {
      alert('최소 1개 이상의 페이지를 남겨두어야 합니다.');
      return;
    }

    try {
      setIsProcessing(true);
      const organizedBytes = await organizePdf(file, pageOrder, rotations, deletedPages);
      savePdfFile(organizedBytes, `${file.name.replace('.pdf', '')}_organized.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('페이지 정리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">페이지 정리 및 순서 변경</h2>
        <p className="text-sm text-slate-500 mt-2">
          페이지의 순서를 변경하거나 불필요한 페이지 삭제, 개별 회전을 자유롭게 수행하세요.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="정리할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">
                총 {pageOrder.length}페이지 중 {pageOrder.length - deletedPages.size}페이지 유지됨
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
                onClick={handleSave}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>저장 중...</span>
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>다시 다운로드</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>정리 완료 및 다운로드</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grid of Pages */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-h-[600px] overflow-y-auto p-2">
            {pageOrder.map((pageIdx, orderIdx) => {
              const isDeleted = deletedPages.has(pageIdx);
              const rotation = rotations[pageIdx] || 0;

              return (
                <div
                  key={pageIdx}
                  className={`relative group bg-slate-50 rounded-2xl p-3 border-2 transition-all flex flex-col justify-between ${
                    isDeleted
                      ? 'border-rose-300 bg-rose-50/50 opacity-50'
                      : 'border-slate-200 hover:border-brand-400 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar for page actions */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-500 px-2 py-0.5 bg-white rounded-md shadow-xs border border-slate-200">
                      #{orderIdx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => rotatePage(pageIdx)}
                        className="p-1 text-slate-600 hover:text-brand-600 hover:bg-white rounded transition-colors"
                        title="90도 회전"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleDeletePage(pageIdx)}
                        className={`p-1 rounded transition-colors ${
                          isDeleted
                            ? 'text-emerald-600 hover:bg-emerald-100'
                            : 'text-rose-500 hover:bg-rose-100'
                        }`}
                        title={isDeleted ? '삭제 취소' : '페이지 삭제'}
                      >
                        {isDeleted ? <Undo2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative">
                    <PageThumbnail
                      file={file}
                      pageNumber={pageIdx + 1}
                      rotation={rotation}
                      className="w-full aspect-[1/1.4]"
                    />
                    {isDeleted && (
                      <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center font-bold text-rose-700 text-xs">
                        삭제 예정
                      </div>
                    )}
                  </div>

                  {/* Move Left / Right buttons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      disabled={orderIdx === 0}
                      onClick={() => movePage(orderIdx, 'left')}
                      className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 rounded hover:bg-white transition-colors"
                      title="앞으로 이동"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">
                      원본 {pageIdx + 1}p
                    </span>
                    <button
                      disabled={orderIdx === pageOrder.length - 1}
                      onClick={() => movePage(orderIdx, 'right')}
                      className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 rounded hover:bg-white transition-colors"
                      title="뒤로 이동"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
