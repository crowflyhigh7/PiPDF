import React, { useState, useEffect } from 'react';
import { FileUploader } from '../FileUploader';
import { addTextAnnotationsToPdf, TextAnnotationItem } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import { Type, Download, Loader2, CheckCircle2, Trash2, Plus, Bold, RefreshCw, Move } from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

export const AddTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1); // 1-based
  const [annotations, setAnnotations] = useState<TextAnnotationItem[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!file) {
      setTotalPages(1);
      setCurrentPage(1);
      setAnnotations([]);
      setSelectedAnnId(null);
      return;
    }
    async function load() {
      try {
        const buffer = await file!.arrayBuffer();
        const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
        setTotalPages(doc.numPages);
        setCurrentPage(1);

        // Add a default sample text annotation on page 1
        const initialId = String(Date.now());
        setAnnotations([
          {
            id: initialId,
            pageIndex: 0,
            text: '여기에 텍스트를 입력하세요',
            xRatio: 0.2,
            yRatio: 0.2,
            fontSize: 18,
            color: '#1e293b',
            isBold: true,
            bgColor: 'transparent',
          },
        ]);
        setSelectedAnnId(initialId);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [file]);

  const selectedAnn = annotations.find((a) => a.id === selectedAnnId);

  const updateSelected = (updates: Partial<TextAnnotationItem>) => {
    if (!selectedAnnId) return;
    setAnnotations((prev) =>
      prev.map((a) => (a.id === selectedAnnId ? { ...a, ...updates } : a))
    );
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = Math.max(0.05, Math.min(0.85, (e.clientX - rect.left) / rect.width));
    const yRatio = Math.max(0.05, Math.min(0.9, (e.clientY - rect.top) / rect.height));

    if (selectedAnnId) {
      // Move selected annotation to clicked spot
      updateSelected({ xRatio, yRatio, pageIndex: currentPage - 1 });
    } else {
      // Create new annotation at click
      const newId = String(Date.now());
      const newAnn: TextAnnotationItem = {
        id: newId,
        pageIndex: currentPage - 1,
        text: '새 텍스트',
        xRatio,
        yRatio,
        fontSize: 16,
        color: '#1e293b',
        isBold: false,
        bgColor: 'transparent',
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setSelectedAnnId(newId);
    }
  };

  const addNewAnnotation = () => {
    const newId = String(Date.now());
    const newAnn: TextAnnotationItem = {
      id: newId,
      pageIndex: currentPage - 1,
      text: '새 텍스트',
      xRatio: 0.3,
      yRatio: 0.4,
      fontSize: 16,
      color: '#1e293b',
      isBold: false,
      bgColor: 'transparent',
    };
    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedAnnId(newId);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnId === id) setSelectedAnnId(null);
  };

  const handleApply = async () => {
    if (!file || annotations.length === 0) return;

    try {
      setIsProcessing(true);
      const res = await addTextAnnotationsToPdf(file, annotations);
      savePdfFile(res, `${file.name.replace('.pdf', '')}_edited.pdf`);
      setIsDone(true);
      confetti({ particleCount: 80, spread: 60 });
    } catch (err) {
      console.error(err);
      alert('PDF 텍스트 삽입 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageAnnotations = annotations.filter(
    (a) => a.pageIndex === currentPage - 1
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF 텍스트 추가 (Edit PDF)</h2>
        <p className="text-sm text-slate-500 mt-2">
          문서의 원하는 위치를 클릭하여 한글/영문 텍스트를 자유롭게 삽입하고 서식을 조절합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="텍스트를 추가할 PDF 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">
                총 {totalPages}페이지 • 삽입된 텍스트 {annotations.length}개
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
                onClick={addNewAnnotation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>텍스트 상자 추가</span>
              </button>
            </div>
          </div>

          <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Interactive PDF Page View with Text Overlays */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Page Selector Controls */}
              <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-3 px-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-md transition-colors"
                >
                  이전 페이지
                </button>
                <span className="text-xs font-bold text-slate-700">
                  페이지 {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-md transition-colors"
                >
                  다음 페이지
                </button>
              </div>

              {/* Clickable Sheet Canvas Area */}
              <div
                onClick={handlePreviewClick}
                className="relative w-full max-w-md aspect-[1/1.4] bg-white rounded-xl shadow-lg border-2 border-slate-300 hover:border-brand-400 cursor-crosshair overflow-hidden select-none transition-colors"
                title="클릭하여 텍스트 위치를 지정하세요"
              >
                <PageThumbnail
                  file={file}
                  pageNumber={currentPage}
                  className="w-full h-full pointer-events-none"
                />

                {/* Overlaid Annotations on this Page */}
                {currentPageAnnotations.map((ann) => {
                  const isSelected = ann.id === selectedAnnId;
                  return (
                    <div
                      key={ann.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnId(ann.id);
                      }}
                      className={`absolute rounded px-1.5 py-0.5 cursor-pointer transition-all duration-75 ${
                        isSelected
                          ? 'ring-2 ring-brand-500 bg-brand-50/90 shadow-md z-20'
                          : 'border border-dashed border-slate-400 bg-white/70 hover:bg-white z-10'
                      }`}
                      style={{
                        left: `${ann.xRatio * 100}%`,
                        top: `${ann.yRatio * 100}%`,
                        color: ann.color,
                        fontWeight: ann.isBold ? 700 : 400,
                        fontSize: `${Math.max(10, ann.fontSize * 0.75)}px`,
                        backgroundColor:
                          ann.bgColor === 'transparent'
                            ? isSelected
                              ? 'rgba(255,241,242,0.9)'
                              : 'transparent'
                            : ann.bgColor,
                      }}
                    >
                      <span className="whitespace-pre-wrap leading-tight">{ann.text || '(빈 텍스트)'}</span>
                      {isSelected && (
                        <div className="absolute -top-6 left-0 bg-brand-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                          <Move className="w-2.5 h-2.5" /> 선택됨
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <span className="text-[11px] text-slate-400 mt-2 text-center">
                💡 미리보기 위를 클릭하면 선택된 텍스트가 해당 위치로 이동합니다.
              </span>
            </div>

            {/* Right: Text Configuration Panel */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              {selectedAnn ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-800">텍스트 서식 편집</span>
                    <button
                      onClick={() => removeAnnotation(selectedAnn.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="이 텍스트 상자 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      텍스트 내용 (한글/영문 지원)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedAnn.text}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      placeholder="추가할 텍스트를 입력하세요"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>

                  {/* Font Size & Bold */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        글자 크기 ({selectedAnn.fontSize}pt)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="48"
                        value={selectedAnn.fontSize}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-full accent-brand-600 mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">굵게 (Bold)</label>
                      <button
                        type="button"
                        onClick={() => updateSelected({ isBold: !selectedAnn.isBold })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          selectedAnn.isBold
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                        <span>굵게</span>
                      </button>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">글자 색상</label>
                    <div className="flex items-center gap-2">
                      {[
                        '#0f172a', // 검정
                        '#e11d48', // 빨강
                        '#2563eb', // 파랑
                        '#16a34a', // 초록
                        '#d97706', // 주황
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateSelected({ color })}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            selectedAnn.color === color
                              ? 'scale-110 border-slate-900 ring-2 ring-brand-400'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="color"
                        value={selectedAnn.color}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 ml-2 p-0.5"
                        title="사용자 지정 색상"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">배경색</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateSelected({ bgColor: 'transparent' })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedAnn.bgColor === 'transparent'
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        투명 배경
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSelected({ bgColor: '#ffffff' })}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selectedAnn.bgColor === '#ffffff'
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        흰색 박스 배경
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                  <Type className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-semibold">선택된 텍스트 상자가 없습니다.</p>
                  <p className="text-xs mt-1">
                    왼쪽 문서 위를 클릭하거나 '텍스트 상자 추가' 버튼을 눌러보세요.
                  </p>
                </div>
              )}

              {/* Bottom Action */}
              <div className="pt-6 mt-6 border-t border-slate-200">
                <button
                  onClick={handleApply}
                  disabled={isProcessing || annotations.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 active:scale-95 transition-all text-sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>텍스트 합성 중...</span>
                    </>
                  ) : isDone ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>다시 다운로드</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>텍스트 적용 및 PDF 다운로드</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
