import { Category, ScriptItem, ExamItem, ContactItem, ContactPoint, ValueTableItem, Professional, DetailedExam, Office, HeaderTagInfo, ExamDeliveryAttendant, RecadoCategory, RecadoItem, InfoTag, InfoItem, OfficeCategory } from "@/types/data";
import { Notice } from "@/types/notice";

export const scriptCategories: Record<string, Category[]> = {
  UNIMED: [
    { id: "un-cat-1", name: "CONSULTAS", color: "text-teal-800" },
    { id: "un-cat-2", name: "EXAMES", color: "text-blue-800" },
  ],
  CASSI: [],
  ANESTESIA: [],
  PARTICULAR: [],
};

export const scriptData: Record<string, Record<string, ScriptItem[]>> = {
  UNIMED: {
    "un-cat-1": [
      {
        id: "s-1",
        title: "Consulta Particular",
        content: "Olá! A consulta particular tem valor de R$ 200,00.\n\nForma de pagamento:\n- Cartão (débito/crédito)\n- Dinheiro\n- PIX",
      },
    ],
    "un-cat-2": [],
  },
  CASSI: {},
  PARTICULAR: {},
  ANESTESIA: {},
};

// --- EXAMES CONSOLIDATED STRUCTURE ---
// Categories are now a flat array
export const examCategories: Category[] = [
  { id: "ex-cat-1", name: "ULTRASSOM", color: "text-green-800" },
  { id: "ex-cat-2", name: "RAIO X", color: "text-red-800" },
];

// Data is now a map of CategoryId to ExamItem[]
export const examData: Record<string, ExamItem[]> = {
  "ex-cat-1": [
    {
      id: "e-1",
      title: "USG Abdômen Total",
      location: "CDU", // Fixed: Changed from array to string
      setor: ["1º Andar"], // Added setor field
      extension: "2110",
      additionalInfo: "Necessário jejum de 8 horas.",
      schedulingRules: "", // Fixed: Changed from [] to ""
    },
  ],
  "ex-cat-2": [],
};

// --- END EXAMES CONSOLIDATED STRUCTURE ---

export const contactCategories: Record<string, Category[]> = {
  GERAL: [
    { id: "cont-cat-geral", name: "GERAL", color: "text-indigo-800" },
  ],
};

// ContactData now holds ContactGroup[]
export const contactData: Record<string, Record<string, ContactItem[]>> = {
  GERAL: {
    "cont-cat-geral": [
      {
        id: "cg-1",
        name: "Recepção Geral",
        points: [
          {
            id: "cp-1",
            setor: "Recepção Principal",
            local: "Térreo",
            ramal: "1000",
            telefone: "(14) 3235-3333",
            whatsapp: "(14) 99999-1111",
            description: "Ponto de contato principal para informações gerais e agendamentos.",
          },
        ],
      },
      {
        id: "cg-2",
        name: "Setor de Imagens",
        points: [
          {
            id: "cp-2",
            setor: "Recepção RX",
            local: "1º Andar",
            ramal: "1001",
            telefone: "",
            whatsapp: "",
            description: "Contato para dúvidas sobre Raio X.",
          },
          {
            id: "cp-3",
            setor: "Tomografia",
            local: "1º Andar",
            ramal: "1002",
            telefone: "",
            whatsapp: "",
            description: "Contato para agendamento e dúvidas sobre Tomografia.",
          },
        ],
      },
    ],
  },
};

export const valueTableCategories: Record<string, Category[]> = {
  GERAL: [
    { id: "vt-cat-geral", name: "GERAL", color: "text-primary" },
  ],
};

export const valueTableData: Record<string, Record<string, ValueTableItem[]>> = {
  GERAL: {
    "vt-cat-geral": [],
  },
};

export const detailedExamData: Record<string, DetailedExam> = {
  "usg-abdomen": {
    name: "USG Abdômen Total",
    category: "ULTRASSOM",
  },
  "raio-x-torax": {
    name: "Raio X de Tórax",
    category: "RAIO X",
  },
  "endoscopia": {
    name: "Endoscopia",
    category: "ENDOSCOPIA",
  },
};

export const professionalData: Record<string, Record<string, Professional[]>> = {
  GERAL: {
    "prof-cat-1": [
      {
        id: "p-1",
        name: "SILVA",
        gender: "masculino",
        specialty: "Gastroenterologia",
        ageRange: "Adultos",
        fittings: {
          allowed: true,
          max: 2,
          details: "Apenas encaixes urgentes.",
        },
        generalObs: "Atende apenas às terças e quintas.",
        performedExams: [
          {
            examId: "endoscopia",
            observations: "Requer sedação leve.",
            preparation: "Jejum de 12h.",
            withAnesthesia: false,
            anesthesiaInstructions: "",
          },
        ],
      },
    ],
  },
};

// Definindo a categoria padrão para consultórios
const defaultOfficeCategory: OfficeCategory = {
  id: "office-cat-default",
  name: "Informações do Setor",
  color: "text-blue-800",
};

// Categoria de exemplo para o consultório
const exampleOfficeCategory: OfficeCategory = {
  id: "office-cat-procedimentos",
  name: "Procedimentos Comuns",
  color: "text-green-800",
};

export const officeData: Office[] = [
  {
    id: "o-1",
    name: "1º Andar",
    ramal: "2110",
    schedule: "08:00 - 18:00",
    specialties: ["Gastroenterologia", "Cardiologia"],
    attendants: [
      { id: "a-1", name: "Ana Paula", username: "Ana", shift: "Integral" },
    ],
    professionals: [
      { name: "DRº. SILVA", specialty: "Gastroenterologia", actuationDescription: "Especialista em Endoscopia" },
    ],
    procedures: ["Endoscopia", "Colonoscopia"],
    categories: [defaultOfficeCategory, exampleOfficeCategory], // Adicionando categoria padrão e de exemplo
    items: {
      [exampleOfficeCategory.id]: [
        {
          id: "oi-1",
          title: "Fluxo de Agendamento de Endoscopia",
          content: "Verificar jejum de 12h. Confirmar se o paciente tem acompanhante. Se for menor de idade, precisa de termo de consentimento assinado pelos pais.",
          info: "O agendamento deve ser feito com a Ana Paula (ramal 2110) ou diretamente no sistema X.",
        }
      ],
    }, // Inicializando items
  },
];

export const noticeData: Notice[] = [
  {
    id: "n-1",
    title: "Novo Fluxo de Autorização",
    content: "A partir de hoje, todas as solicitações de autorização devem ser enviadas via sistema X.",
    date: new Date().toLocaleDateString("pt-BR"),
    tag: "FLUXO", // Adicionando tag
  },
];

export const headerTagData: HeaderTagInfo[] = [
  {
    id: "tag-1",
    tag: "CDU",
    title: "Central de Diagnóstico Unimed",
    address: "Rua X, 123 - Centro",
    phones: [
      { label: "Agendamento", number: "(14) 3235-3333" },
    ],
    whatsapp: "(14) 99999-1111",
    contacts: [],
  },
  {
    id: "tag-3",
    tag: "SEDE",
    title: "Unimed Bauru",
    address: "Av. Nações Unidas, 12-01 - Jardim Redentor",
    phones: [
      { label: "Recepção", number: "(14) 3235-3333" },
      { label: "Financeiro", number: "(14) 3235-3300" },
    ],
    whatsapp: "(14) 99999-1111",
    contacts: [],
  },
  {
    id: "tag-2",
    tag: "GERENCIA",
    title: "Contatos da Gerência",
    address: "",
    phones: [],
    whatsapp: "",
    contacts: [
      { name: "João", phone: "(14) 99999-2222", ramal: "100" },
    ],
  },
];

export const examDeliveryAttendants: ExamDeliveryAttendant[] = [
  { id: "eda-1", name: "Maria", chatNick: "Maria_Exames" },
];

export const recadoCategories: RecadoCategory[] = [
  {
    id: "rc-1",
    title: "Autorização",
    description: "Recados para o setor de Autorização de Guias.",
    destinationType: "group",
    groupName: "Grupo Autorização",
  },
];

export const recadoData: Record<string, RecadoItem[]> = {
  "rc-1": [
    {
      id: "ri-1",
      title: "Solicitação de Guia",
      content: "Prezados, solicito a autorização da guia para o paciente [paciente].\n\nGuia: [guia]\n\nObrigado!\n[nome] / Agendamento",
      fields: ["paciente", "guia"],
    },
  ],
};

// --- NOVOS DADOS PARA INFORMAÇÕES/REGRAS ---
export const infoTags: InfoTag[] = [
  { id: "it-1", name: "Regras Gerais", color: "text-teal-800" },
  { id: "it-2", name: "Novos Procedimentos", color: "text-blue-800" },
];

export const infoData: Record<string, InfoItem[]> = {
  "it-1": [
    {
      id: "ii-1",
      title: "Fluxo de Agendamento de USG",
      content: "1. Verificar elegibilidade do paciente.\n2. Confirmar jejum de 8h.\n3. Agendar no sistema X.",
      tagId: "it-1",
      date: new Date().toLocaleDateString("pt-BR"),
      attachments: [],
    },
  ],
  "it-2": [],
};

// --- NOVOS DADOS PARA ESTOMATERAPIA ---
export const estomaterapiaTags: InfoTag[] = [
  { id: "est-tag-1", name: "Curativos", color: "text-purple-800" },
  { id: "est-tag-2", name: "Ostomias", color: "text-pink-800" },
];

export const estomaterapiaData: Record<string, InfoItem[]> = {
  "est-tag-1": [
    {
      id: "est-item-1",
      title: "Regra de Agendamento de Curativos",
      content: "O agendamento de curativos deve ser feito diretamente com a enfermeira responsável, ramal 1234.",
      tagId: "est-tag-1",
      date: new Date().toLocaleDateString("pt-BR"),
      attachments: [],
    },
  ],
  "est-tag-2": [],
};