import { GoogleGenAI } from "@google/genai";
import { AF3Confidences } from "../types";

const initGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeStructureMetrics = async (
  metrics: AF3Confidences,
  filename: string
): Promise<string> => {
  try {
    const ai = initGenAI();
    
    // Calculate average pLDDT if available
    let avgPlddt = "N/A";
    let seqLength = "N/A";
    
    if (metrics.plddt && metrics.plddt.length > 0) {
        const sum = metrics.plddt.reduce((a, b) => a + b, 0);
        avgPlddt = (sum / metrics.plddt.length).toFixed(2);
        seqLength = metrics.plddt.length.toString();
    }
    
    const prompt = `
      You are an expert structural biologist analyzing an AlphaFold 3 prediction result.
      
      Filename: ${filename}
      
      Metrics provided:
      - Average pLDDT: ${avgPlddt} (0-100, higher is better)
      - pTM Score: ${metrics.ptm?.toFixed(2) ?? "N/A"} (0-1, higher is better)
      - ipTM Score: ${metrics.iptm?.toFixed(2) ?? "N/A"} (0-1, higher is better, relevant for complexes)
      - Ranking Score: ${metrics.ranking_score?.toFixed(2) ?? "N/A"}
      - Fraction Disordered: ${metrics.fraction_disordered !== undefined ? (metrics.fraction_disordered * 100).toFixed(1) + "%" : "N/A"}
      - Has Clash: ${metrics.has_clash !== undefined ? (metrics.has_clash > 0.5 ? "Yes" : "No") : "N/A"}
      - Sequence Length: ${seqLength} residues
      
      Please provide a concise analysis of this structure's quality. 
      1. Interpret the confidence scores (pTM/ipTM).
      2. If clashes are detected or fraction disordered is high, explain the potential implications.
      3. Explain what the pLDDT distribution likely implies about disordered regions vs structured domains.
      
      Keep the tone professional but accessible. Maximum 200 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Failed to communicate with Gemini API. Please check your API key.";
  }
};