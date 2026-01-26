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
    if (contact.local) textLines.push(`🏢 Local: ${contact.local}`);
    if (contact.ramal) textLines.push(`☎️ Ramal: ${contact.ramal}`);
    if (contact.telefone) textLines.push(`📞 Telefone: ${formatPhoneNumber(contact.telefone)}`);
    if (contact.whatsapp) textLines.push(`💬 WhatsApp: ${formatPhoneNumber(contact.whatsapp)}`);

    navigator.clipboard.writeText(textLines.join('\n'));
    toast({
      title: "Copiado!",
      description: `Informações de ${contact.setor} copiadas.`,
      variant: "compact", // Keep compact variant if valid, else standard
      duration: 1000,
    });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatter or return as is
    return phone;
  };

  return (
    <div className="group relative border border-border/60 rounded-xl bg-card hover:bg-muted/30 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center p-3 gap-3">

        {/* Left: Icon & Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-base text-foreground pr-2 flex items-center gap-2 flex-wrap">
              {point.setor}
              {point.description && (
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse mt-0.5 shrink-0" title="Possui observação"></span>
              )}
            </h4>
          </div>

          <div className="flex flex-col gap-2 mt-2 text-sm">
            {point.local && (
              <div className="flex items-start text-muted-foreground" title="Localização">
                <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground/70 shrink-0" />
                <span className="break-words leading-snug">{point.local}</span>
              </div>
            )}

            {/* Contact Numbers Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {point.ramal && (
                <div className="flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-bold border border-primary/10">
                  <span className="mr-1 opacity-70">Ramal</span>
                  {point.ramal}
                </div>
              )}

              {point.telefone && (
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  <span className="font-medium text-foreground/80">{point.telefone}</span>
                </div>
              )}

              {point.whatsapp && (
                <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100 dark:bg-green-900/20 dark:border-green-900/30">
                  <Smartphone className="h-3 w-3 mr-1" />
                  {point.whatsapp}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => handleActionClick(e, () => handleCopyContact(point))}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none"
            title="Copiar informações"
          >
            <Copy className="h-4 w-4" />
          </Button>

          {canEdit && (
            <>
              <div className="w-px h-4 bg-border mx-1 hidden sm:block"></div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onEdit(point))}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 shadow-none"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleActionClick(e, () => onDelete(point.id))}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shadow-none"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Description Footnote */}
      {point.description && (
        <div className="px-3 pb-3 pt-0">
          <div className="bg-muted/40 rounded-md p-2 text-xs text-muted-foreground border border-border/40 mt-1">
            <p className="line-clamp-2">{point.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};