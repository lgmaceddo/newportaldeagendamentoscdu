import { InfoItem, InfoTag } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Eye, Download } from "lucide-react";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";

interface InfoItemCardProps {
  item: InfoItem;
  tag: InfoTag | undefined;
  canEdit: boolean;
  onEdit: (item: InfoItem) => void;
  onDelete: (itemId: string, tagId: string) => void;
  onViewDetails: (item: InfoItem, tag: InfoTag | undefined) => void;
}

export const InfoItemCard = ({
  item,
  tag,
  canEdit,
  onEdit,
  onDelete,
  onViewDetails,
}: InfoItemCardProps) => {
  const tagClasses = tag ? getCategoryBadgeClasses(tag.color) : 'bg-muted text-muted-foreground';
  const categoryColorBg = tagClasses.split(' ').find(c => c.startsWith('bg-')) || 'bg-muted/20';
  const hasAttachments = item.attachments && item.attachments.length > 0;

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card
      key={item.id}
      className="relative overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-300 border-2 border-border/50 hover:shadow-xl hover:border-primary/50"
      onClick={() => onViewDetails(item, tag)}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header Section - Título simplificado */}
        <div className={cn("p-3 flex-shrink-0 flex items-center justify-between min-h-[56px]", categoryColorBg)}>
          <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors flex items-center gap-2">
            <span>{item.title}</span>
          </h3>
        </div>
        
        {/* Footer Actions */}
        <div className="px-3 py-2 bg-muted/20 border-t flex justify-between items-center gap-2 mt-auto flex-shrink-0">
          {/* Indicador de Anexo */}
          {hasAttachments ? (
            <div className="flex items-center gap-1 text-xs text-primary font-semibold">
              <Download className="h-3.5 w-3.5" />
              {item.attachments.length} Anexo(s)
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
                  onClick={(e) => handleActionClick(e, () => onDelete(item.id, item.tagId))}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title="Excluir"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              onClick={(e) => handleActionClick(e, () => onViewDetails(item, tag))}
              className="h-7 px-2 text-xs bg-primary hover:bg-primary/90 text-white"
              title="Ver Detalhes"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Ver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};