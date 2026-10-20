import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '../utils';

const RICH_HTML_FIELDS = ['content', 'description', 'fullDescription', 'full_description', 'body'];

const SAFE_HTML_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'span',
  'div',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const SAFE_HTML_ATTRS = [
  'href',
  'src',
  'alt',
  'title',
  'class',
  'id',
  'target',
  'rel',
  'width',
  'height',
  'style',
];

function sanitizeString(value: string, fieldName?: string): string {
  const isRichHtmlField = fieldName && RICH_HTML_FIELDS.includes(fieldName);

  let sanitized = DOMPurify.sanitize(
    value,
    isRichHtmlField
      ? {
          ALLOWED_TAGS: SAFE_HTML_TAGS,
          ALLOWED_ATTR: SAFE_HTML_ATTRS,
          KEEP_CONTENT: true,
        }
      : {
          ALLOWED_TAGS: [], // Strip ALL HTML tags for non-rich fields
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        },
  );

  if (!sanitized || sanitized === 'undefined') {
    sanitized = value;
  }

  if (!isRichHtmlField && sanitized !== value) {
    logger.warn('Input sanitization triggered - potential XSS attempt detected', {
      original: String(value).slice(0, 100),
      sanitized: String(sanitized).slice(0, 100),
      stripped: String(value).length - String(sanitized).length,
    });
  }

  return sanitized;
}

/** @internal */
function sanitizeValue(value: unknown, fieldName?: string): unknown {
  if (typeof value === 'string') {
    return sanitizeString(value, fieldName);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, fieldName));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val, key);
    }
    return sanitized;
  }

  return value;
}

/**
 * @module SanitizeMiddleware
 * @description Centralized XSS prevention guard. Recursively sanitizes request payloads,
 * applying a zero-trust model to all inputs while selectively permitting safe formatting tags in designated rich-text fields.
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    const sanitizedBody = sanitizeValue(req.body) as Record<string, unknown>;
    try {
      req.body = sanitizedBody;
    } catch {
      try {
        Object.defineProperty(req, 'body', {
          value: sanitizedBody,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } catch (defineError) {
        logger.warn('Could not sanitize req.body - property is read-only', { error: defineError });
      }
    }
  }

  if (req.query && typeof req.query === 'object') {
    const sanitized = sanitizeValue(req.query);
    Object.keys(req.query).forEach((key) => {
      (req.query as Record<string, unknown>)[key] = undefined;
    });
    Object.assign(req.query, sanitized);
  }

  next();
};

export default sanitizeInput;
