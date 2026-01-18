import { useState, useEffect, useMemo } from "react";
import { X, Trash2, Search, Stethoscope, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Professional, ExamDetail } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useExamMap } from "@/hooks/use-exam-map";
import { cn } from "@/lib/utils";

interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (professional: Omit<Professional, "id">) => void;
  professional?: Professional | null;
}

export const ProfessionalModal = ({
  isOpen,
  onClose,
  onSave,
  professional,
}: ProfessionalModalProps) => {
  const { toast } = useToast();
  
  // Mantemos os imports de contexto, mas o foco é no layout do formulário
  const { valueTableData } = useData(); 
  const examMap = useExamMap(); 
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "masculino" as 'masculino' | 'feminino',
    specialty: "",
    ageRange: "",
    fittingsAllowed: "Não",
    fittingsMax: 0,
    fittingsDetails: "",
    generalObs: "",
  });

  const fittingsAllowed = formData.fittingsAllowed === "Sim";

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        gender: professional.gender,
        specialty: professional.specialty,
        ageRange: professional.ageRange,
        fittingsAllowed: professional.fittings.allowed ? "Sim" : "Não",
        fittingsMax: professional.fittings.max,
        fittingsDetails: professional.fittings.details,
        generalObs: professional.generalObs,
      });
    } else {
      setFormData({
        name: "",
        gender: "masculino",
        specialty: "",
        ageRange: "",
        fittingsAllowed: "Não",
        fittingsMax: 0,
        fittingsDetails: "",
        generalObs: "",
      });
    }
  }, [professional, isOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.specialty || !formData.ageRange) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const professionalData: Omit<Professional, "id"> = {
      name: formData.name,
      gender: formData.gender,
      specialty: formData.specialty,
      ageRange: formData.ageRange,
      fittings: {
        allowed: fittingsAllowed,
        max: fittingsAllowed ? formData.fittingsMax : 0,
        details: fittingsAllowed ? formData.fittingsDetails : "",
      },
      generalObs: formData.generalObs,
      // Preserve existing performedExams if editing, or set to empty array if new
      performedExams: professional?.performedExams || [], 
    };

    onSave(professionalData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-primary">{professional ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Information - Compact Grid */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Informações Gerais</h3>
            
            {/* Linha 1: Nome e Gênero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name" className="font-bold flex items-center gap-1"><User className="h-4 w-4" /> Nome do Profissional</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo (sem Dr./Drª.)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="font-bold">Gênero</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as 'masculino' | 'feminino' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino (Dr.)</SelectItem>
                    <SelectItem value="feminino">Feminino (Drª.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 2: Especialidade e Faixa Etária */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="specialty" className="font-bold flex items-center gap-1"><Stethoscope className="h-4 w-4" /> Especialidade</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Cardiologia"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ageRange" className="font-bold flex items-center gap-1"><Calendar className="h-4 w-4" /> Idade que Atende</Label>
                <Input
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  placeholder="ex: 18 a 65 anos"
                />
              </div>
            </div>

            {/* Linha 3: Encaixes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="fittings" className="font-bold">Aceita Encaixes</Label>
                <Select
                  value={formData.fittingsAllowed}
                  onValueChange={(value) => {
                    setFormData({ 
                        ...formData, 
                        fittingsAllowed: value,
                        // Limpa detalhes e max se não aceitar
                        fittingsMax: value === "Não" ? 0 : formData.fittingsMax,
                        fittingsDetails: value === "Não" ? "" : formData.fittingsDetails,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Sim">Sim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {fittingsAllowed && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fittingsMax" className="font-bold">Máximo de Encaixes</Label>
                  <Input
                    id="fittingsMax"
                    type="number"
                    min="0"
                    value={formData.fittingsMax}
                    onChange={(e) => setFormData({ ...formData, fittingsMax: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Regras de Encaixe (Abre somente se aceitar encaixes) */}
            {fittingsAllowed && (
              <div className="space-y-2 border p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Label htmlFor="fittingsDetails" className="font-bold text-yellow-800 dark:text-yellow-200">Regras/Observações sobre Encaixes</Label>
                <Textarea
                  id="fittingsDetails"
                  value={formData.fittingsDetails}
                  onChange={(e) => setFormData({ ...formData, fittingsDetails: e.target.value })}
                  placeholder="Observações específicas sobre encaixes..."
                  rows={2}
                  className="bg-white dark:bg-gray-900"
                />
              </div>
            )}

            {/* Observações Gerais (Full Width) */}
            <div className="space-y-2">
              <Label htmlFor="generalObs" className="font-bold">Observações Gerais</Label>
              <Textarea
                id="generalObs"
                value={formData.generalObs}
                onChange={(e) => setFormData({ ...formData, generalObs: e.target.value })}
                placeholder="Informações gerais sobre o profissional..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" type="button">
            Salvar Profissional
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};