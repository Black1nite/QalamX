import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, Message, Sender } from "../types";
import { MODEL_CONFIGS } from "../constants";

const getSystemInstruction = (modelType: ModelType, language: string) => {
  const baseInstruction = `You are QalamX, an advanced AI assistant.
  Current Language Setting: ${language}.
  Visual Style: Deep Space Dark Mode.
  
  Format your responses using Markdown.
  `;

  if (modelType === ModelType.Pro) {
    return baseInstruction + `
    CRITICAL INSTRUCTION: You are in "Deep Reasoning" mode. 
    Before providing the final answer, you MUST explicitly show your chain of thought.
    Wrap your thinking process inside <thinking>...</thinking> XML tags.
    The content inside <thinking> should be raw, analytical, and monospaced in style (technical).
    After the thinking block, provide your final polished response.
    `;
  }

  return baseInstruction + `
  You are in "Lite" mode. Be concise, fast, and helpful. Do not output thinking blocks.
  `;
};

export const streamResponse = async (
  history: Message[],
  currentMessage: string,
  modelType: ModelType,
  attachments: { data: string; type: string }[] = [],
  language: string,
  onChunk: (text: string) => void
) => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    onChunk("Error: API Key not found in environment.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = MODEL_CONFIGS[modelType].id;

  // Prepare contents from history
  // Note: We need to filter out empty thinking blocks if we want to save token context, 
  // but for simplicity, we pass the final content as the history text.
  const historyContents = history.map(msg => ({
    role: msg.sender === Sender.User ? 'user' : 'model',
    parts: [{ text: msg.finalContent || msg.text }]
  }));

  const parts: any[] = [{ text: currentMessage }];
  
  // Add attachments if any (Images only for now for simplicity, though Gemini handles more)
  if (attachments.length > 0) {
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.type,
          data: att.data
        }
      });
    });
  }

  try {
    const chat = ai.chats.create({
      model: modelId,
      history: historyContents,
      config: {
        systemInstruction: getSystemInstruction(modelType, language),
        // If it's Pro model (gemini-3-pro), we can enable thinking config if we weren't simulating it via prompt.
        // For this demo, since we want to parse <thinking> tags specifically for the UI effect, we stick to Prompt Engineering 
        // combined with the high reasoning model.
        ...(modelType === ModelType.Pro ? {
           // We could use thinkingConfig here if we didn't want the manual XML parsing tags, 
           // but the prompt requests a specific UI "Collapsible Chain of Thought". 
           // Prompt engineering is more reliable for custom UI formatting like <thinking> tags.
           thinkingConfig: { thinkingBudget: 1024 } // Giving it some budget to think, even if we enforce tags via prompt
        } : {})
      },
    });

    const resultStream = await chat.sendMessageStream({
      message: { parts }
    });

    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      if (responseChunk.text) {
        onChunk(responseChunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n\n[System Error: Unable to generate response. Please try again.]");
  }
};