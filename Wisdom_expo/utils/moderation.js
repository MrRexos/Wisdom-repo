export const containsContactInfo = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const phoneRegex = /(?:\+?\d[\d\s\-().]{6,}\d)/;
  const digits = text.replace(/\D/g, '');

  if (emailRegex.test(text)) return true;
  if (phoneRegex.test(text)) return true;
  if (digits.length >= 8) return true;

  const contactWords = /(whats?app|telegram|instagram|facebook|snapchat|t\.me|phone|gmail|hotmail|email|mail|contact?)/i;
  return contactWords.test(lower);
};
