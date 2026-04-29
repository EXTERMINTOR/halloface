'use client';
 
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import { useEffect, useRef } from 'react';
 
type Props = {
  content: any;
  onChange: (json: any) => void;
};
 
export default function Editor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
 
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { loading: 'lazy' },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
    ],
    content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    immediatelyRender: false,
  });
 
  // Sync external content changes (when loading existing post)
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);
 
  if (!editor) return null;
 
  function setLink() {
    const url = window.prompt('Enter URL:');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }
 
  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      // Insert image + an empty paragraph after, then put the cursor
      // in that paragraph so the user can immediately type below the image.
      editor!
        .chain()
        .focus()
        .insertContent([
          { type: 'image', attrs: { src: data.url } },
          { type: 'paragraph' },
        ])
        .run();
    } else {
      alert('Upload failed: ' + (data.error || 'unknown error'));
    }
  }
 
  // Click anywhere below the last block to add a new paragraph there.
  // Solves the "stuck after image" problem for good.
  function handleEditorAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editor) return;
    const proseMirror = e.currentTarget.querySelector('.ProseMirror');
    if (!proseMirror) return;
    const lastChild = proseMirror.lastElementChild;
    if (!lastChild) return;
    const rect = lastChild.getBoundingClientRect();
    // If click happens below the last block in the editor, append/focus paragraph
    if (e.clientY > rect.bottom) {
      const doc = editor.state.doc;
      const lastNode = doc.lastChild;
      // Only add a new paragraph if the last block isn't already an empty paragraph
      if (lastNode?.type.name !== 'paragraph' || lastNode.content.size > 0) {
        editor.chain().focus('end').insertContent({ type: 'paragraph' }).run();
      } else {
        editor.commands.focus('end');
      }
    }
  }
 
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  }
 
  function handleStyleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const chain = editor!.chain().focus();
    switch (value) {
      case 'paragraph': chain.setParagraph().run(); break;
      case 'h1': chain.toggleHeading({ level: 1 }).run(); break;
      case 'h2': chain.toggleHeading({ level: 2 }).run(); break;
      case 'h3': chain.toggleHeading({ level: 3 }).run(); break;
      case 'quote': chain.toggleBlockquote().run(); break;
      case 'code': chain.toggleCodeBlock().run(); break;
    }
  }
 
  // Determine current block type for the dropdown
  let currentBlock = 'paragraph';
  if (editor.isActive('heading', { level: 1 })) currentBlock = 'h1';
  else if (editor.isActive('heading', { level: 2 })) currentBlock = 'h2';
  else if (editor.isActive('heading', { level: 3 })) currentBlock = 'h3';
  else if (editor.isActive('blockquote')) currentBlock = 'quote';
  else if (editor.isActive('codeBlock')) currentBlock = 'code';
 
  return (
    <>
      <div className="toolbar">
        <select className="tb-select" value={currentBlock} onChange={handleStyleChange} title="Block style">
          <option value="paragraph">¶ Body — Modern</option>
          <option value="h1">H1 — Editorial</option>
          <option value="h2">H2 — Editorial</option>
          <option value="h3">H3 — Editorial</option>
          <option value="quote">❝ Quote — Editorial</option>
          <option value="code">⌘ Code block — Mono</option>
        </select>
 
        <div className="tb-divider" />
 
        <button className={`tb-btn ${editor.isActive('bold') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <b>B</b>
        </button>
        <button className={`tb-btn ${editor.isActive('italic') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <i>I</i>
        </button>
        <button className={`tb-btn ${editor.isActive('underline') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <u>U</u>
        </button>
        <button className={`tb-btn ${editor.isActive('strike') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <s>S</s>
        </button>
        <button className={`tb-btn ${editor.isActive('code') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          {`</>`}
        </button>
 
        <div className="tb-divider" />
 
        <button className={`tb-btn ${editor.isActive('bulletList') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          • List
        </button>
        <button className={`tb-btn ${editor.isActive('orderedList') ? 'active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1. List
        </button>
 
        <div className="tb-divider" />
 
        <button className={`tb-btn ${editor.isActive('link') ? 'active' : ''}`} onClick={setLink} title="Add link">
          🔗 Link
        </button>
        <button className="tb-btn" onClick={() => fileRef.current?.click()} title="Upload image">
          🖼 Image
        </button>
        <button className="tb-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          — Hr
        </button>
 
        <div className="tb-divider" />
 
        <button className="tb-btn" onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↶
        </button>
        <button className="tb-btn" onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↷
        </button>
 
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
 
      <div className="editor-content" onClick={handleEditorAreaClick}>
        <EditorContent editor={editor} />
      </div>
    </>
  );
}