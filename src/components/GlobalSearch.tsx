import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ScriptItem, ExamItem, ContactGroup, ContactPoint, ValueTableItem, Professional, Office, RecadoItem, InfoItem } from "@/types/data";
import { highlightText } from "@/lib/textUtils";

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  section: string;
  navigationPath?: string;
  navigationState?: any;
  itemId?: string;
  categoryId?: string;
  viewType?: string;
}

interface GlobalSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const GlobalSearch = ({ searchTerm, setSearchTerm }: GlobalSearchProps) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { scriptData, examData, contactData, valueTableData, professionalData, officeData, recadoData, infoData, estomaterapiaData } = useData();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search when searchTerm changes
  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm]);

  const performSearch = (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search Scripts
    Object.entries(scriptData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, scripts]) => {
        const scriptArray = Array.isArray(scripts) ? scripts : [];
        scriptArray.forEach((script: ScriptItem) => {
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
              navigationPath: "/",
              navigationState: {
                section: "scripts",
                subCategory: viewType,
                searchResult: {
                  type: "script",
                  itemId: script.id,
                  categoryId: categoryId,
                  viewType: viewType
                }
              },
              itemId: script.id,
              categoryId: categoryId,
              viewType: viewType
            });
          }
        });
      });
    });

    // Search Exams
    Object.entries(examData).forEach(([categoryId, exams]) => {
      const examArray = Array.isArray(exams) ? exams : [];
      examArray.forEach((exam: ExamItem) => {
        const title = exam.title || "";
        const locationStr = Array.isArray(exam.location)
          ? exam.location.join(" ").toLowerCase()
          : String(exam.location || "").toLowerCase();
        const additionalInfo = exam.additionalInfo || "";
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
            navigationPath: "/",
            navigationState: {
              section: "exames",
              searchResult: {
                type: "exam",
                itemId: exam.id,
                categoryId: categoryId
              }
            },
            itemId: exam.id,
            categoryId: categoryId
          });
        }
      });
    });

    // Search Contacts
    Object.entries(contactData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, groups]) => {
        const groupArray = Array.isArray(groups) ? groups : [];
        groupArray.forEach((group: ContactGroup) => {
          const groupName = group.name || "";
          if (groupName.toLowerCase().includes(lowerTerm)) {
            foundResults.push({
              id: group.id,
              title: group.name,
              content: `Grupo de contatos`,
              type: "Contato",
              section: `${viewType} - Contatos`,
              navigationPath: "/",
              navigationState: {
                section: "contatos",
                searchResult: {
                  type: "contactGroup",
                  itemId: group.id,
                  categoryId: categoryId,
                  viewType: viewType
                }
              },
              itemId: group.id,
              categoryId: categoryId,
              viewType: viewType
            });
          }

          const pointsArray = Array.isArray(group.points) ? group.points : [];
          pointsArray.forEach((point: ContactPoint) => {
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
                navigationPath: "/",
                navigationState: {
                  section: "contatos",
                  searchResult: {
                    type: "contactPoint",
                    itemId: point.id,
                    groupId: group.id,
                    categoryId: categoryId,
                    viewType: viewType
                  }
                },
                itemId: point.id,
                categoryId: categoryId,
                viewType: viewType
              });
            }
          });
        });
      });
    });

    // Search Value Tables
    Object.entries(valueTableData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, items]) => {
        const itemArray = Array.isArray(items) ? items : [];
        itemArray.forEach((item: ValueTableItem) => {
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
              navigationPath: "/",
              navigationState: {
                section: "valores",
                searchResult: {
                  type: "value",
                  itemId: item.id,
                  categoryId: categoryId,
                  viewType: viewType
                }
              },
              itemId: item.id,
              categoryId: categoryId,
              viewType: viewType
            });
          }
        });
      });
    });

    // Search Professionals
    Object.entries(professionalData).forEach(([viewType, categories]) => {
      Object.entries(categories).forEach(([categoryId, professionals]) => {
        const professionalArray = Array.isArray(professionals) ? professionals : [];
        professionalArray.forEach((professional: Professional) => {
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
              navigationPath: "/",
              navigationState: {
                section: "profissionais",
                searchResult: {
                  type: "professional",
                  itemId: professional.id,
                  categoryId: categoryId,
                  viewType: viewType
                }
              },
              itemId: professional.id,
              categoryId: categoryId,
              viewType: viewType
            });
          }
        });
      });
    });

    // Search Offices
    const officeArray = Array.isArray(officeData) ? officeData : [];
    officeArray.forEach((office: Office) => {
      const name = office.name || "";
      const ramal = office.ramal || "";
      const schedule = office.schedule || "";
      // Fix: Use office.specialties instead of undefined 'specialities'
      const specialties = Array.isArray(office.specialties)
        ? office.specialties.join(', ')
        : "";

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
          navigationPath: "/",
          navigationState: {
            section: "consultorios",
            searchResult: {
              type: "office",
              itemId: office.id
            }
          },
          itemId: office.id
        });
      }
    });

    // Search Recados
    Object.entries(recadoData).forEach(([categoryId, items]) => {
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((recado: RecadoItem) => {
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
            navigationPath: "/",
            navigationState: {
              section: "recados",
              searchResult: {
                type: "recado",
                itemId: recado.id,
                categoryId: categoryId
              }
            },
            itemId: recado.id,
            categoryId: categoryId
          });
        }
      });
    });

    // Search Info (Anotações)
    Object.entries(infoData).forEach(([tagId, items]) => {
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((info: InfoItem) => {
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
            navigationPath: "/",
            navigationState: {
              section: "anotacoes",
              searchResult: {
                type: "info",
                itemId: info.id,
                tagId: tagId
              }
            },
            itemId: info.id,
            categoryId: tagId
          });
        }
      });
    });

    // Search Estomaterapia
    Object.entries(estomaterapiaData).forEach(([tagId, items]) => {
      const itemArray = Array.isArray(items) ? items : [];
      itemArray.forEach((info: InfoItem) => {
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
            navigationPath: "/",
            navigationState: {
              section: "estomaterapia",
              searchResult: {
                type: "estomaterapia",
                itemId: info.id,
                tagId: tagId
              }
            },
            itemId: info.id,
            categoryId: tagId
          });
        }
      });
    });

    setSearchResults(foundResults.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(foundResults.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowSearchResults(false);
    setSearchTerm("");

    if (result.navigationPath) {
      // Clear any existing search state in location before navigating
      window.history.replaceState({}, document.title, "/");
      navigate(result.navigationPath, { state: result.navigationState });
    } else {
      navigate("/");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Script":
        return "bg-blue-100 text-blue-800";
      case "Exame":
        return "bg-purple-100 text-purple-800";
      case "Contato":
        return "bg-green-100 text-green-800";
      case "Valor":
        return "bg-yellow-100 text-yellow-800";
      case "Profissional":
        return "bg-pink-100 text-pink-800";
      case "Consultório":
        return "bg-indigo-100 text-indigo-800";
      case "Recado":
        return "bg-cyan-100 text-cyan-800";
      case "Anotação":
        return "bg-teal-100 text-teal-800";
      case "Estomaterapia":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Busca global..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowSearchResults(true)}
          className="pl-10 pr-10 py-1 w-64 bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 border-none focus:ring-2 focus:ring-primary-foreground/50 rounded-lg"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSearchResults([]);
              setShowSearchResults(false);
              // Clear any search state in location
              if ((location.state as any)?.searchResult) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showSearchResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border border-border">
          <div className="py-1">
            {searchResults.map((result) => (
              <button
                key={result.id}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`p-1 rounded ${getTypeColor(result.type).split(' ')[0]}`}>
                    <Search className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{result.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                  </div>
                  <p
                    className="text-xs text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.content, searchTerm) }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{result.section}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            {searchResults.length} resultado(s) encontrado(s)
          </div>
        </Card>
      )}

      {showSearchResults && searchResults.length === 0 && searchTerm && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 py-6 text-center text-muted-foreground shadow-lg">
          <Search className="h-5 w-5 mx-auto mb-2" />
          <p className="text-sm">Nenhum resultado encontrado</p>
        </Card>
      )}
    </div>
  );
};