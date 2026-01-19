-- Adiciona coluna description na tabela contact_points
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_points' AND column_name = 'description') THEN
        ALTER TABLE contact_points ADD COLUMN description TEXT;
    END IF;
END $$;
