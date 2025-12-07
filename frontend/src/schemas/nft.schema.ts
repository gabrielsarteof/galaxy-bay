import { z } from 'zod';

export const createNFTSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  image: z.any().refine((val) => val instanceof File || typeof val === 'string', {
    message: 'Imagem é obrigatória',
  }),
  collectionId: z.string().min(1, 'Selecione uma coleção'),
});

export type CreateNFTFormData = z.infer<typeof createNFTSchema>;
