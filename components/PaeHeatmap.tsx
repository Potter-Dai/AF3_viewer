import React, { useEffect, useRef } from 'react';

interface PaeHeatmapProps {
  pae: number[][];
}

const PaeHeatmap: React.FC<PaeHeatmapProps> = ({ pae }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pae || pae.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = pae.length;
    // Set canvas dimensions to match data size for pixel-perfect rendering, 
    // css will scale it to fit container.
    canvas.width = size;
    canvas.height = size;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    // AF Server PAE Color Scale:
    // Low Error (0): Dark Green / Blue
    // High Error (30): White / Red
    // Actually, typical AF plots use Green (good) to White (bad) or similar. 
    // Let's replicate a standard PAE visual: Green (0) -> White (15) -> Red (30+)
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const value = pae[i][j];
        
        // Map value (0-30ish) to color
        let r, g, b;
        
        // Custom heatmap logic
        // 0 (Confident/Low Error) -> Dark Green (0, 100, 0)
        // 15 -> White (255, 255, 255)
        // 30 (Uncertain/High Error) -> Dark Greenish-Blue or Red depending on viewer.
        // Let's use the standard AlphaFold DB style: Dark Green (Good) to White (Bad)
        
        if (value < 15) {
            // Interpolate Green (0, 77, 64) to White (255,255,255)
            const t = value / 15;
            r = 0 + t * 255;
            g = 77 + t * (255 - 77);
            b = 64 + t * (255 - 64);
        } else {
             // White to roughly 30
             // Ideally it just stays white or goes slightly reddish for very bad
             const t = Math.min((value - 15) / 15, 1);
             r = 255;
             g = 255 - t * 50; // slight red tint
             b = 255 - t * 50;
        }

        const index = (i * size + j) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);

  }, [pae]);

  return (
    <div className="flex flex-col h-full w-full">
        <div className="relative flex-grow bg-white border rounded-lg shadow-sm overflow-hidden flex items-center justify-center p-2">
            {!pae || pae.length === 0 ? (
                <div className="text-gray-400">No PAE Data</div>
            ) : (
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-contain image-pixelated"
                    style={{ imageRendering: 'pixelated' }}
                />
            )}
        </div>
        {/* Color Bar */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 px-1">
            <span>0Å (High Confidence)</span>
            <div className="h-2 flex-grow mx-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(0,77,64), white)' }}></div>
            <span>30Å (Low Confidence)</span>
        </div>
    </div>
  );
};

export default PaeHeatmap;