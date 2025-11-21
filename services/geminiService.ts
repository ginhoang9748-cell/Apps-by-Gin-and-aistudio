import { GoogleGenAI, Type } from "@google/genai";
import { AIPlanResponse, ChatMessage } from "../types";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this through a backend.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a concrete schedule from an abstract user goal or a timetable image.
 */
export const generateScheduleFromGoal = async (
  prompt: string, 
  image?: { data: string; mimeType: string }
): Promise<AIPlanResponse | null> => {
  try {
    const parts: any[] = [];
    
    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
      parts.push({
        text: `Analyze this image of a timetable or schedule. Extract the specific events, classes, or tasks. 
        ${prompt ? `Also consider this context: "${prompt}".` : ''}
        Create a structured plan based on the exact times found in the image.`
      });
    } else {
      parts.push({
        text: `Create a structured habit plan for the user's goal: "${prompt}". 
        Break this down into 1-3 specific, actionable habits/tasks. 
        Suggest a time of day in HH:MM (24h) format that makes sense.`
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planName: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short, actionable task name" },
                  frequency: { type: Type.STRING, description: "e.g., Daily, Weekly, Mon/Wed" },
                  suggestedTime: { type: Type.STRING, description: "HH:MM format (24h)" },
                  reasoning: { type: Type.STRING, description: "Why this habit helps or where it was found in the schedule" }
                },
                required: ["title", "frequency", "suggestedTime", "reasoning"]
              }
            }
          },
          required: ["planName", "tasks"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIPlanResponse;
  } catch (error) {
    console.error("Error generating schedule:", error);
    return null;
  }
};

/**
 * Provides coaching and motivation based on chat context.
 */
export const getCoachResponse = async (history: ChatMessage[], currentMessage: string): Promise<string> => {
  try {
    // Convert history to Gemini format if needed, but for simple turns we can just concat context or use chat session.
    // Here we'll use a fresh chat for simplicity with system instruction context.
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are 'FocusFlow Coach', a supportive, energetic, and disciplined habit coach. Keep answers concise (under 100 words) unless asked for a detailed plan. Use emojis occasionally. Focus on consistency and incremental progress.",
      }
    });

    // Replay history to restore context (simplified for this demo)
    // In a full app, you'd map the history object properly.
    for (const msg of history) {
       if (msg.role === 'user') {
         await chat.sendMessage({ message: msg.text });
       }
       // We skip model messages in replay to avoid double-generation costs/latency in this simple loop, 
       // or you can pass history directly to history param in create(). 
       // For robustness in this demo, we just send the current message with a strong prompt.
    }

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text || "Keep going! You're doing great.";
  } catch (error) {
    console.error("Error getting coaching response:", error);
    return "I'm having trouble connecting to my coaching database right now. But don't give up!";
  }
};