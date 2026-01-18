import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { contactGroupSchema, ContactGroupFormData } from "@/schemas/contactSchema";
import { ContactGroup } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ContactGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactGroupFormData & { id?: string }) => void;
  editingGroup?: ContactGroup;
}

export const ContactGroupModal = ({
  open,
  onClose,
  onSave,
  editingGroup,
}: ContactGroupModalProps) => {
  const { toast } = useToast();
  const form = useForm<ContactGroupFormData>({
    resolver: zodResolver(contactGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (open && editingGroup) {
      form.reset({
        name: editingGroup.name,
      });
    } else if (open && !editingGroup) {
      form.reset({
        name: "",
      });
    }
  }, [open, editingGroup, form]);

  const handleSubmit = (data: ContactGroupFormData) => {
    try {
      onSave({ ...data, id: editingGroup?.id });
      toast({
        title: "Sucesso!",
        description: editingGroup
          ? "Grupo de contato atualizado com sucesso."
          : "Grupo de contato criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o grupo.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingGroup ? "Editar Grupo Principal" : "Adicionar Novo Grupo Principal"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome do Grupo/Setor Principal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Setor de Imagens"
                      {...field}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                {editingGroup ? "Atualizar" : "Salvar"} Grupo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};