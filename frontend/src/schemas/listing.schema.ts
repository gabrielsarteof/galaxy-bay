import { z } from 'zod';

export const createListingSchema = z.object({
  price: z
    .string()
    .min(1, 'Preço é obrigatório')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Preço deve ser maior que 0'
    ),
});

export type CreateListingFormData = z.infer<typeof createListingSchema>;
