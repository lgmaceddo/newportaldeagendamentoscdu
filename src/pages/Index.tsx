
import { ScriptsContent } from "@/components/content/ScriptsContent";
import { ExamesContent } from "@/components/content/ExamesContent";
import { ContatosContent } from "@/components/content/ContatosContent";
import { ValoresContent } from "@/components/content/ValoresContent";
import { ProfissionaisContent } from "@/components/content/ProfissionaisContent";
import { ConsultoriosContent } from "@/components/content/ConsultoriosContent";
import { RecadosContent } from "@/components/content/RecadosContent";
import { AnotacoesContent } from "@/components/content/AnotacoesContent";
import { UsuariosContent } from "@/components/content/UsuariosContent";
import { DefaultContent } from "@/components/content/DefaultContent";
import { DashboardContent } from "@/components/content/DashboardContent";
import { useData } from "@/contexts/DataContext";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextType } from "@/layouts/DashboardLayout";

const Index = () => {
  const { currentSection, currentSubCategory } = useOutletContext<DashboardOutletContextType>();
  const {
    scriptCategories,
    scriptData,
    examCategories,
    examData,
    contactCategories,
    contactData,
    valueTableCategories,
    valueTableData,
    professionalData,
    officeData,
    addOffice,
    updateOffice,
    deleteOffice,
    recadoCategories,
    recadoData,
    infoTags,
    infoData,
    estomaterapiaTags,
    estomaterapiaData,
    addEstomaterapiaTag,
    updateEstomaterapiaTag,
    deleteEstomaterapiaTag,
    addEstomaterapiaItem,
    updateEstomaterapiaItem,
    deleteEstomaterapiaItem
  } = useData();

  const renderContent = () => {
    const managedScriptViews = ["UNIMED", "CASSI", "PARTICULAR", "ANESTESIA"];
    const contactViewType = "GERAL";

    if (currentSection === "scripts" && managedScriptViews.includes(currentSubCategory)) {
      return (
        <ScriptsContent
          viewType={currentSubCategory}
          categories={scriptCategories[currentSubCategory] || []}
          data={scriptData[currentSubCategory] || {}}
        />
      );
    }

    if (currentSection === "exames") {
      return (
        <ExamesContent
          categories={examCategories}
          data={examData}
        />
      );
    }

    if (currentSection === "estomaterapia") {
      return (
        <AnotacoesContent
          tags={estomaterapiaTags}
          data={estomaterapiaData}
          onAddTag={addEstomaterapiaTag}
          onUpdateTag={updateEstomaterapiaTag}
          onDeleteTag={deleteEstomaterapiaTag}
          onAddItem={addEstomaterapiaItem}
          onUpdateItem={updateEstomaterapiaItem}
          onDeleteItem={deleteEstomaterapiaItem}
          title="Estomaterapia - Procedimentos e Regras"
          description="Gerencie informações e procedimentos específicos do setor de Estomaterapia."
        />
      );
    }

    if (currentSection === "recados") {
      return (
        <RecadosContent
          categories={recadoCategories}
          data={recadoData}
        />
      );
    }

    if (currentSection === "anotacoes") {
      return (
        <AnotacoesContent
          tags={infoTags}
          data={infoData}
        />
      );
    }

    if (currentSection === "config") {
      return <DashboardContent />;
    }

    if (currentSection === "usuarios") {
      return <UsuariosContent />;
    }

    if (currentSection === "contatos") {
      return (
        <ContatosContent
          viewType={contactViewType}
          categories={contactCategories[contactViewType] || []}
          data={contactData[contactViewType] || {}}
        />
      );
    }

    if (currentSection === "valores") {
      return (
        <ValoresContent
          categories={valueTableCategories.GERAL || []}
          data={valueTableData.GERAL || {}}
        />
      );
    }

    if (currentSection === "profissionais") {
      return (
        <ProfissionaisContent
          data={professionalData.GERAL["prof-cat-1"] || []}
        />
      );
    }

    if (currentSection === "consultorios") {
      return (
        <ConsultoriosContent
          data={officeData}
          onAdd={addOffice}
          onUpdate={updateOffice}
          onDelete={deleteOffice}
        />
      );
    }

    return (
      <DefaultContent
        section={currentSection}
        subCategory={currentSubCategory}
      />
    );
  };

  return renderContent();
};

export default Index;