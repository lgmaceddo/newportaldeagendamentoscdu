-- Adiciona a coluna attendants à tabela recado_categories
ALTER TABLE public.recado_categories ADD COLUMN IF NOT EXISTS attendants JSONB DEFAULT '[]'::jsonb;

-- Comentário para documentação
COMMENT ON COLUMN public.recado_categories.attendants IS 'Lista de atendentes vinculados à categoria de recados';
