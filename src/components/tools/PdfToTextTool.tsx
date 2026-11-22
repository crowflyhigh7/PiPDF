import React, { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { extractTextFromPdf } from '../../utils/pdfOperations';
import { Copy, Download, Loader2, Check, RefreshCw } from 'lucide-react';
import { saveAs } from 'file-saver';

export const PdfToTextTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExtract = async (uploadedFile: File) => {
    setFile(uploadedFile);
    try {
      setIsProcessing(true);
      const text = await extractTextFromPdf(uploadedFile);
      setExtractedText(text);
    } catch (err) {
      console.error(err);
      alert('텍스트를 추출할 수 없거나 스캔본(이미지) 문서입니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!file || !extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${file.name.replace('.pdf', '')}_text.txt`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">PDF to Text 변환</h2>
        <p className="text-sm text-slate-500 mt-2">
          PDF 문서 내의 모든 텍스트 레이어를 순수 텍스트로 추출하여 복사 및 다운로드합니다.
        </p>
      </div>

      {!file ? (
        <FileUploader
          buttonLabel="텍스트를 추출할 PDF 파일 선택"
          description="또는 여기에 PDF 파일을 끌어다 놓으세요"
          onFilesSelected={(files) => handleExtract(files[0])}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">{file.name}</h3>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setExtractedText('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
            </button>
          </div>

          {isProcessing ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <span className="text-sm font-semibold">텍스트 레이어 파싱 중...</span>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">
                  추출된 내용 ({extractedText.length.toLocaleString()} 글자)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사됨!' : '클립보드 복사'}</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TXT 파일 저장</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={extractedText}
                className="w-full h-96 p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
