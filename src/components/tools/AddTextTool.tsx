import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { addTextAnnotationsToPdf, TextAnnotationItem } from '../../utils/pdfOperations';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PageThumbnail } from '../PageThumbnail';
import {
  Type,
  Download,
  Loader2,
  CheckCircle2,
  Trash2,
  Plus,
  Bold,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Move,
  Check,
} from 'lucide-react';
import { savePdfFile } from '../../utils/downloadHelper';
import confetti from 'canvas-confetti';

// Available font families
const FONT_OPTIONS = [
  { id: '"Noto Sans KR", sans-serif', label: '본고딕 (Noto Sans)' },
  { id: '"Nanum Gothic", sans-serif', label: '나눔고딕 (Nanum Gothic)' },
  { id: '"Nanum Myeongjo", serif', label: '나눔명조 (바탕체)' },
  { id: '"Nanum Pen Script", cursive', label: '나눔손글씨 (필기체)' },
  { id: 'monospace', label: '고정폭 (Monospace)' },
];

export const AddTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1); // 1-based
  const [zoomLevel, setZoomLevel] = useState<number>(1.25); // 1.25 = 125%
  const [annotations, setAnnotations] = useState<TextAnnotationItem[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // In-place inline editing on canvas
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // Dragging state for annotations
  const [draggingAnnId, setDraggingAnnId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; initialXRatio: number; initialYRatio: number }>({
    x: 0,
    y: 0,
    initialXRatio: 0,
    initialYRatio: 0,
  });

  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
            xRatio: 0.18,
            yRatio: 0.22,
            fontSize: 16,
            color: '#1e293b',
            isBold: true,
            bgColor: 'transparent',
            fontFamily: '"Noto Sans KR", sans-serif',
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

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))));
  const handleZoomReset = () => setZoomLevel(1.0);
  const handleZoomFit = () => setZoomLevel(1.5);

  // Finish editing / deselect
  const handleFinishEditing = () => {
    setSelectedAnnId(null);
    setEditingAnnId(null);
  };

  // Click on background of PDF sheet:
  // If an item was selected, deselect it and finish! (Solves Question 1)
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingAnnId) return;

    if (selectedAnnId || editingAnnId) {
      // Deselect and exit editing mode smoothly
      handleFinishEditing();
      return;
    }

    // If nothing was selected, create a new text box at click position
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = Math.max(0.02, Math.min(0.88, (e.clientX - rect.left) / rect.width));
    const yRatio = Math.max(0.02, Math.min(0.95, (e.clientY - rect.top) / rect.height));

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
      fontFamily: '"Noto Sans KR", sans-serif',
    };
    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedAnnId(newId);
  };

  // Mouse Drag to move text box smoothly
  const handleMouseDownAnnotation = (
    e: React.MouseEvent,
    ann: TextAnnotationItem
  ) => {
    e.stopPropagation();
    setSelectedAnnId(ann.id);
    setDraggingAnnId(ann.id);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialXRatio: ann.xRatio,
      initialYRatio: ann.yRatio,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingAnnId || !pageContainerRef.current) return;
      const rect = pageContainerRef.current.getBoundingClientRect();
      const deltaX = (e.clientX - dragStartPos.current.x) / rect.width;
      const deltaY = (e.clientY - dragStartPos.current.y) / rect.height;

      const newXRatio = Math.max(
        0.01,
        Math.min(0.92, dragStartPos.current.initialXRatio + deltaX)
      );
      const newYRatio = Math.max(
        0.01,
        Math.min(0.96, dragStartPos.current.initialYRatio + deltaY)
      );

      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === draggingAnnId ? { ...a, xRatio: newXRatio, yRatio: newYRatio } : a
        )
      );
    };

    const handleMouseUp = () => {
      if (draggingAnnId) {
        setDraggingAnnId(null);
      }
    };

    if (draggingAnnId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingAnnId]);

  const addNewAnnotation = () => {
    const newId = String(Date.now());
    const newAnn: TextAnnotationItem = {
      id: newId,
      pageIndex: currentPage - 1,
      text: '텍스트 입력',
      xRatio: 0.25,
      yRatio: 0.3,
      fontSize: 16,
      color: '#1e293b',
      isBold: false,
      bgColor: 'transparent',
      fontFamily: '"Noto Sans KR", sans-serif',
    };
    setAnnotations((prev) => [...prev, newAnn]);
    setSelectedAnnId(newId);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnId === id) setSelectedAnnId(null);
    if (editingAnnId === id) setEditingAnnId(null);
  };

  const handleApply = async () => {
    if (!file || annotations.length === 0) return;

    try {
      setIsProcessing(true);
      const res = await addTextAnnotationsToPdf(file, annotations);
      savePdfFile(res, `${file.name.replace('.pdf', '')}_edited.pdf`);
      setIsDone(true);
      confetti({ particleCount: 90, spread: 60 });
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
    <div className="max-w-[1550px] mx-auto px-2 sm:px-4 py-4 animate-fade-in">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>PDF 텍스트 추가 (Edit PDF)</span>
            {file && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {file.name} (총 {totalPages}페이지)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            원하는 위치를 클릭하여 텍스트를 입력하고 폰트, 크기, 색상을 변경하세요.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setFile(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
            </button>

            <button
              onClick={handleApply}
              disabled={isProcessing || annotations.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>합성 중...</span>
                </>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>다시 다운로드</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>텍스트 적용 및 PDF 다운로드</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="텍스트를 추가할 PDF 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => setFile(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Top Full-Featured Editing Toolbar */}
          <div className="bg-slate-900 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800">
            {/* Left: Page Navigator & Zoom Controls */}
            <div className="flex items-center gap-2.5">
              {/* Page Navigator */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-200 transition-colors"
                  title="이전 페이지"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold font-mono text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-200 transition-colors"
                  title="다음 페이지"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  title="축소"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="px-2 font-bold font-mono text-slate-200 hover:text-white"
                  title="100% 원본 크기"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  title="확대"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomFit}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors ml-1 border-l border-slate-700"
                  title="너비에 맞게 시원하게 보기 (150%)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add New Box Button */}
              <button
                onClick={addNewAnnotation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 텍스트 추가</span>
              </button>
            </div>

            {/* Right / Center: Selected Text Box Attributes */}
            {selectedAnn ? (
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-800/95 px-3 py-1.5 rounded-xl border border-slate-700">
                {/* 1. Text Content Input with Enter/Esc handling */}
                <div className="flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={selectedAnn.text}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.currentTarget.blur();
                        handleFinishEditing();
                      }
                    }}
                    placeholder="텍스트 입력 (Enter 또는 Esc로 완료)"
                    className="bg-slate-900 border border-slate-600 text-white px-2.5 py-1 rounded-md text-xs w-40 sm:w-52 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 2. Font Family Selector (폰트 변경 기능) */}
                <div className="flex items-center gap-1">
                  <select
                    value={selectedAnn.fontFamily || '"Noto Sans KR", sans-serif'}
                    onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                    className="bg-slate-900 border border-slate-600 text-white px-2 py-1 rounded-md text-xs focus:outline-none focus:border-brand-500"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Font Size */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={selectedAnn.fontSize}
                    onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-600 text-white px-1.5 py-1 rounded-md text-xs w-12 text-center"
                  />
                  <span className="text-[11px] text-slate-400">pt</span>
                </div>

                {/* 4. Bold */}
                <button
                  onClick={() => updateSelected({ isBold: !selectedAnn.isBold })}
                  className={`p-1 rounded font-bold transition-colors ${
                    selectedAnn.isBold
                      ? 'bg-brand-600 text-white'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                  title="굵게"
                >
                  <Bold className="w-4 h-4" />
                </button>

                {/* 5. Color Palette */}
                <div className="flex items-center gap-1">
                  {[
                    '#0f172a', // 블랙
                    '#e11d48', // 레드
                    '#2563eb', // 블루
                    '#16a34a', // 그린
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateSelected({ color: c })}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        selectedAnn.color === c ? 'scale-125 border-white ring-2 ring-brand-500' : 'border-slate-500'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedAnn.color}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border border-slate-600 ml-1 p-0 bg-transparent"
                    title="커스텀 색상"
                  />
                </div>

                {/* 6. Background Toggle */}
                <button
                  onClick={() =>
                    updateSelected({
                      bgColor: selectedAnn.bgColor === '#ffffff' ? 'transparent' : '#ffffff',
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                    selectedAnn.bgColor === '#ffffff'
                      ? 'bg-white text-slate-900 border-white font-bold'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  흰색 배경
                </button>

                {/* 7. Complete & Exit Button (입력 완료 빠져나오기 버튼) */}
                <button
                  onClick={handleFinishEditing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow-xs transition-colors text-[11px]"
                  title="입력 완료 (Enter 또는 문서 바깥 클릭으로도 완료 가능)"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>완료</span>
                </button>

                {/* Delete button */}
                <button
                  onClick={() => removeAnnotation(selectedAnn.id)}
                  className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded transition-colors ml-0.5"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic flex items-center gap-1.5">
                <span>문서 위의 텍스트를 클릭하거나 더블클릭하여 편집하세요.</span>
              </div>
            )}
          </div>

          {/* Huge Main Canvas Area with Scrolling */}
          <div
            onClick={handleFinishEditing}
            className="relative bg-slate-200/80 p-6 md:p-12 overflow-auto max-h-[calc(100vh-230px)] min-h-[680px] flex items-start justify-center select-none"
          >
            {/* Sheet Container matching zoomLevel */}
            <div
              ref={pageContainerRef}
              onClick={(e) => {
                e.stopPropagation();
                handleSheetClick(e);
              }}
              className="relative bg-white shadow-2xl rounded-sm transition-all duration-100 ease-out cursor-crosshair group ring-1 ring-slate-900/10"
              style={{
                width: `${Math.round(750 * zoomLevel)}px`,
              }}
            >
              {/* HiDPI Crisp PDF Page Rendering */}
              <PageThumbnail
                file={file}
                pageNumber={currentPage}
                renderScale={Math.max(1.2, zoomLevel * 1.5)} // Crisp vector/text quality
                className="w-full h-auto pointer-events-none rounded-sm"
              />

              {/* Overlaid Draggable & In-Place Text Annotations */}
              {currentPageAnnotations.map((ann) => {
                const isSelected = ann.id === selectedAnnId;
                const isEditing = ann.id === editingAnnId;
                const isDraggingThis = draggingAnnId === ann.id;

                return (
                  <div
                    key={ann.id}
                    onMouseDown={(e) => handleMouseDownAnnotation(e, ann)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setSelectedAnnId(ann.id);
                      setEditingAnnId(ann.id);
                    }}
                    className={`absolute rounded px-2 py-1 transition-shadow duration-75 select-none ${
                      isSelected
                        ? 'ring-2 ring-brand-500 shadow-xl z-30 cursor-grab active:cursor-grabbing'
                        : 'border border-dashed border-slate-400 hover:border-brand-400 hover:shadow-md z-20 cursor-pointer'
                    } ${isDraggingThis ? 'opacity-85 scale-105' : ''}`}
                    style={{
                      left: `${ann.xRatio * 100}%`,
                      top: `${ann.yRatio * 100}%`,
                      color: ann.color,
                      fontWeight: ann.isBold ? 700 : 400,
                      fontFamily: ann.fontFamily || '"Noto Sans KR", sans-serif',
                      // Font size scaled relative to document zoom so it looks 1:1 identical to final output
                      fontSize: `${ann.fontSize * (zoomLevel / 1.0)}px`,
                      backgroundColor:
                        ann.bgColor === 'transparent'
                          ? isSelected
                            ? 'rgba(255, 241, 242, 0.85)'
                            : 'rgba(255, 255, 255, 0.4)'
                          : ann.bgColor,
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={ann.text}
                        onChange={(e) => updateSelected({ text: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            setEditingAnnId(null);
                          }
                        }}
                        onBlur={() => setEditingAnnId(null)}
                        className="bg-white/95 text-slate-900 border border-brand-500 outline-none px-1 rounded shadow-sm w-auto min-w-[80px]"
                        style={{
                          fontSize: `${ann.fontSize * (zoomLevel / 1.0)}px`,
                          fontFamily: ann.fontFamily || '"Noto Sans KR", sans-serif',
                        }}
                      />
                    ) : (
                      <span className="whitespace-pre-wrap leading-tight block">
                        {ann.text || '(텍스트를 입력하세요)'}
                      </span>
                    )}

                    {/* Drag Handle Tag & Exit Hint */}
                    {isSelected && !isEditing && (
                      <div className="absolute -top-5 left-0 bg-brand-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-sm pointer-events-none whitespace-nowrap">
                        <Move className="w-2.5 h-2.5" /> 드래그하여 이동 (더블클릭으로 직접 입력)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Helpful Info Bar */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">💡 사용 팁:</span>
              <span>
                텍스트 입력을 마친 후 <strong>[Enter 키]</strong>, <strong>[Esc 키]</strong>를 누르거나
                툴바의 <strong>[완료 ✓]</strong> 버튼을 누르면 입력창에서 빠져나옵니다. 문서의 빈 곳을 클릭해도 완료됩니다.
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              배율: {Math.round(zoomLevel * 100)}% • 가로 너비: {Math.round(750 * zoomLevel)}px
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
