export interface Category {
  id: string;
  name: string;
  color: string;
  order?: number;
}

export interface ScriptItem {
  id: string;
  title: string;
  content: string;
  order?: number; // NOVO: Campo de ordenação opcional
}

export interface SchedulingRule {
  type: 'indication' | 'restriction';
  fromDoctor: string;
  toDoctor: string;
  fromGender?: 'masculino' | 'feminino';
  toGender?: 'masculino' | 'feminino';
}

export interface ExamItem {
  id: string;
  title: string;
  location: string[]; // Alterado para array de strings para seleção múltipla
  // setor?: string[]; // REMOVIDO
  // extension: string; // REMOVIDO
  additionalInfo: string;
  schedulingRules: string; // Mantendo como string para compatibilidade
  valueTableCode?: string; // NOVO: Código do exame na tabela de valores, se aplicável
}

// --- NOVOS TIPOS DE CONTATO ---
export interface ContactPoint {
  id: string;
  setor: string; // Nome do ponto de contato (ex: Recepção RX)
  local: string;
  ramal: string;
  telefone: string;
  whatsapp: string;
  // description: string; // REMOVIDO: Descrição/Notas
}

export interface ContactGroup {
  id: string;
  name: string; // Nome do Grupo/Setor Principal (ex: Setor de Imagens)
  points: ContactPoint[];
}

// O antigo ContactItem agora é ContactGroup para manter a compatibilidade com a estrutura Record<string, ContactItem[]> no DataContext
export type ContactItem = ContactGroup;
// FIM NOVOS TIPOS DE CONTOS

export interface DiferenciatedFee {
  id: string;
  profissional: string;
  valor: number;
  genero: 'masculino' | 'feminino';
}

export interface ValueTableItem {
  id: string;
  codigo: string;
  nome: string;
  info: string;
  honorario: number;
  exame_cartao: number;
  material_min: number;
  material_max: number;
  honorarios_diferenciados: DiferenciatedFee[];
}

export interface DetailedExam {
  name: string;
  category: string;
}

export interface ExamDetail {
  examId: string;
  observations: string;
  preparation: string;
  withAnesthesia: boolean;
  anesthesiaInstructions?: string;
}

export interface Professional {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino';
  specialty: string;
  ageRange: string;
  fittings: {
    allowed: boolean;
    max: number;
    details: string;
  };
  generalObs: string;
  performedExams: ExamDetail[];
}

export interface OfficeAttendant {
  id: string;
  name: string;
  username: string;
  shift: string;
}

export interface OfficeProfessional {
  name: string;
  specialty: string;
  actuationDescription?: string;
}

export interface OfficeCategory {
  id: string;
  name: string;
  color: string;
}

export interface OfficeItem {
  id: string;
  title: string;
  content: string;
  info?: string; // Informações adicionais
}

export interface Office {
  id: string;
  name: string;
  ramal: string;
  schedule: string;
  specialties: string[];
  attendants: OfficeAttendant[];
  professionals: OfficeProfessional[];
  procedures: string[];
  categories: OfficeCategory[]; // Categorias para informações detalhadas
  items: Record<string, OfficeItem[]>; // Itens organizados por categoria
}

export interface HeaderTagInfo {
  id: string;
  tag: string;
  title: string;
  address?: string;
  phones?: { label: string; number: string }[];
  whatsapp?: string;
  contacts?: { name: string; phone: string; ramal: string }[];
}

export interface ExamDeliveryAttendant {
  id: string;
  name: string;
  chatNick: string;
}

export interface RecadoCategory {
  id: string;
  title: string;
  description: string;
  destinationType: 'attendant' | 'group';
  groupName?: string;
  attendants?: { id: string; name: string; chatNick: string }[];
}

export interface RecadoItem {
  id: string;
  title: string;
  content: string;
  fields: string[];
}

// --- NOVOS TIPOS PARA INFORMAÇÕES/REGRAS ---
export interface InfoTag {
  id: string;
  name: string;
  color: string; // Para estilização
  order?: number;
  user_id?: string; // NOVO: Para identificar o proprietário (privacidade)
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  dataUrl: string; // Base64 content
  size: number; // in bytes
}

export interface InfoItem {
  id: string;
  title: string;
  content: string; // O corpo da regra/procedimento
  tagId: string;
  date: string; // Data de criação/atualização
  attachments: Attachment[]; // NOVO CAMPO
  info?: string; // Adicionando o campo info (Informações Adicionais)
  user_id?: string; // NOVO: Para identificar o proprietário (privacidade)
}