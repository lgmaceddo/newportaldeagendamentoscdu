import { useState, useEffect } from "react";
import { Plus, X, Save, Search } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Professional, ExamDetail } from "@/types/data";
import { Card, CardContent } from "@/components/ui/card";
import { ProfessionalModal } from "@/components/modals/ProfessionalModal";
import { ExamDetailsModal } from "@/components/modals/ExamDetailsModal";
import { ProfessionalDetailsModal } from "@/components/modals/ProfessionalDetailsModal";
import { ProfessionalListItem } from "./ProfessionalListItem";
import { useExamMap } from "@/hooks/use-exam-map";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { useLocation } from "react-router-dom";

interface ProfissionaisContentProps {
  data: Professional[];
}

export const ProfissionaisContent = ({ data }: ProfissionaisContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditProfissionais = canEdit('profissionais');
  const { addProfessional, updateProfessional, deleteProfessional, hasUnsavedChanges, saveToLocalStorage } = useData();
  const examMap = useExamMap();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for Modals
  const [isNewProfessionalModalOpen, setIsNewProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deletingProfessionalId, setDeletingProfessionalId] = useState<string | null>(null);
  
  // State for Professional Details Modal (used for viewing all rules)
  const [isProfessionalDetailsModalOpen, setIsProfessionalDetailsModalOpen] = useState(false);
  const [viewingProfessional, setViewingProfessional] = useState<Professional | null>(null);
  
  // State for Exam Details Modal (used for viewing specific exam rules from within ProfessionalDetailsModal)
  const [isExamDetailsModalOpen, setIsExamDetailsModalOpen] = useState(false);
  const [viewingExamDetail, setViewingExamDetail] = useState<{ exam: ExamDetail, professionalName: string } | null>(null);

  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'professional') {
      const itemId = location.state.searchResult.itemId;
      
      // Find and view the specific professional
      const professional = data.find(p => p.id === itemId);
      if (professional) {
        setViewingProfessional(professional);
        setIsProfessionalDetailsModalOpen(true);
        
        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, data]);

  // Função para abrir o modal de detalhes de um exame específico (chamada pelo ProfessionalDetailsModal)
  const handleViewExamDetails = (exam: ExamDetail, professionalName: string) => {
    setViewingExamDetail({ exam, professionalName });
    setIsExamDetailsModalOpen(true);
  };

  // Função para abrir o modal de detalhes do profissional (chamada pelo ProfessionalListItem)
  const handleViewProfessionalDetails = (professional: Professional) => {
    setViewingProfessional(professional);
    setIsProfessionalDetailsModalOpen(true);
  };

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsNewProfessionalModalOpen(true);
  };

  const handleSaveProfessional = (professionalData: Omit<Professional, "id">) => {
    if (editingProfessional) {
      updateProfessional("GERAL", "prof-cat-1", editingProfessional.id, professionalData);
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso!",
      });
      setEditingProfessional(null);
    } else {
      addProfessional("GERAL", "prof-cat-1", professionalData);
      toast({
        title: "Sucesso",
        description: "Profissional adicionado com sucesso!",
      });
    }
    setIsNewProfessionalModalOpen(false);
  };

  const handleDeleteProfessional = (professionalId: string) => {
    setDeletingProfessionalId(professionalId);
  };

  const confirmDelete = () => {
    if (deletingProfessionalId) {
      deleteProfessional("GERAL", "prof-cat-1", deletingProfessionalId);
      toast({
        title: "Sucesso",
        description: "Profissional excluído com sucesso!",
      });
      setDeletingProfessionalId(null);
    }
  };

  const handleCloseModal = () => {
    setIsNewProfessionalModalOpen(false);
    setEditingProfessional(null);
  };

  const handleCloseExamDetailsModal = () => {
    setIsExamDetailsModalOpen(false);
    setViewingExamDetail(null);
  };

  const handleCloseProfessionalDetailsModal = () => {
    setIsProfessionalDetailsModalOpen(false);
    setViewingProfessional(null);
  };

  const filteredData = data
    .filter(
      (prof) =>
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.generalObs.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.performedExams.some(exam => examMap[exam.examId]?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-lg shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Profissionais</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os profissionais, suas especialidades e regras de agendamento.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => {
                saveToLocalStorage();
                toast({
                  title: "Dados salvos",
                  description: "Todas as alterações foram salvas com sucesso!",
                });
              }}
              size="icon"
              variant={hasUnsavedChanges ? "default" : "outline"}
              title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
              className="h-9 w-9"
            >
              <Save className="h-4 w-4" />
            </Button>
            {canEditProfissionais && (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsNewProfessionalModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" /> Novo Profissional
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-background max-w-full">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Buscar profissional por nome, especialidade ou exame..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {/* Lista de Profissionais */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border/50">
          {filteredData.length > 0 ? (
            filteredData.map((prof) => (
              <ProfessionalListItem
                key={prof.id}
                professional={prof}
                onEdit={handleEditProfessional}
                onDelete={handleDeleteProfessional}
                onViewDetails={handleViewProfessionalDetails}
                canEdit={canEditProfissionais}
              />
            ))
          ) : (
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Nenhum profissional encontrado.</p>
            </CardContent>
          )}
        </div>
      </Card>
      {/* New/Edit Professional Modal */}
      <ProfessionalModal
        isOpen={isNewProfessionalModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProfessional}
        professional={editingProfessional}
      />
      {/* Professional Details Modal (Novo modal de visualização completa) */}
      <ProfessionalDetailsModal
        isOpen={isProfessionalDetailsModalOpen}
        onClose={handleCloseProfessionalDetailsModal}
        professional={viewingProfessional}
        onViewExamDetails={handleViewExamDetails}
      />
      {/* Exam Details Modal (usado para ver regras específicas de um exame) */}
      {viewingExamDetail && (
        <ExamDetailsModal
          isOpen={isExamDetailsModalOpen}
          onClose={handleCloseExamDetailsModal}
          exam={viewingExamDetail.exam}
          professionalName={viewingExamDetail.professionalName}
        />
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingProfessionalId} onOpenChange={() => setDeletingProfessionalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};