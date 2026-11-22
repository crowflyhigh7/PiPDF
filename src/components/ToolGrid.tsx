import React, { useState } from 'react';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolCategory, ToolId } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { Sparkles, Shield, Zap } from 'lucide-react';

interface ToolGridProps {
  onSelectTool: (id: ToolId) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const categories: { key: ToolCategory | 'all'; label: string }[] = [
    { key: 'all', label: '모든 도구' },
    { key: 'organize', label: '정리 & 병합' },
    { key: 'optimize', label: '최적화' },
    { key: 'convert', label: '변환' },
    { key: 'edit', label: '편집 & 주석' },
    { key: 'security', label: '보안' },
  ];

  const filteredTools =
    selectedCategory === 'all'
      ? TOOLS_DATA
      : TOOLS_DATA.filter((tool) => tool.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-4 border border-brand-200/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>iLovePDF 급 기능을 100% 프라이버시 보장으로 무료 제공</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          PDF 작업에 필요한 <span className="text-brand-600 underline decoration-brand-200">모든 도구</span>를 한 곳에서
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          병합, 분할, 압축, 이미지 변환, 회전, 페이지 정리부터 전자 서명까지.<br className="hidden sm:inline" />
          외부 서버 업로드 없이 브라우저에서 안전하고 빠르게 처리하세요.
        </p>

        {/* Feature Highlights Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <Shield className="w-4 h-4 text-emerald-500" /> 100% 로컬 보안 (서버 미전송)
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <Zap className="w-4 h-4 text-amber-500" /> 무제한 용량 & 즉각 처리
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            ✨ 완전 무료 & 광고 없음
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group relative bg-white border border-slate-200/90 rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-brand-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all flex items-center justify-center shadow-inner group-hover:shadow-md group-hover:shadow-brand-500/30">
                  <DynamicIcon name={tool.iconName} className="w-7 h-7" />
                </div>
                {tool.badge && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                    {tool.badge}
                  </span>
                )}
                {tool.popular && !tool.badge && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    인기
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-1.5">
                {tool.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tool.shortDesc}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
              <span>시작하기</span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
