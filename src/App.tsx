import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToolGrid } from './components/ToolGrid';
import { ToolId } from './types';
import { TOOLS_DATA } from './data/toolsData';

// Tools
import { MergeTool } from './components/tools/MergeTool';
import { SplitTool } from './components/tools/SplitTool';
import { OrganizeTool } from './components/tools/OrganizeTool';
import { RemovePagesTool } from './components/tools/RemovePagesTool';
import { CompressTool } from './components/tools/CompressTool';
import { PdfToImgTool } from './components/tools/PdfToImgTool';
import { ImgToPdfTool } from './components/tools/ImgToPdfTool';
import { RotateTool } from './components/tools/RotateTool';
import { WatermarkTool } from './components/tools/WatermarkTool';
import { PageNumberTool } from './components/tools/PageNumberTool';
import { SignTool } from './components/tools/SignTool';
import { AddTextTool } from './components/tools/AddTextTool';
import { ProtectTool } from './components/tools/ProtectTool';
import { UnlockTool } from './components/tools/UnlockTool';
import { PdfToTextTool } from './components/tools/PdfToTextTool';
import { ArrowLeft, Home } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTool, setCurrentTool] = useState<ToolId | null>(null);

  const selectedToolMeta = TOOLS_DATA.find((t) => t.id === currentTool);

  const renderToolWorkspace = () => {
    switch (currentTool) {
      case 'merge':
        return <MergeTool />;
      case 'split':
        return <SplitTool />;
      case 'organize':
        return <OrganizeTool />;
      case 'remove':
        return <RemovePagesTool />;
      case 'compress':
        return <CompressTool />;
      case 'pdf-to-img':
        return <PdfToImgTool />;
      case 'img-to-pdf':
        return <ImgToPdfTool />;
      case 'rotate':
        return <RotateTool />;
      case 'watermark':
        return <WatermarkTool />;
      case 'page-numbers':
        return <PageNumberTool />;
      case 'sign':
        return <SignTool />;
      case 'add-text':
        return <AddTextTool />;
      case 'protect':
        return <ProtectTool />;
      case 'unlock':
        return <UnlockTool />;
      case 'pdf-to-text':
        return <PdfToTextTool />;
      default:
        return <ToolGrid onSelectTool={setCurrentTool} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Header */}
      <Header currentTool={currentTool} onSelectTool={setCurrentTool} />

      {/* Main Content */}
      <main className="flex-1">
        {currentTool && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={() => setCurrentTool(null)}
                className="flex items-center gap-1 hover:text-brand-600 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>홈</span>
              </button>
              <span>/</span>
              <span className="text-slate-800 font-bold">{selectedToolMeta?.title}</span>

              <button
                onClick={() => setCurrentTool(null)}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>모든 도구로 돌아가기</span>
              </button>
            </div>
          </div>
        )}

        {renderToolWorkspace()}
      </main>

      {/* Footer */}
      <Footer onSelectTool={setCurrentTool} />
    </div>
  );
};

export default App;
