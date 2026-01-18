import { OfficeItem } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Eye, Download } from "lucide-react";

interface OfficeItemCardProps {
  item: OfficeItem;
  canEdit: boolean;
  onEdit: (item: OfficeItem) => void;
  onDelete: (itemId: string) => void;
  onViewDetails: (item: OfficeItem) => void;
}

export const OfficeItemCard = ({ item, canEdit, onEdit, onDelete, onViewDetails }: OfficeItemCardProps) => {
  const hasInfo = !!item.info;

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      key={item.id} 
      className="relative overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-300 border-2 border-border/50 hover:shadow-xl hover:border-primary/50"
      onClick={() => onViewDetails(item)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header Section - Título */}
        <div className="p-3 flex-shrink-0 flex items-center justify-between min-h-[56px] bg-primary/5 border-b border-border/50">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors flex items-center gap-2">
            <span>{item.title}</span>
          </h3>
        </div>

        {/* Footer Actions */}
        <div className="px-3 py-2 bg-muted/20 border-t flex justify-between items-center gap-2 mt-auto flex-shrink-0">
          {/* Indicador de Informações Adicionais */}
          {hasInfo ? (
            <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-400 font-semibold">
              <Download className="h-3.5 w-3.5" />
              Info Adicional
            </div>
          ) : (
            <div className="w-6 h-6"></div> // Placeholder para alinhamento
          )}

          <div className="flex items-center gap-1">
            {canEdit && (
              <>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={(e) => handleActionClick(e, () => onEdit(item))}
                  className="h-7 w-7 text-muted-foreground hover:text-primary" 
                  title="Editar"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={(e) => handleActionClick(e, () => onDelete(item.id))}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              onClick={(e) => handleActionClick(e, () => onViewDetails(item))}
              className="h-7 px-2 text-xs bg-primary hover:bg-primary/90 text-white" 
              title="Ver Detalhes"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> 
              Ver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};