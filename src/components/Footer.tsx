import React from 'react';
import { Shield, Zap, Lock, Globe, Heart } from 'lucide-react';
import { ToolId } from '../types';

interface FooterProps {
  onSelectTool: (id: ToolId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-24 border-t border-slate-800">
      {/* Feature Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">100% 비공개 & 안전한 처리</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              사용자의 문서나 이미지는 외부 서버로 절대 전송되지 않습니다. 모든 연산은 고객님의 웹 브라우저 내에서 직접 수행됩니다.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">초고속 클라이언트 가속</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              업로드/다운로드 대기 시간 없이 즉각적으로 페이지를 병합, 분할, 압축 및 변환합니다. 파일 크기 제한 없이 자유롭게 사용하세요.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">글로벌 엣지 배포 (Cloudflare)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cloudflare 글로벌 엣지 네트워크를 통해 언제 어디서나 밀리초 단위로 초고속 로딩됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">
              Pi
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Pi<span className="text-brand-500">PDF</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            iLovePDF 수준의 강력한 PDF 편집 기능들을 완전 무료이자 프라이버시가 보장되는 환경에서 제공합니다.
          </p>
          <div className="text-xs text-slate-500">
            도메인: <span className="text-slate-300 font-mono">PiPDF.iamchang.me</span>
          </div>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-3">정리 및 최적화</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => onSelectTool('merge')} className="hover:text-white transition-colors">
                PDF 병합 (Merge)
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('split')} className="hover:text-white transition-colors">
                PDF 분할 (Split)
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('organize')} className="hover:text-white transition-colors">
                페이지 정리 및 순서 변경
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('remove')} className="hover:text-white transition-colors">
                페이지 삭제
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('compress')} className="hover:text-white transition-colors">
                PDF 압축 (Compress)
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-3">변환 및 편집</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => onSelectTool('pdf-to-img')} className="hover:text-white transition-colors">
                PDF to JPG 변환
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('img-to-pdf')} className="hover:text-white transition-colors">
                JPG to PDF 변환
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('rotate')} className="hover:text-white transition-colors">
                PDF 회전
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('page-numbers')} className="hover:text-white transition-colors">
                페이지 번호 삽입
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('watermark')} className="hover:text-white transition-colors">
                워터마크 각인
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTool('sign')} className="hover:text-white transition-colors">
                전자 서명 (Sign)
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-bold text-sm mb-3">보안 및 정책</h5>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Shield className="w-4 h-4" />
              <span>No-Server Storage</span>
            </div>
            <p>
              작업하신 모든 PDF와 이미지는 브라우저 메모리 안에서만 휘발 처리되므로 기밀 문서도 안심하고 작업하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          <span>© 2026 PiPDF (PiPDF.iamchang.me). Built with</span>
          <Heart className="w-3.5 h-3.5 text-brand-500 inline fill-brand-500" />
          <span>for universal productivity.</span>
        </p>
      </div>
    </footer>
  );
};
