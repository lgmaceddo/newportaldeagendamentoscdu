import { Pencil, Trash2, Eye, MapPin, Stethoscope, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Professional, ExamDetail } from "@/types/data";
import { cn } from "@/lib/utils";
import { useExamMap } from "@/hooks/use-exam-map";
import { Badge } from "@/components/ui/badge";

interface ProfessionalListItemProps {
  professional: Professional;
  onEdit?: (prof: Professional) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (prof: Professional) => void;
  canEdit: boolean;
}

export const ProfessionalListItem = ({
  professional,
  onEdit,
  onDelete,
  onViewDetails,
  canEdit,
}: ProfessionalListItemProps) => {
  const prefix = professional.gender === "masculino" ? "Dr." : "Drª.";
  const fullName = `${prefix} ${professional.name}`;
  const examMap = useExamMap();

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  
  const fittingsAllowed = professional.fittings.allowed;
  // const examCount = professional.performedExams.length; // Removido

  return (
    <div 
      key={professional.id} 
      className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onViewDetails(professional)} // Ação principal: Abrir modal de detalhes (que será o ProfessionalDetailsModal)
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 
          className={cn(
            "font-semibold text-base text-foreground line-clamp-1",
            professional.gender === 'feminino' ? 'text-red-700 dark:text-red-400' : 'text-primary'
          )}
          title={fullName}
        >
          {fullName}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
          
          {/* Especialidade - Removido o rótulo 'Especialidade:' */}
          <div className="flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">
              {professional.specialty}
            </span>
          </div>
          
          {/* Faixa Etária */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">Idade:</span>
            <span className="text-foreground font-semibold">
              {professional.ageRange}
            </span>
          </div>
          
          {/* Encaixes */}
          <div className="flex items-center gap-1">
            <span className="font-medium">Encaixes:</span>
            <Badge 
                className={cn(
                    "text-xs font-semibold",
                    fittingsAllowed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}
            >
                {fittingsAllowed ? `Sim (${professional.fittings.max})` : "Não"}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {canEdit && (
          <>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={(e) => handleActionClick(e, () => onEdit?.(professional))}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={(e) => handleActionClick(e, () => onDelete?.(professional.id))}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button 
          size="sm" 
          onClick={(e) => handleActionClick(e, () => onViewDetails(professional))}
          className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white"
          title="Ver Detalhes"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Ver
        </Button>
      </div>
    </div>
  );
};