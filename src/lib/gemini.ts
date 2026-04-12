import { GoogleGenerativeAI } from "@google/generative-ai";

export async function translateLiveContent(channelName: string, category: string) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini API Key is missing!");
      return ["کلیلی API دانەنراوە", "تکایە VITE_GEMINI_API_KEY لە سێرڤەر زیاد بکە"];
    }

    const prompt = `You are a real-time live translator for a TV channel called "${channelName}" (Category: "${category}").
    
    CRITICAL INSTRUCTION: Do NOT generate general news summaries or random facts. You must generate a sequence of 15 to 20 continuous, conversational sentences that sound EXACTLY like what a person on TV is saying right now. 
    
    If it's a news channel, generate a continuous news report (e.g., "The president spoke today...", "He stated that...", "In other news...").
    If it's a movie/drama channel, generate a continuous dialogue between characters (e.g., "Where have you been?", "I was looking for you.", "We need to leave now.").
    
    The translation MUST be in Kurdish Sorani.
    Format the response as a simple JSON array of strings, where each string is the next sentence spoken.
    Only return the JSON array, nothing else.`;

    // Use REST API directly to avoid SDK fetch issues on Vercel
    // Updated model name to gemini-2.5-flash which is the current supported model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8, // Slightly higher for more varied dialogue
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
    const errMsg = error?.message || "";
    
    // If it's a rate limit or high demand error, return a 3-item array 
    // so the UI interval keeps running and automatically retries.
    if (errMsg.includes("high demand") || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("overloaded")) {
      return [
        "سێرڤەری زیرەکی دەستکرد قەرەباڵغە...", 
        "تکایە کەمێک چاوەڕێ بە...", 
        "سیستەمەکە خۆکارانە دووبارە هەوڵ دەداتەوە..."
      ];
    }
    
    return [
      "هەڵەیەک ڕوویدا لە پەیوەندیکردن...", 
      "دووبارە هەوڵ دەداتەوە...", 
      "تکایە چاوەڕوان بە..."
    ];
  }
}
