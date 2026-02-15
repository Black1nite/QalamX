import { ModelType } from './types';

export const DEFAULT_MODEL = ModelType.FAST;

export const SYSTEM_INSTRUCTION_REASONING = `
You are **QalamX** (قلم إكس), an advanced AI assistant created to provide high-precision answers with deep reasoning capabilities.
Your design philosophy combines the speed of modern engines with the depth of analytical thought.

Rules:
1.  **Identity**: You are QalamX. Do NOT refer to yourself as Gemini or Google AI.
2.  **Reasoning**: When asked complex questions, perform a "Chain of Thought" process.
3.  **Format**: Wrap your reasoning process inside <thinking>...</thinking> XML tags.
4.  **Language**: Detect the user's language and respond in the same language.
5.  **Tone**: Professional, insightful, and polite.

After the closing </thinking> tag, provide your final, polished response to the user.
`;

export const SYSTEM_INSTRUCTION_STANDARD = `
You are **QalamX** (قلم إكس), a helpful, fast, and efficient AI assistant.
Provide direct and clear answers formatted in Markdown.
Do NOT refer to yourself as Gemini.
`;

// Real Translation System
export const TRANSLATIONS = {
  ar: {
    newChat: "محادثة جديدة",
    searchPlaceholder: "بحث في المحادثات...",
    recent: "الأخيرة",
    noResults: "لا توجد نتائج",
    settings: "الإعدادات",
    attach: "إرفاق ملف",
    inputPlaceholder: "اسأل QalamX...",
    inputPlaceholderFile: "أضف وصفاً للملف...",
    modelLite: "Qalam Lite",
    modelPro: "Qalam Pro",
    analyzing: "جارِ التحليل",
    completed: "مكتمل",
    copy: "نسخ",
    regenerate: "إعادة توليد",
    general: "عام",
    account: "الحساب",
    data: "البيانات",
    appearance: "المظهر",
    language: "اللغة",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    deleteChat: "حذف المحادثة",
    clearAll: "مسح جميع البيانات",
    confirmClear: "هل أنت متأكد؟",
    guest: "حساب ضيف",
    guestDesc: "يتم حفظ البيانات محلياً على جهازك.",
    welcomeTitle: "مرحباً بك في QalamX",
    welcomeDesc: "ابدأ محادثة جديدة أو قم برفع ملف للتحليل",
    error: "حدث خطأ",
    quotaError: "لقد تجاوزت حد الاستخدام المجاني (Quota). يرجى المحاولة لاحقاً.",
    thinking: "سلسلة الأفكار (Chain of Thought)",
    settingsDesc: "إدارة تفضيلات",
    manage: "إدارة",
    preferences: "التفضيلات"
  },
  en: {
    newChat: "New Chat",
    searchPlaceholder: "Search chats...",
    recent: "Recent",
    noResults: "No results found",
    settings: "Settings",
    attach: "Attach file",
    inputPlaceholder: "Ask QalamX...",
    inputPlaceholderFile: "Describe the file...",
    modelLite: "Qalam Lite",
    modelPro: "Qalam Pro",
    analyzing: "ANALYZING",
    completed: "COMPLETED",
    copy: "Copy",
    regenerate: "Regenerate",
    general: "General",
    account: "Account",
    data: "Data",
    appearance: "Appearance",
    language: "Language",
    save: "Save Changes",
    cancel: "Cancel",
    deleteChat: "Delete Chat",
    clearAll: "Clear All Data",
    confirmClear: "Are you sure?",
    guest: "Guest Account",
    guestDesc: "Data is stored locally on your device.",
    welcomeTitle: "Welcome to QalamX",
    welcomeDesc: "Start a new chat or upload a file to analyze",
    error: "Error occurred",
    quotaError: "You have exceeded your free quota. Please try again later.",
    thinking: "Chain of Thought",
    settingsDesc: "Manage your preferences",
    manage: "Manage your",
    preferences: "preferences"
  }
};

export type Language = 'ar' | 'en';