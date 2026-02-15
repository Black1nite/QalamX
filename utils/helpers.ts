export const detectDirection = (text: string): 'rtl' | 'ltr' => {
  if (!text) return 'rtl'; 
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  // Check the first few valid characters
  const trimmed = text.trim();
  if (trimmed.length === 0) return 'rtl';
  return rtlChars.test(trimmed[0]) ? 'rtl' : 'ltr';
};

export const parseThinkingResponse = (fullText: string) => {
  const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
  const match = fullText.match(thinkingRegex);

  if (match) {
    const thinkingContent = match[1].trim();
    const finalContent = fullText.replace(match[0], '').trim();
    return { thinkingContent, finalContent };
  }

  return { thinkingContent: null, finalContent: fullText };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};