import { useState } from "react";
import { Pencil, Trash2, Eye, Phone, Users, Clock, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Office } from "@/types/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OfficeCategoriesView } from "./OfficeCategoriesView";

interface OfficeListItemProps {
  office: Office;
  onEdit: (office: Office) => void;
  onUpdate: (office: Office) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export const OfficeListItem = ({ office, onEdit, onUpdate, onDelete, canEdit }: OfficeListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Concatena as especialidades para o título
  const specialtiesString = office.specialties && office.specialties.length > 0
    ? office.specialties.join(' / ')
    : 'Sem Especialidades';

  // Categorias para mostrar no card fechado (badge count ou nomes)
  const categoryCount = office.categories?.length || 0;

  return (
    <div className="flex flex-col border-b border-border/50 last:border-b-0 hover:bg-muted/5 transition-all duration-200">
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer",
          isExpanded ? "bg-muted/30" : "hover:bg-muted/30"
        )}
        onClick={toggleExpand}
      >
        <div className="flex-1 min-w-0 pr-4">
          {/* Título Principal: Nome do Consultório + Especialidades */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-primary line-clamp-1" title={`${office.name} - ${specialtiesString}`}>
              {office.name}
            </h3>
            {categoryCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground border-primary/20">
                {categoryCount} Categoria{categoryCount !== 1 && 's'}
              </Badge>
            )}
          </div>


          {office.specialties && office.specialties.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground mb-2 line-clamp-1">
              {specialtiesString}
            </div>
          )}

          {/* Informações Chave (Ramal e Horário) */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-2">

            {/* Ramal */}
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Ramal:</span>
              <span className="text-foreground font-bold"> {office.ramal} </span>
            </div>

            {/* Horário */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="font-medium">Horário:</span>
              <span className="text-foreground font-bold"> {office.schedule} </span>
            </div>
          </div>

          {/* Atendentes - Listagem compacta */}
          <div className="flex items-center gap-2 mt-3">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium text-sm text-muted-foreground">Atendentes:</span>
            {office.attendants && office.attendants.filter(a => a && a.username).length > 0 ? (
              <div className="flex flex-wrap gap-1 ml-1">
                {office.attendants.filter(a => a && a.username).map((attendant, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10 font-semibold"
                    title={`${attendant.name || ""} - Turno: ${attendant.shift || ""}`}
                  >
                    {attendant.username}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Nenhum cadastrado</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Ícone de expansão */}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-hover:text-primary" />
          )}

          {canEdit && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onEdit(office))}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Editar Informações"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onDelete(office.id))}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Excluir Consultório"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Área Expandida para Categorias e Procedimentos */}
      {isExpanded && (
        <div className="p-4 bg-muted/5 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
          <OfficeCategoriesView
            office={office}
            onUpdate={onUpdate}
            canEdit={canEdit}
          />
        </div>
      )}
    </div>
  );
};