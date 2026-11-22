import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, Sparkles, Search, X } from 'lucide-react';
import { ToolId } from '../types';
import { TOOLS_DATA } from '../data/toolsData';

interface HeaderProps {
  currentTool: ToolId | null;
  onSelectTool: (id: ToolId | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTool, onSelectTool }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS_DATA.filter((tool) =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onSelectTool(null)}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all">
              Pi
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Pi<span className="text-brand-600">PDF</span>
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectTool('merge')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentTool === 'merge'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              PDF 병합
            </button>
            <button
              onClick={() => onSelectTool('split')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentTool === 'split'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              PDF 분할
            </button>
            <button
              onClick={() => onSelectTool('compress')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentTool === 'compress'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              PDF 압축
            </button>
            <button
              onClick={() => onSelectTool('pdf-to-img')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentTool === 'pdf-to-img'
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              PDF 변환
            </button>

            {/* All tools dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span>모든 도구</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in max-h-[80vh] overflow-y-auto">
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      전체 기능 목록
                    </div>
                    {TOOLS_DATA.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTool(t.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentTool === t.id ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{t.title}</span>
                        {t.badge && (
                          <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded">
                            {t.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {/* Quick search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            title="기능 검색"
          >
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline text-xs text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
              검색
            </span>
          </button>

          {/* Privacy safe badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>서버 미전송 (로컬 처리)</span>
          </div>

          <a
            href="https://github.com/crowflyhigh7/PiPDF"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="어떤 PDF 작업을 원하시나요? (예: 병합, 압축, 이미지 변환)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-base outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                        {tool.title}
                      </div>
                      <div className="text-xs text-slate-500">{tool.shortDesc}</div>
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-400">
                  일치하는 도구를 찾을 수 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
