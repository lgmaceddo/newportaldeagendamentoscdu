import { Phone, Smartphone, Copy, Edit, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactPoint } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ContactPointCardProps {
  point: ContactPoint;
  onEdit: (point: ContactPoint) => void;
  onDelete: (pointId: string) => void;
  canEdit: boolean;
}

export const ContactPointCard = ({ point, onEdit, onDelete, canEdit }: ContactPointCardProps) => {
  const { toast } = useToast();

  const handleCopyContact = (contact: ContactPoint) => {
    // Formatar o texto para cópia com cada campo em uma linha separada
    let textLines: string[] = [];
    
    textLines.push(`📍 ${contact.setor}`);
    
    if (contact.local) {
        textLines.push(`🏢 Local: ${contact.local}`);
    }
    
    if (contact.ramal) {
        textLines.push(`☎️ Ramal: ${contact.ramal}`);
    }
    
    if (contact.telefone) {
        textLines.push(`📞 Telefone: ${contact.telefone}`);
    }
    
    if (contact.whatsapp) {
        textLines.push(`💬 WhatsApp: ${contact.whatsapp}`);
    }

    navigator.clipboard.writeText(textLines.join('\n'));
    toast({
      title: "Copiado!",
      description: `Informações de ${contact.setor} copiadas.`,
      variant: "compact",
      duration: 1000,
    });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm p-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Conteúdo Principal: Nome do Ponto + Informações */}
        <div className="flex flex-wrap items-center gap-3 min-w-0 flex-grow">
          {/* Título do Ponto (Setor) */}
          <div className="min-w-0 flex-shrink">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {point.setor}
            </h4>
          </div>

          {/* Informações do Ponto - na mesma linha, alinhadas à esquerda */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground min-w-0">
            {point.local && (
              <span className="truncate" title={`Local: ${point.local}`}>
                <MapPin className="h-3 w-3 text-primary inline mr-1" />
                {point.local}
              </span>
            )}
            
            {point.ramal && (
              <span className="truncate" title={`Ramal: ${point.ramal}`}>
                <Phone className="h-3 w-3 text-primary inline mr-1" />
                <span className="font-medium text-primary">Ramal:</span>
                <span className="font-bold text-primary"> {point.ramal}</span>
              </span>
            )}
            
            {point.telefone && (
              <span className="truncate" title={`Telefone: ${point.telefone}`}>
                <Phone className="h-3 w-3 text-primary inline mr-1" />
                <span className="font-medium">Telefone:</span>
                <span className="font-bold"> {point.telefone}</span>
              </span>
            )}
            
            {point.whatsapp && (
              <span className="truncate" title={`WhatsApp: ${point.whatsapp}`}>
                <Smartphone className="h-3 w-3 text-green-600 inline mr-1" />
                <span className="font-medium text-green-600">WhatsApp:</span>
                <span className="font-bold text-green-600"> {point.whatsapp}</span>
              </span>
            )}
          </div>
        </div>

        {/* Ações - alinhadas à direita */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onEdit(point))}
                className="h-7 w-7 text-muted-foreground hover:text-primary p-1"
                title="Editar Ponto"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onDelete(point.id))}
                className="h-7 w-7 text-muted-foreground hover:text-destructive p-1"
                title="Excluir Ponto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handleActionClick(e, () => handleCopyContact(point))}
            className="h-7 text-xs px-2"
            title="Copiar Informações"
          >
            <Copy className="h-3 w-3 mr-1" /> Copiar
          </Button>
        </div>
      </div>
    </div>
  );
};