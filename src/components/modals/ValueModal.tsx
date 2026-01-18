import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DiferenciatedFee } from "@/types/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { valueSchema } from "@/schemas/valueSchema";
import { Category, ValueTableItem } from "@/types/data";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

type ValueFormData = z.infer<typeof valueSchema>;

interface ValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewType: string;
  categories: Category[];
  editingItem?: ValueTableItem & { oldCategoryId: string }; // Adicionando oldCategoryId
}

export const ValueModal = ({ isOpen, onClose, viewType, categories, editingItem, }: ValueModalProps) => {
  const { addValueTable, moveAndUpdateValueTable } = useData();
  const { toast } = useToast();
  const [honorariosDiferenciados, setHonorariosDiferenciados] = useState<DiferenciatedFee[]>([]);
  const [novoProfissional, setNovoProfissional] = useState("");
  const [novoValor, setNovoValor] = useState("");
  const [novoGenero, setNovoGenero] = useState<'masculino' | 'feminino'>('masculino');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors }, } = useForm<ValueFormData>({
    resolver: zodResolver(valueSchema),
    defaultValues: {
      categoryId: categories[0]?.id || "",
      codigo: "",
      nome: "",
      honorario: 0,
      exame_cartao: 0,
      material_min: 0,
      material_max: 0,
      info: "",
    },
  });

  const honorario = watch("honorario");
  const exameCartao = watch("exame_cartao");
  const materialMin = watch("material_min");
  const materialMax = watch("material_max");
  const totalExame = (honorario || 0) + (exameCartao || 0);
  const totalComMaterial = totalExame + (materialMax || 0);

  // Função auxiliar para parsear valores monetários (para honorários diferenciados)
  const parseMoneyValue = (value: string | undefined): number => {
    if (!value) return 0;
    
    // Ensure value is treated as string for replacement operations
    const stringValue = String(value);
    
    // Remove "R$", espaços, e pontos de milhar
    const cleaned = stringValue.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  useEffect(() => {
    if (isOpen && editingItem) {
      // O categoryId já vem no editingItem.oldCategoryId, mas o form precisa do categoryId atual
      setValue("categoryId", editingItem.oldCategoryId); 
      setValue("codigo", editingItem.codigo);
      setValue("nome", editingItem.nome);
      setValue("honorario", editingItem.honorario);
      setValue("exame_cartao", editingItem.exame_cartao);
      setValue("material_min", editingItem.material_min);
      setValue("material_max", editingItem.material_max);
      setValue("info", editingItem.info || "");
      setHonorariosDiferenciados(editingItem.honorarios_diferenciados || []);
    } else if (isOpen) {
      reset({
        categoryId: categories[0]?.id || "",
        codigo: "",
        nome: "",
        honorario: 0,
        exame_cartao: 0,
        material_min: 0,
        material_max: 0,
        info: "",
      });
      setHonorariosDiferenciados([]);
      setNovoProfissional("");
      setNovoValor("");
      setNovoGenero('masculino');
    }
  }, [isOpen, editingItem, categories, reset, setValue]);

  const adicionarHonorarioDiferenciado = () => {
    if (!novoProfissional.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite o nome do profissional.",
        variant: "destructive",
      });
      return;
    }
    
    const valor = parseMoneyValue(novoValor);
    if (valor <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para o honorário.",
        variant: "destructive",
      });
      return;
    }

    const novoHonorario: DiferenciatedFee = {
      id: `hd-${Date.now()}`,
      profissional: novoProfissional.trim().toUpperCase(),
      valor: valor,
      genero: novoGenero,
    };

    setHonorariosDiferenciados([...honorariosDiferenciados, novoHonorario].sort((a, b) => 
      a.profissional.localeCompare(b.profissional)
    ));
    setNovoProfissional("");
    setNovoValor("");
    setNovoGenero('masculino');
  };

  const removerHonorarioDiferenciado = (id: string) => {
    setHonorariosDiferenciados(honorariosDiferenciados.filter(h => h.id !== id));
  };

  const onSubmit = (data: ValueFormData) => {
    const valueItemUpdates: Partial<ValueTableItem> = {
      codigo: data.codigo,
      nome: data.nome,
      info: data.info || "",
      honorario: data.honorario,
      exame_cartao: data.exame_cartao,
      material_min: data.material_min,
      material_max: data.material_max,
      honorarios_diferenciados: honorariosDiferenciados,
    };

    if (editingItem) {
      // Usa a nova função para lidar com a mudança de categoria
      moveAndUpdateValueTable(
        viewType, 
        editingItem.oldCategoryId, 
        data.categoryId, 
        editingItem.id, 
        valueItemUpdates
      );
      toast({
        title: "Valor atualizado",
        description: "O valor foi atualizado com sucesso.",
      });
    } else {
      addValueTable(viewType, data.categoryId, valueItemUpdates as Omit<ValueTableItem, 'id'>);
      toast({
        title: "Valor adicionado",
        description: "O novo valor foi adicionado com sucesso.",
      });
      
      // Mostrar notificação de novo item
      toast({
        title: "Novo exame adicionado",
        description: (
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{data.nome}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Será automaticamente sincronizado com a aba Exames.
              </p>
            </div>
          </div>
        ),
        duration: 5000,
      });
    }

    onClose();
    reset();
    setHonorariosDiferenciados([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {editingItem ? "Editar Valor" : "Adicionar Novo Valor"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground"
            aria-label="Fechar modal de valores"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId">Categoria</Label>
              <Select 
                value={watch("categoryId")} 
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input 
                id="codigo" 
                {...register("codigo")} 
                placeholder="Ex: 40808017" 
              />
              {errors.codigo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.codigo.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="nome">Nome do Exame</Label>
            <Input 
              id="nome" 
              {...register("nome")} 
              placeholder="Ex: Endoscopia Digestiva Alta" 
            />
            {errors.nome && (
              <p className="text-sm text-destructive mt-1">
                {errors.nome.message}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="honorario">Honorário (PIX)</Label>
              <Input 
                id="honorario" 
                type="number" 
                step="0.01" 
                {...register("honorario", { valueAsNumber: true })} 
                placeholder="0,00" 
              />
              {errors.honorario && (
                <p className="text-sm text-destructive mt-1">
                  {errors.honorario.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="exame_cartao">Exame (Cartão)</Label>
              <Input 
                id="exame_cartao" 
                type="number" 
                step="0.01" 
                {...register("exame_cartao", { valueAsNumber: true })} 
                placeholder="0,00" 
              />
              {errors.exame_cartao && (
                <p className="text-sm text-destructive mt-1">
                  {errors.exame_cartao.message}
                </p>
              )}
            </div>
          </div>
          
          {/* Campos de Material (Min e Max) - Agora inputs numéricos diretos */}
          <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/20">
            <div>
              <Label htmlFor="material_min" className="font-bold text-primary">Material Mínimo (R$)</Label>
              <Input 
                id="material_min" 
                type="number" 
                step="0.01" 
                {...register("material_min", { valueAsNumber: true })} 
                placeholder="0,00" 
              />
              {errors.material_min && (
                <p className="text-sm text-destructive mt-1">
                  {errors.material_min.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="material_max" className="font-bold text-primary">Material Máximo (R$)</Label>
              <Input 
                id="material_max" 
                type="number" 
                step="0.01" 
                {...register("material_max", { valueAsNumber: true })} 
                placeholder="0,00" 
              />
              {errors.material_max && (
                <p className="text-sm text-destructive mt-1">
                  {errors.material_max.message}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground col-span-2">
              Defina a faixa de custo de material. Se não houver custo, deixe 0,00.
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm text-primary">Resumo de Valores</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Total Exame:</span>
                <span className="ml-2 font-medium text-foreground">
                  R$ {totalExame.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total c/ Material (Máx):</span>
                <span className="ml-2 font-bold text-primary">
                  R$ {totalComMaterial.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <h3 className="font-semibold text-primary mb-3">
                Honorários Diferenciados por Profissional
              </h3>
              {honorariosDiferenciados.length > 0 && (
                <div className="space-y-2 mb-4">
                  {[...honorariosDiferenciados].sort((a, b) => 
                    a.profissional.localeCompare(b.profissional)
                  ).map((honorario) => {
                    const prefixo = honorario.genero === 'masculino' ? 'DRº' : 'DRª';
                    return (
                      <div 
                        key={honorario.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-full ${
                            honorario.genero === 'masculino' 
                              ? 'bg-blue-500/10' 
                              : 'bg-pink-500/10'
                          }`}>
                            <User className={`h-4 w-4 ${
                              honorario.genero === 'masculino' 
                                ? 'text-blue-500' 
                                : 'text-pink-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{prefixo} {honorario.profissional}</p>
                            <p className="text-sm text-muted-foreground">
                              Honorário: R$ {honorario.valor.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removerHonorarioDiferenciado(honorario.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder="Nome do Profissional" 
                      value={novoProfissional} 
                      onChange={(e) => setNovoProfissional(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          adicionarHonorarioDiferenciado();
                        }
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Select 
                      value={novoGenero} 
                      onValueChange={(value: 'masculino' | 'feminino') => setNovoGenero(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span>DRº</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feminino">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-pink-500" />
                            <span>DRª</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input 
                      placeholder="Valor (R$)" 
                      value={novoValor} 
                      onChange={(e) => setNovoValor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          adicionarHonorarioDiferenciado();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={adicionarHonorarioDiferenciado}
                    className="bg-primary hover:bg-primary/90"
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Adicione profissionais que cobram honorários diferentes para este exame
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
            >
              Salvar Item
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};