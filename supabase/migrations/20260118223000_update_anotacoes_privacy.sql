-- Adicionar coluna user_id às tabelas se não existirem
ALTER TABLE public.info_tags 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.info_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar Policies para info_tags
DROP POLICY IF EXISTS "Enable read access for all users" ON public.info_tags;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.info_tags;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.info_tags;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.info_tags;

-- Policy de Leitura:
-- 1. Estomaterapia ou outras seções públicas (section_type != 'anotacoes') -> Visível para todos
-- 2. Anotações (section_type = 'anotacoes') -> Apenas se pertencer ao usuário (user_id = auth.uid())
CREATE POLICY "info_tags_select_policy" ON public.info_tags
FOR SELECT USING (
  section_type != 'anotacoes' OR 
  (section_type = 'anotacoes' AND user_id = auth.uid())
);

-- Policy de Inserção:
-- Usuários podem criar tags apenas para si mesmos na seção 'anotacoes'
-- Admins podem criar em qualquer lugar (mas focamos na regra do usuário comum)
CREATE POLICY "info_tags_insert_policy" ON public.info_tags
FOR INSERT WITH CHECK (
  (section_type = 'anotacoes' AND user_id = auth.uid()) OR
  (section_type != 'anotacoes' AND public.has_role(auth.uid(), 'admin'))
);

-- Policy de Atualização:
-- Dono da tag pode editar
CREATE POLICY "info_tags_update_policy" ON public.info_tags
FOR UPDATE USING (
  (section_type = 'anotacoes' AND user_id = auth.uid()) OR
  (section_type != 'anotacoes' AND public.has_role(auth.uid(), 'admin'))
);

-- Policy de Deleção:
-- Dono da tag pode deletar
CREATE POLICY "info_tags_delete_policy" ON public.info_tags
FOR DELETE USING (
  (section_type = 'anotacoes' AND user_id = auth.uid()) OR
  (section_type != 'anotacoes' AND public.has_role(auth.uid(), 'admin'))
);


-- Atualizar Policies para info_items
DROP POLICY IF EXISTS "Enable read access for all users" ON public.info_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.info_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.info_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.info_items;

-- Policy de Leitura:
-- 1. Itens públicos (user_id IS NULL) - Assumindo que Estomaterapia/Globais não têm user_id ou é opcional
-- 2. Meus itens (user_id = auth.uid())
-- PROBLEMA: items dependem da tag para saber se são anotações ou estomaterapia?
-- Solução Mais Segura: Verificar se a tag pai é visível.
-- Postgres RLS permite subqueries.
CREATE POLICY "info_items_select_policy" ON public.info_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.info_tags t
    WHERE t.id = info_items.tag_id
    AND (
      t.section_type != 'anotacoes' OR 
      (t.section_type = 'anotacoes' AND t.user_id = auth.uid())
    )
  )
);

-- Policy de Inserção:
-- Deve corresponder à visibilidade da tag pai
CREATE POLICY "info_items_insert_policy" ON public.info_items
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.info_tags t
    WHERE t.id = tag_id
    AND t.section_type = 'anotacoes'
    AND t.user_id = auth.uid()
  )
);
-- Nota: Para estomaterapia, admins inserem.
-- Vamos adicionar regra para Admins/Estomaterapia depois se necessário, mas o foco é 'Anotações' pessoal.
-- Ajustando insert para permitir admins em estomaterapia também:
-- OU user comum em suas anotações
ALTER POLICY "info_items_insert_policy" ON public.info_items
USING (
   (
     public.has_role(auth.uid(), 'admin') -- Admins podem tudo (simplificado)
     OR
     (user_id = auth.uid() AND EXISTS (
        SELECT 1 FROM public.info_tags t
        WHERE t.id = tag_id AND t.section_type = 'anotacoes' AND t.user_id = auth.uid()
     ))
   )
);
-- Ops, USING é para UPDATE/DELETE. WITH CHECK é para INSERT. Vou corrigir abaixo.

DROP POLICY "info_items_insert_policy" ON public.info_items;
CREATE POLICY "info_items_insert_policy" ON public.info_items
FOR INSERT WITH CHECK (
    -- Admin criando qualquer coisa
    public.has_role(auth.uid(), 'admin') 
    OR
    -- Usuário criando anotação pessoal
    (
        user_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.info_tags t
            WHERE t.id = tag_id 
            AND t.section_type = 'anotacoes' 
            AND t.user_id = auth.uid()
        )
    )
);

-- Policy de Atualização
CREATE POLICY "info_items_update_policy" ON public.info_items
FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') 
    OR
    (
        user_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.info_tags t
            WHERE t.id = tag_id 
            AND t.section_type = 'anotacoes'
        )
    )
);

-- Policy de Deleção
CREATE POLICY "info_items_delete_policy" ON public.info_items
FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') 
    OR
    (
        user_id = auth.uid() 
        AND EXISTS (
            SELECT 1 FROM public.info_tags t
            WHERE t.id = tag_id 
            AND t.section_type = 'anotacoes'
        )
    )
);
