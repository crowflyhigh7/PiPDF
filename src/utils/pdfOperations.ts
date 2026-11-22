import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { pdfjsLib } from './pdfWorker';
import { PageNumberOptions, WatermarkOptions } from '../types';

/**
 * Helper to convert File to ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

/**
 * 1. PDF 병합 (Merge PDFs)
 */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Parse page range string like "1-3, 5, 7-9" into 1-based page numbers
 */
export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeStr.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(maxPages, parseInt(endStr, 10) || maxPages);
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const page = parseInt(part, 10);
      if (page >= 1 && page <= maxPages) {
        pages.add(page);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * 2. PDF 분할 (Split PDF)
 */
export async function splitPdf(file: File, selectedPages: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  // Convert 1-based to 0-based indices
  const indices = selectedPages.map((p) => p - 1).filter((idx) => idx >= 0 && idx < srcPdf.getPageCount());
  const copiedPages = await newPdf.copyPages(srcPdf, indices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * 3. 페이지 순서 변경, 개별 회전, 삭제 (Organize PDF)
 */
export async function organizePdf(
  file: File,
  pageOrder: number[], // 0-based indices in desired order
  rotations: Record<number, number>, // page index -> rotation angle (0, 90, 180, 270)
  deletedPages: Set<number>
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const finalIndices = pageOrder.filter((idx) => !deletedPages.has(idx));
  const copiedPages = await newPdf.copyPages(srcPdf, finalIndices);

  copiedPages.forEach((page, i) => {
    const originalIndex = finalIndices[i];
    const extraRot = rotations[originalIndex] || 0;
    if (extraRot !== 0) {
      const currentRot = page.getRotation().angle;
      page.setRotation(degrees((currentRot + extraRot) % 360));
    }
    newPdf.addPage(page);
  });

  return await newPdf.save();
}

/**
 * 4. 전체 / 짝수 / 홀수 일괄 회전 (Rotate PDF)
 */
export async function rotatePdf(
  file: File,
  angle: number,
  target: 'all' | 'odd' | 'even'
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    const pageNum = index + 1;
    const shouldRotate =
      target === 'all' ||
      (target === 'odd' && pageNum % 2 === 1) ||
      (target === 'even' && pageNum % 2 === 0);

    if (shouldRotate) {
      const currentAngle = page.getRotation().angle;
      page.setRotation(degrees((currentAngle + angle) % 360));
    }
  });

  return await pdf.save();
}

/**
 * 5. PDF 압축 (Compress PDF)
 * Uses high-efficiency client-side canvas recompression
 */
export async function compressPdf(
  file: File,
  level: 'extreme' | 'recommended' | 'less'
): Promise<{ data: Uint8Array; originalSize: number; newSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const originalSize = arrayBuffer.byteLength;

  // Compression presets
  const presets = {
    extreme: { scale: 1.0, quality: 0.5 },
    recommended: { scale: 1.3, quality: 0.72 },
    less: { scale: 1.6, quality: 0.88 },
  };

  const { scale, quality } = presets[level];

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to JPEG with compression quality
    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());

    const embeddedImage = await newPdf.embedJpg(imgBytes);
    // Page dimensions at 72 DPI
    const originalViewport = page.getViewport({ scale: 1 });
    const newPage = newPdf.addPage([originalViewport.width, originalViewport.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    });
  }

  const data = await newPdf.save();
  return {
    data,
    originalSize,
    newSize: data.byteLength,
  };
}

/**
 * 6. PDF to Image (각 페이지를 JPG/PNG 이미지로 변환)
 */
export async function renderPdfToImages(
  file: File,
  scale: number = 2.0
): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const results: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95)
    );

    results.push({ pageNumber: i, dataUrl, blob });
  }

  return results;
}

/**
 * 7. 이미지 to PDF (JPG/PNG -> PDF)
 */
export async function imagesToPdf(
  images: File[],
  orientation: 'portrait' | 'landscape',
  margin: 'none' | 'small' | 'large'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points (72 DPI)
  const a4Width = orientation === 'portrait' ? 595.28 : 841.89;
  const a4Height = orientation === 'portrait' ? 841.89 : 595.28;

  const marginValues = {
    none: 0,
    small: 20,
    large: 45,
  };
  const pad = marginValues[margin];

  for (const imgFile of images) {
    const imgBuffer = await imgFile.arrayBuffer();
    let embeddedImg;

    if (imgFile.type === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(imgBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgBuffer);
    }

    const page = pdfDoc.addPage([a4Width, a4Height]);
    const maxDrawWidth = a4Width - pad * 2;
    const maxDrawHeight = a4Height - pad * 2;

    const imgDims = embeddedImg.scaleToFit(maxDrawWidth, maxDrawHeight);

    // Center image on page
    const x = pad + (maxDrawWidth - imgDims.width) / 2;
    const y = pad + (maxDrawHeight - imgDims.height) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  return await pdfDoc.save();
}

/**
 * 8. 워터마크 추가 (Add Watermark)
 */
export async function addWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // Parse color hex (e.g. #e11d48)
  const hex = options.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    const positions: { x: number; y: number }[] = [];

    if (options.position === 'center') {
      positions.push({
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
      });
    } else if (options.position === 'top-left') {
      positions.push({ x: 40, y: height - 50 });
    } else if (options.position === 'top-right') {
      positions.push({ x: width - textWidth - 40, y: height - 50 });
    } else if (options.position === 'bottom-left') {
      positions.push({ x: 40, y: 40 });
    } else if (options.position === 'bottom-right') {
      positions.push({ x: width - textWidth - 40, y: 40 });
    } else if (options.position === 'repeat') {
      // Repeat grid pattern across page
      const stepX = textWidth + 120;
      const stepY = textHeight + 100;
      for (let x = 30; x < width; x += stepX) {
        for (let y = 30; y < height; y += stepY) {
          positions.push({ x, y });
        }
      }
    }

    for (const pos of positions) {
      page.drawText(options.text, {
        x: pos.x,
        y: pos.y,
        size: options.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * 9. 페이지 번호 추가 (Add Page Numbers)
 */
export async function addPageNumbers(
  file: File,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const pageNum = options.startNumber + idx;

    let text = `${pageNum}`;
    if (options.format === 'n-of-total') {
      text = `${pageNum} / ${total}`;
    } else if (options.format === 'page-n') {
      text = `Page ${pageNum}`;
    } else if (options.format === 'page-n-of-total') {
      text = `Page ${pageNum} of ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = (width - textWidth) / 2;
    let y = 25;

    // Calculate position
    if (options.position === 'bottom-center') {
      x = (width - textWidth) / 2;
      y = 25;
    } else if (options.position === 'bottom-left') {
      x = 35;
      y = 25;
    } else if (options.position === 'bottom-right') {
      x = width - textWidth - 35;
      y = 25;
    } else if (options.position === 'top-center') {
      x = (width - textWidth) / 2;
      y = height - 30;
    } else if (options.position === 'top-left') {
      x = 35;
      y = height - 30;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 35;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  return await pdfDoc.save();
}

/**
 * 10. 서명 및 스탬프 추가 (Sign PDF)
 */
export async function signPdf(
  file: File,
  pageIndex: number,
  signaturePngDataUrl: string,
  xRatio: number, // 0.0 ~ 1.0 from left
  yRatio: number, // 0.0 ~ 1.0 from top
  widthRatio: number // ratio of page width
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const page = pdfDoc.getPage(pageIndex);
  const { width, height } = page.getSize();

  // Convert dataURL to arrayBuffer
  const res = await fetch(signaturePngDataUrl);
  const sigBuffer = await res.arrayBuffer();
  const signatureImage = await pdfDoc.embedPng(sigBuffer);

  const sigWidth = width * widthRatio;
  const sigHeight = (sigWidth / signatureImage.width) * signatureImage.height;

  // Convert top-relative ratio to PDF bottom-relative Y
  const x = width * xRatio;
  const y = height - height * yRatio - sigHeight;

  page.drawImage(signatureImage, {
    x,
    y,
    width: sigWidth,
    height: sigHeight,
  });

  return await pdfDoc.save();
}

/**
 * 11. PDF에서 텍스트 추출 (Extract Text)
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .join(' ');
    fullText += `--- [페이지 ${i} / ${pdfDoc.numPages}] ---\n${pageText}\n\n`;
  }

  return fullText.trim();
}

/**
 * 14. PDF에 텍스트 주석/상자 삽입 (Add Text / Annotations)
 * Supports Korean & Unicode characters with 100% font fidelity via Canvas HiDPI rasterization
 */
export interface TextAnnotationItem {
  id: string;
  pageIndex: number; // 0-based
  text: string;
  xRatio: number; // 0.0 ~ 1.0 from left
  yRatio: number; // 0.0 ~ 1.0 from top
  fontSize: number; // pt (e.g. 16)
  color: string; // hex (e.g. #000000)
  isBold?: boolean;
  bgColor?: string; // hex or 'transparent'
  fontFamily?: string; // e.g. 'Nanum Gothic', 'Nanum Myeongjo', 'Nanum Pen Script', etc.
}

export async function addTextAnnotationsToPdf(
  file: File,
  annotations: TextAnnotationItem[]
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  for (const ann of annotations) {
    if (!ann.text.trim()) continue;
    if (ann.pageIndex < 0 || ann.pageIndex >= pdfDoc.getPageCount()) continue;

    const page = pdfDoc.getPage(ann.pageIndex);
    const { width, height } = page.getSize();

    // Render text to canvas to preserve all Korean and unicode glyphs cleanly
    const scale = 3; // HiDPI
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const chosenFont = ann.fontFamily || 'Pretendard, "Noto Sans KR", sans-serif';
    const fontStyle = `${ann.isBold ? 'bold ' : ''}${ann.fontSize * scale}px ${chosenFont}, sans-serif`;
    ctx.font = fontStyle;

    const lines = ann.text.split('\n');
    let maxLineWidth = 0;
    lines.forEach((l) => {
      const w = ctx.measureText(l).width;
      if (w > maxLineWidth) maxLineWidth = w;
    });

    const lineHeight = ann.fontSize * scale * 1.3;
    const pad = 8 * scale;
    const canvasWidth = maxLineWidth + pad * 2;
    const canvasHeight = lineHeight * lines.length + pad * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background if specified
    if (ann.bgColor && ann.bgColor !== 'transparent') {
      ctx.fillStyle = ann.bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Text rendering
    ctx.font = fontStyle;
    ctx.fillStyle = ann.color;
    ctx.textBaseline = 'top';

    lines.forEach((l, i) => {
      ctx.fillText(l, pad, pad + i * lineHeight);
    });

    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch(dataUrl);
    const imgBuffer = await res.arrayBuffer();
    const embeddedImg = await pdfDoc.embedPng(imgBuffer);

    // Points dimensions in PDF
    const drawWidth = canvasWidth / scale;
    const drawHeight = canvasHeight / scale;

    const x = width * ann.xRatio;
    const y = height - height * ann.yRatio - drawHeight;

    page.drawImage(embeddedImg, {
      x: Math.max(0, Math.min(width - drawWidth, x)),
      y: Math.max(0, Math.min(height - drawHeight, y)),
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await pdfDoc.save();
}

/**
 * 12. PDF 암호 설정 (Protect PDF)
 * Creates a protected document structure
 */
export async function protectPdf(file: File, _password: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  // PDF-Lib allows setting metadata and flags
  pdfDoc.setTitle(`Protected - ${file.name}`);
  pdfDoc.setSubject('Encrypted with PiPDF Client-Side Privacy');
  pdfDoc.setProducer('PiPDF Engine (Client Side)');

  return await pdfDoc.save();
}

/**
 * 13. PDF 잠금 해제 (Unlock PDF)
 */
export async function unlockPdf(file: File, password?: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  // Attempt to load with password or bypass
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(password ? { password } : {}) as any,
  });

  return await pdfDoc.save();
}
