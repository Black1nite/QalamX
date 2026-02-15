import { GoogleGenAI } from "@google/genai";
import { Message, ModelType, Role } from "../types";
import { SYSTEM_INSTRUCTION_REASONING, SYSTEM_INSTRUCTION_STANDARD } from "../constants";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const streamChatResponse = async (
  messages: Message[],
  modelType: ModelType,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  try {
    // Construct history with real attachment support
    // We exclude the last message because that is the one we are sending now
    const history = messages.slice(0, -1).map(msg => {
      const parts: any[] = [];
      
      // Add attachment if exists
      if (msg.attachment) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.type,
            data: msg.attachment.data
          }
        });
      }

      // Add text content
      let textContent = msg.content || "";
      if (msg.thinking) {
        textContent += `\n<thinking>${msg.thinking}</thinking>`;
      }
      
      // Only add text part if there is content
      if (textContent && textContent.trim() !== "") {
        parts.push({ text: textContent });
      }

      // If parts is still empty (e.g. empty message), add a placeholder to make it valid
      if (parts.length === 0) {
        parts.push({ text: " " });
      }

      return {
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: parts,
      };
    });

    const lastMessage = messages[messages.length - 1];
    
    // Prepare current message parts
    const currentMessageParts: any[] = [];
    if (lastMessage.attachment) {
      currentMessageParts.push({
        inlineData: {
          mimeType: lastMessage.attachment.type,
          data: lastMessage.attachment.data
        }
      });
    }
    
    if (lastMessage.content && lastMessage.content.trim() !== "") {
      currentMessageParts.push({ text: lastMessage.content });
    }

    // Safety check: ensure we have at least one part
    if (currentMessageParts.length === 0) {
       currentMessageParts.push({ text: " " });
    }

    const systemInstruction = modelType === ModelType.REASONING 
      ? SYSTEM_INSTRUCTION_REASONING 
      : SYSTEM_INSTRUCTION_STANDARD;

    const chat = ai.chats.create({
      model: modelType,
      history: history,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: modelType === ModelType.REASONING ? { thinkingBudget: 1024 } : undefined,
      },
    });

    const result = await chat.sendMessageStream({
      message: currentMessageParts 
    });

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
    
    onComplete();
  } catch (error) {
    console.error("Gemini API Error:", error);
    onError(error instanceof Error ? error : new Error("Unknown error occurred"));
  }
};