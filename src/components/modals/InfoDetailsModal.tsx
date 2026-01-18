import { X, FileText, Info, Clock, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoItem, InfoTag } from "@/types/data";
import { cn } from "@/lib/utils";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InfoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InfoItem;
  tag: InfoTag | undefined;
}

export const InfoDetailsModal = ({ isOpen, onClose, item, tag }: InfoDetailsModalProps) => {
  const tagClasses = tag ? getCategoryBadgeClasses(tag.color) : 'bg-muted text-muted-foreground';
  const hasAdditionalInfo = !!item.info;

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

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground border-b pb-4 mb-6">
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4 text-primary" />
              <Badge className={cn("text-xs font-semibold", tagClasses)}>
                {tag?.name.toUpperCase() || 'SEM ETIQUETA'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Atualizado em: {item.date}</span>
            </div>
          </div>
        </div>

        {/* Content Body - Two Columns */}
        <div className={cn(
          "flex-1 overflow-hidden",
          hasAdditionalInfo ? "grid grid-cols-1 md:grid-cols-2" : "grid grid-cols-1"
        )}>
          {/* Coluna Principal: Conteúdo Detalhado */}
          <ScrollArea className={cn(
            "p-6",
            hasAdditionalInfo && "border-r border-border"
          )}>
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
          {hasAdditionalInfo && (
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