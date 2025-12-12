import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import StructureViewer from './components/StructureViewer';
import PaeHeatmap from './components/PaeHeatmap';
import PlddtChart from './components/PlddtChart';
import { AF3Confidences, LoadedData } from './types';
import { analyzeStructureMetrics } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<LoadedData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDataLoaded = (cif: string | null, confidences: AF3Confidences | null, name: string) => {
    setData({
      cifContent: cif,
      confidences: confidences,
      fileName: name
    });
    setAnalysis(null); // Reset previous analysis
  };

  const handleAnalyze = async () => {
    if (!data?.confidences) return;
    
    setIsAnalyzing(true);
    const result = await analyzeStructureMetrics(data.confidences, data.fileName);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            α
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">AlphaFold 3 Viewer</h1>
        </div>
        {data && (
          <div className="flex items-center gap-3">
             <div className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-600 font-medium truncate max-w-[200px] md:max-w-[400px]">
                {data.fileName}
             </div>
             <button 
                onClick={() => setData(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
             >
                Upload New
             </button>
          </div>
        )}
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6">
        {/* Upload Section (Visible if no data) */}
        {!data && (
          <div className="max-w-3xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Visualise your AF3 Predictions</h2>
            <FileUpload onDataLoaded={handleDataLoaded} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">3D Visualization</h3>
                <p className="text-sm text-gray-500 mt-1">Interactive structure viewer colored by pLDDT confidence.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">PAE & Metrics</h3>
                <p className="text-sm text-gray-500 mt-1">View PAE matrix, pLDDT charts, and detailed scores.</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">AI Analysis</h3>
                <p className="text-sm text-gray-500 mt-1">Get instant insights via Google Gemini.</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard (Visible if data) */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            
            {/* Left Column: 3D View (7 cols) */}
            <div className="lg:col-span-7 flex flex-col h-full gap-4">
              <div className="flex-grow h-full min-h-[400px]">
                 <StructureViewer cifContent={data.cifContent} />
              </div>
            </div>

            {/* Right Column: Metrics & Charts (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2">
              
              {/* Summary Metrics Cards */}
              {data.confidences ? (
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">pTM</div>
                        <div className="text-xl font-bold text-gray-800">{data.confidences.ptm?.toFixed(2) ?? "-"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">ipTM</div>
                        <div className="text-xl font-bold text-gray-800">{data.confidences.iptm?.toFixed(2) ?? "-"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Ranking</div>
                        <div className="text-xl font-bold text-gray-800">{data.confidences.ranking_score?.toFixed(2) ?? "-"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Disorder</div>
                        <div className="text-xl font-bold text-gray-800">
                          {data.confidences.fraction_disordered !== undefined 
                            ? `${(data.confidences.fraction_disordered * 100).toFixed(0)}%` 
                            : "-"}
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Has Clash?</div>
                        <div className={`text-xl font-bold ${data.confidences.has_clash && data.confidences.has_clash > 0.5 ? 'text-red-500' : 'text-green-600'}`}>
                          {data.confidences.has_clash !== undefined 
                            ? (data.confidences.has_clash > 0.5 ? "Yes" : "No") 
                            : "-"}
                        </div>
                    </div>
                 </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                  Metrics not available. Upload JSON files to see details.
                </div>
              )}

              {/* PAE Heatmap */}
              <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Predicted Aligned Error (PAE)</h3>
                <div className="flex-grow relative flex items-center justify-center">
                    {data.confidences?.pae ? (
                        <PaeHeatmap pae={data.confidences.pae} />
                    ) : (
                        <div className="text-gray-400 text-sm">PAE data not found in uploaded files.</div>
                    )}
                </div>
              </div>

              {/* pLDDT Chart */}
              <div className="min-h-[250px]">
                 {data.confidences?.plddt ? (
                    <PlddtChart scores={data.confidences.plddt} />
                 ) : (
                    <div className="h-full flex items-center justify-center bg-white border rounded-lg text-gray-400 text-sm">
                        pLDDT data not found.
                    </div>
                 )}
              </div>

              {/* Gemini Analysis Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                        <span>✨ Gemini Analysis</span>
                    </h3>
                    {!analysis && (
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !data.confidences}
                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {isAnalyzing ? "Analyzing..." : "Generate Insights"}
                        </button>
                    )}
                 </div>
                 
                 {analysis && (
                    <div className="mt-2 text-sm text-gray-700 leading-relaxed bg-white/50 p-3 rounded border border-blue-100 animate-fadeIn">
                        {analysis}
                    </div>
                 )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;