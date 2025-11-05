'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPageSchema, CreatePageFormData } from '@/schemas/page.schema';
import { useCreatePage } from '@/hooks/useCreatePage';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import FormInput from '@/components/FormInput';

export default function CreatePage() {
  const { createPageMutation, isLoading, error, clearError } = useCreatePage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePageFormData>({
    resolver: zodResolver(createPageSchema),
    defaultValues: { pageName: '', slug: '' },
  });

  const onSubmit = (data: CreatePageFormData) => {
    createPageMutation(data);
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="w-full max-w-sm py-8 space-y-8">
        <div className="space-y-3">
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Vamos dar personalidade à sua página
          </h1>
          <p className="text-center text-gray-600 leading-relaxed">
            Você pode usar algo criativo ou começar com seu nome. Não se preocupe, você pode mudar quando quiser.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            id="pageName"
            label="Nome da Página"
            placeholder="Ex: Minha Página"
            register={register('pageName')}
            error={errors.pageName?.message}
          />

          <FormInput
            id="slug"
            label="URL da Página"
            placeholder="minha-pagina"
            prefix="galaxybay.com/"
            register={register('slug')}
            error={errors.slug?.message}
          />

          {error && <ErrorMessage message={error} onDismiss={clearError} />}

          <Button type="submit" loading={isFormLoading} disabled={isFormLoading} fullWidth>
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
}