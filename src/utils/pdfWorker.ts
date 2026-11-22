import * as pdfjsLib from 'pdfjs-dist';

// Use verified matching cdn worker to avoid cross-origin / bundler worker issues in SPA
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export { pdfjsLib };
