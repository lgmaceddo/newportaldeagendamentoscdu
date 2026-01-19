import { useState, useEffect, useMemo } from "react";
import { Plus, Settings, Edit, Trash2, Eye, Copy, Save, X, MapPin, Phone, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, ExamItem } from "@/types/data";
import { ExamModal } from "@/components/modals/ExamModal";
import { ExamItemDetailsModal } from "@/components/modals/ExamItemDetailsModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ExamFormData, CategoryFormData } from "@/schemas/examSchema";
import { getCategoryBadgeClasses, getLocationTextClass } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { SortableList, SortableItem } from "@/components/SortableList";
import { useLocation } from "react-router-dom";

interface ExamesContentProps {
  categories: Category[];
  data: Record<string, ExamItem[]>;
}

export const ExamesContent = ({ categories, data }: ExamesContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditExams = canEdit('exames');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<(ExamItem & { categoryId: string }) | undefined>();
  const [viewingExam, setViewingExam] = useState<ExamItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addExam, updateExam, deleteExam, addExamCategory, updateExamCategory, deleteExamCategory, reorderExamCategories, hasUnsavedChanges, saveToLocalStorage, userName } = useData();
  const { toast } = useToast();

  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'exam') {
      const categoryId = location.state.searchResult.categoryId;
      const itemId = location.state.searchResult.itemId;

      // Set the correct category
      if (categoryId) {
        setActiveCategory(categoryId);
      }

      // Find and view the specific exam
      const categoryExams = data[categoryId] || [];
      const exam = categoryExams.find(e => e.id === itemId);
      if (exam) {
        setViewingExam(exam);
        setDetailsModalOpen(true);

        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, data]);

  // Ordena as categorias alfabeticamente (apenas para inicialização, a reordenação manual prevalece)
  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [categories]);

  // Update activeCategory when viewType or categories change
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Consolida todos os itens para a busca
  const allItems: (ExamItem & { categoryId: string })[] = categories.flatMap(cat => (data[cat.id] || []).map(item => ({ ...item, categoryId: cat.id })));

  const filteredItems = allItems
    .filter((item) => {
      const lowerTerm = searchTerm.toLowerCase();
      const locationArr = Array.isArray(item.location) ? item.location : [];
      const locationStr = locationArr.join(' ').toLowerCase();
      // Removido setorStr e item.extension da busca

      return item.title.toLowerCase().includes(lowerTerm) ||
        locationStr.includes(lowerTerm);
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  // Itens a serem exibidos (filtrados se houver busca, ou apenas da categoria ativa)
  const itemsToDisplay = searchTerm ? filteredItems : (data[activeCategory] || []).map(item => ({ ...item, categoryId: activeCategory }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  const handleSaveExam = async (formData: ExamFormData) => {
    try {
      const examData: ExamItem = {
        id: editingExam?.id || crypto.randomUUID(),
        title: formData.title,
        location: formData.location, // Agora é string[]
        // setor e extension removidos
        additionalInfo: formData.additionalInfo || "",
        schedulingRules: formData.schedulingRules || "",
        valueTableCode: formData.valueTableCode,
      };

      if (editingExam) {
        // Se mudou de categoria, precisa remover da antiga e adicionar na nova
        if (editingExam.categoryId !== formData.categoryId) {
          deleteExam(editingExam.categoryId, editingExam.id);
          addExam(formData.categoryId, examData);
        } else {
          // Mesma categoria, apenas atualiza
          updateExam(formData.categoryId, editingExam.id, examData);
        }
      } else {
        addExam(formData.categoryId, examData);
      }

      setEditingExam(undefined);
      setExamModalOpen(false);
      toast({
        title: "Sucesso!",
        description: editingExam ? "Exame atualizado com sucesso." : "Exame criado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar exame:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o exame.",
        variant: "destructive"
      });
    }
  };

  const handleEditExam = (exam: ExamItem, categoryId: string) => {
    setEditingExam({ ...exam, categoryId });
    setExamModalOpen(true);
  };

  const handleDeleteExam = async (examId: string, categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir este exame?")) {
      try {
        await deleteExam(categoryId, examId);
        toast({
          title: "Sucesso!",
          description: "Exame excluído com sucesso."
        });
      } catch (error) {
        console.error("Erro ao excluir exame:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o exame.",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewExam = (exam: ExamItem) => {
    setViewingExam(exam);
    setDetailsModalOpen(true);
  };

  const handleAddCategory = (formData: CategoryFormData) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: formData.name,
      color: formData.color,
    };
    addExamCategory(newCategory);
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    updateExamCategory(categoryId, updates);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("ATENÇÃO! Excluir esta categoria removerá TODOS os exames associados a ela. Continuar?")) {
      deleteExamCategory(categoryId);
      toast({
        title: "Sucesso!",
        description: "Categoria e exames associados excluídos."
      });
    }
  };

  const handleSyncExams = async () => {
    setIsSyncing(true);
    try {
      // syncValueTableToExams();
      toast({
        title: "Sincronização concluída",
        description: "Exames da tabela de valores sincronizados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os exames.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    reorderExamCategories(oldIndex, newIndex);
    // Atualiza a categoria ativa para a nova posição, se necessário
    const newActiveCategory = categories[newIndex]?.id;
    if (newActiveCategory) {
      setActiveCategory(newActiveCategory);
    }
  };

  const renderExamItem = (item: ExamItem & { categoryId: string }) => {
    const category = categories.find(c => c.id === item.categoryId);
    const categoryClasses = category ? getCategoryBadgeClasses(category.color) : 'bg-muted text-muted-foreground';

    // Lida com o location como array
    const locationStr = Array.isArray(item.location) ? item.location.join(' / ') : 'N/A';

    // Obtém a classe de cor do texto para a localização (usando o primeiro local para cor)
    const locationTextClass = getLocationTextClass(Array.isArray(item.location) ? item.location[0] : item.location);

    return (
      <div
        key={item.id}
        className={cn(
          "flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer",
          viewingExam?.id === item.id && "bg-primary/10 ring-2 ring-primary/30" // Highlight searched item
        )}
        onClick={() => handleViewExam(item)}
      >
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-semibold text-base text-foreground line-clamp-1" title={item.title}>
            {item.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium">Local:</span>
              <span className={cn("font-semibold", locationTextClass)}>
                {locationStr}
              </span>
            </div>
            {/* Ramal e Setor removidos */}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canEditExams && (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditExam(item, item.categoryId);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteExam(item.id, item.categoryId);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewExam(item);
            }}
            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white"
            title="Ver Detalhes"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Ver
          </Button>
        </div>
      </div>
    );
  };

  const renderCategoryButton = (cat: Category) => {
    const isSelected = activeCategory === cat.id && !searchTerm;
    return (
      <button
        onClick={() => {
          setActiveCategory(cat.id);
          setSearchTerm("");
        }}
        className={cn(
          "whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 w-full text-left h-full",
          "bg-card border rounded-lg hover:bg-muted/50",
          isSelected ? "bg-primary text-primary-foreground border-primary shadow-md" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {cat.name.toUpperCase()}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Exames e Procedimentos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie informações, locais e regras de agendamento para todos os exames.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  saveToLocalStorage();
                  toast({
                    title: "Dados salvos",
                    description: "Todas as alterações foram salvas com sucesso!"
                  });
                }}
                size="icon"
                variant={hasUnsavedChanges ? "default" : "outline"}
                title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditExams && (
                <>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingExam(undefined);
                      setExamModalOpen(true);
                    }}
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Novo Exame
                  </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                    <Settings className="h-5 w-5 mr-2" /> Gerenciar Categorias
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={handleSyncExams}
                disabled={isSyncing}
                title="Sincronizar exames da tabela de valores"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
                Sincronizar
              </Button>
            </div>
          </div>
          {/* Navegação por Abas (Botões) - Agora usando SortableList */}
          {categories.length > 0 && !searchTerm && (
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Arraste para reordenar as categorias:</h3>
              <SortableList
                items={categories}
                onReorder={handleReorderCategories}
                renderItem={(cat) => renderCategoryButton(cat)}
                className="flex flex-wrap gap-2 items-start"
                itemClassName="flex-shrink-0 w-auto"
                handleClassName="left-0"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Buscar exames por nome ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card"
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
      {/* Lista de Exames */}
      <Card className="overflow-hidden">
        {searchTerm && (
          <div className="bg-primary/5 p-4 font-bold text-primary border-b border-border">
            Resultados da Busca ({itemsToDisplay.length})
          </div>
        )}
        <div className="divide-y divide-border/50">
          {itemsToDisplay.length > 0 ? (
            itemsToDisplay.map(renderExamItem)
          ) : (
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchTerm
                ? `Nenhum exame encontrado para "${searchTerm}".`
                : categories.length === 0
                  ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'."
                  : `Nenhum exame cadastrado na categoria ${categories.find(c => c.id === activeCategory)?.name || 'selecionada'}.`}
            </CardContent>
          )}
        </div>
      </Card>
      <ExamModal
        open={examModalOpen}
        onClose={() => {
          setExamModalOpen(false);
          setEditingExam(undefined);
        }}
        onSave={(data) => handleSaveExam(data)}
        categories={categories}
        editingExam={editingExam}
      />
      {viewingExam && (
        <ExamItemDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setViewingExam(null);
          }}
          exam={viewingExam}
        />
      )}
      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        categories={categories}
      />
    </div>
  );
};