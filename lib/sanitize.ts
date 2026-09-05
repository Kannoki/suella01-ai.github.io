import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string of HTML for safe rendering in dangerouslySetInnerHTML.
 * Strips dangerous tags (script, iframe, etc.), event handlers, and javascript: URIs.
 * Allows the rich-text elements admins use: headings, lists, links, images, code blocks, tables.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}
