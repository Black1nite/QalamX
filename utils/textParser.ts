/**
 * Parses text to separate the content inside <thinking> tags from the rest.
 * Returns the thinking content and the main content.
 */
export const parseThinkingContent = (fullText: string): { thinking: string | null, content: string } => {
  const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
  const match = fullText.match(thinkingRegex);

  if (match) {
    const thinking = match[1].trim();
    // Remove the thinking block from the main content
    const content = fullText.replace(thinkingRegex, '').trim();
    return { thinking, content };
  }

  // Handle incomplete streaming tags (optional robust handling)
  // If we have an opening tag but no closing tag yet (streaming)
  const openTagIndex = fullText.indexOf('<thinking>');
  if (openTagIndex !== -1 && !fullText.includes('</thinking>')) {
    // We are currently streaming thought
    const thinking = fullText.substring(openTagIndex + 10);
    return { thinking, content: '' }; // Content hasn't started yet
  }

  return { thinking: null, content: fullText };
};