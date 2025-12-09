import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure API_KEY is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  async generateSummary(content: string): Promise<string> {
    try {
      if (!apiKey) return content.substring(0, 150) + "...";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following blog post content into a short, engaging preview paragraph (max 200 characters). Content: ${content.substring(0, 5000)}`,
      });
      return response.text || content.substring(0, 150) + "...";
    } catch (e) {
      console.error("Gemini summary error", e);
      return content.substring(0, 150) + "...";
    }
  },

  async suggestTags(content: string): Promise<string[]> {
    try {
        if (!apiKey) return ["General"];
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the following text and suggest 3-5 relevant category tags. Return ONLY the tags separated by commas, no other text. Text: ${content.substring(0, 3000)}`
        });
        const text = response.text || "";
        return text.split(',').map(t => t.trim()).filter(t => t.length > 0);
    } catch (e) {
        return ["General"];
    }
  },

  async getSearchRelevance(query: string, articles: any[]): Promise<any[]> {
     // A pseudo-semantic search helper. 
     // In a real app, this would use embeddings. 
     // Here we ask Gemini to pick the best matches if the list is small, or just return as is.
     return articles; 
  },
  
  async inspireMe(topic: string): Promise<string> {
      try {
        if (!apiKey) return "Please configure your API key to use AI features.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write an engaging introductory paragraph for a blog post about: "${topic}". Keep it under 100 words.`
        });
        return response.text || "";
      } catch (e) {
          console.error(e);
          return "Could not generate content.";
      }
  }
};