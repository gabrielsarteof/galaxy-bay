import { z } from 'zod';

/**
 * Valida os campos obrigatórios no primeiro passo do fluxo de criação
 */
export const createPageSchema = z.object({
  pageName: z
    .string()
    .min(1, 'Digite um nome para a sua página')
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  slug: z
    .string()
    .min(1, 'Digite um slug válido')
    .min(3, 'O slug deve ter pelo menos 3 caracteres')
    .max(30, 'O slug deve ter no máximo 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'O slug só pode conter letras minúsculas, números e hífens')
    .regex(/^[a-z]/, 'O slug deve começar com uma letra')
    .regex(/[a-z0-9]$/, 'O slug deve terminar com uma letra ou número'),
});

export type CreatePageFormData = z.infer<typeof createPageSchema>;

/**
 * Valida campos opcionais para atualização parcial de página
 */
export const updatePageSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .optional(),
  tagline: z
    .string()
    .max(100, 'O título deve ter no máximo 100 caracteres')
    .optional(),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional(),
  category: z
    .string()
    .min(2, 'A categoria deve ter pelo menos 2 caracteres')
    .max(30, 'A categoria deve ter no máximo 30 caracteres')
    .optional(),
  tags: z
    .array(z.string().min(2).max(20))
    .max(10, 'Você pode adicionar no máximo 10 tags')
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export type UpdatePageFormData = z.infer<typeof updatePageSchema>;

/**
 * Valida upload de imagens com restrições de tamanho e formato
 */
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'A imagem deve ter no máximo 5MB',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Formato não suportado. Use JPEG, PNG ou WebP',
      }
    ),
});

export type ImageUploadFormData = z.infer<typeof imageUploadSchema>;
