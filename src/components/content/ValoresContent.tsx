import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, FileText, Edit, Trash2, Save, X, Eye, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, ValueTableItem } from "@/types/data";
import { ValueModal } from "@/components/modals/ValueModal";
import { ScriptGeneratorModal } from "@/components/modals/ScriptGeneratorModal";
import { ImportExcelModal } from "@/components/modals/ImportExcelModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { SortableList, SortableItem } from "@/components/SortableList";
import { useLocation } from "react-router-dom";

interface ValoresContentProps {
  categories: Category[];
  data: Record<string, ValueTableItem[]>;
}

// ID fixo da viewType (sempre GERAL)
const VIEW_TYPE = 'GERAL';

// Valores padrão para material, conforme solicitado
const DEFAULT_MATERIAL_MIN = 500.00;
const DEFAULT_MATERIAL_MAX = 1500.00;

// Função de ordenação alfabética
const sortItems = (items: ValueTableItem[]): ValueTableItem[] => {
  return [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
};

export const ValoresContent = ({ categories, data }: ValoresContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditValores = canEdit('valores');
  const sortedCategories = useMemo(() => [...categories], [categories]);
  const [activeCategory, setActiveCategory] = useState(sortedCategories[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [editingValue, setEditingValue] = useState<(ValueTableItem & { oldCategoryId: string }) | undefined>();
  const [viewingValue, setViewingValue] = useState<ValueTableItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { deleteValueTable, hasUnsavedChanges, saveToLocalStorage, syncValueTableToExams, reorderValueCategories, bulkUpsertValueTable } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for search result in location state
  useEffect(() => {
    if (location.state?.searchResult?.type === 'value') {
      const categoryId = location.state.searchResult.categoryId;
      const itemId = location.state.searchResult.itemId;

      // Set the correct category
      if (categoryId) {
        setActiveCategory(categoryId);
      }

      // Find and view the specific value item
      const categoryItems = data[categoryId] || [];
      const item = categoryItems.find(i => i.id === itemId);
      if (item) {
        setViewingValue(item);
        setIsViewModalOpen(true);

        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title, location.pathname);
      }
    }
  }, [location.state, data]);

  // Consolida todos os itens para a busca e encontra a categoria de origem
  const allItems = useMemo(() => {
    const itemsWithCategory: (ValueTableItem & { categoryId: string })[] = [];
    Object.entries(data).forEach(([categoryId, items]) => {
      items.forEach(item => {
        itemsWithCategory.push({ ...item, categoryId });
      });
    });
    return itemsWithCategory;
  }, [data]);

  // Atualiza a categoria ativa se a lista de categorias mudar
  useEffect(() => {
    if (sortedCategories.length > 0 && (!activeCategory || !sortedCategories.find(cat => cat.id === activeCategory))) {
      setActiveCategory(sortedCategories[0].id);
    }
  }, [sortedCategories, activeCategory]);

  // Aplica a ordenação alfabética aos itens da categoria ativa
  const items = useMemo(() => {
    return sortItems(data[activeCategory] || []);
  }, [data, activeCategory]);

  const itemsToDisplay = useMemo(() => {
    const filtered = searchTerm
      ? allItems.filter(
        (item) =>
          item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ).map(item => item as ValueTableItem) // Remove o categoryId extra para compatibilidade com o render
      : items;

    // Garante que os resultados da busca também estejam ordenados
    return sortItems(filtered);
  }, [searchTerm, allItems, items]);

  const selectedExams = allItems.filter((item) => selectedItems.has(item.id));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Lógica de material simplificada para usar apenas os valores persistentes
  const getMaterialStatus = (item: ValueTableItem): { min: number, max: number, isActive: boolean } => {
    const isPersistentlyActive = item.material_max > 0;
    if (isPersistentlyActive) {
      const min = item.material_min > 0 ? item.material_min : DEFAULT_MATERIAL_MIN;
      const max = item.material_max > 0 ? item.material_max : DEFAULT_MATERIAL_MAX;
      return { min, max, isActive: true };
    }
    return { min: 0, max: 0, isActive: false };
  };

  const handleEdit = (item: ValueTableItem) => {
    // Encontra a categoria de origem do item
    const itemWithCategory = allItems.find(i => i.id === item.id);
    const oldCategoryId = itemWithCategory?.categoryId || activeCategory;
    setEditingValue({ ...item, oldCategoryId });
    setIsValueModalOpen(true);
  };

  const handleView = (item: ValueTableItem) => {
    setViewingValue(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = (item: ValueTableItem) => {
    if (confirm(`Deseja realmente excluir "${item.nome}"?`)) {
      // Precisa encontrar a categoria correta para deletar, se estiver na busca
      const categoryIdToDelete = allItems.find(i => i.id === item.id)?.categoryId || activeCategory;
      deleteValueTable(VIEW_TYPE, categoryIdToDelete, item.id);
      toast({
        title: "Valor excluído",
        description: "O valor foi excluído com sucesso.",
      });
    }
  };

  const handleCloseValueModal = () => {
    setIsValueModalOpen(false);
    setEditingValue(undefined);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingValue(null);
  };

  const handleReorderCategories = (oldIndex: number, newIndex: number) => {
    reorderValueCategories(VIEW_TYPE, oldIndex, newIndex);
    // Atualiza a categoria ativa para a nova posição, se necessário
    const newActiveCategory = categories[newIndex]?.id;
    if (newActiveCategory) {
      setActiveCategory(newActiveCategory);
    }
  };

  const generatePolipectomyInfo = () => {
    return `⚠️ Importante: Caso seja identificada a necessidade de remoção de pólipos durante o exame, o procedimento será convertido para Polipectomia.

✅ POLIPECTOMIA (ESÔFAGO, ESTÔMAGO E DUODENO)

O valor total do procedimento é de R$ 1.795,00.

Este valor inclui a realização com sedação;

Em caso de necessidade de anestesia, o valor deve ser consultado diretamente com a UNIANEST: 📞 (14) 3206-3101 | (14) 3206-9435.

📦 Materiais e Biópsia (Custos Adicionais):

Envio para biópsia: Acréscimo de R$ 400,00 a R$ 1.100,00 (dependendo da quantidade de amostras);

Taxa por pólipo: Acréscimo de R$ 400,00 a R$ 1.100,00 por formação retirada.

Para dúvidas sobre valores e condições de pagamento, entre em contato com nosso setor Financeiro:

💬 WhatsApp Financeiro: (14) 99865-9327 🕒 Horário de Atendimento:
* Segunda a Sexta: 07h às 19h
* Sábado: 08h às 13h

Se precisar de mais informações, fique à vontade para perguntar! Estamos aqui para ajudar! 😊`;
  };

  const generateScript = () => {
    if (selectedExams.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum exame selecionado",
        description: "Selecione pelo menos um exame para gerar o script.",
      });
      return;
    }

    let script = "Conforme solicitado, segue as informações sobre os valores na *modalidade Particular*:\n\n";
    let totalHonorario = 0;
    let totalExameCartao = 0;
    let totalMaterialMax = 0;
    let needsPolipectomyInfo = false;

    selectedExams.forEach((exam, index) => {
      // Usa a função simplificada de status de material
      const materialStatus = getMaterialStatus(exam);
      const material_min = materialStatus.min;
      const material_max = materialStatus.max;
      const hasMaterial = materialStatus.isActive;

      // LÓGICA DE CÁLCULO:
      // 1. Total Exame = Honorário (PIX) + Exame (Cartão)
      const totalExame = exam.honorario + exam.exame_cartao;

      // 2. Total c/ Material = Total Exame + Material (SEMPRE usando o MÁXIMO)
      // Quando há faixa (ex: R$500 a R$1500), usa R$1500
      const totalComMaterial = totalExame + material_max;

      const examNameUpper = exam.nome.toUpperCase();

      // Verifica se precisa adicionar a informação de polipectomia
      if (examNameUpper.includes("ENDOSCOPIA") || examNameUpper.includes("COLONOSCOPIA")) {
        needsPolipectomyInfo = true;
      }

      // Acumula totais
      totalHonorario += exam.honorario;
      totalExameCartao += exam.exame_cartao;
      totalMaterialMax += material_max;

      script += `✅ *${exam.nome}*\n\n`;
      script += `O valor total do procedimento é de ${formatCurrency(totalExame)}, que pode ser pago da seguinte forma:\n\n`;
      script += `• ${formatCurrency(exam.honorario)} no Pix ou Dinheiro (valor referente ao honorário médico)\n`;
      script += `• ${formatCurrency(exam.exame_cartao)} no Cartão de Crédito (à vista).\n\n`;

      if (hasMaterial) {
        const materialRange = material_min === material_max
          ? formatCurrency(material_max)
          : `${formatCurrency(material_min)} a ${formatCurrency(material_max)}`;

        script += `*Materiais e Contrastes*\n`;
        script += `• Há um custo adicional e variável para materiais e contrastes, que pode ser de ${materialRange}. O valor exato será determinado pelo profissional durante o exame, de acordo com a quantidade de material utilizado.\n\n`;
        script += `• O custo total do exame (procedimento + materiais) pode chegar a até ${formatCurrency(totalComMaterial)}.\n\n`;
      }

      if (exam.honorarios_diferenciados && exam.honorarios_diferenciados.length > 0) {
        const sortedHonorarios = [...exam.honorarios_diferenciados].sort((a, b) =>
          a.profissional.localeCompare(b.profissional)
        );

        script += `*Observação sobre Honorários:*\n`;
        script += `Caso opte por realizar o exame com um dos profissionais abaixo, o valor do honorário será diferente:\n`;
        sortedHonorarios.forEach((hon) => {
          const prefixo = hon.genero === 'masculino' ? 'DRº' : 'DRª';
          script += `• ${prefixo} ${hon.profissional}: ${formatCurrency(hon.valor)}\n`;
        });
        script += "\n";
      }

      if (index < selectedExams.length - 1) {
        script += "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
      }
    });

    // Adiciona o resumo total se houver mais de um exame
    if (selectedExams.length > 1) {
      const totalGeral = totalHonorario + totalExameCartao;
      const totalGeralComMaterial = totalGeral + totalMaterialMax;

      script += "========================================\n\n";
      script += `*RESUMO TOTAL (${selectedExams.length} EXAMES)*\n\n`;
      script += `O valor total dos procedimentos é de ${formatCurrency(totalGeral)}, que pode ser pago da seguinte forma:\n\n`;
      script += `• ${formatCurrency(totalHonorario)} no Pix ou Dinheiro (valor referente aos honorários médicos)\n`;
      script += `• ${formatCurrency(totalExameCartao)} no Cartão de Crédito (à vista).\n\n`;

      if (totalMaterialMax > 0) {
        script += `*Materiais e Contrastes (Máximo Acumulado)*\n`;
        script += `• O custo total máximo (procedimentos + materiais) pode chegar a até ${formatCurrency(totalGeralComMaterial)}.\n\n`;
      }
      script += "========================================\n\n";
    }

    // Adiciona a informação de Polipectomia ou apenas os contatos financeiros
    if (needsPolipectomyInfo) {
      script += "\n" + generatePolipectomyInfo();
    } else {
      script += `Para dúvidas sobre valores e condições de pagamento, entre em contato com nosso setor Financeiro:\n\n`;
      script += `💬 WhatsApp Financeiro: (14) 99865-9327 🕒 Horário de Atendimento:\n`;
      script += `* Segunda a Sexta: 07h às 19h\n`;
      script += `* Sábado: 08h às 13h\n\n`;
      script += `Se precisar de mais informações, fique à vontade para perguntar! Estamos aqui para ajudar! 😊`;
    }

    setGeneratedScript(script);
    setIsScriptModalOpen(true);
  };

  const renderCategoryButton = (cat: Category) => {
    const isSelected = activeCategory === cat.id && !searchTerm;
    return (
      <button
        onClick={() => {
          setActiveCategory(cat.id);
          setSearchTerm("");
        }}
        className={cn(
          "whitespace-nowrap py-3 px-4 rounded-lg font-medium text-sm transition-colors duration-200 w-full text-left h-full",
          "bg-card border rounded-lg hover:bg-muted/50",
          isSelected ? "bg-primary text-primary-foreground border-primary shadow-md" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {cat.name}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Tabela de Valores</h1>
              <p className="text-muted-foreground mt-1">Gerencie os valores dos exames particulares</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  saveToLocalStorage();
                  toast({
                    title: "Dados salvos",
                    description: "Todas as alterações foram salvas com sucesso!",
                  });
                }}
                size="icon"
                variant={hasUnsavedChanges ? "default" : "outline"}
                title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditValores && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    onClick={() => setIsImportModalOpen(true)}
                    disabled={categories.length === 0}
                  >
                    <FileSpreadsheet className="h-5 w-5 mr-2" /> Sincronizar Excel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsValueModalOpen(true)}
                    disabled={categories.length === 0}
                  >
                    <Plus className="h-5 w-5 mr-2" /> Novo Valor
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* Navegação por Abas (Categorias) - Agora usando SortableList */}
          {sortedCategories.length > 0 && !searchTerm && (
            <div className="border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Arraste para reordenar as categorias:</h3>
              <SortableList
                items={sortedCategories}
                onReorder={handleReorderCategories}
                renderItem={(cat) => renderCategoryButton(cat)}
                className="flex flex-wrap gap-2 items-start"
                itemClassName="flex-shrink-0 w-auto"
                handleClassName="left-0"
              />
            </div>
          )}
          {/* Barra de Ações de Seleção */}
          {selectedItems.size > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3 md:space-y-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-primary mb-2 md:mb-0">
                  {selectedItems.size} {selectedItems.size === 1 ? 'item selecionado' : 'itens selecionados'}
                </h2>
                <div className="text-sm text-muted-foreground max-h-24 overflow-y-auto pr-2">
                  {selectedExams.map((exam, index) => (
                    <p key={exam.id} className="truncate">
                      {index + 1}. {exam.nome}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={generateScript}
                >
                  <FileText className="h-5 w-5 mr-2" /> Gerar Script
                </Button>
                <Button variant="outline" onClick={() => setSelectedItems(new Set())}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-md mt-4">
          <Input
            type="text"
            placeholder="Buscar por código ou nome do exame (em todas as categorias)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-card"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-border">
              <thead className="bg-[#ECFDF5]">
                <tr>
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(itemsToDisplay.map((item) => item.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      checked={
                        itemsToDisplay.length > 0 &&
                        itemsToDisplay.every((item) => selectedItems.has(item.id))
                      }
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider w-[100px]">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Nome do Exame
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Honorário (PIX)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Exame (Cartão)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Total Exame
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Total c/ Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {itemsToDisplay.length > 0 ? (
                  itemsToDisplay.map((item) => {
                    const materialStatus = getMaterialStatus(item);
                    const material_min = materialStatus.min;
                    const material_max = materialStatus.max;
                    const hasMaterial = materialStatus.isActive;

                    // LÓGICA DE CÁLCULO:
                    // 1. Total Exame = Honorário (PIX) + Exame (Cartão)
                    const totalExame = item.honorario + item.exame_cartao;

                    // 2. Total c/ Material = Total Exame + Material (SEMPRE usando o MÁXIMO)
                    // Quando há faixa (ex: R$500 a R$1500), usa R$1500
                    const totalComMaterial = totalExame + material_max;

                    let materialText = "";
                    if (!hasMaterial) {
                      materialText = formatCurrency(0);
                    } else if (material_min === material_max) {
                      materialText = formatCurrency(material_max);
                    } else {
                      materialText = `${formatCurrency(material_min)} a ${formatCurrency(
                        material_max
                      )}`;
                    }

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors cursor-pointer ${selectedItems.has(item.id) ? "bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        onClick={() => handleView(item)} // Ação principal: abrir modal de visualização
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelection(item.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {item.codigo}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {item.nome}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {formatCurrency(item.honorario)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {formatCurrency(item.exame_cartao)}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {materialText}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-foreground">
                          {formatCurrency(totalExame)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">
                          {formatCurrency(totalComMaterial)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(item);
                              }}
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEditValores && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(item);
                                  }}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item);
                                  }}
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-muted-foreground">
                      <Card className="max-w-md mx-auto p-6 border-primary/20 bg-primary/5">
                        <CardContent className="p-0">
                          <p className="font-semibold mb-2">Nenhum exame encontrado.</p>
                          <p className="text-sm">
                            Utilize o botão "Novo Valor" para adicionar manualmente.
                          </p>
                        </CardContent>
                      </Card>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ValueModal
        isOpen={isValueModalOpen}
        onClose={handleCloseValueModal}
        viewType={VIEW_TYPE}
        categories={categories}
        editingItem={editingValue}
      />
      {/* Modal de Visualização */}
      <ValueViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        item={viewingValue}
      />
      <ScriptGeneratorModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        script={generatedScript}
      />
      <ImportExcelModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </div>
  );
};

// Componente para o modal de visualização
const ValueViewModal = ({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item: ValueTableItem | null }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!item) return null;

  // LÓGICA DE CÁLCULO:
  // 1. Total Exame = Honorário (PIX) + Exame (Cartão)
  const totalExame = item.honorario + item.exame_cartao;

  // 2. Total c/ Material = Total Exame + Material (SEMPRE usando o MÁXIMO)
  // Quando há faixa (ex: R$500 a R$1500), usa R$1500
  const totalComMaterial = totalExame + item.material_max;

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-card rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-transform ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="p-6">
          <div className="flex justify-between items-start border-b pb-4">
            <h2 className="text-2xl font-bold text-primary">{item.nome}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-6 mt-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Código</p>
                <p className="text-base font-medium text-foreground">{item.codigo}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total Exame</p>
                <p className="text-base font-medium text-foreground">{formatCurrency(totalExame)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total c/ Material</p>
                <p className="text-base font-medium text-primary">{formatCurrency(totalComMaterial)}</p>
              </div>
            </div>
            {/* Valores Detalhados - Em uma única linha */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Valores Detalhados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Honorário (PIX)</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(item.honorario)}</p>
                </div>
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Exame (Cartão)</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(item.exame_cartao)}</p>
                </div>
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Total Exame</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{formatCurrency(totalExame)}</p>
                </div>
              </div>
            </div>
            {/* Materiais */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Materiais e Contrastes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Mínimo</p>
                  <p className="text-base font-medium text-foreground mt-1">{formatCurrency(item.material_min)}</p>
                </div>
                <div className="p-3 border rounded-lg bg-card shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Máximo</p>
                  <p className="text-base font-medium text-foreground mt-1">{formatCurrency(item.material_max)}</p>
                </div>
              </div>
              <div className="p-3 border rounded-lg bg-primary/5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Total com Material (Máximo)</p>
                <p className="text-base font-semibold text-primary mt-1">{formatCurrency(totalComMaterial)}</p>
              </div>
            </div>
            {/* Observações */}
            {item.info && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">Observações</h3>
                <div className="bg-muted/30 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {item.info}
                  </p>
                </div>
              </div>
            )}
            {/* Honorários Diferenciados */}
            {item.honorarios_diferenciados && item.honorarios_diferenciados.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-primary">Honorários Diferenciados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.honorarios_diferenciados.map((honorario) => (
                    <div key={honorario.id} className="p-3 border rounded-lg bg-card shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">
                          {honorario.genero === 'masculino' ? 'Dr.' : 'Dra.'} {honorario.profissional}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">{formatCurrency(honorario.valor)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 pt-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose} size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};