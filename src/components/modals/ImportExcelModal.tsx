import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { importExcelData } from '@/scripts/excelImporter';
import { useData } from '@/contexts/DataContext';
import { ValueTableItem, Category } from '@/types/data';
import { toast } from 'sonner';

interface ImportExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ID fixo da categoria GERAL para valores (mantido para referência, mas não usado para importação de múltiplas categorias)
const GERAL_CATEGORY_ID = 'vt-cat-geral';

export function ImportExcelModal({ open, onOpenChange }: ImportExcelModalProps) {
  const {
    saveToLocalStorage,
    setValueTableDataAndCategories // Nova função para substituir tudo
  } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<{
    totalItems: number;
    categories: Category[];
    values: Record<string, ValueTableItem[]>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsProcessing(true);

    try {
      const { values, categories } = await importExcelData(file);

      const totalItems = Object.values(values).reduce((sum, items) => sum + items.length, 0);

      if (totalItems === 0) {
        toast.error('Nenhum exame válido encontrado no arquivo.');
        setPreview(null);
        return;
      }

      setPreview({
        totalItems,
        categories,
        values
      });

      toast.success(`Arquivo processado: ${totalItems} exames encontrados em ${categories.length} categorias.`);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error(`Erro ao processar arquivo. Verifique se o formato está correto. Detalhe: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsProcessing(true);

    try {
      // 1. Substitui todas as categorias e dados de valores
      // A importação agora substitui TUDO, não apenas a categoria GERAL.
      // O DataContext precisa de uma função para lidar com isso.

      // Criando a nova estrutura de dados para o DataContext (viewType: GERAL)
      const newCategories: Category[] = preview.categories;
      const newValues: Record<string, ValueTableItem[]> = preview.values;

      // Chamando a função de substituição total (que criaremos no DataContext)
      await setValueTableDataAndCategories('GERAL', newCategories, newValues);

      // 2. Salva no localStorage
      saveToLocalStorage();

      toast.success(`Importação concluída! ${preview.totalItems} exames foram importados em ${preview.categories.length} categorias.`);
      onOpenChange(false);
      setPreview(null);

      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Tabela de Valores do Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">ATENÇÃO: Substituição Completa</p>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  <li>Ao importar, **TODAS** as categorias e dados de valores existentes serão **APAGADOS** e substituídos pelos dados do arquivo Excel.</li>
                  <li>Cada aba (sheet) do Excel será convertida em uma nova categoria no sistema.</li>
                  <li>O arquivo deve conter colunas para ITEM (Código), DESCRIÇÃO, HONORÁRIO MÉDICO e VALOR EXAME.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Área de upload */}
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {fileInputRef.current?.files?.[0]?.name || 'Selecione o arquivo Excel'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato aceito: .xlsx ou .xls
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Escolher Arquivo'}
              </Button>
            </div>
          </div>

          {/* Preview dos dados */}
          {preview && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Pronto para importar:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {preview.totalItems} exames serão importados.</li>
                    <li>• {preview.categories.length} categorias serão criadas/substituídas.</li>
                    <li>• Todos os dados de valores anteriores serão substituídos.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!preview || isProcessing}
            >
              {isProcessing ? 'Importando...' : 'Confirmar Importação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}