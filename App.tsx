import React, { useState, useEffect, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import GraphVisualization from './components/GraphVisualization';
import { generateGraphFromText } from './services/geminiService';
import { AppState, DetailLevel, GraphData, GraphType } from './types';

const App: React.FC = () => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // App logic state
  const [state, setState] = useState<AppState>({
    inputText: '',
    graphData: null,
    isLoading: false,
    detailLevel: DetailLevel.MEDIUM,
    graphType: GraphType.DEFAULT,
    error: null,
  });

  // Graph container dimension state
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (graphContainerRef.current) {
        setGraphDimensions({
          width: graphContainerRef.current.clientWidth,
          height: graphContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update HTML class for dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleGenerate = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await generateGraphFromText(state.inputText, state.detailLevel, state.graphType);
      setState(prev => ({ ...prev, graphData: data, isLoading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "An unexpected error occurred."
      }));
    }
  };

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      inputText: '',
      graphData: null,
      error: null
    }));
  };

  const handleExportJSON = () => {
    if (!state.graphData) return;
    const jsonString = JSON.stringify(state.graphData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "textgraph-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">

      {/* Mobile Overlay for Error */}
      {state.error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-auto">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400/50 animate-in slide-in-from-top-5">
            <span className="material-icons-round">error_outline</span>
            <p className="font-medium">{state.error}</p>
            <button onClick={() => setState(s => ({ ...s, error: null }))} className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors">
              <span className="material-icons-round text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full min-h-0">

        {/* Sidebar */}
        <ControlPanel
          inputText={state.inputText}
          setInputText={(text) => setState(s => ({ ...s, inputText: text }))}
          isLoading={state.isLoading}
          onGenerate={handleGenerate}
          onClear={handleClear}
          detailLevel={state.detailLevel}
          setDetailLevel={(level) => setState(s => ({ ...s, detailLevel: level }))}
          graphType={state.graphType}
          setGraphType={(type) => setState(s => ({ ...s, graphType: type }))}
          hasData={!!state.graphData}
          onExportJSON={handleExportJSON}
        />

        {/* Visualization Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-gray-900/50 backdrop-blur-sm relative transition-colors duration-300">

          {/* Header Actions (Theme Toggle) */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="material-icons-round">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Graph Container */}
          <div ref={graphContainerRef} className="flex-1 w-full h-full p-4">
            <GraphVisualization
              data={state.graphData}
              width={graphDimensions.width}
              height={graphDimensions.height}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-2 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 text-center z-10 shrink-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          MDH - Versão 1.0. @Copywriter 2025. Desenvolvido por PVolker
        </p>
      </footer>
    </div>
  );
};

export default App;