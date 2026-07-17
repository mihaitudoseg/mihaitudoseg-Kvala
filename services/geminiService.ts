
import { GoogleGenAI } from "@google/genai";
import { MenuItem } from "../types";

export const getSommelierRecommendation = async (query: string, availableWines: MenuItem[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Serviciul de somelier nu este configurat (Lipsește API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const wineListString = availableWines.length > 0 
      ? availableWines.map(w => `- ${w.name}: ${w.description || 'Vin de calitate'} (${w.price} Lei)`).join('\n')
      : "Momentan nu avem vinuri listate în stocul digital.";

    const systemInstruction = `
      Ești "Somelierul Virtual al Restaurantului Kvala" din Cotroceni, București. 
      Ești expert în vinuri grecești și internaționale.

      LISTA OFICIALĂ DE VINURI KVALA (DOAR ACESTEA EXISTĂ):
      ${wineListString}

      REGULI CRITICE:
      1. NU recomanda vinuri care nu apar în lista de mai sus. 
      2. Dacă utilizatorul întreabă despre mâncare, recomandă vinul care se potrivește cel mai bine cu acel preparat.
      3. Folosește un ton elegant, primitor și profesionist. Explică notele de degustare.
      4. Limba de comunicare: Română.
    `;

    // Upgrade to Gemini 3 Pro for advanced reasoning/pairing
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return response.text || "Îmi pare rău, am întâmpinat o eroare la procesarea recomandării.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Somelierul nostru consultă acum lista de prețuri. Vă rugăm să reveniți în câteva momente.";
  }
};
