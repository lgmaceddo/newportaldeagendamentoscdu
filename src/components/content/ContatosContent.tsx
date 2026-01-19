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
  const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [categories]);
  const [activeCategory, setActiveCategory] = useState(sortedCategories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | undefined>();
  const [editingPoint, setEditingPoint] = useState<ContactPoint | undefined>();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { addContactCategory, updateContactCategory, deleteContactCategory, addContactGroup, updateContactGroup, deleteContactGroup, addContactPoint, updateContactPoint, deleteContactPoint, hasUnsavedChanges, saveToLocalStorage } = useData();
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
    const newCategory: Category = { id: `cont-cat-${Date.now()}`, name: formData.name, color: formData.color };
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
              <div className="flex flex-wrap gap-2 items-start">
                {sortedCategories.map((cat) => (<div key={cat.id} className="flex-shrink-0 w-auto"> {renderCategoryButton(cat)} </div>))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input type="text" placeholder="Buscar por grupo, setor, ramal ou telefone em todas as categorias..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card" />
          {searchTerm && (<button onClick={() => { setSearchTerm(""); setOpenGroups(new Set()); }} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" title="Limpar busca"> <X className="h-4 w-4" /> </button>)}
        </div>
      </div>

      {searchTerm && searchResults && (<div className="bg-primary/5 p-4 font-bold text-primary border rounded-lg"> Resultados da Busca: {Object.values(searchResults).flat().length} itens encontrados </div>)}

      <Card className="overflow-hidden">
        <CardContent className="p-0 divide-y divide-border/50">
          {searchTerm && searchResults ? (
            Object.entries(searchResults).map(([categoryId, results]) => {
              if (results.length === 0) return null;
              const category = sortedCategories.find(cat => cat.id === categoryId);
              const groupsInCategory = data[categoryId] || [];
              const groupIdsWithResults = new Set(results.map(r => r.groupId));
              const filteredGroupsInCategory = groupsInCategory.filter(group => groupIdsWithResults.has(group.id));
              if (filteredGroupsInCategory.length === 0) return null;
              return (
                <div key={categoryId}>
                  {category && (<div className="bg-muted p-2 font-medium border-b"> Categoria: {category.name} </div>)}
                  {filteredGroupsInCategory.map(group => {
                    const groupResults = results.filter(r => r.groupId === group.id);
                    const pointIds = new Set(groupResults.filter(r => r.type === 'point').map(r => (r.item as ContactPoint).id));
                    const matchingPoints = group.points.filter(point => pointIds.has(point.id));
                    return (
                      <Collapsible key={group.id} open={openGroups.has(group.id)} onOpenChange={() => toggleGroup(group.id)} className="border-b last:border-b-0">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-primary" />
                              <h3 className="font-bold text-lg text-foreground"> {group.name} </h3>
                              <span className="text-sm text-muted-foreground"> ({matchingPoints.length} pontos) </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {canEditContatos && (
                                <>
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAddPoint(group.id); }} className="h-8 text-xs"> <Plus className="h-4 w-4 mr-1" /> Ponto </Button>
                                  <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleEditGroup(group))} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Editar Grupo"> <Edit className="h-4 w-4" /> </Button>
                                  <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleDeleteGroup(group.id))} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Excluir Grupo"> <Trash2 className="h-4 w-4" /> </Button>
                                </>
                              )}
                              <ChevronDown className={cn("h-5 w-5 transition-transform", openGroups.has(group.id) && "rotate-180")} />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-muted/20">
                          {renderPointsList(matchingPoints, group.id)}
                          {matchingPoints.length === 0 && (<div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg"> Nenhum ponto de contato encontrado na busca. </div>)}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              );
            })
          ) : filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Collapsible key={group.id} open={openGroups.has(group.id)} onOpenChange={() => toggleGroup(group.id)} className="border-b last:border-b-0">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg text-foreground"> {group.name} </h3>
                      <span className="text-sm text-muted-foreground"> ({group.points.length} pontos) </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEditContatos && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAddPoint(group.id); }} className="h-8 text-xs"> <Plus className="h-4 w-4 mr-1" /> Ponto </Button>
                          <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleEditGroup(group))} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Editar Grupo"> <Edit className="h-4 w-4" /> </Button>
                          <Button size="icon" variant="ghost" onClick={(e) => handleActionClick(e, () => handleDeleteGroup(group.id))} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Excluir Grupo"> <Trash2 className="h-4 w-4" /> </Button>
                        </>
                      )}
                      <ChevronDown className={cn("h-5 w-5 transition-transform", openGroups.has(group.id) && "rotate-180")} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-muted/20">
                  {renderPointsList(group.points, group.id)}
                  {group.points.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground border border-dashed rounded-lg">
                      Nenhum ponto de contato cadastrado neste grupo.
                      {canEditContatos && (<Button variant="link" size="sm" onClick={() => handleAddPoint(group.id)} className="ml-2"> Adicionar Ponto </Button>)}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))
          ) : (
            <CardContent className="p-8 text-center text-muted-foreground">
              <p> {searchTerm ? "Nenhum grupo ou ponto de contato encontrado." : sortedCategories.length === 0 ? "Crie uma categoria primeiro usando 'Gerenciar Categorias'." : "Nenhum grupo de contato cadastrado nesta categoria. Clique em 'Novo Grupo' para começar."} </p>
            </CardContent>
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