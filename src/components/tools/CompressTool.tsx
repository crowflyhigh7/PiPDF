import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { compressPdf } from '../../utils/pdfOperations';
import { Zap, Download, Loader2, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const CompressTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'less'>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    data: Uint8Array;
    originalSize: number;
    newSize: number;
  } | null>(null);

  const handleCompress = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      const res = await compressPdf(file, level);
      setResult(res);
      savePdfFile(res.data, `${file.name.replace('.pdf', '')}_compressed.pdf`);
      confetti({ particleCount: 90, spread: 70 });
    } catch (err) {
      console.error(err);
      alert('PDF 압축 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 압축</h2>
        <p className="text-sm text-slate-500 mt-2">
          문서의 가독성과 서식을 유지하면서 파일 용량을 최대한 가볍게 최적화합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="압축할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => {
            setFile(files[0]);
            setResult(null);
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">원본 크기: {formatBytes(file.size)}</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="my-8">
            <label className="block text-sm font-bold text-slate-800 mb-4">
              압축 수준 선택
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Extreme */}
              <button
                type="button"
                onClick={() => setLevel('extreme')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  level === 'extreme'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900">극대 압축</span>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    최소 용량
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  화질을 줄여 가장 가벼운 용량으로 만듭니다. 이메일 첨부에 최적화되어 있습니다.
                </p>
              </button>

              {/* Recommended */}
              <button
                type="button"
                onClick={() => setLevel('recommended')}
                className={`p-5 rounded-2xl border text-left transition-all relative ${
                  level === 'recommended'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900">권장 압축</span>
                  <span className="text-[10px] font-bold bg-brand-600 text-white px-2 py-0.5 rounded-full">
                    강력 추천
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  선명한 텍스트 품질을 유지하면서 큰 폭으로 용량을 줄이는 가장 이상적인 밸런스입니다.
                </p>
              </button>

              {/* Less */}
              <button
                type="button"
                onClick={() => setLevel('less')}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  level === 'less'
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900">최소 압축</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    고화질
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  품질 저하 없이 원본에 가까운 디테일을 유지하며 파일 구조만 가볍게 정돈합니다.
                </p>
              </button>
            </div>
          </div>

          {/* Results Comparison Card */}
          {result && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 mb-8 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>압축이 성공적으로 완료되었습니다!</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">압축 전</span>
                  <span className="font-bold text-slate-700 line-through">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-emerald-600" />

                <div>
                  <span className="text-xs text-emerald-700 block">압축 후</span>
                  <span className="text-lg font-black text-emerald-800">
                    {formatBytes(result.newSize)}
                  </span>
                </div>

                <div className="ml-auto">
                  <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-sm">
                    {Math.max(
                      0,
                      Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100)
                    )}
                    % 용량 절감
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>브라우저 내 자체 압축 (서버에 업로드되지 않음)</span>
            </div>

            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-base"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>최적화 압축 중...</span>
                </>
              ) : result ? (
                <>
                  <Download className="w-5 h-5" />
                  <span>압축된 PDF 다시 다운로드</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>PDF 압축 시작</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
