import { X, User, Calendar, Check, X as XIcon, AlertTriangle, Stethoscope, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Professional, ExamDetail } from "@/types/data";
import { cn } from "@/lib/utils";
import { useExamMap } from "@/hooks/use-exam-map";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  onViewExamDetails: (exam: ExamDetail, professionalName: string) => void;
}

export const ProfessionalDetailsModal = ({
  isOpen,
  onClose,
  professional,
  onViewExamDetails,
}: ProfessionalDetailsModalProps) => {
  const { toast } = useToast();
  const examMap = useExamMap();

  if (!professional) return null;

  const prefix = professional.gender === "masculino" ? "Dr." : "Drª.";
  const fullName = `${prefix} ${professional.name}`;
  const fittingsAllowed = professional.fittings.allowed;
  const hasFittingsDetails = fittingsAllowed && professional.fittings.details.trim().length > 0;

  const handleCopyGeneralObs = () => {
    if (professional.generalObs) {
        navigator.clipboard.writeText(professional.generalObs);
        toast({
            title: "Copiado!",
            description: "Observação geral copiada.",
            variant: "compact",
            duration: 1000,
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <DialogTitle className="text-3xl font-extrabold text-primary pr-8">
                  {fullName}
                </DialogTitle>
                <p className="text-lg text-muted-foreground mt-1">{professional.specialty}</p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Estatísticas e Encaixes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
                
                {/* Faixa Etária */}
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Faixa Etária</p>
                        <p className="text-sm font-semibold text-foreground">{professional.ageRange}</p>
                    </div>
                </div>

                {/* Encaixes */}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-1.5 rounded-full flex-shrink-0",
                        fittingsAllowed ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                    )}>
                        {fittingsAllowed ? (
                            <Check className="h-5 w-5 text-green-600" />
                        ) : (
                            <XIcon className="h-5 w-5 text-red-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Encaixes</p>
                        <p className={cn(
                            "text-sm font-semibold",
                            fittingsAllowed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                        )}>
                            {fittingsAllowed ? `Sim (Máx: ${professional.fittings.max})` : "Não"}
                        </p>
                    </div>
                </div>
                
                {/* Exames Cadastrados */}
                <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Total de Exames</p>
                        <p className="text-sm font-semibold text-foreground">{professional.performedExams.length}</p>
                    </div>
                </div>
            </div>

            {/* Observações Gerais */}
            {professional.generalObs && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Observações Gerais</h3>
                    <Button variant="ghost" size="sm" onClick={handleCopyGeneralObs}>
                        <Copy className="h-4 w-4 mr-2" /> Copiar
                    </Button>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {professional.generalObs}
                  </p>
                </div>
              </div>
            )}
            
            {/* Detalhes de Encaixe (se houver) */}
            {hasFittingsDetails && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Regras de Encaixe</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 whitespace-pre-wrap leading-relaxed">
                        {professional.fittings.details}
                      </p>
                    </div>
                </div>
            )}
            
            {/* Aviso sobre Exames REMOVIDO */}
          </div>
        </div>
        
        <div className="p-6 pt-4 border-t flex justify-end">
            <Button variant="outline" onClick={onClose}>
                Fechar
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};