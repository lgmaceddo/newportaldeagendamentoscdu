import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, Search, Check, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { examSchema, ExamFormData } from "@/schemas/examSchema";
import { Category, ExamItem, ValueTableItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { Label } from "@/components/ui/label";

interface ExamModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ExamFormData) => void;
  categories: Category[];
  editingExam?: ExamItem & { categoryId: string };
}

const locationOptions = [
  { value: "CDU", label: "CDU" },
  { value: "HOSPITAL", label: "HOSPITAL" },
  { value: "CLÍNICAS EXTERNAS", label: "CLÍNICAS EXTERNAS" },
];

export const ExamModal = ({ open, onClose, onSave, categories, editingExam, }: ExamModalProps) => {
  const { toast } = useToast();
  const { valueTableData } = useData();
  const [mode, setMode] = useState<'manual' | 'import'>('manual');
  const [selectedValueItem, setSelectedValueItem] = useState<ValueTableItem | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Consolidate all value items into a single searchable array
  const allValueItems: ValueTableItem[] = useMemo(() => {
    return Object.values(valueTableData).flatMap(dataByView => Object.values(dataByView).flat() )
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [valueTableData]);

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      location: [], // Agora é array
      additionalInfo: "",
      schedulingRules: "",
      valueTableCode: undefined,
    },
  });

  const isTitleLocked = mode === 'import' && selectedValueItem;

  useEffect(() => {
    if (open && editingExam) {
      const safeSchedulingRules = typeof editingExam.schedulingRules === 'string' ? editingExam.schedulingRules : "";
      // Garante que location é um array
      const safeLocation = Array.isArray(editingExam.location) ? editingExam.location : (editingExam.location ? [String(editingExam.location)] : []);
      
      form.reset({
        title: editingExam.title,
        categoryId: editingExam.categoryId,
        location: safeLocation, // Usando safeLocation
        additionalInfo: editingExam.additionalInfo,
        schedulingRules: safeSchedulingRules,
        valueTableCode: editingExam.valueTableCode,
      });
      
      if (editingExam.valueTableCode) {
        const linkedItem = allValueItems.find(item => item.codigo === editingExam.valueTableCode);
        setSelectedValueItem(linkedItem || null);
        setMode('import');
      } else {
        setSelectedValueItem(null);
        setMode('manual');
      }
    } else if (open && !editingExam) {
      form.reset({
        title: "",
        categoryId: categories[0]?.id || "",
        location: [], // Array vazio
        additionalInfo: "",
        schedulingRules: "",
        valueTableCode: undefined,
      });
      setSelectedValueItem(null);
      setMode('manual');
    }
  }, [open, editingExam, categories, form, allValueItems]);

  const handleSelectValueItem = (item: ValueTableItem) => {
    setSelectedValueItem(item);
    setIsCommandOpen(false); // Close the command list
    
    // Pre-fill only the title field based on selected item
    form.setValue('title', item.nome, { shouldValidate: true });
    form.setValue('valueTableCode', item.codigo);
    
    // Clear other fields that might conflict
    form.setValue('additionalInfo', '');
    form.setValue('schedulingRules', '');
    form.setValue('location', []); // Limpa location
    
    toast({
      title: "Exame selecionado",
      description: `Nome preenchido automaticamente. Preencha o Local Principal manualmente.`,
      variant: "compact",
      duration: 2000,
    });
  };

  const handleModeChange = (newMode: 'manual' | 'import') => {
    setMode(newMode);
    // Reset fields related to the other mode
    if (newMode === 'manual') {
      form.setValue('valueTableCode', undefined);
      setSelectedValueItem(null);
      // If creating new, clear title to allow manual entry
      if (!editingExam) {
        form.setValue('title', '');
      }
    } else {
      // If switching to import, clear title until an item is selected
      form.setValue('title', '');
      form.setValue('valueTableCode', undefined);
      setSelectedValueItem(null);
      setIsCommandOpen(true); // Open command list when switching to import mode
    }
  };

  const handleSubmit = (data: ExamFormData) => {
    // Double-check required fields in import mode before proceeding
    if (mode === 'import' && selectedValueItem) {
      if (!data.title?.trim()) {
        toast({
          title: "Erro de Validação",
          description: "O campo 'Nome do Exame' é obrigatório.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      const finalData: ExamFormData = {
        ...data,
        // valueTableCode is handled by the mode logic
        valueTableCode: mode === 'import' && selectedValueItem ? selectedValueItem.codigo : undefined,
      };
      
      onSave(finalData);
      toast({
        title: "Sucesso!",
        description: editingExam ? "Exame atualizado com sucesso." : "Exame criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o exame.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedValueItem(null);
    setIsCommandOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingExam ? "Editar Exame" : "Adicionar Novo Exame"}
          </DialogTitle>
          <p className="sr-only">Formulário para {editingExam ? "editar" : "adicionar"} exame</p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tabs for Mode Selection (Only for new exams) */}
            {!editingExam && (
              <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'manual' | 'import')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
                  <TabsTrigger value="import" disabled={allValueItems.length === 0}>
                    Importar da Tabela de Valores ({allValueItems.length})
                  </TabsTrigger>
                </TabsList>
                
                {/* Import Content */}
                <TabsContent value="import" className="mt-4">
                  <div className="space-y-4">
                    <FormLabel className="font-bold text-primary">Selecione o Exame da Tabela de Valores</FormLabel>
                    <Command className="rounded-lg border shadow-md">
                      <CommandInput placeholder="Buscar exame por nome ou código..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Nenhum exame encontrado.</CommandEmpty>
                        <CommandGroup>
                          {allValueItems.map((item) => (
                            <CommandItem
                              key={item.codigo}
                              value={`${item.nome} ${item.codigo}`}
                              onSelect={() => handleSelectValueItem(item)}
                              className={cn(
                                "flex items-center justify-between",
                                selectedValueItem?.codigo === item.codigo && "bg-primary/10 text-primary"
                              )}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{item.nome}</span>
                                <span className="text-xs text-muted-foreground">Código: {item.codigo}</span>
                              </div>
                              {selectedValueItem?.codigo === item.codigo && <Check className="h-4 w-4" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                    {selectedValueItem && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary flex items-center gap-3">
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        <p>Exame selecionado: <span className="font-bold">{selectedValueItem.nome}</span> (Código: {selectedValueItem.codigo}). O Nome foi preenchido automaticamente. Preencha o Local Principal manualmente.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Manual Content (Empty, fields are below) */}
                <TabsContent value="manual" className="mt-4">
                  <p className="text-sm text-muted-foreground">Preencha os campos abaixo para cadastrar um exame manualmente.</p>
                </TabsContent>
              </Tabs>
            )}
            
            {/* Shared Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem className="col-span-1">
                            <FormLabel className="font-bold">Categoria</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name.toUpperCase()}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            Crie uma categoria primeiro
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="font-bold">Nome do Exame</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: USG de Abdômen"
                                    {...field}
                                    maxLength={200}
                                    readOnly={isTitleLocked}
                                    className={cn(isTitleLocked && "bg-muted/50")}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {/* Linha 2: Local Principal (Múltipla Seleção) */}
            <div className="grid grid-cols-1 gap-4">
              {/* Local Principal (Múltipla Seleção) */}
              <FormField
                control={form.control}
                name="location"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-bold">Local(is) Principal(is)</FormLabel>
                    <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
                      {locationOptions.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="location"
                          render={({ field }) => {
                            const isChecked = field.value?.includes(item.value);
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const currentValues = Array.isArray(field.value) ? field.value : [];
                                      if (checked) {
                                        field.onChange([...currentValues, item.value]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (value) => value !== item.value
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Informações Adicionais */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Informações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite informações adicionais sobre o exame..."
                      rows={4}
                      {...field}
                      maxLength={2000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Regras de Agendamento */}
            <FormField
              control={form.control}
              name="schedulingRules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">Regras de Agendamento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite regras específicas de agendamento (ex: só agenda com guia, restrição de idade, etc.)..."
                      rows={4}
                      {...field}
                      maxLength={2000}
                      className="resize-none border-primary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={categories.length === 0}
              >
                {editingExam ? "Atualizar" : "Salvar"} Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};