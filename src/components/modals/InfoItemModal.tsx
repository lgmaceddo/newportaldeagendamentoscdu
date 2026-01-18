import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, FileText, Image, Trash2, Download, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { infoItemSchema, InfoItemFormData } from "@/schemas/infoSchema";
import { InfoTag, InfoItem } from "@/types/data";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface InfoItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: InfoItemFormData & { id?: string, info?: string }) => void;
  tags: InfoTag[];
  editingItem?: InfoItem;
}

export const InfoItemModal = ({
  open,
  onClose,
  onSave,
  tags,
  editingItem,
}: InfoItemModalProps) => {
  const { toast } = useToast();
  const [additionalInfo, setAdditionalInfo] = useState("");
  
  const form = useForm<InfoItemFormData>({
    resolver: zodResolver(infoItemSchema),
    defaultValues: {
      title: "",
      content: "",
      tagId: "",
    },
  });

  const { formState: { errors } } = form;

  useEffect(() => {
    if (open && editingItem) {
      form.reset({
        title: editingItem.title,
        content: editingItem.content,
        tagId: editingItem.tagId,
      });
      setAdditionalInfo(editingItem.info || "");
    } else if (open && !editingItem) {
      form.reset({
        title: "",
        content: "",
        tagId: tags[0]?.id || "",
      });
      setAdditionalInfo("");
    }
  }, [open, editingItem, tags, form]);

  const onSubmit = (data: InfoItemFormData) => {
    try {
      const finalData: InfoItemFormData & { id?: string; info?: string } = {
        ...data,
        id: editingItem?.id,
        info: additionalInfo, // Passando o campo info (Informações Adicionais)
      };
      onSave(finalData);
      form.reset();
      setAdditionalInfo("");
      onClose();
      toast({
        title: "Sucesso",
        description: editingItem ? "Informação atualizada com sucesso!" : "Informação adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a informação.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit, (validationErrors) => {
      if (Object.keys(validationErrors).length > 0) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
      }
    })(e);
  };

  const handleClose = () => {
    form.reset();
    setAdditionalInfo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex justify-between items-start border-b pb-4">
              <DialogTitle className="text-2xl font-bold text-primary">
                {editingItem ? "Editar Informação/Regra" : "Adicionar Nova Informação/Regra"}
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="tagId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Etiqueta (Categoria)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma etiqueta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tags.length > 0 ? (
                          tags.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id}>
                              {tag.name.toUpperCase()}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            Crie uma etiqueta primeiro
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
                  <FormItem>
                    <FormLabel className="font-bold">Título da Regra/Procedimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Regra de Agendamento de Ressonância"
                        {...field}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="font-bold">Conteúdo Detalhado</FormLabel>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a regra ou procedimento detalhadamente..."
                          rows={8}
                          {...field}
                          maxLength={10000}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        {field.value.length}/10000 caracteres
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
                <FormLabel className="font-bold text-primary">Informações Adicionais</FormLabel>
                <Textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Informações complementares sobre esta regra/procedimento..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Informações adicionais que complementam o conteúdo principal
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={tags.length === 0}
                >
                  {editingItem ? "Atualizar" : "Salvar"} Informação
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};