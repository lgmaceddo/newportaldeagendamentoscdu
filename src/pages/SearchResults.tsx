import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, TestTube, Phone, DollarSign, Users, Building, MessageSquare, Info, ChevronRight } from "lucide-react";
import { ScriptItem, ExamItem, ContactGroup, ContactPoint, ValueTableItem, Professional, Office, RecadoItem, InfoItem } from "@/types/data";
import { highlightText } from "@/lib/textUtils";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  section: string;
  icon: React.ReactNode;
  item: unknown;
  // Add navigation info
  navigationPath?: string;
  navigationState?: unknown;
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scriptData, examData, contactData, valueTableData, professionalData, officeData, recadoData, infoData, estomaterapiaData } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);



  const performSearch = useCallback((term: string) => {
    setLoading(true);
    const lowerTerm = term.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search Scripts
    Object.entries(scriptData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, scripts]) => {
        // Ensure scripts is an array
        const scriptArray = Array.isArray(scripts) ? scripts : [];
        scriptArray.forEach((script: ScriptItem) => {
          // Ensure all fields are strings before calling toLowerCase
          const title = script.title || "";
          const content = script.content || "";

          if (
            title.toLowerCase().includes(lowerTerm) ||
            content.toLowerCase().includes(lowerTerm)
          ) {
            foundResults.push({
              id: script.id,
              title: script.title,
              content: script.content,
              type: "Script",
              section: `${viewType} - Scripts`,
              icon: <FileText className="h-4 w-4" />,
              item: script,
              navigationPath: "/",
              navigationState: { section: "scripts", subCategory: viewType }
            });
          }
        });
      });
    });

    // Search Exams
    Object.entries(examData).forEach(([categoryId, exams]) => {
      // Ensure exams is an array
      const examArray = Array.isArray(exams) ? exams : [];
      examArray.forEach((exam: ExamItem) => {
        // Ensure all fields are strings before calling toLowerCase
        const title = exam.title || "";
        const locationStr = Array.isArray(exam.location)
          ? exam.location.join(" ").toLowerCase()
          : "";
        const additionalInfo = exam.additionalInfo || "";
        // Convert schedulingRules to string safely
        const schedulingRules = exam.schedulingRules ? String(exam.schedulingRules) : "";
        const valueTableCode = exam.valueTableCode || "";

        if (
          title.toLowerCase().includes(lowerTerm) ||
          locationStr.includes(lowerTerm) ||
          additionalInfo.toLowerCase().includes(lowerTerm) ||
          schedulingRules.toLowerCase().includes(lowerTerm) ||
          valueTableCode.toLowerCase().includes(lowerTerm)
        ) {
          foundResults.push({
            id: exam.id,
            title: exam.title,
            content: `${additionalInfo} ${schedulingRules}`,
            type: "Exame",
            section: "Exames",
            icon: <TestTube className="h-4 w-4" />,
            item: exam,
            navigationPath: "/",
            navigationState: { section: "exames" }
          });
        }
      });
    });

    // Search Contacts
    Object.entries(contactData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, groups]) => {
        // Ensure groups is an array
        const groupArray = Array.isArray(groups) ? groups : [];
        groupArray.forEach((group: ContactGroup) => {
          // Ensure group.name is a string
          const groupName = group.name || "";

          if (groupName.toLowerCase().includes(lowerTerm)) {
            foundResults.push({
              id: group.id,
              title: group.name,
              content: `Grupo de contatos`,
              type: "Contato",
              section: `${viewType} - Contatos`,
              icon: <Phone className="h-4 w-4" />,
              item: group,
              navigationPath: "/",
              navigationState: { section: "contatos" }
            });
          }

          // Ensure group.points is an array
          const pointsArray = Array.isArray(group.points) ? group.points : [];
          pointsArray.forEach((point: ContactPoint) => {
            // Ensure all point fields are strings
            const setor = point.setor || "";
            const local = point.local || "";
            const ramal = point.ramal || "";
            const telefone = point.telefone || "";
            const whatsapp = point.whatsapp || "";

            if (
              setor.toLowerCase().includes(lowerTerm) ||
              local.toLowerCase().includes(lowerTerm) ||
              ramal.toLowerCase().includes(lowerTerm) ||
              telefone.toLowerCase().includes(lowerTerm) ||
              whatsapp.toLowerCase().includes(lowerTerm)
            ) {
              foundResults.push({
                id: point.id,
                title: `${group.name || ''} - ${point.setor || ''}`,
                content: `${local} Ramal: ${ramal} Telefone: ${telefone} WhatsApp: ${whatsapp}`,
                type: "Contato",
                section: `${viewType} - Contatos`,
                icon: <Phone className="h-4 w-4" />,
                item: point,
                navigationPath: "/",
                navigationState: { section: "contatos" }
              });
            }
          });
        });
      });
    });

    // Search Value Tables
    Object.entries(valueTableData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, items]) => {
        // Ensure items is an array
        const itemArray = Array.isArray(items) ? items : [];
        itemArray.forEach((item: ValueTableItem) => {
          // Ensure all fields are strings
          const codigo = item.codigo || "";
          const nome = item.nome || "";
          const info = item.info || "";

          if (
            codigo.toLowerCase().includes(lowerTerm) ||
            nome.toLowerCase().includes(lowerTerm) ||
            info.toLowerCase().includes(lowerTerm)
          ) {
            foundResults.push({
              id: item.id,
              title: item.nome,
              content: `Código: ${item.codigo} Honorário: R$ ${item.honorario} Exame: R$ ${item.exame_cartao}`,
              type: "Valor",
              section: `${viewType} - Tabela de Valores`,
              icon: <DollarSign className="h-4 w-4" />,
              item: item,
              navigationPath: "/",
              navigationState: { section: "valores" }
            });
          }
        });
      });
    });

    // Search Professionals
    Object.entries(professionalData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, professionals]) => {
        // Ensure professionals is an array
        const professionalArray = Array.isArray(professionals) ? professionals : [];
        professionalArray.forEach((professional: Professional) => {
          // Ensure all fields are strings
          const name = professional.name || "";
          const specialty = professional.specialty || "";
          const ageRange = professional.ageRange || "";
          const generalObs = professional.generalObs || "";

          if (
            name.toLowerCase().includes(lowerTerm) ||
            specialty.toLowerCase().includes(lowerTerm) ||
            ageRange.toLowerCase().includes(lowerTerm) ||
            generalObs.toLowerCase().includes(lowerTerm)
          ) {
            foundResults.push({
              id: professional.id,
              title: `${professional.gender === 'masculino' ? 'Dr.' : 'Dra.'} ${professional.name}`,
              content: `${specialty} - ${ageRange} - ${generalObs}`,
              type: "Profissional",
              section: `${viewType} - Profissionais`,
              icon: <Users className="h-4 w-4" />,
              item: professional,
              navigationPath: "/",
              navigationState: { section: "profissionais" }
            });
          }
        });
      });
    });

    // Search Offices
    // Ensure officeData is an array
    const officeArray = Array.isArray(officeData) ? officeData : [];
    officeArray.forEach((office: Office) => {
      // Ensure all fields are strings
      const name = office.name || "";
      const ramal = office.ramal || "";
      const schedule = office.schedule || "";
      const specialties = Array.isArray(office.specialties) ? office.specialties.join(', ') : "";

      if (
        name.toLowerCase().includes(lowerTerm) ||
        ramal.toLowerCase().includes(lowerTerm) ||
        schedule.toLowerCase().includes(lowerTerm) ||
        specialties.toLowerCase().includes(lowerTerm)
      ) {
        foundResults.push({
          id: office.id,
          title: office.name,
          content: `Ramal: ${ramal} Horário: ${schedule} Especialidades: ${specialties}`,
          type: "Consultório",
          section: "Consultórios",
          icon: <Building className="h-4 w-4" />,
          item: office,
          navigationPath: "/",
          navigationState: { section: "consultorios" }
        });
      }
    });

    // Search Recados
    Object.entries(recadoData).forEach(([categoryId, items]) => {
      // Ensure items is an array
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((recado: RecadoItem) => {
        // Ensure all fields are strings
        const title = recado.title || "";
        const content = recado.content || "";

        if (
          title.toLowerCase().includes(lowerTerm) ||
          content.toLowerCase().includes(lowerTerm)
        ) {
          foundResults.push({
            id: recado.id,
            title: recado.title,
            content: recado.content,
            type: "Recado",
            section: "Recados",
            icon: <MessageSquare className="h-4 w-4" />,
            item: recado,
            navigationPath: "/",
            navigationState: { section: "recados" }
          });
        }
      });
    });

    // Search Info (Anotações)
    Object.entries(infoData).forEach(([tagId, items]) => {
      // Ensure items is an array
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((info: InfoItem) => {
        // Ensure all fields are strings
        const title = info.title || "";
        const content = info.content || "";

        if (
          title.toLowerCase().includes(lowerTerm) ||
          content.toLowerCase().includes(lowerTerm)
        ) {
          foundResults.push({
            id: info.id,
            title: info.title,
            content: info.content,
            type: "Anotação",
            section: "Anotações",
            icon: <Info className="h-4 w-4" />,
            item: info,
            navigationPath: "/",
            navigationState: { section: "anotacoes" }
          });
        }
      });
    });

    // Search Estomaterapia
    Object.entries(estomaterapiaData).forEach(([tagId, items]) => {
      // Ensure items is an array
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((info: InfoItem) => {
        // Ensure all fields are strings
        const title = info.title || "";
        const content = info.content || "";

        if (
          title.toLowerCase().includes(lowerTerm) ||
          content.toLowerCase().includes(lowerTerm)
        ) {
          foundResults.push({
            id: info.id,
            title: info.title,
            content: info.content,
            type: "Estomaterapia",
            section: "Estomaterapia",
            icon: <Info className="h-4 w-4" />,
            item: info,
            navigationPath: "/",
            navigationState: { section: "estomaterapia" }
          });
        }
      });
    });

    setResults(foundResults);
    setLoading(false);
  }, [scriptData, examData, contactData, valueTableData, professionalData, officeData, recadoData, infoData, estomaterapiaData]);

  // Parse query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchTerm(query);

    if (query) {
      performSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [location.search, performSearch]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Script": return "bg-blue-100 text-blue-800";
      case "Exame": return "bg-purple-100 text-purple-800";
      case "Contato": return "bg-green-100 text-green-800";
      case "Valor": return "bg-yellow-100 text-yellow-800";
      case "Profissional": return "bg-pink-100 text-pink-800";
      case "Consultório": return "bg-indigo-100 text-indigo-800";
      case "Recado": return "bg-cyan-100 text-cyan-800";
      case "Anotação": return "bg-teal-100 text-teal-800";
      case "Estomaterapia": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Script": return <FileText className="h-4 w-4" />;
      case "Exame": return <TestTube className="h-4 w-4" />;
      case "Contato": return <Phone className="h-4 w-4" />;
      case "Valor": return <DollarSign className="h-4 w-4" />;
      case "Profissional": return <Users className="h-4 w-4" />;
      case "Consultório": return <Building className="h-4 w-4" />;
      case "Recado": return <MessageSquare className="h-4 w-4" />;
      case "Anotação": return <Info className="h-4 w-4" />;
      case "Estomaterapia": return <Info className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.navigationPath) {
      navigate(result.navigationPath, { state: result.navigationState });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resultados da Busca</h1>
          <p className="text-muted-foreground mt-2">
            Buscando por: <span className="font-semibold text-primary">"{searchTerm}"</span>
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
        >
          Voltar ao Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {results.length} resultado(s) encontrado(s)
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground">
                  Não encontramos nenhum item correspondente a sua busca por "{searchTerm}".
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          {getTypeIcon(result.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{result.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={getTypeColor(result.type)}>
                              {result.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {result.section}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResultClick(result)}
                        className="text-primary hover:text-primary/80"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-sm text-muted-foreground line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: highlightText(result.content, searchTerm)
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}