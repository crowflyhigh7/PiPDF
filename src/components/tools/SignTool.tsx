import React, { useState, useRef, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { signPdf } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import { PenTool, Loader2, Eraser, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const SignTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [targetPage, setTargetPage] = useState<number>(1); // 1-based
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [stampPos, setStampPos] = useState<{ xRatio: number; yRatio: number }>({
    xRatio: 0.65,
    yRatio: 0.8,
  });
  const [penColor, setPenColor] = useState<string>('#1e293b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Drawing Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      return;
    }
    async function load() {
      try {
        const buffer = await file!.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        setTotalPages(doc.numPages);
        setTargetPage(doc.numPages); // usually the last page has signature
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [file]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const handleApplySignature = async () => {
    if (!file || !signatureDataUrl) return;

    try {
      setIsProcessing(true);
      const res = await signPdf(
        file,
        targetPage - 1, // 0-based
        signatureDataUrl,
        stampPos.xRatio,
        stampPos.yRatio,
        0.25 // width ratio
      );

      savePdfFile(res, `${file.name.replace('.pdf', '')}_signed.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('서명 날인 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setStampPos({
      xRatio: Math.max(0.05, Math.min(0.7, x - 0.1)),
      yRatio: Math.max(0.05, Math.min(0.85, y - 0.05)),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 전자 서명 (Sign)</h2>
        <p className="text-sm text-slate-500 mt-2">
          자필 서명이나 도장을 작성하여 문서의 원하는 위치에 날인합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="서명할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">총 {totalPages}페이지</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setSignatureDataUrl(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
            </button>
          </div>

          <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Signature Pad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  마우스 또는 터치로 서명 그리기
                </label>
                <div className="flex items-center gap-2">
                  {['#1e293b', '#2563eb', '#dc2626'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        penColor === color ? 'scale-110 border-slate-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    onClick={clearCanvas}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-2"
                    title="지우기"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-2 bg-slate-50 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white rounded-xl shadow-xs cursor-crosshair w-full max-w-[400px] h-[180px] touch-none"
                />
              </div>

              {/* Target Page Selector */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  서명할 페이지 선택 (1 ~ {totalPages})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max={totalPages}
                    value={targetPage}
                    onChange={(e) => setTargetPage(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                  <span className="text-xs font-bold text-slate-700 w-12 text-right">
                    {targetPage}p
                  </span>
                </div>
              </div>
            </div>

            {/* Position Picker Preview */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-700 mb-2">
                미리보기를 클릭하여 서명이 찍힐 위치를 지정하세요
              </span>

              <div
                onClick={handlePreviewClick}
                className="relative w-64 aspect-[1/1.4] bg-white rounded-xl shadow-lg border border-slate-300 cursor-pointer overflow-hidden p-2 select-none"
              >
                <PageThumbnail
                  file={file}
                  pageNumber={targetPage}
                  className="w-full h-full pointer-events-none"
                />

                {/* Stamped signature preview overlay */}
                {signatureDataUrl && (
                  <div
                    className="absolute pointer-events-none border-2 border-dashed border-brand-500 rounded p-1 bg-brand-500/10 transition-all duration-75"
                    style={{
                      left: `${stampPos.xRatio * 100}%`,
                      top: `${stampPos.yRatio * 100}%`,
                      width: '35%',
                    }}
                  >
                    <img src={signatureDataUrl} alt="Signature" className="w-full object-contain" />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-2">
                현재 선택 좌표: X {Math.round(stampPos.xRatio * 100)}%, Y {Math.round(stampPos.yRatio * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleApplySignature}
              disabled={isProcessing || !signatureDataUrl}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>서명 날인 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5" />
                  <span>서명 완료 및 PDF 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
