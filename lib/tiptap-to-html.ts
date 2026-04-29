// Converts TipTap JSON document to clean HTML for public display.
// We do this server-side so posts are pre-rendered and SEO-friendly.

type Node = {
  type: string;
  attrs?: Record<string, any>;
  content?: Node[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarks(text: string, marks?: Node['marks']): string {
  if (!marks || marks.length === 0) return escapeHtml(text);
  let result = escapeHtml(text);

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`;
        break;
      case 'italic':
        result = `<em>${result}</em>`;
        break;
      case 'underline':
        result = `<u>${result}</u>`;
        break;
      case 'strike':
        result = `<s>${result}</s>`;
        break;
      case 'code':
        result = `<code>${result}</code>`;
        break;
      case 'link':
        const href = mark.attrs?.href || '#';
        result = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${result}</a>`;
        break;
      case 'textStyle':
        const fontFamily = mark.attrs?.fontFamily;
        if (fontFamily) {
          result = `<span style="font-family: ${escapeHtml(fontFamily)}">${result}</span>`;
        }
        break;
    }
  }
  return result;
}

function renderNode(node: Node): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(renderNode).join('');

    case 'paragraph': {
      const inner = (node.content || []).map(renderNode).join('');
      const align = node.attrs?.textAlign;
      const style = align ? ` style="text-align:${align}"` : '';
      return `<p${style}>${inner || '<br>'}</p>`;
    }

    case 'heading': {
      const level = node.attrs?.level || 2;
      const inner = (node.content || []).map(renderNode).join('');
      return `<h${level}>${inner}</h${level}>`;
    }

    case 'text':
      return renderMarks(node.text || '', node.marks);

    case 'bulletList':
      return `<ul>${(node.content || []).map(renderNode).join('')}</ul>`;

    case 'orderedList':
      return `<ol>${(node.content || []).map(renderNode).join('')}</ol>`;

    case 'listItem':
      return `<li>${(node.content || []).map(renderNode).join('')}</li>`;

    case 'blockquote':
      return `<blockquote>${(node.content || []).map(renderNode).join('')}</blockquote>`;

    case 'codeBlock': {
      const inner = (node.content || []).map((n) => escapeHtml(n.text || '')).join('');
      const lang = node.attrs?.language || '';
      return `<pre><code class="language-${escapeHtml(lang)}">${inner}</code></pre>`;
    }

    case 'horizontalRule':
      return `<hr>`;

    case 'hardBreak':
      return `<br>`;

    case 'image': {
      const src = node.attrs?.src || '';
      const alt = node.attrs?.alt || '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`;
    }

    default:
      // Unknown nodes — try to render children
      return (node.content || []).map(renderNode).join('');
  }
}

export function tiptapToHtml(doc: any): string {
  if (!doc || typeof doc !== 'object') return '';
  return renderNode(doc as Node);
}

export function extractPlainText(doc: any): string {
  if (!doc || typeof doc !== 'object') return '';
  function walk(node: Node): string {
    if (node.type === 'text') return node.text || '';
    if (!node.content) return '';
    return node.content.map(walk).join(' ');
  }
  return walk(doc as Node).replace(/\s+/g, ' ').trim();
}
