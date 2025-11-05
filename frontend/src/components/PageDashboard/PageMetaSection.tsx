'use client';

import React from 'react';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/24/solid';
import EditableField from '@/components/EditableField';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];

type PageMetaSectionProps = {
  page: PageResponseDto;
  localName: string;
  setLocalName: (value: string) => void;
  localTagline: string;
  setLocalTagline: (value: string) => void;
  isEditing: boolean;
};

const PageMetaSection: React.FC<PageMetaSectionProps> = ({ page, localName, setLocalName, localTagline, setLocalTagline, isEditing }) => (
  <section className="mt-20 text-center">
    <h1 className="text-xl font-bold">
      <EditableField
        value={localName}
        isEditing={isEditing}
        onChange={setLocalName}
        onSave={() => Promise.resolve()}
        className="text-xl font-bold"
      />
    </h1>
    <p className="text-sm text-gray-500 mt-4">
      <EditableField
        value={localTagline}
        isEditing={isEditing}
        onChange={setLocalTagline}
        onSave={() => Promise.resolve()}
        placeholder="Adicionar título"
        className="text-sm text-gray-500 mt-4"
      />
    </p>
    {page.slug && (
      <Link href={page.slug} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-blue-600 mt-2">
        <LinkIcon className="w-4 h-4 mr-2" />
        {page.slug}
      </Link>
    )}
  </section>
);

export default PageMetaSection;