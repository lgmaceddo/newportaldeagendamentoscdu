import { z } from "zod";

export const recadoCategorySchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Máximo de 100 caracteres"),
  description: z.string().trim().max(500, "Máximo de 500 caracteres").optional().or(z.literal("")),
  destinationType: z.enum(['attendant', 'group']),
  groupName: z.string().optional().or(z.literal("")),
  attendants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    chatNick: z.string().min(1),
  })).optional().default([]),
});

export const recadoItemSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Máximo de 100 caracteres"),
  content: z.string().trim().min(1, "Conteúdo é obrigatório").max(5000, "Máximo de 5000 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  fields: z.array(z.string()).default([]),
});

export type RecadoCategoryFormData = z.infer<typeof recadoCategorySchema>;
export type RecadoItemFormData = z.infer<typeof recadoItemSchema>;