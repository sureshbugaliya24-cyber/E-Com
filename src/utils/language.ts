export interface TranslatableString {
    en: string;
    hi: string;
}

export const getLocalizedString = (
    text: TranslatableString | undefined,
    language: 'en' | 'hi'
): string => {
    if (!text) return '';
    return text[language] || text.en || '';
};
