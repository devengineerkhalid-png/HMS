
import { GoogleGenAI } from "@google/genai";
import { Resident } from "../types.ts";

// Helper to safely get the API key
const getApiKey = () => {
  return (typeof process !== 'undefined' && process.env?.API_KEY) || "";
};

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: getApiKey() });
  }

  async generatePoliceReport(residents: Resident[]) {
    const ai = this.getClient();
    const prompt = `Generate a formal text report for the Peshawar Police Station regarding the current active residents of a hostel. 
    The report should follow local official standards and include: 
    Name, CNIC, Father's Name, Permanent Address (simulated), and Local Reference.
    
    Data: ${JSON.stringify(residents.map(r => ({ name: r.name, cnic: r.cnic, father: r.parentName, type: r.type })))}
    
    Please provide the output in English, but use professional local terminology (e.g., 'Verification Form', 'S/O', 'Tehsil').`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("AI Report Generation Failed", error);
      return "Unable to generate AI report. Please check API configuration.";
    }
  }

  async calculateGeneratorSurcharge(totalFuelCost: number, numberOfRooms: number, hoursOfUsage: number) {
    const ai = this.getClient();
    const prompt = `As a hostel financial assistant in Peshawar, calculate a fair shared 'Generator Surcharge' for a hostel.
    Total Fuel Cost: ${totalFuelCost} PKR.
    Number of Rooms: ${numberOfRooms}.
    Hours of Load Shedding: ${hoursOfUsage}.
    
    Provide a breakdown of cost per room and a short friendly justification text in English and Urdu that can be sent to residents.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("AI Calculation Failed", error);
      return "Manual calculation required.";
    }
  }
}

export const geminiService = new GeminiService();
