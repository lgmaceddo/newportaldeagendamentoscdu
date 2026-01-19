-- Adicionar colunas para categorias e itens nos consultórios, se não existirem
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.offices ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '{}'::jsonb;
