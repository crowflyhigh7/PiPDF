import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { mergePdfs } from '../../utils/pdfOperations';
import { ArrowUp, ArrowDown, Trash2, Plus, Download, Loader2, CheckCircle2, File } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setIsDone(false);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    try {
      setIsProcessing(true);
      const mergedBytes = await mergePdfs(files);
      savePdfFile(mergedBytes, `PiPDF_Merged_${Date.now()}.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('PDF 병합 중 오류가 발생했습니다. 암호화되지 않은 유효한 파일인지 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 병합</h2>
        <p className="text-sm text-slate-500 mt-2">
          여러 PDF 파일을 순서대로 결합하여 하나의 완벽한 PDF 파일로 만듭니다.
        </p>
      </div>

      {files.length === 0 ? (
        <FileUploader
          multiple
          buttonLabel="병합할 PDF 파일들 선택"
          description="또는 여기에 여러 PDF 파일들을 한꺼번에 끌어다 놓으세요"
          onFilesSelected={handleFilesSelected}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-800">선택된 파일 목록 ({files.length}개)</span>
              <p className="text-xs text-slate-400">파일의 화살표를 눌러 병합될 순서를 조정하세요.</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors">
              <Plus className="w-4 h-4" />
              <span>파일 추가</span>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                }}
              />
            </label>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                    {index + 1}
                  </div>
                  <File className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveFile(index, 'up')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 rounded hover:bg-white"
                    title="위로 이동"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === files.length - 1}
                    onClick={() => moveFile(index, 'down')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 rounded hover:bg-white"
                    title="아래로 이동"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setFiles([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              모두 비우기
            </button>

            <button
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>PDF 병합 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{files.length}개 파일 병합 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
