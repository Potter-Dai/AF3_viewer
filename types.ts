export interface AF3Confidences {
  pae?: number[][]; // Predicted Aligned Error matrix
  plddt?: number[]; // Predicted Local Distance Difference Test per residue
  
  // Fields from summary_confidences.json
  ptm?: number; // Predicted Template Modeling score
  iptm?: number; // Interface Predicted Template Modeling score
  fraction_disordered?: number;
  has_clash?: number;
  ranking_score?: number;
  chain_iptm?: number[];
  chain_ptm?: number[];
  chain_pair_iptm?: number[][];
  chain_pair_pae_min?: number[][];
}

export interface LoadedData {
  cifContent: string | null;
  confidences: AF3Confidences | null;
  fileName: string;
}

export interface AnalysisResult {
  summary: string;
  qualityAssessment: string;
}