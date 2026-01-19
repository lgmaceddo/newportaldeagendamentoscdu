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
    let textLines: string[] = [];
    textLines.push(`📍 ${contact.setor}`);
    // if (contact.local) textLines.push(`🏢 Local: ${contact.local}`); // Removed
    if (contact.ramal) textLines.push(`☎️ Ramal: ${contact.ramal}`);
    if (contact.telefone) textLines.push(`📞 Telefone: ${contact.telefone}`);
    if (contact.whatsapp) textLines.push(`💬 WhatsApp: ${contact.whatsapp}`);

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
    <div className="border rounded-lg bg-card shadow-sm p-3 hover:shadow-md transition-shadow duration-200 group">
      {/* Layout Grid para Desktop */}
      {/* Nome (320px ~35chars) | Ramal (Auto - mostra tudo) | Telefone (160px) | Espaço Vazio (Flex) | Ações */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_auto_160px_1fr_auto] gap-2 items-center">

        {/* 1. Nome do Ponto (Setor) */}
        <div className="font-semibold text-sm text-foreground truncate" title={point.setor}>
          {point.setor}
        </div>

        {/* 2. Ramal (Mostra tudo) */}
        <div className="text-xs truncate flex items-center gap-1.5" title={point.ramal ? `Ramal: ${point.ramal}` : ''}>
          {point.ramal ? (
            <>
              <Phone className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                R: {point.ramal}
              </span>
            </>
          ) : (
            <span className="opacity-0">-</span>
          )}
        </div>

        {/* 3. Telefone / WhatsApp */}
        <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
          {point.whatsapp ? (
            <div className="flex items-center gap-1 text-green-600 font-medium" title="WhatsApp">
              <Smartphone className="h-3 w-3" />
              <span>{point.whatsapp}</span>
            </div>
          ) : point.telefone ? (
            <div className="flex items-center gap-1" title="Telefone">
              <Phone className="h-3 w-3" />
              <span>{point.telefone}</span>
            </div>
          ) : (
            <span className="opacity-0">-</span>
          )}
        </div>

        {/* 4. Espaçador (preenche vazio para empurrar ações para a direita) */}
        <div className="hidden md:block"></div>

        {/* 5. Ações */}
        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onEdit(point))}
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                title="Editar"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onDelete(point.id))}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => handleActionClick(e, () => handleCopyContact(point))}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Copiar"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Descrição em linha separada e largura total - Respeitando quebras de linha */}
      {point.description && (
        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground pl-1">
          <span className="text-primary/50 text-[10px] uppercase font-bold tracking-wider mr-2 select-none">Nota:</span>
          <div className="whitespace-pre-wrap mt-1 italic">{point.description}</div>
        </div>
      )}
    </div>
  );
};