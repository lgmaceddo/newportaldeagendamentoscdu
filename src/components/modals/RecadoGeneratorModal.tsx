import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Info, Edit, Users, MessageCircle, FileText, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { RecadoCategory, RecadoItem } from "@/types/data";
import { replaceUserNamePlaceholders } from "@/lib/textReplacer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RecadoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecadoItem;
  category: RecadoCategory;
  onEditCategory: (category: RecadoCategory) => void;
}

export const RecadoGeneratorModal = ({
  isOpen,
  onClose,
  item,
  category,
  onEditCategory,
}: RecadoGeneratorModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { userName } = useData();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, string> = {};
      item.fields.forEach(field => {
        initialValues[field] = "";
      });
      setFieldValues(initialValues);
    }
  }, [isOpen, item.fields]);

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateMessage = () => {
    let message = item.content;
    
    // 1. Substituir placeholders de campos dinâmicos
    item.fields.forEach(field => {
      // Aplica MAIÚSCULAS e formatação de negrito (*valor*)
      const rawValue = fieldValues[field] || 'N/A';
      const formattedValue = `*${rawValue.toUpperCase()}*`;
      message = message.replace(new RegExp(`\\[${field}\\]`, 'g'), formattedValue);
    });
    
    // 2. Substituir placeholder de nome do usuário
    message = replaceUserNamePlaceholders(message, userName);
    
    return message;
  };

  const generatedMessage = generateMessage();

  const handleCopy = async () => {
    // Validação simples: se houver campos obrigatórios (todos são considerados), verificar se foram preenchidos
    const requiredFieldsFilled = item.fields.every(field => fieldValues[field]?.trim());
    
    if (item.fields.length > 0 && !requiredFieldsFilled) {
      toast({
        variant: "destructive",
        title: "Preencha os campos",
        description: "Preencha todos os campos obrigatórios para gerar o recado completo.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      toast({
        title: "Recado copiado!",
        description: "Recado copiado.",
        variant: "compact",
        duration: 1000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o recado.",
      });
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'paciente': return 'Nome do Paciente';
      case 'medico': return 'Dr(a). Solicitante';
      case 'guia': return 'Guia';
      case 'telefone': return 'Telefone';
      case 'carteirinha': return 'Carteirinha';
      case 'idade': return 'Idade';
      case 'exame': return 'Exame(s)';
      case 'procedimento': return 'Procedimento';
      case 'ac_number': return 'AC Number';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  const handleEditClick = () => {
    onClose(); // Fecha o modal atual
    onEditCategory(category); // Abre o modal de edição de categoria
  };

  // Função para agrupar campos sequencialmente em linhas de 1 ou 2 colunas, mantendo a ordem
  const groupFieldsIntoRows = () => {
    const rows = [];
    const fields = [...item.fields];
    
    for (let i = 0; i < fields.length; i += 2) {
      const row = [fields[i]];
      if (i + 1 < fields.length) {
        row.push(fields[i + 1]);
      }
      rows.push(row);
    }
    return rows;
  };

  const fieldRows = groupFieldsIntoRows();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">Gerar Recado</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">Preencha os dados para gerar o recado: <span className="font-semibold text-primary">{item.title}</span></p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Form */}
          <div className="w-1/2 border-r flex flex-col">
            <ScrollArea className="flex-1 px-6 pb-6">
              {/* Compact Recipient Info - UPDATED */}
              <Card className="mb-4 border border-border bg-muted/30">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-sm text-foreground">
                          {category.title}
                        </h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleEditClick}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-snug">
                        {category.description}
                    </p>

                    {category.destinationType === 'group' && category.groupName && (
                        <div className="pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-primary mb-1">Destino:</p>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Grupo: {category.groupName}
                            </Badge>
                        </div>
                    )}
                    
                    {category.destinationType === 'attendant' && category.attendants && category.attendants.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-primary mb-1">Atendentes:</p>
                            <div className="flex flex-wrap gap-1">
                                {category.attendants.map((attendant) => (
                                    <Badge 
                                        key={attendant.id} 
                                        variant="secondary" 
                                        className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary"
                                    >
                                        {attendant.name} (@{attendant.chatNick})
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Separator className="my-3" />

              {/* Compact Form Fields - ORDER MAINTAINED */}
              {item.fields.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Dados do Recado
                  </h3>
                  
                  <div className="space-y-3">
                    {fieldRows.map((row, rowIndex) => (
                      <div 
                        key={rowIndex} 
                        className={cn(
                          "grid gap-3",
                          row.length === 1 ? "grid-cols-1" : "grid-cols-2"
                        )}
                      >
                        {row.map(field => (
                          <div key={field} className="space-y-1.5">
                            <Label htmlFor={field} className="text-xs font-medium text-foreground">
                              {getFieldLabel(field)}
                            </Label>
                            <Input
                              id={field}
                              value={fieldValues[field]}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                              placeholder={getFieldLabel(field)}
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-sm font-medium text-foreground mb-1">Nenhum campo necessário</h3>
                  <p className="text-xs text-muted-foreground">Este recado não requer dados adicionais.</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right Column - Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Pré-visualização
              </h3>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <Card className="h-full border border-border bg-muted/30">
                <CardContent className="p-4">
                  <div className="bg-white dark:bg-gray-900 rounded-md p-3 min-h-[200px] shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-foreground leading-relaxed">
                      {generatedMessage || "Preencha os campos ao lado para gerar o recado..."}
                    </pre>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={handleCopy} 
                      className="h-8 text-xs px-3 bg-primary hover:bg-primary/90"
                      disabled={copied}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" /> Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};