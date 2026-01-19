-- Simplificação Radical das Políticas de Privacidade
-- Regra de Ouro: Estomaterapia é Público. Todo o resto é estritamente privado (dono apenas).

-- 1. INFO_TAGS
ALTER TABLE public.info_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "info_tags_select_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_insert_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_update_policy" ON public.info_tags;
DROP POLICY IF EXISTS "info_tags_delete_policy" ON public.info_tags;

-- SELECT: Vê se é Estomaterapia OU se é dono.
CREATE POLICY "info_tags_select_strict" ON public.info_tags
FOR SELECT USING (
  section_type = 'estomaterapia' 
  OR 
  user_id = auth.uid()
);

-- INSERT: Cria se for dono (para anotações) ou admin (para estomaterapia)
CREATE POLICY "info_tags_insert_strict" ON public.info_tags
FOR INSERT WITH CHECK (
  user_id = auth.uid() 
  OR 
  (section_type = 'estomaterapia' AND public.has_role(auth.uid(), 'admin'))
);

-- UPDATE/DELETE: Apenas dono ou admin (para estomaterapia)
CREATE POLICY "info_tags_modify_strict" ON public.info_tags
FOR ALL USING (
  user_id = auth.uid() 
  OR 
  (section_type = 'estomaterapia' AND public.has_role(auth.uid(), 'admin'))
);

-- 2. INFO_ITEMS
ALTER TABLE public.info_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "info_items_select_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_insert_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_update_policy" ON public.info_items;
DROP POLICY IF EXISTS "info_items_delete_policy" ON public.info_items;

-- SELECT/ALL: Segue a visibilidade da TAG pai.
-- Se eu vejo a tag, eu vejo o item.
CREATE POLICY "info_items_access_strict" ON public.info_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.info_tags t
    WHERE t.id = info_items.tag_id
    AND (
      t.section_type = 'estomaterapia' 
      OR 
      t.user_id = auth.uid()
    )
  )
);
