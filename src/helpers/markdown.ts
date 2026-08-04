import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const markdownParser = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'strong',
  'em',
  'b',
  'i',
  'a',
  'code',
  'pre',
  'br',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName !== 'A') {
    return;
  }

  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
});

export function renderMarkdown(source: string | null | undefined): string {
  const normalizedSource = source?.trim() ? source : '';
  const html = markdownParser.render(normalizedSource);

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
