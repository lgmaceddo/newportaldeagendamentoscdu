import { X, FileText, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OfficeItem } from "@/types/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface OfficeItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OfficeItem | null;
}

export const OfficeItemDetailsModal = ({ isOpen, onClose, item }: OfficeItemDetailsModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 flex flex-col">
        <div className="p-6 flex-shrink-0">
          <DialogHeader>
            <div className="flex justify-between items-start border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-primary pr-8">
                {item.title}
              </DialogTitle>
              <button 
                onClick={onClose} 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* Content Body - Two Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Coluna Principal: Conteúdo Detalhado */}
          <ScrollArea className="p-6 border-r border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Conteúdo Detalhado
              </h3>
              <div className="bg-card p-4 rounded-lg border border-border/50 shadow-inner">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Coluna Secundária: Informações Adicionais */}
          {item.info && (
            <ScrollArea className="p-6 bg-muted/10">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Info className="h-5 w-5 text-yellow-600" />
                  Informações Adicionais
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {item.info}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="p-6 pt-4 border-t flex justify-end flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};