import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export async function translateLiveContent(channelName: string, category: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a live AI translator for a movie/TV app. 
    The user is watching a live channel called "${channelName}" in the category "${category}".
    The channel is likely in English or Arabic.
    Generate 3-5 short, realistic "live subtitles" in Kurdish Sorani that might be appearing on screen right now for this type of channel.
    Format the response as a JSON array of strings. 
    Only return the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean the response in case there's markdown
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      return ["بەخێربێن بۆ پەخشی ڕاستەوخۆ", "ئێستا سەیری ${channelName} دەکەن"];
    }
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return ["هەڵەیەک ڕوویدا لە وەرگێڕان"];
  }
}
