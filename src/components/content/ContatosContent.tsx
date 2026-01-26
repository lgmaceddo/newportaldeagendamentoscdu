import { useState, useMemo, useEffect } from "react";
import { Plus, Phone, Smartphone, Copy, Edit, Trash2, Save, X, Users, Search, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ContactGroup, ContactPoint, Category } from "@/types/data";
import { ContactGroupModal } from "@/components/modals/ContactGroupModal";
import { ContactPointModal } from "@/components/modals/ContactPointModal";
import { CategoryModal } from "@/components/modals/CategoryModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { ContactGroupFormData, ContactPointFormData, CategoryFormData } from "@/schemas/contactSchema";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ContactPointCard } from "./ContactPointCard";
import { ContactClusterCard } from "./ContactClusterCard";
import { SortableList } from "@/components/SortableList";
import { useLocation } from "react-router-dom";

interface ContatosContentProps {
  viewType: string;
  categories: Category[];
  data: Record<string, ContactGroup[]>;
}

// ID fixo da categoria GERAL
const GENERAL_CATEGORY_ID = "cont-cat-geral";

export const ContatosContent = ({ viewType, categories, data }: ContatosContentProps) => {
  // ... (mesmo código até linha 290) ...
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditContatos = canEdit('contatos');
  /* Ordenação Natural (baseada na ordem do array data/db), permitindo reordenação manual */
  const sortedCategories = categories;
  const [activeCategory, setActiveCategory] = useState(sortedCategories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | undefined>();
  const [editingPoint, setEditingPoint] = useState<ContactPoint | undefined>();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { addContactCategory, updateContactCategory, deleteContactCategory, reorderContactCategories, addContactGroup, updateContactGroup, deleteContactGroup, addContactPoint, updateContactPoint, deleteContactPoint, hasUnsavedChanges, saveToLocalStorage } = useData();
  const { toast } = useToast();

  // Helper para renderizar a lista de pontos agrupada
  const renderPointsList = (points: ContactPoint[], groupId: string) => {
    // 1. Agrupar por setor (nome)
    const grouped = points.reduce((acc, point) => {
      const key = (point.setor || "Sem Nome").trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(point);
      return acc;
    }, {} as Record<string, ContactPoint[]>);

    // 2. Ordenar chaves
    const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    // 3. Renderizar
    return (
      <div className="space-y-3">
        {sortedKeys.map(sector => {
          const cluster = grouped[sector];
          // Se houver mais de um ponto com mesmo nome, usa o ClusterCard
          if (cluster.length > 1) {
            return (
              <ContactClusterCard
                key={`cluster-${sector}`}
                points={cluster}
                onEdit={(p) => handleEditPoint(p, groupId)}
                onDelete={(pId) => handleDeletePoint(pId, groupId)}
                canEdit={canEditContatos}
              />
            );
          } else {
            // Se for único, usa o PointCard normal
            return (
              <ContactPointCard
                key={cluster[0].id}
                point={cluster[0]}
                onEdit={(p) => handleEditPoint(p, groupId)}
                onDelete={(pId) => handleDeletePoint(pId, groupId)}
                canEdit={canEditContatos}
              />
            );
          }
        })}
      </div>
    );
  };

  // ... (Hooks de busca - searchResults, filteredGroups - mantidos iguais) ...
  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'contactGroup' || location.state?.searchResult?.type === 'contactPoint') {
      const categoryId = location.state.searchResult.categoryId;
      const groupId = location.state.searchResult.groupId;
      if (categoryId) setActiveCategory(categoryId);
      if (groupId) {
        setOpenGroups(prev => new Set(prev).add(groupId));
        setActiveGroupId(groupId);
      }
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (sortedCategories.length > 0 && (!activeCategory || !sortedCategories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(sortedCategories[0].id);
    }
  }, [sortedCategories, activeCategory]);

  const allGroupsAndPoints = useMemo(() => {
    const allEntries: Array<{
      type: 'group' | 'point';
      item: ContactGroup | ContactPoint;
      groupId: string;
      groupName?: string;
      categoryId: string;
      search: string;
    }> = [];
    Object.entries(data).forEach(([categoryId, categoryGroups]) => {
      if (Array.isArray(categoryGroups)) {
        categoryGroups.forEach(group => {
          allEntries.push({ type: 'group', item: group, groupId: group.id, categoryId, search: (group.name || "").toLowerCase() });
          if (Array.isArray(group.points)) {
            group.points.forEach(point => {
              allEntries.push({ type: 'point', item: point, groupId: group.id, groupName: group.name, categoryId, search: `${point.setor || ""} ${point.local || ""} ${point.ramal || ""} ${point.telefone || ""} ${point.whatsapp || ""} ${point.description || ""}`.toLowerCase() });
            });
          }
        });
      }
    });
    return allEntries;
  }, [data]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchingEntries = allGroupsAndPoints.filter(entry => entry.search.includes(lowerSearchTerm));
    const resultsByCategory: Record<string, Array<{ type: 'group' | 'point', item: ContactGroup | ContactPoint, groupId: string, groupName?: string }>> = {};
    matchingEntries.forEach(entry => {
      if (!resultsByCategory[entry.categoryId]) resultsByCategory[entry.categoryId] = [];
      resultsByCategory[entry.categoryId].push({ type: entry.type, item: entry.item, groupId: entry.groupId, groupName: entry.groupName });
    });
    return resultsByCategory;
  }, [searchTerm, allGroupsAndPoints]);

  const filteredGroups = useMemo(() => {
    if (searchResults) {
      const categoryResults = searchResults[activeCategory] || [];
      const groupIds = new Set(categoryResults.map(r => r.groupId));
      const groupsInCategory = data[activeCategory] || [];
      return groupsInCategory.filter(group => groupIds.has(group.id));
    }
    const groups = data[activeCategory] || [];
    return [...groups].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [searchResults, activeCategory, data]);

  // ... (Handlers - add/update/delete - mantidos iguais) ...
  const handleAddCategory = (formData: CategoryFormData) => {
    const newCategory: Category = { id: crypto.randomUUID(), name: formData.name, color: formData.color };
    addContactCategory(viewType, newCategory);
    if (categories.length === 0) setActiveCategory(newCategory.id);
  };
  const handleUpdateCategory = (categoryId: string, updates: Partial<Category>) => { updateContactCategory(viewType, categoryId, updates); };
  const handleDeleteCategory = (categoryId: string) => {
    deleteContactCategory(viewType, categoryId);
    if (activeCategory === categoryId && categories.length > 1) {
      const remainingCategories = categories.filter(cat => cat.id !== categoryId);
      if (remainingCategories.length > 0) setActiveCategory(remainingCategories[0].id);
    }
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    reorderContactCategories(viewType, oldIndex, newIndex);
    // Atualiza a categoria ativa para a nova posição, se necessário
    const newActiveCategory = categories[newIndex]?.id;
    if (newActiveCategory) {
      setActiveCategory(newActiveCategory);
    }
  };
  const handleSaveGroup = (formData: ContactGroupFormData & { id?: string }) => {
    const groupData: Omit<ContactGroup, 'id' | 'points'> = { name: formData.name };
    if (formData.id) updateContactGroup(viewType, activeCategory, formData.id, groupData);
    else addContactGroup(viewType, activeCategory, groupData);
    setEditingGroup(undefined);
    setGroupModalOpen(false);
  };
  const handleEditGroup = (group: ContactGroup) => { setEditingGroup(group); setGroupModalOpen(true); };
  const handleDeleteGroup = (groupId: string) => {
    if (confirm("Tem certeza que deseja excluir este grupo e todos os pontos de contato associados?")) {
      deleteContactGroup(viewType, activeCategory, groupId);
      toast({ title: "Sucesso!", description: "Grupo de contato excluído com sucesso." });
    }
  };
  const handleAddPoint = (groupId: string) => { setActiveGroupId(groupId); setEditingPoint(undefined); setPointModalOpen(true); };
  const handleSavePoint = (formData: ContactPointFormData & { id?: string }) => {
    const pointData: Omit<ContactPoint, 'id'> = { setor: formData.setor, local: formData.local || "", ramal: formData.ramal || "", telefone: formData.telefone || "", whatsapp: formData.whatsapp || "", description: formData.description || "" };
    if (!activeGroupId) return;
    if (formData.id) updateContactPoint(viewType, activeCategory, activeGroupId, formData.id, pointData);
    else addContactPoint(viewType, activeCategory, activeGroupId, pointData);
    setEditingPoint(undefined);
    setPointModalOpen(false);
    setActiveGroupId(null);
  };
  const handleEditPoint = (point: ContactPoint, groupId: string) => { setActiveGroupId(groupId); setEditingPoint(point); setPointModalOpen(true); };
  const handleDeletePoint = (pointId: string, groupId: string) => {
    if (confirm("Tem certeza que deseja excluir este ponto de contato?")) {
      deleteContactPoint(viewType, activeCategory, groupId, pointId);
      toast({ title: "Sucesso!", description: "Ponto de contato excluído com sucesso." });
    }
  };
  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) newSet.delete(groupId);
      else return new Set([groupId]);
      return newSet;
    });
  };
  const renderCategoryButton = (cat: Category) => {
    const isSelected = activeCategory === cat.id && !searchTerm;
    return (
      <button
        onClick={() => { setActiveCategory(cat.id); setOpenGroups(new Set()); }}
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
      {/* ... (Header e Busca - mantidos) ... */}
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Contatos Inteligentes</h1>
              <p className="text-muted-foreground mt-1"> Gerencie grupos e pontos de contato hierárquicos. </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => { saveToLocalStorage(); toast({ title: "Dados salvos", description: "Todas as alterações foram salvas com sucesso!" }); }} size="icon" variant={hasUnsavedChanges ? "default" : "outline"} title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"} className="h-9 w-9"> <Save className="h-4 w-4" /> </Button>
              {canEditContatos && (
                <>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => { setEditingGroup(undefined); setGroupModalOpen(true); }} disabled={sortedCategories.length === 0}> <Plus className="h-5 w-5 mr-2" /> Novo Grupo </Button>
                  <Button variant="outline" onClick={() => setCategoryModalOpen(true)}> <Settings className="h-5 w-5 mr-2" /> Gerenciar Categorias </Button>
                </>
              )}
            </div>
          </div>
          {sortedCategories.length > 0 && !searchTerm && (
            <div className="border-b border-border pb-2">
              {canEditContatos ? (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Arraste para reordenar as categorias:</h3>
                  <SortableList
                    items={sortedCategories}
                    onReorder={handleReorderCategories}
                    renderItem={(cat) => renderCategoryButton(cat)}
                    className="flex flex-wrap gap-2 items-start"
                    itemClassName="flex-shrink-0 w-auto"
                    handleClassName="left-0"
                  />
                </>
              ) : (
                <div className="flex flex-wrap gap-2 items-start">
                  {sortedCategories.map((cat) => (<div key={cat.id} className="flex-shrink-0 w-auto"> {renderCategoryButton(cat)} </div>))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input type="text" placeholder="Buscar por grupo, setor, ramal ou telefone em todas as categorias..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card" />
          {searchTerm && (<button onClick={() => { setSearchTerm(""); setOpenGroups(new Set()); }} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" title="Limpar busca"> <X className="h-4 w-4" /> </button>)}
        </div>
      </div>

      {searchTerm && searchResults && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Search className="h-5 w-5" />
            <span>Resultados da Busca: <span className="font-bold">{Object.values(searchResults).flat().length}</span> itens encontrados</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setOpenGroups(new Set()); }} className="h-8 text-muted-foreground hover:text-foreground">
            Limpar Busca
          </Button>
        </div>
      )}

      <Card className="overflow-hidden border-none shadow-none bg-transparent space-y-4">
        <CardContent className="p-0 space-y-4">
          {searchTerm && searchResults ? (
            Object.entries(searchResults).map(([categoryId, results]) => {
              if (results.length === 0) return null;
              const category = sortedCategories.find(cat => cat.id === categoryId);
              const groupsInCategory = data[categoryId] || [];
              const groupIdsWithResults = new Set(results.map(r => r.groupId));
              const filteredGroupsInCategory = groupsInCategory.filter(group => groupIdsWithResults.has(group.id));

              if (filteredGroupsInCategory.length === 0) return null;

              return (
                <div key={categoryId} className="space-y-4">
                  {category && (
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {category.name}
                      </span>
                    </div>
                  )}
                  {filteredGroupsInCategory.map(group => {
                    const groupResults = results.filter(r => r.groupId === group.id);
                    const isGroupMatch = groupResults.some(r => r.type === 'group');
                    const matchingPoints = isGroupMatch
                      ? group.points
                      : group.points.filter(point => groupResults.some(r => r.type === 'point' && (r.item as ContactPoint).id === point.id));

                    return (
                      <Collapsible key={group.id} open={true} className="border rounded-xl bg-card shadow-sm overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="bg-white p-2 rounded-lg shadow-sm border border-border/50">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-foreground leading-tight"> {group.name} </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Encontrados: {matchingPoints.length} pontos</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-card/50">
                          {renderPointsList(matchingPoints, group.id)}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              );
            })
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Collapsible
                key={group.id}
                open={openGroups.has(group.id)}
                onOpenChange={() => toggleGroup(group.id)}
                className={cn(
                  "border rounded-xl bg-card transition-all duration-300",
                  openGroups.has(group.id) ? "shadow-md ring-1 ring-primary/20" : "shadow-sm hover:shadow-md hover:border-primary/30"
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl transition-colors duration-300",
                        openGroups.has(group.id) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className={cn("font-bold text-lg transition-colors", openGroups.has(group.id) ? "text-primary" : "text-foreground group-hover:text-primary/80")}>
                          {group.name}
                        </h3>
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                          {group.points.length} {group.points.length === 1 ? 'ponto' : 'pontos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEditContatos && (
                        <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAddPoint(group.id); }} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary" title="Adicionar Ponto"> <Plus className="h-4 w-4" /> </Button>
                          <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleEditGroup(group))} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Editar Grupo"> <Edit className="h-4 w-4" /> </Button>
                          <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleDeleteGroup(group.id))} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Excluir Grupo"> <Trash2 className="h-4 w-4" /> </Button>
                        </div>
                      )}
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-300 bg-muted/50",
                        openGroups.has(group.id) && "bg-primary/10 rotate-180"
                      )}>
                        <ChevronDown className={cn("h-5 w-5 text-muted-foreground", openGroups.has(group.id) && "text-primary")} />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t border-border/50">
                  <div className="p-4 bg-muted/5 space-y-4">
                    {renderPointsList(group.points, group.id)}
                    {group.points.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/20">
                        <Users className="h-10 w-10 mb-3 opacity-20" />
                        <p className="font-medium">Nenhum contato cadastrado</p>
                        <p className="text-sm opacity-70 mb-4">Este grupo está vazio.</p>
                        {canEditContatos && (
                          <Button variant="outline" size="sm" onClick={() => handleAddPoint(group.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Primeiro Ponto
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="bg-muted p-6 rounded-full mb-4">
                <Search className="h-12 w-12 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Nenhum resultado encontrado</h3>
              <p className="max-w-md text-center opacity-80 mb-6">
                {searchTerm
                  ? `Não encontramos nada para "${searchTerm}". Tente outro termo.`
                  : sortedCategories.length === 0
                    ? "Comece criando categorias para organizar seus contatos."
                    : "Selecione uma categoria ou crie um novo grupo para começar."}
              </p>
              {sortedCategories.length === 0 && canEditContatos && (
                <Button onClick={() => setCategoryModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Categorias
                </Button>
              )}
              {!searchTerm && sortedCategories.length > 0 && canEditContatos && (
                <Button onClick={() => { setEditingGroup(undefined); setGroupModalOpen(true); }} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Grupo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals - mantidos iguais */}
      <ContactGroupModal open={groupModalOpen} onClose={() => { setGroupModalOpen(false); setEditingGroup(undefined); }} onSave={handleSaveGroup} editingGroup={editingGroup} />
      {activeGroupId && (<ContactPointModal open={pointModalOpen} onClose={() => { setPointModalOpen(false); setEditingPoint(undefined); setActiveGroupId(null); }} onSave={handleSavePoint} editingPoint={editingPoint} groupName={data[activeCategory]?.find(g => g.id === activeGroupId)?.name || "Grupo Desconhecido"} />)}
      <CategoryModal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} onAdd={handleAddCategory} onUpdate={handleUpdateCategory} onDelete={handleDeleteCategory} categories={sortedCategories} />
    </div>
  );
};

// Helper para evitar que o clique no botão acione o Collapsible
const handleActionClick = (e: React.MouseEvent, action: () => void) => {
  e.stopPropagation();
  action();
};