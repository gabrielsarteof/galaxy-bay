'use client';

import { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  html: string;
  isEditing: boolean;
  onSave: (newHtml: string) => Promise<void>;
  className?: string;
}

export default function RichTextEditor({
  html,
  isEditing,
  onSave,
  className = '',
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocalHtml] = useState(html);

  useEffect(() => {
    setLocalHtml(html);
    if (ref.current) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  const handleBlur = async () => {
    if (ref.current) {
      const updated = ref.current.innerHTML;
      setLocalHtml(updated);
      await onSave(updated);
    }
  };

  return isEditing ? (
    <div
      ref={ref}
      className={`border rounded p-2 ${className}`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
    />
  ) : (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
