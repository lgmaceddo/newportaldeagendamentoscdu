import { Pencil, Trash2, Eye, Phone, Users, Clock, Stethoscope, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Office } from "@/types/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OfficeListItemProps {
  office: Office;
  onEdit: (office: Office) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export const OfficeListItem = ({ office, onEdit, onDelete, canEdit }: OfficeListItemProps) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Concatena as especialidades para o título
  const specialtiesString = office.specialties && office.specialties.length > 0 
    ? office.specialties.join(' / ') 
    : 'Sem Especialidades';

  return (
    <div 
      key={office.id} 
      className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors"
    >
      <div className="flex-1 min-w-0 pr-4">
        {/* Título Principal: Nome do Consultório + Especialidades */}
        <h3 className="font-bold text-lg text-primary line-clamp-1" title={`${office.name} - ${specialtiesString}`}>
          {office.name}
          {office.specialties && office.specialties.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground ml-2">
              — {specialtiesString}
            </span>
          )}
        </h3>
        
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
          {office.attendants && office.attendants.length > 0 ? (
            <div className="flex flex-wrap gap-1 ml-1">
              {office.attendants.map((attendant, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10 font-semibold"
                  title={`${attendant.name} - Turno: ${attendant.shift}`}
                >
                  {attendant.username}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Nenhum cadastrado</span>
          )}
        </div>
        
        {/* Especialidades (Removido daqui, já está no título) */}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Ícone de expansão (para indicar que é clicável para detalhes) */}
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
        
        {canEdit && (
          <>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={(e) => handleActionClick(e, () => onEdit(office))}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={(e) => handleActionClick(e, () => onDelete(office.id))}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};