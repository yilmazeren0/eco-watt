import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';

export interface WasteClassificationResult {
    type: string;
    binColor: string;
    description: string;
    confidence: number;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const classifyImage = async (imageUri: string, base64?: string): Promise<WasteClassificationResult> => {
    if (!base64) {
        throw new Error('Image base64 data is required for API analysis');
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Analyze this image and identify the waste item.
      Return ONLY a valid JSON object with the following structure:
      {
        "type": "Short waste type (e.g., Plastic, Paper, Metal, Glass, Organic, Electronic)",
        "binColor": "Color of the recycling bin (e.g., Yellow for Plastic, Blue for Paper, Green for Glass, Gray for Metal, Brown for Organic, Orange for E-waste)",
        "description": "A short, helpful description (max 2 sentences) in Turkish explaining how to recycle it (e.g., 'Wash and crush before throwing').",
        "confidence": 0.95 (estimated confidence between 0 and 1)
      }
      If the image is not a waste item, set type to "Unknown" and description to "Atık tespit edilemedi.".
      Respond in Turkish for the description and type fields.
    `;

        const imagePart = {
            inlineData: {
                data: base64,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up the text to ensure it's valid JSON (sometimes models add markdown formatting)
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(jsonString);

        return {
            type: parsedData.type || 'Bilinmiyor',
            binColor: parsedData.binColor || '#808080',
            description: parsedData.description || 'Analiz sonucu alınamadı.',
            confidence: parsedData.confidence || 0,
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Fallback or rethrow
        throw new Error('Atık analizi yapılamadı. Lütfen tekrar deneyin.');
    }
};
