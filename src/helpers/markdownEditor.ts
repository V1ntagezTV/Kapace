export type MarkdownEditorAction =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'unorderedList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'code';

export interface MarkdownEditorSelectionResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

function getSelectedLines(value: string, selectionStart: number, selectionEnd: number) {
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf('\n', selectionEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

  return {
    lineStart,
    lineEnd,
    selectedText: value.slice(lineStart, lineEnd),
  };
}

function prefixSelectedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefixBuilder: (lineIndex: number, line: string) => string,
): MarkdownEditorSelectionResult {
  const { lineStart, lineEnd, selectedText } = getSelectedLines(value, selectionStart, selectionEnd);
  const lines = selectedText.split('\n');
  const prefixedLines = lines.map((line, index) => prefixBuilder(index, line));
  const nextText = prefixedLines.join('\n');
  const nextValue = `${value.slice(0, lineStart)}${nextText}${value.slice(lineEnd)}`;

  return {
    value: nextValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + nextText.length,
  };
}

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  placeholder: string,
): MarkdownEditorSelectionResult {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const content = selectedText || placeholder;
  const nextValue = `${value.slice(0, selectionStart)}${prefix}${content}${suffix}${value.slice(selectionEnd)}`;
  const nextSelectionStart = selectionStart + prefix.length;
  const nextSelectionEnd = nextSelectionStart + content.length;

  return {
    value: nextValue,
    selectionStart: nextSelectionStart,
    selectionEnd: nextSelectionEnd,
  };
}

export function applyMarkdownEditorAction(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  action: MarkdownEditorAction,
): MarkdownEditorSelectionResult {
  switch (action) {
    case 'heading':
      return prefixSelectedLines(value, selectionStart, selectionEnd, (_index, line) => {
        const trimmedLine = line.replace(/^#{1,6}\s*/, '');
        return `## ${trimmedLine}`;
      });
    case 'bold':
      return wrapSelection(value, selectionStart, selectionEnd, '**', '**', 'жирный текст');
    case 'italic':
      return wrapSelection(value, selectionStart, selectionEnd, '*', '*', 'курсив');
    case 'unorderedList':
      return prefixSelectedLines(value, selectionStart, selectionEnd, (_index, line) => {
        const trimmedLine = line.replace(/^[-*+]\s+/, '');
        return `- ${trimmedLine}`;
      });
    case 'orderedList':
      return prefixSelectedLines(value, selectionStart, selectionEnd, (index, line) => {
        const trimmedLine = line.replace(/^\d+\.\s+/, '');
        return `${index + 1}. ${trimmedLine}`;
      });
    case 'blockquote':
      return prefixSelectedLines(value, selectionStart, selectionEnd, (_index, line) => {
        const trimmedLine = line.replace(/^>\s?/, '');
        return `> ${trimmedLine}`;
      });
    case 'link':
      return wrapSelection(value, selectionStart, selectionEnd, '[', '](https://)', 'текст ссылки');
    case 'code':
      return wrapSelection(value, selectionStart, selectionEnd, '`', '`', 'код');
    default:
      return {
        value,
        selectionStart,
        selectionEnd,
      };
  }
}
