import { useState } from "react";
import { Plus, Edit, Trash2, ChevronRight, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Office, OfficeCategory, OfficeItem } from "@/types/data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface OfficeCategoriesViewProps {
    office: Office;
    onUpdate: (updatedOffice: Office) => void;
    canEdit: boolean;
}

export const OfficeCategoriesView = ({ office, onUpdate, canEdit }: OfficeCategoriesViewProps) => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<string>(office.categories?.[0]?.id || "");

    // Modals States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    // Editing States
    const [editingCategory, setEditingCategory] = useState<OfficeCategory | undefined>();
    const [editingItem, setEditingItem] = useState<OfficeItem | undefined>();

    // Form States
    const [catName, setCatName] = useState("");
    const [itemTitle, setItemTitle] = useState("");
    const [itemContent, setItemContent] = useState("");
    const [itemInfo, setItemInfo] = useState("");

    const categories = office.categories || [];
    const items = office.items || {};

    // --- Category Handlers ---
    const handleOpenCategoryModal = (category?: OfficeCategory) => {
        if (category) {
            setEditingCategory(category);
            setCatName(category.name);
        } else {
            setEditingCategory(undefined);
            setCatName("");
        }
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = () => {
        if (!catName.trim()) return;

        let newCategories = [...categories];
        let newItems = { ...items };

        if (editingCategory) {
            // Update
            newCategories = newCategories.map(c =>
                c.id === editingCategory.id ? { ...c, name: catName } : c
            );
        } else {
            // Create
            const newId = crypto.randomUUID();
            const newCat: OfficeCategory = {
                id: newId,
                name: catName,
                color: "text-blue-600" // Default color for now
            };
            newCategories.push(newCat);
            newItems[newId] = []; // Initialize items array
            // Set active tab to new category
            setTimeout(() => setActiveTab(newId), 0);
        }

        onUpdate({
            ...office,
            categories: newCategories,
            items: newItems
        });

        setIsCategoryModalOpen(false);
        toast({ title: "Categoria salva com sucesso!" });
    };

    const handleDeleteCategory = (catId: string) => {
        if (confirm("Tem certeza? Isso excluirá todos os itens desta categoria.")) {
            const newCategories = categories.filter(c => c.id !== catId);
            const newItems = { ...items };
            delete newItems[catId];

            onUpdate({
                ...office,
                categories: newCategories,
                items: newItems
            });

            if (activeTab === catId && newCategories.length > 0) {
                setActiveTab(newCategories[0].id);
            }
        }
    };

    // --- Item Handlers ---
    const handleOpenItemModal = (item?: OfficeItem) => {
        if (item) {
            setEditingItem(item);
            setItemTitle(item.title);
            setItemContent(item.content);
            setItemInfo(item.info || "");
        } else {
            setEditingItem(undefined);
            setItemTitle("");
            setItemContent("");
            setItemInfo("");
        }
        setIsItemModalOpen(true);
    };

    const handleSaveItem = () => {
        if (!itemTitle.trim() || !activeTab) return;

        const currentItems = items[activeTab] || [];
        let updatedItemsList = [...currentItems];

        if (editingItem) {
            updatedItemsList = updatedItemsList.map(i =>
                i.id === editingItem.id ? { ...i, title: itemTitle, content: itemContent, info: itemInfo } : i
            );
        } else {
            const newItem: OfficeItem = {
                id: crypto.randomUUID(),
                title: itemTitle,
                content: itemContent,
                info: itemInfo
            };
            updatedItemsList.push(newItem);
        }

        onUpdate({
            ...office,
            items: {
                ...items,
                [activeTab]: updatedItemsList
            }
        });

        setIsItemModalOpen(false);
        toast({ title: "Procedimento salvo com sucesso!" });
    };

    const handleDeleteItem = (itemId: string) => {
        if (confirm("Excluir este procedimento?")) {
            const currentItems = items[activeTab] || [];
            const updatedItemsList = currentItems.filter(i => i.id !== itemId);

            onUpdate({
                ...office,
                items: {
                    ...items,
                    [activeTab]: updatedItemsList
                }
            });
        }
    };

    // Ensure active tab is valid
    if (categories.length > 0 && !categories.find(c => c.id === activeTab)) {
        setActiveTab(categories[0].id);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary flex items-center gap-2">
                    Procedimentos e Regras por Categoria
                </h4>
                {canEdit && (
                    <Button size="sm" onClick={() => handleOpenCategoryModal()} variant="outline" className="h-8">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Nova Categoria
                    </Button>
                )}
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/20">
                    <p>Nenhuma categoria de procedimentos cadastrada.</p>
                    {canEdit && (
                        <Button variant="link" onClick={() => handleOpenCategoryModal()}>
                            Criar primeira categoria
                        </Button>
                    )}
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <TabsList className="bg-transparent h-auto p-0 gap-2">
                            {categories.map(cat => (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className={cn(
                                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                                        "border border-border bg-card px-4 py-2 h-9"
                                    )}
                                >
                                    {cat.name}
                                    {canEdit && activeTab === cat.id && (
                                        <div className="ml-2 flex gap-1" onClick={e => e.stopPropagation()}>
                                            <Edit
                                                className="h-3 w-3 hover:text-yellow-300 cursor-pointer"
                                                onClick={() => handleOpenCategoryModal(cat)}
                                            />
                                            <Trash2
                                                className="h-3 w-3 hover:text-red-300 cursor-pointer"
                                                onClick={() => handleDeleteCategory(cat.id)}
                                            />
                                        </div>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="mt-4">
                        {categories.map(cat => (
                            <TabsContent key={cat.id} value={cat.id} className="mt-0 space-y-4">
                                <div className="flex justify-end">
                                    {canEdit && (
                                        <Button size="sm" onClick={() => handleOpenItemModal()} className="h-8">
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Procedimento
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4">
                                    {(items[cat.id] || []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4 italic">
                                            Nenhum procedimento cadastrado nesta categoria.
                                        </p>
                                    ) : (
                                        (items[cat.id] || []).map(item => (
                                            <Card key={item.id} className="bg-card hover:border-primary/50 transition-colors">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="space-y-1">
                                                            <h5 className="font-semibold text-foreground">{item.title}</h5>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                                                            {item.info && (
                                                                <div className="mt-2 text-xs bg-muted p-2 rounded text-muted-foreground">
                                                                    <strong>Obs:</strong> {item.info}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {canEdit && (
                                                            <div className="flex flex-col gap-1">
                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenItemModal(item)}>
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            )}

            {/* Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Categoria</Label>
                            <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Procedimentos Cirúrgicos" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCategory}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Item Modal */}
            <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Editar Procedimento" : "Novo Procedimento"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Ex: Retirada de Pontos" />
                        </div>
                        <div className="space-y-2">
                            <Label>Regras / Descrição</Label>
                            <Textarea
                                value={itemContent}
                                onChange={e => setItemContent(e.target.value)}
                                placeholder="Descreva as regras ou passos..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Informações Adicionais (Opcional)</Label>
                            <Input value={itemInfo} onChange={e => setItemInfo(e.target.value)} placeholder="Ex: Necessário autorização prévia" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveItem}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
