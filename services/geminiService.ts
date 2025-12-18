
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

export const generateGeminiImage = async (
  prompt: string, 
  aspectRatio: AspectRatio, 
  imageSize: ImageSize
) => {
  // Check for API key selection
  const hasKey = await (window as any).aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await (window as any).aistudio.openSelectKey();
    // Proceeding after openSelectKey as per instructions
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      await (window as any).aistudio.openSelectKey();
    }
    throw error;
  }
};
