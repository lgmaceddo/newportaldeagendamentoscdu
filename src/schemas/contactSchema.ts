import { z } from "zod";

// Schema for a single contact point (child)
export const contactPointSchema = z.object({
  setor: z
    .string()
    .trim()
    .min(1, { message: "Nome do Ponto de Contato (Setor) é obrigatório" })
    .max(200, { message: "Setor deve ter no máximo 200 caracteres" }),
  local: z
    .string()
    .trim()
    .max(200, { message: "Local deve ter no máximo 200 caracteres" })
    .optional(),
  ramal: z
    .string()
    .trim()
    .max(100, { message: "Ramal deve ter no máximo 100 caracteres" })
    .optional(),
  telefone: z
    .string()
    .trim()
    .max(50, { message: "Telefone deve ter no máximo 50 caracteres" })
    .optional(),
  whatsapp: z
    .string()
    .trim()
    .max(50, { message: "WhatsApp deve ter no máximo 50 caracteres" })
    .optional(),
  // description: z // REMOVIDO
  //   .string()
  //   .trim()
  //   .max(500, { message: "Descrição deve ter no máximo 500 caracteres" })
  //   .optional(),
});

// Schema for the main contact group (parent)
export const contactGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome do Grupo Principal é obrigatório" })
    .max(200, { message: "Nome deve ter no máximo 200 caracteres" }),
  categoryId: z.string().optional(), // Used for context, but not strictly part of the group data
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Nome da categoria é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  color: z.string().min(1, { message: "Cor é obrigatória" }),
});

export type ContactPointFormData = z.infer<typeof contactPointSchema>;
export type ContactGroupFormData = z.infer<typeof contactGroupSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;