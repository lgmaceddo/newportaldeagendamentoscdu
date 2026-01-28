import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { recadoCategorySchema, RecadoCategoryFormData } from "@/schemas/recadoSchema";
import { RecadoCategory } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Users, MessageCircle, ChevronDown, Folder, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecadoCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<RecadoCategory, "id"> | RecadoCategory) => void;
    onEdit: (category: RecadoCategory) => void;
    onDelete: (categoryId: string) => void;
    categories: RecadoCategory[];
    category?: RecadoCategory;
}

export const RecadoCategoryModal = ({ isOpen, onClose, onSave, onEdit, onDelete, categories, category }: RecadoCategoryModalProps) => {
    const { toast } = useToast();
    const [newAttendantName, setNewAttendantName] = useState("");
    const [newAttendantNick, setNewAttendantNick] = useState("");

    const [activeTab, setActiveTab] = useState<string>("form");

    const form = useForm<RecadoCategoryFormData>({
        resolver: zodResolver(recadoCategorySchema),
        defaultValues: {
            title: "",
            description: "",
            destinationType: "attendant",
            groupName: "",
            attendants: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "attendants",
    });

    const destinationType = form.watch("destinationType");
    const titleWatch = form.watch("title"); // Watch title for button disable state

    useEffect(() => {
        if (isOpen) {
            if (category) {
                form.reset({
                    title: category.title,
                    description: category.description,
                    destinationType: category.destinationType,
                    groupName: category.groupName || "",
                    attendants: category.attendants || [],
                });
                // Scroll to top when editing starts
                const modalContent = document.querySelector('[role="dialog"] .overflow-y-auto');
                if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                form.reset({
                    title: "",
                    description: "",
                    destinationType: "attendant",
                    groupName: "",
                    attendants: [],
                });
            }
            setNewAttendantName("");
            setNewAttendantNick("");
        }
    }, [isOpen, category, form]);

    const handleAddAttendant = () => {
        if (!newAttendantName.trim() || !newAttendantNick.trim()) {
            toast({
                variant: "destructive",
                title: "Campos obrigatórios",
                description: "Preencha o nome e o nick do atendente.",
            });
            return;
        }
        append({ id: crypto.randomUUID(), name: newAttendantName, chatNick: newAttendantNick });
        setNewAttendantName("");
        setNewAttendantNick("");
    };

    const handleSubmit = (data: RecadoCategoryFormData) => {
        const finalData: Omit<RecadoCategory, "id"> = {
            title: data.title,
            description: data.description || "",
            destinationType: data.destinationType,
            attendants: data.destinationType === 'attendant' ? (data.attendants || []) : [],
            groupName: data.destinationType === 'group' ? (data.groupName || "") : "",
        };

        if (category) {
            onSave({ ...category, ...finalData });
            toast({ title: "Categoria atualizada!" });
        } else {
            onSave(finalData);
            toast({ title: "Categoria criada!" });
        }
        onClose();
    };

    const onError = (errors: any) => {
        console.error("Erro de validação no formulário:", errors);
        const firstError = Object.values(errors)[0] as any;
        if (firstError) {
            toast({
                variant: "destructive",
                title: "Verifique os campos",
                description: firstError.message || "Preencha todos os campos obrigatórios corretamente.",
            });
        }
    };

    const handleCancelEdit = () => {
        form.reset();
        if (category) {
            onClose(); // Se veio de fora pro edit, fecha
        }
    };

    const handleEditInModal = (cat: RecadoCategory) => {
        onEdit(cat);
        setActiveTab("form");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Categorias de Recados</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="form">
                                {category ? "Editar Categoria" : "Nova Categoria"}
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                Categorias Existentes ({categories.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="form" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit, onError)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Nome da Categoria <span className="text-destructive">*</span></FormLabel>
                                                <FormControl><Input {...field} placeholder="Ex: Solicitação de Guias" className="bg-background" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Descrição <span className="text-destructive">*</span></FormLabel>
                                                <FormControl><Input {...field} placeholder="Ex: Recados para o setor de guias" className="bg-background" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Destinatário */}
                                    <div className="space-y-4 p-5 border-2 border-primary/10 rounded-xl bg-primary/5">
                                        <FormField control={form.control} name="destinationType" render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="font-bold text-primary flex items-center gap-2">
                                                    <Users className="h-4 w-4" /> Tipo de Destinatário:
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-6">
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl><RadioGroupItem value="attendant" /></FormControl>
                                                            <FormLabel className="font-semibold cursor-pointer">Atendentes Individuais</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl><RadioGroupItem value="group" /></FormControl>
                                                            <FormLabel className="font-semibold cursor-pointer">Grupo Geral</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        {destinationType === 'group' && (
                                            <FormField control={form.control} name="groupName" render={({ field }) => (
                                                <FormItem className="animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <FormLabel className="font-bold">Nome do Grupo <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl><Input {...field} placeholder="Ex: Grupo Autorização" className="bg-background" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}

                                        {destinationType === 'attendant' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <Label className="font-bold text-primary">Gerenciar Atendentes <span className="text-destructive">*</span></Label>
                                                <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg space-y-3 bg-background/50">
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                                        <div className="space-y-1 md:col-span-2">
                                                            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Nome Completo</Label>
                                                            <Input value={newAttendantName} onChange={(e) => setNewAttendantName(e.target.value)} placeholder="Ex: Maria Silva" className="bg-background" />
                                                        </div>
                                                        <div className="space-y-1 md:col-span-2">
                                                            <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Nick do Chat</Label>
                                                            <Input value={newAttendantNick} onChange={(e) => setNewAttendantNick(e.target.value)} placeholder="Ex: maria_exames" className="bg-background" />
                                                        </div>
                                                        <Button type="button" onClick={handleAddAttendant} className="bg-primary hover:bg-primary/90 h-10 w-full">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {fields.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                                        {fields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center justify-between gap-2 p-2.5 bg-background border rounded-lg shadow-sm group/item">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                        <Users className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <p className="text-sm font-bold truncate text-foreground">{field.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-mono">@{field.chatNick}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-sm text-muted-foreground bg-background/30 rounded-lg border border-dashed">
                                                        Nenhum atendente adicionado. Adicione pelo menos um.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t">
                                        <Button type="button" variant="ghost" onClick={handleCancelEdit} className="text-muted-foreground">
                                            Limpar / Cancelar
                                        </Button>
                                        <Button type="submit" size="lg" className="px-8 shadow-md">
                                            {category ? "Salvar Alterações" : "Criar Categoria"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="list" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
                            <div className="grid grid-cols-1 gap-3">
                                {categories.length > 0 ? (
                                    [...categories].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')).map((cat) => (
                                        <div
                                            key={cat.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 bg-background border-2 rounded-xl transition-all duration-200",
                                                category?.id === cat.id ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/30 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1.5 min-w-0">
                                                <span className="font-bold text-base text-foreground uppercase tracking-tight truncate">
                                                    {cat.title}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                        {cat.destinationType === 'group' ? (
                                                            <><MessageCircle className="h-3 w-3" /> Grupo: {cat.groupName}</>
                                                        ) : (
                                                            <><Users className="h-3 w-3" /> {cat.attendants?.length || 0} Atendentes</>
                                                        )}
                                                    </span>
                                                    {cat.description && (
                                                        <span className="text-[11px] text-muted-foreground italic truncate">
                                                            {cat.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    onClick={() => handleEditInModal(cat)}
                                                    className="h-9 w-9 text-primary hover:bg-primary hover:text-white"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    onClick={() => onDelete(cat.id)}
                                                    className="h-9 w-9 text-destructive hover:bg-destructive hover:text-white"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/20">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <Folder className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">Nenhuma categoria encontrada.</p>
                                        <Button variant="link" onClick={() => setActiveTab("form")}>
                                            Crie a primeira agora
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto mt-4">
                            Sair
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};