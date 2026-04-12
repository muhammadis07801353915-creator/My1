import { GoogleGenerativeAI } from "@google/generative-ai";

export async function translateLiveContent(channelName: string, category: string) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini API Key is missing!");
      return ["کلیلی API دانەنراوە", "تکایە VITE_GEMINI_API_KEY لە سێرڤەر زیاد بکە"];
    }

    const prompt = `You are a live AI translator for a movie/TV app. 
    The user is watching a live channel called "${channelName}" in the category "${category}".
    The channel is likely in English or Arabic.
    Generate 3-5 short, realistic "live subtitles" in Kurdish Sorani that might be appearing on screen right now for this type of channel.
    Format the response as a JSON array of strings. 
    Only return the JSON array.`;

    // Use REST API directly to avoid SDK fetch issues on Vercel
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    try {
      // Clean the response in case there's markdown
      const cleanedText = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return ["بەخێربێن بۆ پەخشی ڕاستەوخۆ", `ئێستا سەیری ${channelName} دەکەن`];
    }
  } catch (error: any) {
    console.error("Gemini Translation Error Details:", error?.message || error);
    // Return the actual error message to the UI so we can see what's wrong
    return ["هەڵە: " + (error?.message || "نەزانراو").substring(0, 50)];
  }
}
