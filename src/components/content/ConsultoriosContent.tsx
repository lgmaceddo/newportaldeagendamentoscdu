import { useState, useEffect, useMemo } from "react";
import { Plus, Settings, Edit, Trash2, Save, X, Search, ChevronDown, Phone, Clock, Users, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Office } from "@/types/data";
import { OfficeModal } from "@/components/modals/OfficeModal";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserRoleContext } from "@/contexts/UserRoleContext";
import { OfficeListItem } from "./OfficeListItem";
import { useLocation } from "react-router-dom";

interface ConsultoriosContentProps {
  data: Office[];
  onAdd: (office: Omit<Office, "id">) => void;
  onUpdate: (office: Office) => void;
  onDelete: (id: string) => void;
}

export const ConsultoriosContent = ({ data, onAdd, onUpdate, onDelete }: ConsultoriosContentProps) => {
  const location = useLocation();
  const { canEdit } = useUserRoleContext();
  const canEditConsultorios = canEdit('consultorios');
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | undefined>();
  const { toast } = useToast();
  const { hasUnsavedChanges, saveToLocalStorage } = useData();

  // Ordena os consultórios por nome
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [data]);

  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredData = sortedData.filter((office) =>
    office.name.toLowerCase().includes(lowerSearchTerm) ||
    office.ramal.toLowerCase().includes(lowerSearchTerm) ||
    office.schedule.toLowerCase().includes(lowerSearchTerm) ||
    (office.specialties && office.specialties.some(s => s.toLowerCase().includes(lowerSearchTerm))) ||
    (office.attendants && office.attendants.some(a =>
      a.name.toLowerCase().includes(lowerSearchTerm) ||
      a.username.toLowerCase().includes(lowerSearchTerm)
    ))
  );

  // Efeito para lidar com a navegação de busca
  useEffect(() => {
    if (location.state?.searchResult?.type === 'office') {
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state]);

  // --- Office CRUD Handlers ---
  const handleSave = (officeData: Omit<Office, "id"> & { id?: string }) => {
    if (officeData.id) {
      onUpdate(officeData as Office);
      toast({
        title: "Consultório atualizado",
        description: "As informações foram atualizadas com sucesso."
      });
    } else {
      onAdd(officeData);
      toast({
        title: "Consultório criado",
        description: "O consultório foi criado com sucesso."
      });
    }
    setEditingOffice(undefined);
    setIsModalOpen(false);
  };

  const handleEdit = (office: Office) => {
    setEditingOffice(office);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este consultório?")) {
      onDelete(id);
      toast({
        title: "Consultório excluído",
        description: "O consultório foi removido com sucesso."
      });
    }
  };

  const handleNewOffice = () => {
    setEditingOffice(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="p-6 bg-card rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Consultórios</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os locais, ramais, atendentes e informações detalhadas dos consultórios.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  saveToLocalStorage();
                  toast({
                    title: "Dados salvos",
                    description: "Todas as alterações foram salvas com sucesso!"
                  });
                }}
                size="icon"
                variant={hasUnsavedChanges ? "default" : "outline"}
                title={hasUnsavedChanges ? "Salvar Alterações" : "Tudo Salvo"}
                className="h-9 w-9"
              >
                <Save className="h-4 w-4" />
              </Button>
              {canEditConsultorios && (
                <Button onClick={handleNewOffice} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-5 w-5 mr-2" /> Novo Consultório
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border rounded-md px-3 bg-card max-w-full mt-4">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Buscar por nome, ramal ou atendente..."
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

      {/* Lista de Consultórios */}
      <Card className="overflow-hidden">
        {searchTerm && (
          <div className="bg-primary/5 p-4 font-bold text-primary border-b border-border">
            Resultados da Busca ({filteredData.length})
          </div>
        )}
        <div className="divide-y divide-border/50">
          {filteredData.length === 0 ? (
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchTerm
                ? "Nenhum consultório encontrado com o termo de busca."
                : "Nenhum consultório cadastrado."}
            </CardContent>
          ) : (
            filteredData.map((office) => (
              <OfficeListItem
                key={office.id}
                office={office}
                onEdit={handleEdit}
                onUpdate={onUpdate}
                onDelete={handleDelete}
                canEdit={canEditConsultorios}
              />
            ))
          )}
        </div>
      </Card>

      {/* Office Modal (Edit/New) */}
      <OfficeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOffice(undefined);
        }}
        onSave={handleSave}
        office={editingOffice}
      />
    </div>
  );
};