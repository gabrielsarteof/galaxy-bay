// src/components/EditableField.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
  value: string;
  isEditing: boolean;
  onChange: (newValue: string) => void;
  onSave: () => Promise<void>;
  placeholder?: string;
  className?: string;
}

export default function EditableField({
  value,
  isEditing,
  onChange,
  onSave,
  placeholder = '',
  className = '',
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Quando entramos em edição, povoamos apenas com o value (nunca o placeholder)
  useEffect(() => {
    if (editing && spanRef.current) {
      spanRef.current.textContent = value;
      spanRef.current.focus();
      // posiciona cursor no fim
      const range = document.createRange();
      range.selectNodeContents(spanRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing, value]);

  // 1) Modo leitura PURO (sem edição possível)
  if (!isEditing) {
    return (
      <span
        className={`${className} inline-block px-2 py-1 border border-transparent rounded-md transition-theme ${
          value ? 'text-primary' : 'text-muted'
        }`}
      >
        {value || placeholder}
      </span>
    );
  }

  // 2) Modo "clicável" antes de editar
  if (!editing) {
    return (
      <span
        className={`${className} inline-block px-2 py-1 border border-transparent rounded-md hover:cursor-text transition-theme ${
          value ? 'text-primary' : 'text-muted'
        }`}
        onClick={() => setEditing(true)}
      >
        {value || placeholder}
      </span>
    );
  }

  // 3) Modo edição ativo: mesma caixa, mas borda visível
  return (
    <span
      ref={spanRef}
      contentEditable
      suppressContentEditableWarning
      className={`
        ${className}
        inline-block
        px-2 py-1
        border border-input
        rounded-md
        focus:outline-none focus:border-input-focus
        transition-theme
        text-input
      `}
      onInput={() => {
        const txt = spanRef.current?.textContent ?? '';
        onChange(txt);
      }}
      onBlur={async () => {
        await onSave();
        setEditing(false);
      }}
    />
  );
}
