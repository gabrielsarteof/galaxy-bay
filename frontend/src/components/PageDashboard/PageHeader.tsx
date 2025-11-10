'use client';

import React from 'react';
import { Eye, EyeOff, Rocket } from 'lucide-react';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

type PageHeaderProps = {
  page: PageResponseDto;
  isEditing: boolean;
  isPreviewMode: boolean;
  dirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onPublish: () => void;
  onTogglePreview: () => void;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  isEditing,
  isPreviewMode,
  dirty,
  onSave,
  onDiscard,
  onPublish,
  onTogglePreview
}) => (
  <header className="sticky top-0 z-20 bg-gray-200 border-b flex flex-col gap-2">
    <div className="flex px-6 py-4 justify-between items-center">
      {page.status !== 'published' && !isPreviewMode && (
        <span className="text-gray-600">Sua página ainda não foi publicada</span>
      )}
      {isPreviewMode && (
        <span className="text-gray-600 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Modo de visualização
        </span>
      )}
      <div className="flex space-x-4">
        {page.status !== 'published' && (
          <button
            onClick={onTogglePreview}
            className="inline-flex items-center px-5 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" /> Sair da visualização
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" /> Visualizar página
              </>
            )}
          </button>
        )}
        {page.status !== 'published' && !isPreviewMode && (
          <button onClick={onPublish} className="inline-flex items-center px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800">
            <Rocket className="w-4 h-4 mr-2" /> Publicar página
          </button>
        )}
      </div>
    </div>
    {isEditing && dirty && (
      <div className="bg-white px-6 py-5 flex justify-between items-center border-t">
        <span className="text-base">Você tem alterações não publicadas.</span>
        <div className="flex space-x-2">
          <button onClick={onDiscard} className="px-5 py-2 border border-gray-300 rounded-lg bg-white text-sm font-semibold hover:bg-gray-50">
            Descartar
          </button>
          <button onClick={onSave} className="px-5 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900">
            Salvar
          </button>
        </div>
      </div>
    )}
  </header>
);

export default PageHeader;