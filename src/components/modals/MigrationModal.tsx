
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useData } from "@/contexts/DataContext";

interface MigrationModalProps {
    open: boolean;
    onClose: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ open, onClose }) => {
    const [jsonContent, setJsonContent] = useState("");
    const [isMigrating, setIsMigrating] = useState(false);
    const { importAllData } = useData();

    const handleMigration = async () => {
        if (!jsonContent.trim()) return;

        setIsMigrating(true);
        const success = await importAllData(jsonContent);
        setIsMigrating(false);
        if (success) onClose();
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Migração de Dados (Backup)</DialogTitle>
                    <DialogDescription>
                        Cole o conteúdo do seu arquivo JSON de backup abaixo para importar todos os dados para o Supabase.
                        Isso irá criar novos registros para todas as categorias e itens.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                        placeholder='Cole o conteúdo do JSON aqui (ex: { "scriptCategories": ... })'
                        className="min-h-[300px] font-mono text-xs"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isMigrating}>Cancelar</Button>
                    <Button onClick={handleMigration} disabled={isMigrating || !jsonContent.trim()}>
                        {isMigrating ? "Migrando..." : "Migrar Agora"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
