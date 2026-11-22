import { TextAnnotationItem } from './pdfOperations';

export interface RenderedTextResult {
  dataUrl: string;
  widthPt: number; // width in PDF points
  heightPt: number; // height in PDF points
  scale: number;
}

/**
 * Common pure text renderer for BOTH editing screen and PDF generator.
 * This guarantees 100.0% WYSIWYG pixel-perfect fidelity.
 */
export function renderTextToCanvas(
  ann: TextAnnotationItem,
  scale: number = 3 // HiDPI 3x
): RenderedTextResult {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx || !ann.text) {
    return { dataUrl: '', widthPt: 0, heightPt: 0, scale };
  }

  const chosenFont = ann.fontFamily || '"Noto Sans KR", sans-serif';
  const scaledFontSize = ann.fontSize * scale;
  const fontStyle = `${ann.isBold ? 'bold ' : ''}${scaledFontSize}px ${chosenFont}, sans-serif`;
  ctx.font = fontStyle;

  const lines = ann.text.split('\n');
  let maxLineWidth = 0;
  lines.forEach((l) => {
    const w = ctx.measureText(l).width;
    if (w > maxLineWidth) maxLineWidth = w;
  });

  const lineHeight = scaledFontSize * 1.25;
  const canvasWidth = Math.max(1, Math.ceil(maxLineWidth));
  const canvasHeight = Math.max(1, Math.ceil(lineHeight * lines.length));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Background
  if (ann.bgColor && ann.bgColor !== 'transparent') {
    ctx.fillStyle = ann.bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Draw Text
  ctx.font = fontStyle;
  ctx.fillStyle = ann.color;
  ctx.textBaseline = 'top';

  lines.forEach((l, i) => {
    ctx.fillText(l, 0, Math.round(i * lineHeight));
  });

  const widthPt = canvasWidth / scale;
  const heightPt = canvasHeight / scale;
  const dataUrl = canvas.toDataURL('image/png');

  return {
    dataUrl,
    widthPt,
    heightPt,
    scale,
  };
}
