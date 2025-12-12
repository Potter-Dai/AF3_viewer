import React, { useCallback, useState } from 'react';
import { AF3Confidences } from '../types';

interface FileUploadProps {
  onDataLoaded: (cif: string | null, confidences: AF3Confidences | null, name: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: FileList) => {
    setError(null);
    let cifContent: string | null = null;
    let mergedConfidences: Partial<AF3Confidences> = {};
    let baseName = "";
    let foundJson = false;

    const fileArray = Array.from(files);

    // 1. Process CIF file (Case insensitive check)
    const cifFile = fileArray.find(f => f.name.toLowerCase().endsWith('.cif'));
    if (cifFile) {
      try {
        cifContent = await cifFile.text();
        baseName = cifFile.name.replace(/_model\.cif$/i, '').replace(/\.cif$/i, '');
      } catch (e) {
        console.error("Error reading CIF", e);
        setError("Failed to read the .cif file.");
        return;
      }
    }

    // 2. Process JSON files
    const jsonFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.json'));
    
    for (const file of jsonFiles) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Merge logic
        // We assume valid JSON data from AF3. We merge everything we find.
        // If it looks like confidences.json (has pae/plddt)
        // If it looks like summary_confidences.json (has ptm/iptm)
        // We just merge it all into one object.
        if (data) {
            mergedConfidences = { ...mergedConfidences, ...data };
            foundJson = true;
            
            // If we didn't get a name from CIF, try to get it from the JSON filename
            if (!baseName) {
                baseName = file.name.replace(/_confidences\.json$/i, '')
                                    .replace(/_summary_confidences\.json$/i, '')
                                    .replace(/\.json$/i, '');
            }
        }
      } catch (e) {
        console.error(`Failed to parse ${file.name}`, e);
        // We continue processing other files even if one fails
      }
    }

    if (cifContent) {
      // Success case: We at least have the structure
      onDataLoaded(cifContent, foundJson ? mergedConfidences as AF3Confidences : null, baseName || "Unknown Structure");
    } else {
      // Error case: No CIF file found
      setError("No .cif file found. Please upload at least a model.cif file to visualize the structure.");
    }
  }, [onDataLoaded]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        type="file" 
        id="fileInput" 
        multiple 
        accept=".cif,.json" 
        className="hidden" 
        onChange={handleInputChange} 
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full transition-colors ${error ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
            {error ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )}
        </div>
        <div className="text-gray-600">
          <p className="font-semibold text-lg text-gray-800">
             {error ? "Upload Failed" : "Drag & drop files here"}
          </p>
          <p className="text-sm mt-2 text-gray-500 max-w-sm mx-auto">
            {error ? error : <span>Select your <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono text-xs">model.cif</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono text-xs">confidences.json</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono text-xs">summary.json</code> files.</span>}
          </p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition shadow-sm hover:shadow">
          {error ? "Try Again" : "Browse Files"}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;