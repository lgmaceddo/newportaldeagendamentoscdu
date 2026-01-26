import { X, Clock, Tag, FileText, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoItem, InfoTag } from "@/types/data";
import { cn } from "@/lib/utils";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";

interface InfoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InfoItem;
  tag: InfoTag | undefined;
}

export const InfoDetailsModal = ({ isOpen, onClose, item, tag }: InfoDetailsModalProps) => {
  const tagClasses = tag ? getCategoryBadgeClasses(tag.color) : 'bg-muted text-muted-foreground';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-primary pr-8 leading-tight">
                {item.title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Metadados (Etiqueta e Data) - Container estilo Exames */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Etiqueta</p>
                  <div className="mt-1">
                    <Badge className={cn("text-xs font-semibold", tagClasses)}>
                      {tag?.name.toUpperCase() || 'SEM ETIQUETA'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Última Atualização</p>
                  <p className="text-sm font-medium mt-1">
                    {item.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            {item.content && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Conteúdo
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            )}

            {/* Informações Adicionais / Observações */}
            {item.info && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informações Adicionais
                </h3>
                {/* Usando estilo similar ao 'Regras de Agendamento' do Exames (bg-primary/5) */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {item.info}
                  </p>
                </div>
              </div>
            )}

            {/* Anexos (se houver - estrutura futura, mantendo consistência se adicionar) */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">Anexos</h3>
                <div className="grid gap-2">
                  {/* Placeholder para anexos se necessário implementar visualização */}
                  <p className="text-sm text-muted-foreground">Há {item.attachments.length} anexo(s) disponível(is).</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose} size="sm">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};