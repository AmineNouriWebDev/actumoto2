"use client";

import React, { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs SSR (window is not defined)
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

interface RichTextEditorProps {
  name: string;
  initialValue?: string | null;
  placeholder?: string;
}

export default function RichTextEditor({
  name,
  initialValue,
  placeholder = "Rédigez une description...",
}: RichTextEditorProps) {
  const editor = useRef(null);
  const [content, setContent] = useState(initialValue ?? '');

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder,
      enableDragAndDropFileToEditor: true,
      uploader: {
        insertImageAsBase64URI: true // Permet de coller des images directement qui seront encodées en base64
      },
      theme: 'dark', // Thème sombre pour correspondre à votre panel admin
      minHeight: 400,
      style: {
        background: '#1a1a2e',
        color: '#f3f4f6',
        border: '1px solid #374151',
      },
      toolbarAdaptive: false,
      buttons: [
        'source', '|',
        'bold', 'strikethrough', 'underline', 'italic', '|',
        'ul', 'ol', '|',
        'outdent', 'indent', '|',
        'font', 'fontsize', 'brush', 'paragraph', '|',
        'image', 'video', 'table', 'link', '|',
        'align', 'undo', 'redo', '|',
        'hr', 'eraser', 'fullsize',
      ],
      // Configuration permissive pour accepter tout le HTML collé (comme depuis Word ou d'autres sites)
      defaultMode: '1',
      enter: 'P',
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_as_html' as any,
    }),
    [placeholder]
  );

  return (
    <div style={{ width: '100%', minHeight: '400px' }}>
      {/* Input caché pour le form */}
      <input type="hidden" name={name} value={content} />
      
      <div className="jodit-wrapper-dark" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <JoditEditor
          ref={editor}
          value={content}
          config={config}
          onBlur={(newContent) => setContent(newContent)} // Préférable d'utiliser onBlur pour les perfs
          onChange={(newContent) => {}} // On garde une fonction vide pour éviter les re-renders excessifs
        />
      </div>
      
      <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.4rem" }}>
        Cet éditeur (Jodit) supporte parfaitement le copier-coller de pages entières, d'articles, d'images et de tableaux HTML depuis n'importe quel site ou document Word.
      </p>

      <style jsx global>{`
        .jodit-wrapper-dark .jodit-container {
          border-color: #374151 !important;
        }
        .jodit-wrapper-dark .jodit-toolbar__box {
          background-color: #111827 !important;
          border-bottom-color: #374151 !important;
        }
        .jodit-wrapper-dark .jodit-ui-button__text {
          color: #e5e7eb !important;
        }
        .jodit-wrapper-dark .jodit-ui-button__icon {
          fill: #e5e7eb !important;
        }
        .jodit-wrapper-dark .jodit-workplace {
          background-color: #1a1a2e !important;
        }
        .jodit-wrapper-dark .jodit-wysiwyg {
          color: #f3f4f6 !important;
        }
        .jodit-wrapper-dark .jodit-ui-button:hover,
        .jodit-wrapper-dark .jodit-ui-button[aria-pressed="true"] {
          background-color: rgba(255,0,0,0.1) !important;
        }
        .jodit-wrapper-dark .jodit-ui-button:hover .jodit-ui-button__icon,
        .jodit-wrapper-dark .jodit-ui-button[aria-pressed="true"] .jodit-ui-button__icon {
          fill: #ff0000 !important;
        }
        .jodit-wrapper-dark .jodit-popup {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
}
