import { useState, useEffect } from "react";
import { Plus, Settings, Edit, Trash2, Copy, Eye, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, ScriptItem } from "@/types/data";
import { ScriptModal } from "@/components/modals/ScriptModal";
import { ScriptDetailsModal } from "@/components/modals/ScriptDetailsModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ScriptFormData, CategoryFormData } from "@/schemas/scriptSchema";
import { replaceUserNamePlaceholders } from "@/lib/textReplacer";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { SortableList, SortableItem } from "@/components/SortableList";
import { useLocation } from "react-router-dom";

interface ScriptsContentProps {
  viewType: string;
  categories: Category[];
  data: Record<string, ScriptItem[]>;
}

// Função de ordenação: prioriza 'order' numérico, depois alfabético
const sortScripts = (a: ScriptItem, b: ScriptItem): number => {
  const orderA = a.order ?? Infinity;
  const orderB = b.order ?? Infinity;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.title.localeCompare(b.title, 'pt-BR');
};

export const ScriptsContent = ({ viewType, categories, data }: ScriptsContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditScripts = canEdit('scripts');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<(ScriptItem & { categoryId: string }) | undefined>();
  const [viewingScript, setViewingScript] = useState<ScriptItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { addScript, updateScript, deleteScript, addScriptCategory, updateScriptCategory, deleteScriptCategory, reorderScriptCategories, hasUnsavedChanges, saveToLocalStorage, userName } = useData();
  const { toast } = useToast();

  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'script' &&
      location.state?.searchResult?.viewType === viewType) {
      const categoryId = location.state.searchResult.categoryId;
      const itemId = location.state.searchResult.itemId;

      // Set the correct category
      if (categoryId) {
        setActiveCategory(categoryId);
      }

      // Find and view the specific script
      const categoryScripts = data[categoryId] || [];
      const script = categoryScripts.find(s => s.id === itemId);
      if (script) {
        setViewingScript(script);
        setDetailsModalOpen(true);

        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, viewType, data]);

  // Update activeCategory when viewType or categories change
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(categories[0].id);
    }
  }, [viewType, categories, activeCategory]);

  const items = data[activeCategory] || [];
  const filteredItems = items
    .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(sortScripts);

  const handleSaveScript = (formData: ScriptFormData) => {
    const scriptData: ScriptItem = {
      id: editingScript?.id || crypto.randomUUID(),
      title: formData.title,
      content: formData.content,
      order: formData.order || undefined,
    };

    if (editingScript) {
      // Se mudou de categoria, precisa remover da antiga e adicionar na nova
      if (editingScript.categoryId !== formData.categoryId) {
        deleteScript(viewType, editingScript.categoryId, editingScript.id);
        addScript(viewType, formData.categoryId, scriptData);
      } else {
        // Mesma categoria, apenas atualiza
        updateScript(viewType, formData.categoryId, editingScript.id, scriptData);
      }
    } else {
      addScript(viewType, formData.categoryId, scriptData);
    }
    setEditingScript(undefined);
  };

  const handleEditScript = (script: ScriptItem) => {
    setEditingScript({ ...script, categoryId: activeCategory });
    setScriptModalOpen(true);
  };

  const handleDeleteScript = (scriptId: string) => {
    if (confirm("Tem certeza que deseja excluir este script?")) {
      deleteScript(viewType, activeCategory, scriptId);
      toast({
        title: "Sucesso!",
        description: "Script excluído com sucesso.",
      });
    }
  };

  const handleCopyScript = (content: string) => {
    const processedContent = replaceUserNamePlaceholders(content, userName);
    navigator.clipboard.writeText(processedContent);
    toast({
      title: "Copiado!",
      description: "Script copiado.",
      variant: "compact",
      duration: 1000,
    });
  };

  const handleViewScript = (script: ScriptItem) => {
    setViewingScript(script);
    setDetailsModalOpen(true);
  };

  const handleAddCategory = (formData: CategoryFormData) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: formData.name,
      color: formData.color,
    };
    addScriptCategory(viewType, newCategory);
    if (categories.length === 0) {
      setActiveCategory(newCategory.id);
    }
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => {
    updateScriptCategory(viewType, categoryId, updates);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteScriptCategory(viewType, categoryId);
    if (activeCategory === categoryId && categories.length > 1) {
      const remainingCategories = categories.filter(cat => cat.id !== categoryId);
      if (remainingCategories.length > 0) {
        setActiveCategory(remainingCategories[0].id);
      }
    }
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    reorderScriptCategories(viewType, oldIndex, newIndex);
    // Atualiza a categoria ativa para a nova posição, se necessário
    const newActiveCategory = categories[newIndex]?.id;
    if (newActiveCategory) {
      setActiveCategory(newActiveCategory);
    }
  };

  const renderCategoryButton = (cat: Category) => {
    const isSelected = activeCategory === cat.id && !searchTerm;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
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

  const activeCategoryInfo = categories.find(cat => cat.id === activeCategory);
  const categoryClasses = activeCategoryInfo ? getCategoryBadgeClasses(activeCategoryInfo.color) : 'bg-muted text-muted-foreground';
  const categoryColorText = categoryClasses.split(' ').find(c => c.startsWith('text-')) || 'text-foreground';
  const categoryColorBg = categoryClasses.split(' ').find(c => c.startsWith('bg-')) || 'bg-muted/20';

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">{viewType} - Scripts</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie scripts de atendimento para {viewType}
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
              {canEditScripts && (
                <>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingScript(undefined);
                      setScriptModalOpen(true);
                    }}
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Novo Script
                  </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                    <Settings className="h-5 w-5 mr-2" /> Gerenciar Categorias
                  </Button>
                </>
              )}
            </div>
          </div>
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
          <Input
            type="text"
            placeholder="Buscar scripts..."
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
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "relative overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-300 border-2 border-border/50 hover:shadow-xl hover:border-primary/50",
                  viewingScript?.id === item.id && "ring-2 ring-primary/50 bg-primary/5" // Highlight searched item
                )}
                onClick={() => handleCopyScript(item.content)}
              >
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Header Section - Título simplificado */}
                  <div className={cn("p-3 flex-shrink-0 flex items-center justify-between min-h-[56px]", categoryColorBg)}>
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {/* Apenas o Título */}
                      <span>{item.title}</span>
                    </h3>
                  </div>
                  {/* Footer Actions */}
                  <div className="px-3 py-2 bg-muted/20 border-t flex justify-between items-center gap-2 mt-auto flex-shrink-0">
                    {/* Badge de Ordem no lado esquerdo do rodapé */}
                    {item.order !== undefined && item.order !== null ? (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 p-0",
                          categoryColorText.replace('text-', 'bg-').replace('-800', '-100'),
                          categoryColorText,
                          "border-2 border-current"
                        )}
                      >
                        {item.order}
                      </Badge>
                    ) : (
                      <div className="w-6 h-6"></div>
                    )}
                    <div className="flex items-center gap-1">
                      {canEditScripts && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditScript(item);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScript(item.id);
                            }}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewScript(item);
                        }}
                        className="h-7 px-2 text-xs bg-primary hover:bg-primary/90 text-white"
                        title="Ver Completo"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              <p>
                {searchTerm
                  ? "Nenhum script encontrado."
                  : categories.length === 0
                    ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'."
                    : "Nenhum script nesta categoria. Clique em 'Novo Script' para adicionar."}
              </p>
            </div>
          )}
        </div>
      </div>
      <ScriptModal
        open={scriptModalOpen}
        onClose={() => {
          setScriptModalOpen(false);
          setEditingScript(undefined);
        }}
        onSave={handleSaveScript}
        categories={categories}
        editingScript={editingScript}
      />
      {viewingScript && (
        <ScriptDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setViewingScript(null);
          }}
          script={viewingScript}
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