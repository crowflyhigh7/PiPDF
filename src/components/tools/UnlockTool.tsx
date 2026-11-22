import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { unlockPdf } from '../../utils/pdfOperations';
import { Unlock, Loader2, CheckCircle2, KeyRound, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const UnlockTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleUnlock = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const res = await unlockPdf(file, password);
      savePdfFile(res, `${file.name.replace('.pdf', '')}_unlocked.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('비밀번호가 올바르지 않거나 잠금 해제에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 잠금 해제</h2>
        <p className="text-sm text-slate-500 mt-2">
          암호가 걸려있는 PDF 문서의 보안을 해제하여 자유롭게 편집 및 열람할 수 있도록 합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="잠금 해제할 PDF 선택"
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

          <div className="my-8 max-w-md mx-auto space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-brand-600" />
              <span>문서 비밀번호 입력</span>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="문서 암호를 입력하세요 (설정된 경우)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              일부 권한 제한(인쇄/복사 금지)만 걸려있는 문서는 비밀번호 없이도 해제될 수 있습니다.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleUnlock}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>잠금 해제 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>잠금 해제 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
