import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { splitPdf, parsePageRanges } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import { Scissors, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

export const SplitTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mode, setMode] = useState<'range' | 'all' | 'select'>('range');
  const [rangeInput, setRangeInput] = useState<string>('');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!file) {
      setTotalPages(0);
      return;
    }
    async function loadDoc() {
      try {
        const buffer = await file!.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        setTotalPages(doc.numPages);
        setRangeInput(`1-${Math.min(3, doc.numPages)}`);
        setSelectedPages(new Set([1]));
      } catch (err) {
        console.error(err);
      }
    }
    loadDoc();
  }, [file]);

  const togglePageSelect = (page: number) => {
    const updated = new Set(selectedPages);
    if (updated.has(page)) {
      updated.delete(page);
    } else {
      updated.add(page);
    }
    setSelectedPages(updated);
  };

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;

    try {
      setIsProcessing(true);

      if (mode === 'all') {
        // Split every page into separate PDF inside a ZIP
        const zip = new JSZip();
        for (let p = 1; p <= totalPages; p++) {
          const pagePdf = await splitPdf(file, [p]);
          zip.file(`${file.name.replace('.pdf', '')}_page_${p}.pdf`, pagePdf);
        }
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${file.name.replace('.pdf', '')}_split_pages.zip`);
      } else {
        // Range mode or Select mode
        let targetPages: number[] = [];
        if (mode === 'range') {
          targetPages = parsePageRanges(rangeInput, totalPages);
        } else {
          targetPages = Array.from(selectedPages).sort((a, b) => a - b);
        }

        if (targetPages.length === 0) {
          alert('최소 1개 이상의 유효한 페이지를 지정해주세요.');
          return;
        }

        const splitBytes = await splitPdf(file, targetPages);
        savePdfFile(splitBytes, `${file.name.replace('.pdf', '')}_extracted.pdf`);
      }

      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('PDF 분할 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 분할</h2>
        <p className="text-sm text-slate-500 mt-2">
          원하는 페이지 범위를 추출하거나 모든 페이지를 개별 PDF로 나눕니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="분할할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
                <p className="text-xs text-slate-400">총 {totalPages}페이지</p>
              </div>

              <button
                onClick={() => setFile(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
              </button>
            </div>

            {/* Split Mode Options */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'range'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">페이지 범위 지정</div>
                <div className="text-xs text-slate-500 mt-1">예: 1-3, 5, 8-10 형식으로 추출</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('select')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'select'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">페이지 직접 클릭 선택</div>
                <div className="text-xs text-slate-500 mt-1">썸네일을 클릭하여 추출할 페이지 선택</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('all')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === 'all'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-800">모든 페이지 낱장 분할</div>
                <div className="text-xs text-slate-500 mt-1">각 페이지를 개별 PDF로 ZIP 압축 저장</div>
              </button>
            </div>

            {/* Range Input Field */}
            {mode === 'range' && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  추출할 페이지 범위 입력:
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="예: 1-3, 5, 8"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  쉼표(,)와 하이픈(-)을 사용하여 유연하게 범위를 지정할 수 있습니다.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>분할 처리 중...</span>
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>다시 다운로드</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5" />
                    <span>PDF 분할 및 다운로드</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Thumbnails preview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800">전체 페이지 미리보기</h4>
              {mode === 'select' && (
                <div className="text-xs font-semibold text-brand-600">
                  {selectedPages.size}개 페이지 선택됨
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isSelected = selectedPages.has(pageNum);
                return (
                  <div
                    key={pageNum}
                    onClick={() => mode === 'select' && togglePageSelect(pageNum)}
                    className={`relative rounded-xl p-2 border-2 transition-all cursor-pointer ${
                      mode === 'select'
                        ? isSelected
                          ? 'border-brand-500 bg-brand-50/40 shadow-md ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 opacity-60'
                        : 'border-slate-200'
                    }`}
                  >
                    <PageThumbnail
                      file={file}
                      pageNumber={pageNum}
                      className="w-full aspect-[1/1.4]"
                    />
                    <div className="mt-1.5 text-center text-xs font-bold text-slate-600">
                      {pageNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
