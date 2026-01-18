import { useState, useEffect, useMemo } from "react";
import { Plus, Settings, Edit, Trash2, Eye, Save, X, Info, Clock, Download, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoTag, InfoItem } from "@/types/data";
import { InfoTagModal } from "@/components/modals/InfoTagModal";
import { InfoItemModal } from "@/components/modals/InfoItemModal";
import { InfoDetailsModal } from "@/components/modals/InfoDetailsModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { InfoItemFormData } from "@/schemas/infoSchema";
import { getCategoryBadgeClasses } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { SortableList, SortableItem } from "@/components/SortableList";
import { useLocation } from "react-router-dom";
import { InfoItemCard } from "./InfoItemCard"; // Importando o novo componente

interface AnotacoesContentProps {
  tags: InfoTag[];
  data: Record<string, InfoItem[]>;
  title?: string;
  description?: string;
  // Funções de CRUD injetáveis para reutilização
  onAddTag?: (tag: Omit<InfoTag, "id">) => void;
  onUpdateTag?: (tag: InfoTag) => void;
  onDeleteTag?: (tagId: string) => void;
  onAddItem?: (item: Omit<InfoItem, "id" | "date">) => void;
  onUpdateItem?: (item: InfoItem) => void;
  onDeleteItem?: (itemId: string, tagId: string) => void;
}

export const AnotacoesContent = ({
  tags,
  data,
  title = "Anotações e Regras",
  description = "Base de conhecimento para regras, procedimentos e informações importantes.",
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: AnotacoesContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const isEstomaterapia = title.includes("Estomaterapia");
  const canEditAnotacoes = canEdit(isEstomaterapia ? 'estomaterapia' : 'anotacoes');
  const [activeTagId, setActiveTagId] = useState(tags[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfoItem | undefined>();
  const [editingTag, setEditingTag] = useState<InfoTag | undefined>();
  const [viewingItem, setViewingItem] = useState<{ item: InfoItem, tag: InfoTag | undefined } | null>(null);
  
  // Usa as funções injetadas ou as funções padrão do useData
  const dataContext = useData();
  const addTag = onAddTag || dataContext.addInfoTag;
  const updateTag = onUpdateTag || dataContext.updateInfoTag;
  const deleteTag = onDeleteTag || dataContext.deleteInfoTag;
  const addItem = onAddItem || dataContext.addInfoItem;
  const updateItem = onUpdateItem || dataContext.updateInfoItem;
  const deleteItem = onDeleteItem || dataContext.deleteInfoItem;
  
  // Funções de reordenação específicas
  const reorderTags = isEstomaterapia 
    ? dataContext.reorderEstomaterapiaTags 
    : dataContext.reorderInfoTags;
    
  const { hasUnsavedChanges, saveToLocalStorage } = dataContext;
  const { toast } = useToast();

  // Check for search result in location state
  useEffect(() => {
    const searchType = isEstomaterapia ? 'estomaterapia' : 'info';
    
    if (location.state?.searchResult?.type === searchType) {
      const tagId = location.state.searchResult.tagId;
      const itemId = location.state.searchResult.itemId;
      
      // Set the correct tag
      if (tagId) {
        setActiveTagId(tagId);
      }
      
      // Find and view the specific item
      const tagItems = data[tagId] || [];
      const item = tagItems.find(i => i.id === itemId);
      const tag = tags.find(t => t.id === tagId);
      
      if (item && tag) {
        setViewingItem({ item, tag });
        setDetailsModalOpen(true);
        
        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, data, tags, isEstomaterapia]);

  // Tags são usadas diretamente do prop, que é o estado do DataContext
  const sortedTags = useMemo(() => [...tags], [tags]);

  // Update activeTagId when tags change
  useEffect(() => {
    if (sortedTags.length > 0 && (!activeTagId || !sortedTags.find(tag => tag.id === activeTagId))) {
      setActiveTagId(sortedTags[0].id);
    }
  }, [sortedTags, activeTagId]);

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);

  // Consolida todos os itens para a busca
  // Estrutura: { item: InfoItem, tag: InfoTag | undefined }
  const allItems: (InfoItem & { tag: InfoTag | undefined })[] = sortedTags.flatMap(tag => 
    (data[tag.id] || []).map(item => ({ item, tag }))
  );

  const filteredItems = allItems
    .filter((entry) =>
      entry.item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tag?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.item.title.localeCompare(b.item.title, 'pt-BR'));

  // Itens a serem exibidos (filtrados se houver busca, ou apenas da categoria ativa)
  const itemsToDisplay = searchTerm
    ? filteredItems
    : (data[activeTagId] || []).map(item => ({ item, tag: getTagById(item.tagId) }))
      .sort((a, b) => a.item.title.localeCompare(b.item.title, 'pt-BR'));

  // --- Item Handlers ---
  const handleSaveItem = (formData: InfoItemFormData & { id?: string, info?: string }) => {
    // Verificação adicional de campos obrigatórios antes de salvar
    if (!formData.title?.trim()) {
      toast({
        title: "Erro de validação",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.content?.trim()) {
      toast({
        title: "Erro de validação",
        description: "O conteúdo é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.tagId) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma etiqueta.",
        variant: "destructive",
      });
      return;
    }

    const itemData: Omit<InfoItem, "id" | "date"> = {
      title: formData.title,
      content: formData.content,
      tagId: formData.tagId,
      attachments: formData.attachments || [],
      info: formData.info || "", // Adicionando o campo info (Informações Adicionais)
    };

    if (formData.id) {
      const currentItem = allItems.find(i => i.item.id === formData.id)?.item;
      if (currentItem && currentItem.tagId !== formData.tagId) {
        deleteItem(currentItem.id, currentItem.tagId);
        addItem(itemData);
      } else {
        updateItem({ ...currentItem!, ...itemData, id: formData.id });
      }
    } else {
      addItem(itemData);
    }
    setEditingItem(undefined);
    setItemModalOpen(false);
    toast({
      title: "Sucesso!",
      description: formData.id ? "Informação atualizada com sucesso." : "Informação adicionada com sucesso.",
    });
  };

  const handleEditItem = (item: InfoItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleDeleteItem = (itemId: string, tagId: string) => {
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
      deleteItem(itemId, tagId);
      toast({
        title: "Sucesso!",
        description: "Anotação excluída com sucesso.",
      });
    }
  };

  const handleViewDetails = (item: InfoItem, tag: InfoTag | undefined) => {
    setViewingItem({ item, tag });
    setDetailsModalOpen(true);
  };

  // --- Tag Handlers ---
  const handleSaveTag = (formData: Omit<InfoTag, "id"> | InfoTag) => {
    try {
      if ('id' in formData) {
        // Atualizando tag existente
        updateTag(formData as InfoTag);
        toast({
          title: "Sucesso!",
          description: "Etiqueta atualizada com sucesso.",
        });
      } else {
        // Adicionando nova tag
        addTag(formData as Omit<InfoTag, "id">);
        toast({
          title: "Sucesso!",
          description: "Etiqueta criada com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a etiqueta.",
        variant: "destructive",
      });
    } finally {
      // Sempre limpa o estado de edição e fecha o modal
      setEditingTag(undefined);
      setTagModalOpen(false);
    }
  };

  const handleEditTag = (tag: InfoTag) => {
    setEditingTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = (tagId: string) => {
    if (confirm("Tem certeza que deseja excluir esta etiqueta? Todos os itens associados serão perdidos.")) {
      deleteTag(tagId);
      toast({
        title: "Sucesso!",
        description: "Etiqueta excluída com sucesso.",
      });
    }
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    reorderTags(oldIndex, newIndex);
    // Atualiza a categoria ativa para a nova posição, se necessário
    const newActiveTag = tags[newIndex]?.id;
    if (newActiveTag) {
      setActiveTagId(newActiveTag);
    }
  };

  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setEditingItem(undefined);
  };

  const handleCloseTagModal = () => {
    setTagModalOpen(false);
    setEditingTag(undefined);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setViewingItem(null);
  };

  const renderTagButton = (tag: InfoTag) => {
    const isSelected = activeTagId === tag.id && !searchTerm;
    const tagClasses = getCategoryBadgeClasses(tag.color);
    const tagColorText = tagClasses.split(' ').find(c => c.startsWith('text-')) || 'text-foreground';

    return (
      <button
        onClick={() => {
          setActiveTagId(tag.id);
          setSearchTerm(""); // Limpa a busca ao mudar de aba
        }}
        className={cn(
          "whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 w-full text-left h-full",
          "bg-card border rounded-lg hover:bg-muted/50",
          isSelected ? "bg-primary text-primary-foreground border-primary shadow-md" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {tag.name.toUpperCase()}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
              <p className="text-muted-foreground mt-1">
                {description}
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
              {canEditAnotacoes && (
                <>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setEditingItem(undefined);
                      setItemModalOpen(true);
                    }}
                    disabled={tags.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Nova Anotação
                  </Button>
                  <Button variant="outline" onClick={() => setTagModalOpen(true)}>
                    <Settings className="h-5 w-5 mr-2" /> Gerenciar Etiquetas
                  </Button>
                </>
              )}
            </div>
          </div>
          {tags.length > 0 && !searchTerm && (
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Arraste para reordenar as etiquetas:</h3>
              <SortableList
                items={tags}
                onReorder={handleReorderCategories}
                renderItem={(tag) => renderTagButton(tag)}
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
            placeholder="Buscar anotações por título ou conteúdo..."
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
      {/* Lista de Anotações (Novo Layout de Grid) */}
      <Card className="overflow-hidden">
        {searchTerm && (
          <div className="bg-primary/5 p-4 font-bold text-primary border-b border-border">
            Resultados da Busca ({itemsToDisplay.length})
          </div>
        )}
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {itemsToDisplay.length > 0 ? (
              itemsToDisplay.map(({ item, tag }) => (
                <InfoItemCard
                  key={item.id}
                  item={item}
                  tag={tag}
                  canEdit={canEditAnotacoes}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                <p>
                  {searchTerm
                    ? "Nenhuma anotação encontrada."
                    : tags.length === 0
                    ? "Crie uma etiqueta primeiro usando 'Gerenciar Etiquetas'."
                    : `Nenhuma anotação cadastrada na etiqueta ${sortedTags.find(t => t.id === activeTagId)?.name || 'selecionada'}.`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <InfoItemModal
        open={itemModalOpen}
        onClose={handleCloseItemModal}
        onSave={handleSaveItem}
        tags={tags}
        editingItem={editingItem}
      />
      <InfoTagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        onSave={handleSaveTag}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        tags={tags}
        editingTag={editingTag}
      />
      {viewingItem && (
        <InfoDetailsModal
          isOpen={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          item={viewingItem.item}
          tag={viewingItem.tag}
        />
      )}
    </div>
  );
};