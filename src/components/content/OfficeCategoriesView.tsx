import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

    // Mantendo controle de qual categoria está "focada" para adição/edição
    const [targetCategoryId, setTargetCategoryId] = useState<string>("");

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
                color: "text-blue-600"
            };
            newCategories.push(newCat);
            newItems[newId] = [];
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
        }
    };

    // --- Item Handlers ---
    const handleOpenItemModal = (catId: string, item?: OfficeItem) => {
        setTargetCategoryId(catId);
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
        if (!itemTitle.trim() || !targetCategoryId) return;

        const currentItems = items[targetCategoryId] || [];
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
                [targetCategoryId]: updatedItemsList
            }
        });

        setIsItemModalOpen(false);
        toast({ title: "Procedimento salvo com sucesso!" });
    };

    const handleDeleteItem = (catId: string, itemId: string) => {
        if (confirm("Excluir este procedimento?")) {
            const currentItems = items[catId] || [];
            const updatedItemsList = currentItems.filter(i => i.id !== itemId);

            onUpdate({
                ...office,
                items: {
                    ...items,
                    [catId]: updatedItemsList
                }
            });
        }
    };

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
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {categories.filter(cat => cat && cat.id).map(cat => (
                        <AccordionItem value={cat.id} key={cat.id} className="border rounded-md px-2 bg-card">
                            <AccordionTrigger className="hover:no-underline py-3 px-2">
                                <div className="flex items-center gap-2 w-full pr-4 text-left">
                                    <span className="font-semibold text-foreground">{cat.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                                        ({(items[cat.id] || []).length} itens)
                                    </span>

                                    {/* Botões de Ação da Categoria - Com Stop Propagation */}
                                    {canEdit && (
                                        <div className="ml-auto flex gap-1 isolate" onClick={e => e.stopPropagation()}>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }}>
                                                <Edit className="h-3.5 w-3.5 text-muted-foreground hover:text-yellow-600" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}>
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-2 pt-0">
                                <div className="flex justify-end mb-4">
                                    {canEdit && (
                                        <Button size="sm" onClick={() => handleOpenItemModal(cat.id)} className="h-8">
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Procedimento
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-3">
                                    {(items[cat.id] || []).length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2 italic bg-muted/20 rounded">
                                            Nenhum procedimento cadastrado nesta categoria.
                                        </p>
                                    ) : (
                                        (items[cat.id] || []).filter(item => item && item.id).map(item => (
                                            <Card key={item.id} className="bg-muted/10 border-l-4 border-l-primary/40 hover:border-l-primary transition-all shadow-sm">
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div className="space-y-1">
                                                            <h5 className="font-bold text-sm text-foreground">{item.title}</h5>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{item.content}</p>
                                                            {item.info && (
                                                                <div className="mt-2 text-xs bg-background p-1.5 rounded text-muted-foreground border inline-block">
                                                                    <strong>Obs:</strong> {item.info}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {canEdit && (
                                                            <div className="flex flex-col gap-1 flex-shrink-0">
                                                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleOpenItemModal(cat.id, item)}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(cat.id, item.id)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            {/* Category Modal (Create/Edit) */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome da Categoria</Label>
                            <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Procedimentos Gerais, Regras de Atendimento..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCategory}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Item Modal (Create/Edit) */}
            <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Editar Procedimento" : "Novo Procedimento"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Título do Procedimento</Label>
                            <Input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Ex: Retirada de Pontos, Troca de Curativo..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Regras / Descrição Detalhada</Label>
                            <Textarea
                                value={itemContent}
                                onChange={e => setItemContent(e.target.value)}
                                placeholder="Descreva o passo a passo, materiais necessários, ou regras específicas..."
                                className="min-h-[120px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Observações Adicionais (Opcional)</Label>
                            <Input value={itemInfo} onChange={e => setItemInfo(e.target.value)} placeholder="Ex: Requer autorização prévia, Apenas médico..." />
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
