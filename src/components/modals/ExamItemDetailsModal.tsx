import { X, MapPin, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamItem } from "@/types/data";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ExamItemDetailsModalProps {
  open: boolean;
  onClose: () => void;
  exam: ExamItem;
}

const getLocationBadgeClasses = (location: string): string => {
  switch (location.toUpperCase()) {
    case 'CDU': // Verde escuro
      return "bg-green-600 hover:bg-green-700 text-white border-green-700";
    case 'HOSPITAL': // Laranja escuro
      return "bg-orange-600 hover:bg-orange-700 text-white border-orange-700";
    case 'CLÍNICAS EXTERNAS': // Vermelho queimado escuro
      return "bg-red-700 hover:bg-red-800 text-white border-red-800";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700";
  }
};

export const ExamItemDetailsModal = ({ open, onClose, exam }: ExamItemDetailsModalProps) => {
  // Garante que location é um array
  const safeLocation = Array.isArray(exam.location) ? exam.location : [String(exam.location || "")];
  
  // Setor e Ramal foram removidos do ExamItem, então removemos a lógica de exibição.

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-primary pr-8">
                {exam.title}
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
            {/* Informações Básicas (Local) */}
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-muted/20">
              {/* Local */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Local(is) Principal(is)</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {safeLocation.map((loc, index) => (
                      <Badge 
                        key={index}
                        className={cn(
                          "text-xs font-semibold",
                          getLocationBadgeClasses(loc)
                        )}
                      >
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            {exam.additionalInfo && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">
                  Informações Adicionais
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {exam.additionalInfo}
                  </p>
                </div>
              </div>
            )}

            {/* Regras de Agendamento */}
            {exam.schedulingRules && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">
                  Regras de Agendamento
                </h3>
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {exam.schedulingRules}
                  </p>
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