import { useState, useEffect, useMemo } from "react";
import { Plus, Settings, Edit, Trash2, Copy, Save, X, MessageCircle, Eye, Users, FileText, Folder, Zap, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RecadoCategory, RecadoItem } from "@/types/data";
import { RecadoCategoryModal } from "@/components/modals/RecadoCategoryModal";
import { RecadoItemModal } from "@/components/modals/RecadoItemModal";
import { RecadoGeneratorModal } from "@/components/modals/RecadoGeneratorModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { RecadoCategoryFormData, RecadoItemFormData } from "@/schemas/recadoSchema";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SortableList, SortableItem } from "@/components/SortableList";
import { useLocation } from "react-router-dom";

interface RecadosContentProps {
  categories: RecadoCategory[];
  data: Record<string, RecadoItem[]>;
}

// Mapeamento de ícones para categorias (apenas para dar um toque visual)
const getCategoryIcon = (categoryTitle: string) => {
  const lowerTitle = categoryTitle.toLowerCase();
  if (lowerTitle.includes('autorização') || lowerTitle.includes('guia')) return ClipboardList;
  if (lowerTitle.includes('imagem') || lowerTitle.includes('exame')) return Zap;
  return Folder;
};

export const RecadosContent = ({ categories, data }: RecadosContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditRecados = canEdit('recados');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(RecadoItem & { categoryId: string }) | undefined>();
  const [editingCategory, setEditingCategory] = useState<RecadoCategory | undefined>();
  const [selectedItem, setSelectedItem] = useState<{ item: RecadoItem, category: RecadoCategory } | null>(null);
  const { recadoCategories, addRecadoCategory, updateRecadoCategory, deleteRecadoCategory, reorderRecadoCategories, addRecadoItem, updateRecadoItem, deleteRecadoItem, hasUnsavedChanges, saveToLocalStorage } = useData();
  const { toast } = useToast();

  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'recado') {
      const categoryId = location.state.searchResult.categoryId;
      const itemId = location.state.searchResult.itemId;

      // Set the correct category
      if (categoryId) {
        setActiveCategory(categoryId);
      }

      // Find and generate the specific recado
      const categoryItems = data[categoryId] || [];
      const item = categoryItems.find(i => i.id === itemId);
      const category = categories.find(c => c.id === categoryId);

      if (item && category) {
        setSelectedItem({ item, category });
        setGeneratorModalOpen(true);

        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, data, categories]);

  // Ordena as categorias por título alfabeticamente
  const sortedCategories = useMemo(() =>
    [...categories].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
    [categories]
  );

  // Update activeCategory when categories change
  useEffect(() => {
    if (sortedCategories.length > 0 && (!activeCategory || !sortedCategories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(sortedCategories[0].id);
    }
  }, [sortedCategories, activeCategory]);

  // Consolida todos os itens para a busca
  const allItems: (RecadoItem & { categoryId: string, category: RecadoCategory })[] = sortedCategories.flatMap(cat => (data[cat.id] || []).map(item => ({ ...item, categoryId: cat.id, category: cat })));
  const filteredItems = allItems
    .filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const attendantMatch = item.category.attendants?.some(at =>
        at.name.toLowerCase().includes(searchLower) ||
        at.chatNick.toLowerCase().includes(searchLower)
      );

      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.category.title.toLowerCase().includes(searchLower) ||
        attendantMatch
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  // Itens a serem exibidos (filtrados se houver busca, ou apenas da categoria ativa)
  const itemsToDisplay = searchTerm
    ? filteredItems
    : (data[activeCategory] || []).map(item => ({ ...item, categoryId: activeCategory, category: sortedCategories.find(c => c.id === activeCategory)! }))
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));

  // --- Category Handlers ---
  const handleSaveCategory = (formData: Omit<RecadoCategory, "id"> | RecadoCategory) => {
    if ('id' in formData) {
      updateRecadoCategory(formData);
      toast({ title: "Sucesso!", description: "Categoria atualizada com sucesso." });
    } else {
      addRecadoCategory(formData);
      toast({ title: "Sucesso!", description: "Categoria criada com sucesso." });
    }
    setEditingCategory(undefined);
  };

  const handleEditCategory = (category: RecadoCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria e todos os recados associados?")) {
      deleteRecadoCategory(categoryId);
      toast({ title: "Sucesso!", description: "Categoria excluída." });
    }
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    // Reordenação manual desativada em favor da ordem alfabética automática
    // reorderRecadoCategories(oldIndex, newIndex);
  };

  // --- Item Handlers ---
  const handleSaveItem = (formData: RecadoItemFormData) => {
    if (editingItem) {
      // Se mudou de categoria, precisa remover da antiga e adicionar na nova
      if (editingItem.categoryId !== formData.categoryId) {
        deleteRecadoItem(editingItem.categoryId, editingItem.id);
        addRecadoItem(formData.categoryId, {
          title: formData.title,
          content: formData.content,
          fields: formData.fields,
        });
      } else {
        // Mesma categoria, apenas atualiza
        updateRecadoItem(formData.categoryId, editingItem.id, {
          title: formData.title,
          content: formData.content,
          fields: formData.fields,
        });
      }
    } else {
      addRecadoItem(formData.categoryId, {
        title: formData.title,
        content: formData.content,
        fields: formData.fields,
      });
    }
    setEditingItem(undefined);
    setItemModalOpen(false);
  };

  const handleEditItem = (item: RecadoItem, categoryId: string) => {
    setEditingItem({ ...item, categoryId });
    setItemModalOpen(true);
  };

  const handleDeleteItem = (itemId: string, categoryId: string) => {
    if (confirm("Tem certeza que deseja excluir este item de recado?")) {
      deleteRecadoItem(categoryId, itemId);
      toast({ title: "Sucesso!", description: "Item excluído com sucesso." });
    }
  };

  const handleGenerateRecado = (item: RecadoItem, category: RecadoCategory) => {
    setSelectedItem({ item, category });
    setGeneratorModalOpen(true);
  };

  // Função para editar a categoria a partir do modal de geração
  const handleEditCategoryFromGenerator = (category: RecadoCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const renderRecadoItem = (item: RecadoItem & { categoryId: string, category: RecadoCategory }) => {
    // Icon removido

    return (
      <Card
        key={item.id}
        // Removendo min-h para compactar o card
        className="relative overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-300 border-2 border-border/50 hover:shadow-xl hover:border-primary/50"
        onClick={() => handleGenerateRecado(item, item.category)}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header Section - Título simplificado (igual ao script) */}
          <div className="p-3 flex-shrink-0 flex items-center justify-between min-h-[56px] bg-primary/5 border-b border-border/50">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors flex items-center gap-2">
              <span>{item.title}</span>
            </h3>
          </div>

          {/* Atendentes / Destino - DISCRETO E ELEGANTE */}
          <div className="px-3 py-2 flex flex-col gap-1.5 flex-1 min-h-[40px]">
            {item.category.destinationType === 'attendant' && item.category.attendants && item.category.attendants.length > 0 ? (
              <div className="flex flex-wrap gap-1 items-center">
                <Users className="h-3 w-3 text-muted-foreground mr-1" />
                {item.category.attendants.map((at) => (
                  <Badge key={at.id} variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-primary/5 text-primary/80 border-primary/20 font-medium">
                    {at.name}
                  </Badge>
                ))}
              </div>
            ) : item.category.destinationType === 'group' && item.category.groupName ? (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-muted-foreground mr-1" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {item.category.groupName}
                </span>
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground italic px-0.5">
                Sem destinatários
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-3 py-2 bg-muted/20 border-t flex justify-end items-center gap-2 mt-auto flex-shrink-0">
            {canEditRecados && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditItem(item, item.categoryId);
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
                    handleDeleteItem(item.id, item.categoryId);
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
                handleGenerateRecado(item, item.category);
              }}
              className="h-7 px-2 text-xs bg-primary hover:bg-primary/90 text-white"
              title="Gerar Recado"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Gerar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCategoryButton = (cat: RecadoCategory) => {
    const isSelected = activeCategory === cat.id && !searchTerm;
    return (
      <div className="relative group/cat">
        <button
          onClick={() => {
            setActiveCategory(cat.id);
            setSearchTerm("");
          }}
          className={cn(
            "whitespace-nowrap py-3 px-4 pr-10 rounded-lg font-medium text-sm transition-all duration-200 w-full text-left h-full border-2",
            isSelected
              ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
              : "bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:bg-muted/30"
          )}
        >
          {cat.title.toUpperCase()}
        </button>
        {canEditRecados && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditCategory(cat);
            }}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200",
              isSelected
                ? "text-primary-foreground/80 hover:text-white hover:bg-white/20"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover/cat:opacity-100"
            )}
            title="Editar Categoria"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Recados Rápidos</h1>
              <p className="text-muted-foreground mt-1">
                Selecione um tema para gerar um recado pré-formatado
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
              {canEditRecados && (
                <>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingItem(undefined);
                      setItemModalOpen(true);
                    }}
                    disabled={sortedCategories.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Novo Recado
                  </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                    <Settings className="h-5 w-5 mr-2" /> Gerenciar Categorias
                  </Button>
                </>
              )}
            </div>
          </div>
          {sortedCategories.length > 0 && !searchTerm && (
            <div className="border-t border-border/50 pt-4 mt-2">
              <div className="flex flex-wrap gap-3 items-start">
                {sortedCategories.map(cat => (
                  <div key={cat.id} className="flex-shrink-0">
                    {renderCategoryButton(cat)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Input
            type="text"
            placeholder="Buscar recados por título ou categoria..."
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
      {/* Lista de Recados (Novo Layout de Grid) */}
      <Card className="overflow-hidden">
        {searchTerm && (
          <div className="bg-primary/5 p-4 font-bold text-primary border-b border-border">
            Resultados da Busca ({itemsToDisplay.length})
          </div>
        )}
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
            {itemsToDisplay.length > 0 ? (
              itemsToDisplay.map(renderRecadoItem)
            ) : (
              <div className="col-span-full text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                <p>
                  {searchTerm
                    ? "Nenhum recado encontrado."
                    : sortedCategories.length === 0
                      ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'."
                      : "Nenhum recado nesta categoria. Clique em 'Novo Recado' para adicionar."
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <RecadoItemModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        categories={recadoCategories}
        editingItem={editingItem}
      />
      <RecadoCategoryModal
        isOpen={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        categories={recadoCategories}
        category={editingCategory}
      />
      {selectedItem && (
        <RecadoGeneratorModal
          isOpen={generatorModalOpen}
          onClose={() => setGeneratorModalOpen(false)}
          item={selectedItem.item}
          category={selectedItem.category}
          onEditCategory={handleEditCategoryFromGenerator}
        />
      )}
    </div>
  );
};