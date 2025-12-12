import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface PlddtChartProps {
  scores: number[];
}

const PlddtChart: React.FC<PlddtChartProps> = ({ scores }) => {
  if (!scores || scores.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No pLDDT Data</div>;

  const data = scores.map((score, index) => ({
    residue: index + 1,
    plddt: score
  }));

  // Average
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return (
    <div className="h-full w-full bg-white rounded-lg border shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Predicted LDDT per Position</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
                dataKey="residue" 
                label={{ value: 'Residue Index', position: 'insideBottom', offset: -5, fontSize: 10 }} 
                tick={{fontSize: 10}}
                height={30}
            />
            <YAxis 
                domain={[0, 100]} 
                label={{ value: 'pLDDT', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                tick={{fontSize: 10}}
            />
            <Tooltip 
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            />
            <ReferenceLine y={90} stroke="#0053D6" strokeDasharray="3 3" label={{ value: "Very High", position: 'insideTopLeft', fontSize: 10, fill: '#0053D6' }} />
            <ReferenceLine y={70} stroke="#65CBF3" strokeDasharray="3 3" label={{ value: "High", position: 'insideTopLeft', fontSize: 10, fill: '#65CBF3' }} />
            <ReferenceLine y={50} stroke="#FFDB13" strokeDasharray="3 3" label={{ value: "Low", position: 'insideTopLeft', fontSize: 10, fill: '#E6C200' }} />
            
            <Line 
                type="monotone" 
                dataKey="plddt" 
                stroke="#333" 
                strokeWidth={1.5} 
                dot={false} 
                activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-center text-gray-500">
        Average pLDDT: <span className="font-bold text-gray-800">{avg.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PlddtChart;