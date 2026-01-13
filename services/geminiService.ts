
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingLink, Location, VerifiedCatch } from "../types";

/**
 * Maps grounding is supported in Gemini 2.5 series models.
 * Using 'gemini-2.5-flash' for standard text-based content generation with tools.
 */
const MODEL_NAME = 'gemini-2.5-flash';

export const generateFishingResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  location?: Location
): Promise<{ text: string; links: GroundingLink[]; verifiedCatches: VerifiedCatch[] }> => {
  // Use the API key exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // tools: googleMaps may be used with googleSearch for location-based search tasks
  const tools = [
    { googleSearch: {} },
    { googleMaps: {} }
  ];
  
  const toolConfig = location ? {
    retrievalConfig: {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }
  } : undefined;

  const systemInstruction = `
    You are the 'Fishing Spot Chat Bot' backend engine. Your specialized task is to find high-yield fishing spots by scraping and analyzing public posts on Instagram, X (formerly Twitter), and Facebook.

    STRICT OPERATIONAL CONSTRAINTS:
    1. RADIUS LIMIT: Only analyze posts and locations within a 30-mile (approx 48km) radius of the user's current location (${location ? `Lat: ${location.latitude}, Lng: ${location.longitude}` : 'Location unknown - prompt user for area'}).
    2. POST QUANTITY: For the specific type of fish requested (or most common species in the area), limit your analysis to the 5 MOST RECENT verified public posts.
    3. TARGET PLATFORMS: Specifically search for public posts on Instagram, X, and Facebook using Google Search grounding.
    4. VISUAL SCREENING: You must "verify" that the catch occurred in the wild (on the water or on the shore). 
    5. EXCLUSION CRITERIA: Reject any photos taken at a house, in a backyard, on a boat dock, or at a commercial cleaning station. 
    6. METADATA EXTRACTION: Simulate the extraction of location metadata by cross-referencing visual landmarks, geotags mentioned in captions, or user location history in the post.
    7. DATA STRUCTURE: Categorize your findings by species. If multiple species are mentioned, focus on the top 5 most recent posts for each.

    Be clinical and precise. If you find posts outside the 30-mile radius, exclude them from the "verified" list.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        tools,
        toolConfig,
      },
    });

    const text = response.text || "I'm currently scanning social feeds for recent catches within your 30-mile perimeter. Please wait...";
    const links: GroundingLink[] = [];
    const verifiedCatches: VerifiedCatch[] = [];

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({
            title: chunk.maps.title || "Verified Fishing Location",
            uri: chunk.maps.uri
          });
        } else if (chunk.web) {
          links.push({
            title: chunk.web.title || "Social Catch Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, links, verifiedCatches };
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Rethrow to be caught by the App component's UI error handler
    throw error;
  }
};
