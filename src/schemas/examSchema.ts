import { z } from "zod";

export const examSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Nome do exame é obrigatório" })
    .max(200, { message: "Nome deve ter no máximo 200 caracteres" }),
  categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
  location: z // Alterado para array de strings
    .array(z.string())
    .min(1, { message: "Selecione pelo menos um local" }),
  // setor: z.array(z.string()).optional(), // REMOVIDO
  // extension: z.string().trim().max(50).optional(), // REMOVIDO
  additionalInfo: z
    .string()
    .max(2000, { message: "Informações devem ter no máximo 2000 caracteres" })
    .optional(),
  schedulingRules: z // NOVO CAMPO
    .string()
    .max(2000, { message: "Regras devem ter no máximo 2000 caracteres" })
    .optional(),
  valueTableCode: z.string().optional(), // NOVO: Código do exame na tabela de valores
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da categoria é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export type ExamFormData = z.infer<typeof examSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;