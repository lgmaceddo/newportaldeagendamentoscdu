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
import { contactPointSchema, ContactPointFormData } from "@/schemas/contactSchema";
import { ContactPoint } from "@/types/data";
import { useToast } from "@/hooks/use-toast";

interface ContactPointModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactPointFormData & { id?: string }) => void;
  editingPoint?: ContactPoint;
  groupName: string;
}

export const ContactPointModal = ({
  open,
  onClose,
  onSave,
  editingPoint,
  groupName,
}: ContactPointModalProps) => {
  const { toast } = useToast();
  const form = useForm<ContactPointFormData>({
    resolver: zodResolver(contactPointSchema),
    defaultValues: {
      setor: "",
      local: "",
      ramal: "",
      telefone: "",
      whatsapp: "",
    },
  });

  useEffect(() => {
    if (open && editingPoint) {
      form.reset({
        setor: editingPoint.setor,
        local: editingPoint.local,
        ramal: editingPoint.ramal,
        telefone: editingPoint.telefone,
        whatsapp: editingPoint.whatsapp,
        description: editingPoint.description || "",
      });
    } else if (open && !editingPoint) {
      form.reset({
        setor: "",
        local: "",
        ramal: "",
        telefone: "",
        whatsapp: "",
        description: "",
      });
    }
  }, [open, editingPoint, form]);

  const handleSubmit = (data: ContactPointFormData) => {
    try {
      onSave({ ...data, id: editingPoint?.id });
      toast({
        title: "Sucesso!",
        description: editingPoint
          ? "Ponto de contato atualizado com sucesso."
          : "Ponto de contato criado com sucesso.",
      });
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o ponto de contato.",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPoint ? "Editar Ponto de Contato" : "Adicionar Novo Ponto de Contato"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Grupo Principal: <span className="font-semibold text-primary">{groupName}</span>
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="setor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome do Ponto de Contato (Setor)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Recepção RX / Tomografia"
                      {...field}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Local</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Prédio de Consultas / Térreo"
                        {...field}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ramal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Ramal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 1001 / 1002"
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: (14) 3235-3333"
                        {...field}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: (14) 99999-1111"
                        {...field}
                        maxLength={50}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Descrição / Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Informações adicionais, detalhes de funcionamento..."
                      {...field}
                      maxLength={500}
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
                {editingPoint ? "Atualizar" : "Salvar"} Ponto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};