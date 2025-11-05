'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import ErrorMessage from './ErrorMessage';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
  initialValue?: string;
}

/**
 * Modal para edição da descrição da página.
 * Permite que o criador adicione ou edite a descrição com validação em tempo real.
 */
export default function DescriptionModal({
  isOpen,
  onClose,
  onSave,
  initialValue = '',
}: DescriptionModalProps) {
  const [description, setDescription] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDescription(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    setError('');

    if (description.length < 10) {
      setError('A descrição deve ter pelo menos 10 caracteres');
      return;
    }

    if (description.length > 500) {
      setError('A descrição deve ter no máximo 500 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(description);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar descrição:', err);
      setError('Erro ao salvar a descrição. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription(initialValue);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const charCount = description.length;
  const charLimit = 500;
  const isValid = charCount >= 10 && charCount <= charLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Descreva sua página
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Conte para as pessoas quem é você e por que você está aqui
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              placeholder="Exemplo: Olá! Sou um artista digital apaixonado por criar NFTs únicos e exclusivos. Aqui você encontrará minhas últimas criações e terá acesso antecipado a novos lançamentos..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Mínimo 10 caracteres
              </p>
              <p className={`text-xs ${charCount > charLimit ? 'text-red-600' : 'text-gray-500'}`}>
                {charCount}/{charLimit}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Dicas para escrever uma boa descrição:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Seja autêntico e mostre sua personalidade</li>
              <li>Explique o tipo de conteúdo que você vai compartilhar</li>
              <li>Mencione o que torna seu trabalho único</li>
              <li>Seja claro sobre os benefícios para seus apoiadores</li>
            </ul>
          </div>

          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!isValid || isSaving}
          >
            Salvar descrição
          </Button>
        </div>
      </div>
    </div>
  );
}
