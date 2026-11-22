import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { addWatermark } from '../../utils/pdfOperations';
import { WatermarkOptions } from '../../types';
import { Stamp, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const WatermarkTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [color, setColor] = useState<string>('#e11d48');
  const [rotation, setRotation] = useState<number>(45);
  const [position, setPosition] = useState<WatermarkOptions['position']>('center');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleApply = async () => {
    if (!file || !text.trim()) return;

    try {
      setIsProcessing(true);
      const res = await addWatermark(file, {
        type: 'text',
        text,
        fontSize,
        opacity,
        color,
        rotation,
        position,
      });

      savePdfFile(res, `${file.name.replace('.pdf', '')}_watermarked.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('워터마크 추가 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">워터마크 추가</h2>
        <p className="text-sm text-slate-500 mt-2">
          문서 복제 방지 및 보안을 위해 텍스트 워터마크를 투명도와 각도를 지정해 각인합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="워터마크를 넣을 PDF 선택"
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
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">워터마크 텍스트</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="예: CONFIDENTIAL, 기밀, SAMPLE"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    글자 크기 ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="96"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    투명도 ({Math.round(opacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    회전 각도 ({rotation}°)
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="15"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">색상</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">배치 위치</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'center', label: '가운데' },
                    { id: 'repeat', label: '격자 반복' },
                    { id: 'bottom-right', label: '우측 하단' },
                    { id: 'top-left', label: '좌측 상단' },
                    { id: 'top-right', label: '우측 상단' },
                    { id: 'bottom-left', label: '좌측 하단' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id as WatermarkOptions['position'])}
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
            </div>

            {/* Interactive Preview Canvas */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden">
              <div className="w-56 aspect-[1/1.4] bg-white rounded-lg shadow-md border border-slate-200 relative flex items-center justify-center p-4 overflow-hidden">
                <div className="space-y-2 opacity-20 w-full pointer-events-none">
                  <div className="h-3 bg-slate-400 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-400 rounded w-full"></div>
                  <div className="h-3 bg-slate-400 rounded w-5/6"></div>
                  <div className="h-3 bg-slate-400 rounded w-4/5"></div>
                  <div className="h-3 bg-slate-400 rounded w-full"></div>
                  <div className="h-3 bg-slate-400 rounded w-2/3"></div>
                </div>

                <div
                  className="absolute font-black whitespace-nowrap pointer-events-none select-none transition-all"
                  style={{
                    color,
                    opacity,
                    fontSize: `${fontSize * 0.45}px`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {text || 'SAMPLE'}
                </div>
              </div>
              <span className="text-xs text-slate-400 mt-3">워터마크 스타일 미리보기</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleApply}
              disabled={isProcessing || !text.trim()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>워터마크 각인 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Stamp className="w-5 h-5" />
                  <span>워터마크 적용 및 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
