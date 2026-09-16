import DOMPurify from 'dompurify';

export const sanitizeAI = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'span', 'a'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
