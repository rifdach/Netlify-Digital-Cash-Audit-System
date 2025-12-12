import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, RiskLevel } from "../types";

// Initialize Gemini Client
// Note: In a real app, API Key should come from secure env vars.
// We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface RiskAnalysisResult {
  transactionId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasoning: string;
  isAnomaly: boolean;
}

/**
 * CAAT: Uses Gemini to analyze a batch of transactions for anomalies,
 * outliers, and potential fraud patterns (Python/Pandas simulation).
 */
export const analyzeTransactionsRisk = async (
  transactions: Transaction[]
): Promise<RiskAnalysisResult[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided. Returning mock analysis.");
    return transactions.map(t => ({
      transactionId: t.id,
      riskScore: t.amount > 50000000 ? 85 : 10,
      riskLevel: t.amount > 50000000 ? RiskLevel.HIGH : RiskLevel.LOW,
      reasoning: "Mock analysis: High value transaction.",
      isAnomaly: t.amount > 50000000
    }));
  }

  // We process a subset to avoid token limits in this demo
  const subset = transactions.slice(0, 15);
  
  const prompt = `
    Analyze the following cash transactions for audit risks.
    Look for:
    1. Round numbers (often potential fraud).
    2. Weekend transactions.
    3. Unusually high amounts.
    4. Duplicate amounts or references.
    
    Return a JSON array where each object contains the transactionId, a riskScore (0-100), 
    a riskLevel (Low, Medium, High), a reasoning string, and a boolean isAnomaly.
    
    Transactions: ${JSON.stringify(subset)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              transactionId: { type: Type.STRING },
              riskScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              reasoning: { type: Type.STRING },
              isAnomaly: { type: Type.BOOLEAN }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as RiskAnalysisResult[];

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return [];
  }
};

/**
 * Simulates OCR Extraction + Matching
 */
export const extractAndMatchEvidence = async (
  base64Image: string, 
  transaction: Transaction
): Promise<{ status: 'MATCH' | 'DISCREPANCY'; extractedAmount: number }> => {
    // In a real scenario, we would send the image to gemini-2.5-flash
    // For this code demo, we will simulate a match or discrepancy based on a random factor
    // or return a mock successful extraction.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isMatch = Math.random() > 0.3; // 70% chance of match for demo
    
    return {
        status: isMatch ? 'MATCH' : 'DISCREPANCY',
        extractedAmount: isMatch ? transaction.amount : transaction.amount + 500
    };
}
