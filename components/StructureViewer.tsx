import React, { useEffect, useRef, useState } from 'react';

// Declare global 3Dmol namespace loaded via script tag
declare global {
  interface Window {
    $3Dmol: any;
  }
}

interface StructureViewerProps {
  cifContent: string | null;
}

const StructureViewer: React.FC<StructureViewerProps> = ({ cifContent }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<any>(null); // Reference to the 3Dmol viewer instance
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viewerRef.current || !window.$3Dmol) return;

    // Initialize Viewer
    const element = viewerRef.current;
    const config = { backgroundColor: 'white' };
    const viewer = window.$3Dmol.createViewer(element, config);
    glRef.current = viewer;

    return () => {
      // Cleanup not strictly necessary for 3dmol as it binds to the div, but good practice if needed
    };
  }, []);

  useEffect(() => {
    if (!glRef.current || !cifContent) return;

    setLoading(true);
    const viewer = glRef.current;

    viewer.clear();
    viewer.addModel(cifContent, "cif");

    // AlphaFold pLDDT Coloring Scheme
    // 3Dmol supports 'spectrum' with 'b' (b-factor) property.
    // However, custom colors for specific pLDDT ranges match AF Server better.
    // Very High (>90): Blue (0053D6)
    // High (90-70): Light Blue (65CBF3)
    // Low (70-50): Yellow (FFDB13)
    // Very Low (<50): Orange (FF7D45)

    const colorFunction = (atom: any) => {
      const plddt = atom.b;
      if (plddt >= 90) return 0x0053D6; // Dark Blue
      if (plddt >= 70) return 0x65CBF3; // Light Blue
      if (plddt >= 50) return 0xFFDB13; // Yellow
      return 0xFF7D45; // Orange
    };

    viewer.setStyle({}, { cartoon: { colorfunc: colorFunction } });
    viewer.zoomTo();
    viewer.render();
    setLoading(false);

  }, [cifContent]);

  if (!cifContent) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg border text-gray-400">
        No Structure Loaded
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-white rounded-lg shadow-sm border overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <div ref={viewerRef} className="h-full w-full" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow text-xs font-medium space-y-1 backdrop-blur-sm">
        <div className="font-bold mb-2 text-gray-700">Model Confidence (pLDDT)</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0053D6]"></div>
          <span>Very High (&gt;90)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#65CBF3]"></div>
          <span>High (90 &gt; 70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FFDB13]"></div>
          <span>Low (70 &gt; 50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FF7D45]"></div>
          <span>Very Low (&lt;50)</span>
        </div>
      </div>
    </div>
  );
};

export default StructureViewer;