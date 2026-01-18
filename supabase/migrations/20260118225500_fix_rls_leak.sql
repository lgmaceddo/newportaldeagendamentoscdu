-- ATIVAR RLS (Essencial!)
ALTER TABLE public.info_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_items ENABLE ROW LEVEL SECURITY;

-- Limpar policies anteriores para evitar duplicidade ou conflitos
DROP POLICY IF EXISTS "info_tags_select_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_insert_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_update_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_delete_policy" ON public.info_tags;

DROP POLICY IF EXISTS "info_items_select_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_insert_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_update_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_delete_policy" ON public.info_items;

-- RECRIAR POLICIES INFO_TAGS

-- SELECT:
-- 1. Se section_type for 'anotacoes', APENAS o dono (user_id = auth.uid()) pode ver.
-- 2. Se section_type != 'anotacoes' (estomaterapia, etc), todos podem ver (público).
-- Nota: Isso IMPEDE explicitamente admins de verem anotações de outros, a menos que o admin seja o dono.
CREATE POLICY "info_tags_select_policy" ON public.info_tags
FOR SELECT USING (
  (section_type = 'anotacoes' AND user_id = auth.uid()) 
  OR 
  (section_type != 'anotacoes')
);

-- INSERT:
-- Users normais: Apenas 'anotacoes' e para si mesmos.
-- Admins: Qualquer section, qualquer usuário (geralmente eles criam para si ou público).
CREATE POLICY "info_tags_insert_policy" ON public.info_tags
FOR INSERT WITH CHECK (
  (section_type = 'anotacoes' AND user_id = auth.uid()) 
  OR 
  (public.has_role(auth.uid(), 'admin'))
);

-- UPDATE/DELETE:
-- Apenas dono ou admin (para seções públicas).
-- Para anotações privadas, SÓ O DONO. Nem admin edita anotação privada alheia.
CREATE POLICY "info_tags_update_policy" ON public.info_tags
FOR UPDATE USING (
  (section_type = 'anotacoes' AND user_id = auth.uid()) 
  OR 
  (section_type != 'anotacoes' AND public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "info_tags_delete_policy" ON public.info_tags
FOR DELETE USING (
  (section_type = 'anotacoes' AND user_id = auth.uid()) 
  OR 
  (section_type != 'anotacoes' AND public.has_role(auth.uid(), 'admin'))
);


-- RECRIAR POLICIES INFO_ITEMS

-- SELECT: Baseado na visibilidade da Tag Pai
CREATE POLICY "info_items_select_policy" ON public.info_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.info_tags t
    WHERE t.id = info_items.tag_id
    AND (
      (t.section_type = 'anotacoes' AND t.user_id = auth.uid())
      OR
      (t.section_type != 'anotacoes')
    )
  )
);

-- INSERT:
CREATE POLICY "info_items_insert_policy" ON public.info_items
FOR INSERT WITH CHECK (
  -- Admin pode inserir em qualquer coisa, MAS se for anotação privada, deve ser dele
  -- Para simplificar: Usuario insere na sua anotação ou Admin insere em público
  (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.info_tags t
      WHERE t.id = tag_id AND t.section_type = 'anotacoes' AND t.user_id = auth.uid()
    )
  )
  OR
  (public.has_role(auth.uid(), 'admin')) -- Admin pode injetar itens globais
);

-- UPDATE/DELETE
CREATE POLICY "info_items_update_policy" ON public.info_items
FOR UPDATE USING (
  (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.info_tags t
      WHERE t.id = tag_id AND t.section_type = 'anotacoes' AND t.user_id = auth.uid()
    )
  )
  OR
  (public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "info_items_delete_policy" ON public.info_items
FOR DELETE USING (
  (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.info_tags t
      WHERE t.id = tag_id AND t.section_type = 'anotacoes' AND t.user_id = auth.uid()
    )
  )
  OR
  (public.has_role(auth.uid(), 'admin'))
);
