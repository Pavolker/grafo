import React from 'react';
import { DetailLevel, GraphType } from '../types';

interface ControlPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onClear: () => void;
  detailLevel: DetailLevel;
  setDetailLevel: (level: DetailLevel) => void;
  graphType: GraphType;
  setGraphType: (type: GraphType) => void;
  hasData: boolean;
  onExportJSON: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  inputText,
  setInputText,
  isLoading,
  onGenerate,
  onClear,
  detailLevel,
  setDetailLevel,
  graphType,
  setGraphType,
  hasData,
  onExportJSON
}) => {
  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;
  const handleSample = () => {
    setInputText("A Inteligência Artificial Generativa (IA Generativa) é um tipo de inteligência artificial focada na criação de novos conteúdos, como texto, imagens, áudio e vídeo, em resposta a prompts do usuário. Diferente da IA tradicional, que analisa dados para fazer previsões, a IA Generativa utiliza modelos de aprendizado profundo, como Redes Neurais e Transformers, para aprender padrões em grandes volumes de dados e gerar novas informações originais. Exemplos notáveis incluem o GPT-4 da OpenAI, o Gemini do Google e o Claude da Anthropic. Essas tecnologias estão transformando setores como marketing, programação, design e educação, permitindo automação criativa e personalização em escala.");
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 p-6 overflow-y-auto w-full md:w-96 shrink-0 transition-all duration-300 shadow-2xl z-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
          <img src="/centauro.png" alt="Logo" className="h-10 w-auto" />
          MDH GRAFOS
          <img src="/mdh.gif" alt="Logo MDH" className="h-10 w-auto" />
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium leading-relaxed text-center">
          Transforme seus textos em <span className="text-indigo-600 dark:text-indigo-400">Grafos de Conhecimento</span> interativos.
        </p>
        {!hasApiKey && (
          <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50/80 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3 text-xs font-semibold shadow-sm">
            Gemini desativada: configure a variável `VITE_GEMINI_API_KEY` no Netlify.
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-1 flex flex-col min-h-0 mb-6 group">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Texto de Entrada
          </label>
          <button
            onClick={handleSample}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1"
            title="Inserir texto de exemplo"
          >
            <span className="material-icons-round text-[14px]">playlist_add</span>
            Exemplo
          </button>
        </div>
        <div className="relative flex-1 flex flex-col">
          <textarea
            className="flex-1 w-full p-4 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all duration-200 text-sm leading-relaxed shadow-inner hover:bg-white dark:hover:bg-gray-800"
            placeholder="Cole seu artigo, anotação ou resumo aqui..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          ></textarea>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-md backdrop-blur-sm">
            {inputText.length} chars
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-6 space-y-6">
        {/* Graph Type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
            Tipo de Grafo
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(GraphType).map((type) => (
              <button
                key={type}
                onClick={() => setGraphType(type)}
                className={`flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 text-left ${graphType === type
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                  }`}
              >
                <span className="material-icons-round text-sm">
                  {type === GraphType.DEFAULT && 'hub'}
                  {type === GraphType.TREE && 'account_tree'}
                  {type === GraphType.TIMELINE && 'timeline'}
                  {type === GraphType.HIERARCHICAL && 'layers'}
                  {type === GraphType.COMMUNITY && 'bubble_chart'}
                </span>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Detail Level */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
            Nível de Detalhe
          </label>
          <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl gap-1">
            {Object.values(DetailLevel).map((level) => (
              <button
                key={level}
                onClick={() => setDetailLevel(level)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all duration-200 ${detailLevel === level
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-md scale-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 scale-95 hover:scale-100'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onGenerate}
          disabled={isLoading || inputText.trim().length === 0 || !hasApiKey}
          className={`
            w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all duration-300 transform
            ${isLoading || inputText.trim().length === 0 || !hasApiKey
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70 grayscale'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="animate-pulse">Analisando...</span>
            </>
          ) : (
            <>
              <span className="material-icons-round text-lg">auto_awesome</span>
              {hasApiKey ? 'Gerar Grafo' : 'Configurar chave requerida'}
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all active:scale-95"
          >
            Limpar
          </button>

          {hasData && (
            <button
              onClick={onExportJSON}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold border-2 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-sm">download</span>
              JSON
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Legenda do Grafo</p>
        <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span> Conceito</div>
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span> Pessoa</div>
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span> Lugar</div>
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span> Evento</div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
