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
import { Plus, Trash2, Edit, Users, MessageCircle, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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
        // Double-check required fields before proceeding
        if (!data.title?.trim()) {
            toast({
                title: "Erro de Validação",
                description: "O campo 'Nome da Categoria' é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        const finalData: Omit<RecadoCategory, "id"> = {
            title: data.title,
            description: data.description,
            destinationType: data.destinationType,
            attendants: data.destinationType === 'attendant' ? data.attendants : undefined,
            groupName: data.destinationType === 'group' ? data.groupName : undefined,
        };

        if (category) {
            onSave({ ...category, ...finalData });
        } else {
            onSave(finalData);
        }
        onClose();
    };

    const handleCancelEdit = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Categorias de Recados</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 border-b pb-6">
                            <h3 className="text-lg font-semibold text-primary">
                                {category ? "Editar Categoria" : "Nova Categoria"}
                            </h3>

                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <FormControl><Input {...field} placeholder="Ex: Solicitação de Guias" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl><Textarea {...field} placeholder="Descreva o propósito desta categoria de recados" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Separator />

                            {/* Destinatário */}
                            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                                <FormField control={form.control} name="destinationType" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="font-bold text-primary flex items-center gap-2">
                                            <Users className="h-4 w-4" /> Tipo de Destinatário:
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="attendant" /></FormControl><FormLabel className="font-normal">Atendentes (Individual)</FormLabel></FormItem>
                                                <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="group" /></FormControl><FormLabel className="font-normal">Grupo (Geral)</FormLabel></FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                {destinationType === 'group' && (
                                    <FormField control={form.control} name="groupName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Grupo (Ex: Grupo Autorização)</FormLabel>
                                            <FormControl><Input {...field} placeholder="Nome do Grupo" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}

                                {destinationType === 'attendant' && (
                                    <div className="space-y-4">
                                        <Label className="font-bold text-primary">Gerenciar Atendentes</Label>
                                        <div className="p-3 border rounded-lg space-y-3 bg-background">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                                                <div className="space-y-1 md:col-span-1">
                                                    <Label className="text-xs">Nome Completo</Label>
                                                    <Input value={newAttendantName} onChange={(e) => setNewAttendantName(e.target.value)} placeholder="Nome" />
                                                </div>
                                                <div className="space-y-1 md:col-span-1">
                                                    <Label className="text-xs">Nick do Chat</Label>
                                                    <Input value={newAttendantNick} onChange={(e) => setNewAttendantNick(e.target.value)} placeholder="Nick" />
                                                </div>
                                                <Button type="button" onClick={handleAddAttendant} className="bg-primary hover:bg-primary/90 h-10">
                                                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                                                </Button>
                                            </div>
                                        </div>

                                        {fields.length > 0 && (
                                            <Collapsible className="space-y-2">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between">
                                                        Lista de Atendentes ({fields.length})
                                                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="space-y-2 p-2 border rounded-lg bg-background">
                                                    {fields.map((field, index) => (
                                                        <div key={field.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                            <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                                            <p className="flex-1 text-sm font-medium">{field.name}</p>
                                                            <p className="flex-1 text-sm text-muted-foreground">@{field.chatNick}</p>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                        </div>
                                                    ))}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )}
                                        {form.formState.errors.groupName && (
                                            <p className="text-sm text-destructive mt-1">{form.formState.errors.groupName.message}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {category && (
                                    <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancelar Edição</Button>
                                )}
                                <Button type="submit" disabled={!titleWatch?.trim()}>
                                    {category ? "Atualizar Categoria" : "Salvar Nova Categoria"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                            Categorias Existentes
                        </h3>
                        <div className="space-y-2">
                            {categories.length > 0 ? (
                                [...categories].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')).map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-foreground">
                                                {cat.title.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                {cat.destinationType === 'group' ? (
                                                    <><MessageCircle className="h-3 w-3" /> Destino: Grupo ({cat.groupName})</>
                                                ) : (
                                                    <><Users className="h-3 w-3" /> Destino: Atendentes ({cat.attendants?.length || 0})</>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(cat)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDelete(cat.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-4">
                                    Nenhuma categoria criada ainda.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};