import React, { useState, useRef } from 'react';
import { analyzeCompanyText, analyzeBusinessCard } from './services/geminiService';
import { ReportView } from './components/ReportView';
import { SearchIcon, UploadIcon, LoadingSpinner } from './components/Icons';
import { AnalysisState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    mode: 'text',
  });

  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setState({ ...state, isLoading: true, error: null, result: null, mode: 'text' });
    try {
      const result = await analyzeCompanyText(inputText);
      setState(prev => ({ ...prev, isLoading: false, result }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ ...state, isLoading: true, error: null, result: null, mode: 'image' });
    try {
      const result = await analyzeBusinessCard(file);
      setState(prev => ({ ...prev, isLoading: false, result }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              TradeScout AI
            </span>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Global Trade Intelligence
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
        
        {/* Hero Section */}
        {!state.result && !state.isLoading && (
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
              Analyze Any Company <br/>
              <span className="text-blue-600">In Seconds</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Evaluate B2B clients, extract business card data, and generate export strategies using Google's latest Gemini models and Search Grounding.
            </p>
          </div>
        )}

        {/* Input Card */}
        <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-500 ${state.result ? 'mb-8' : 'mb-20'}`}>
          <div className="p-2 bg-slate-100 flex gap-1 rounded-t-2xl border-b border-slate-200">
            <button 
              onClick={() => setState(s => ({...s, mode: 'text'}))}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${state.mode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Company URL / Name
            </button>
            <button 
              onClick={() => setState(s => ({...s, mode: 'image'}))}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${state.mode === 'image' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Business Card Scan
            </button>
          </div>

          <div className="p-6 md:p-8">
            {state.mode === 'text' ? (
              <form onSubmit={handleTextSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="e.g., Home Depot, www.ikea.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg placeholder-slate-400"
                    disabled={state.isLoading}
                  />
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim() || state.isLoading}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {state.isLoading ? 'Analyzing Global Database...' : 'Analyze Company'}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="card-upload"
                  disabled={state.isLoading}
                />
                <label
                  htmlFor="card-upload"
                  className={`block border-2 border-dashed border-slate-300 rounded-xl p-10 cursor-pointer transition-all ${state.isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50 group'}`}
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">Upload Business Card</h3>
                  <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Loading State Overlay */}
        {state.isLoading && (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse">
            <LoadingSpinner className="w-12 h-12 text-blue-600 mb-4" />
            <p className="text-lg font-medium text-slate-700">Consulting Global Knowledge Base...</p>
            <p className="text-sm text-slate-500">Searching Web • Analyzing Competitors • Drafting Strategy</p>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {state.error}
          </div>
        )}

        {/* Results */}
        {state.result && !state.isLoading && (
          <div className="animate-fade-in">
            <ReportView content={state.result} />
            
            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => {
                   setState({ isLoading: false, result: null, error: null, mode: state.mode });
                   setInputText('');
                }}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Analyze Another
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(state.result || '')}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
              >
                Copy Report
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;