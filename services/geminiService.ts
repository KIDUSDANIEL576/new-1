
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Sale } from "../types";

// Initialized with process.env.API_KEY as per requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * AI Fuzzy Search for Medicines (Patient Paid Plan)
   * Using gemini-3-flash-preview for optimal text matching performance
   */
  async fuzzySearchMedicines(query: string, availableInventory: string[]): Promise<string[]> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the following list of available medicines: [${availableInventory.join(', ')}], return a JSON array of the top 3 items that most closely match the user's potentially misspelled query: "${query}". Return ONLY the JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      // Correctly access .text property
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Search Error:", error);
      return [];
    }
  },

  /**
   * AI Restock Predictions (Pharmacy Platinum Plan)
   */
  async predictRestock(inventory: InventoryItem[], salesHistory: Sale[]): Promise<any> {
    try {
      const invSummary = inventory.map(i => `${i.medicineName} (Stock: ${i.stock})`).join(', ');
      const salesSummary = salesHistory.map(s => `${s.medicineName} (Qty Sold: ${s.quantity})`).join(', ');

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As an inventory expert, analyze this data. Current Inventory: [${invSummary}]. Recent Sales: [${salesSummary}]. Predict which 3 items need restocking soon and why. Return as a JSON array of objects with keys "item", "reason", and "priority".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                reason: { type: Type.STRING },
                priority: { type: Type.STRING }
              },
              required: ["item", "reason", "priority"]
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Gemini Prediction Error:", error);
      return [];
    }
  }
};
