"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write your description here...',
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-purple-500">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 flex-wrap bg-gray-50 rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
            editor.isActive('bold')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm line-through transition-colors ${
            editor.isActive('strike')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          S
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          H3
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
          }`}
        >
          " Quote
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          ― HR
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="text-gray-900" />
    </div>
  );
}
