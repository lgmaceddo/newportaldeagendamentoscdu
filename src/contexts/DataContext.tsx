import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Category,
  ScriptItem,
  ExamItem,
  ContactItem, // Alias for ContactGroup
  ContactGroup, // New type
  ContactPoint, // New type
  ValueTableItem,
  Professional,
  Office,
  HeaderTagInfo,
  ExamDeliveryAttendant,
  RecadoCategory,
  RecadoItem,
  InfoTag,
  InfoItem,
  DiferenciatedFee
} from '@/types/data';
import {
  scriptCategories as initialScriptCategories,
  scriptData as initialScriptData,
  examCategories as initialExamCategories,
  examData as initialExamData,
  contactCategories as initialContactCategories,
  contactData as initialContactData,
  valueTableCategories as initialValueTableCategories,
  valueTableData as initialValueTableData,
  professionalData as initialProfessionalData,
  officeData as initialOfficeData,
  noticeData as initialNoticeData,
  headerTagData as initialHeaderTagData,
  examDeliveryAttendants as initialExamDeliveryAttendants,
  recadoCategories as initialRecadoCategories,
  recadoData as initialRecadoData,
  infoTags as initialInfoTags,
  infoData as initialInfoData,
  estomaterapiaTags as initialEstomaterapiaTags,
  estomaterapiaData as initialEstomaterapiaData
} from '@/data/initialData';
import { Notice } from '@/types/notice';
import { arrayMove } from '@dnd-kit/sortable';

interface DataContextType {
  // User Name
  userName: string;
  setUserName: (name: string) => void;

  // Header Tags
  headerTagData: HeaderTagInfo[];
  updateHeaderTag: (id: string, updates: Omit<HeaderTagInfo, 'id' | 'tag'>) => void;

  // Scripts
  scriptCategories: Record<string, Category[]>;
  scriptData: Record<string, Record<string, ScriptItem[]>>;
  addScriptCategory: (viewType: string, category: Category) => void;
  updateScriptCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteScriptCategory: (viewType: string, categoryId: string) => void;
  reorderScriptCategories: (viewType: string, oldIndex: number, newIndex: number) => void; // NOVO
  addScript: (viewType: string, categoryId: string, script: ScriptItem) => void;
  updateScript: (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => void;
  deleteScript: (viewType: string, categoryId: string, scriptId: string) => void;

  // Exams
  examCategories: Category[];
  examData: Record<string, ExamItem[]>;
  addExamCategory: (category: Category) => void;
  updateExamCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteExamCategory: (categoryId: string) => void;
  reorderExamCategories: (oldIndex: number, newIndex: number) => void; // NOVO
  addExam: (categoryId: string, exam: ExamItem) => void;
  updateExam: (categoryId: string, examId: string, updates: Partial<ExamItem>) => void;
  deleteExam: (categoryId: string, examId: string) => void;
  syncValueTableToExams: () => void;

  // Contacts (Updated to handle Groups and Points)
  contactCategories: Record<string, Category[]>;
  contactData: Record<string, Record<string, ContactGroup[]>>; // Changed ContactItem[] to ContactGroup[]
  addContactCategory: (viewType: string, category: Category) => void;
  updateContactCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteContactCategory: (viewType: string, categoryId: string) => void;
  reorderContactCategories: (viewType: string, oldIndex: number, newIndex: number) => void;

  // Group CRUD
  addContactGroup: (viewType: string, categoryId: string, group: Omit<ContactGroup, 'id' | 'points'>) => void;
  updateContactGroup: (viewType: string, categoryId: string, groupId: string, updates: Partial<ContactGroup>) => void;
  deleteContactGroup: (viewType: string, categoryId: string, groupId: string) => void;

  // Point CRUD
  addContactPoint: (viewType: string, categoryId: string, groupId: string, point: Omit<ContactPoint, 'id'>) => void;
  updateContactPoint: (viewType: string, categoryId: string, groupId: string, pointId: string, updates: Partial<ContactPoint>) => void;
  deleteContactPoint: (viewType: string, categoryId: string, groupId: string, pointId: string) => void;

  // Value Tables
  valueTableCategories: Record<string, Category[]>;
  valueTableData: Record<string, Record<string, ValueTableItem[]>>;
  addValueCategory: (viewType: string, category: Category) => void;
  updateValueCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteValueCategory: (viewType: string, categoryId: string) => void;
  reorderValueCategories: (viewType: string, oldIndex: number, newIndex: number) => void; // NOVO
  addValueTable: (viewType: string, categoryId: string, item: Omit<ValueTableItem, 'id'>) => void;
  moveAndUpdateValueTable: (viewType: string, oldCategoryId: string, newCategoryId: string, itemId: string, updates: Partial<ValueTableItem>) => void;
  deleteValueTable: (viewType: string, categoryId: string, itemId: string) => void;

  // Professionals
  professionalData: Record<string, Record<string, Professional[]>>;
  addProfessional: (viewType: string, categoryId: string, professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (viewType: string, categoryId: string, professionalId: string, updates: Partial<Professional>) => void;
  deleteProfessional: (viewType: string, categoryId: string, professionalId: string) => void;

  // Offices
  officeData: Office[];
  addOffice: (office: Omit<Office, 'id'>) => void;
  updateOffice: (office: Office) => void;
  deleteOffice: (id: string) => void;

  // Notices
  noticeData: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;

  // Exam Delivery Attendants
  examDeliveryAttendants: ExamDeliveryAttendant[];
  addExamDeliveryAttendant: (attendant: Omit<ExamDeliveryAttendant, 'id'>) => void;
  updateExamDeliveryAttendant: (attendant: ExamDeliveryAttendant) => void;
  deleteExamDeliveryAttendant: (id: string) => void;

  // Recados
  recadoCategories: RecadoCategory[];
  recadoData: Record<string, RecadoItem[]>;
  addRecadoCategory: (category: Omit<RecadoCategory, 'id'>) => void;
  updateRecadoCategory: (category: RecadoCategory) => void;
  deleteRecadoCategory: (id: string) => void;
  reorderRecadoCategories: (oldIndex: number, newIndex: number) => void; // NOVO
  addRecadoItem: (categoryId: string, item: Omit<RecadoItem, 'id'>) => void;
  updateRecadoItem: (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => void;
  deleteRecadoItem: (categoryId: string, itemId: string) => void;

  // Info (Anotações)
  infoTags: InfoTag[];
  infoData: Record<string, InfoItem[]>;
  addInfoTag: (tag: Omit<InfoTag, 'id'>) => void;
  updateInfoTag: (tag: InfoTag) => void;
  deleteInfoTag: (tagId: string) => void;
  reorderInfoTags: (oldIndex: number, newIndex: number) => void; // NOVO
  addInfoItem: (item: Omit<InfoItem, 'id' | 'date'>) => void;
  updateInfoItem: (item: InfoItem) => void;
  deleteInfoItem: (itemId: string, tagId: string) => void;

  // Estomaterapia
  estomaterapiaTags: InfoTag[];
  estomaterapiaData: Record<string, InfoItem[]>;
  addEstomaterapiaTag: (tag: Omit<InfoTag, 'id'>) => void;
  updateEstomaterapiaTag: (tag: InfoTag) => void;
  deleteEstomaterapiaTag: (tagId: string) => void;
  reorderEstomaterapiaTags: (oldIndex: number, newIndex: number) => void; // NOVO
  addEstomaterapiaItem: (item: Omit<InfoItem, 'id' | 'date'>) => void;
  updateEstomaterapiaItem: (item: InfoItem) => void;
  deleteEstomaterapiaItem: (itemId: string, tagId: string) => void;

  // Data Management
  hasUnsavedChanges: boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => Promise<boolean>;
  loadExamsFromDatabase: () => Promise<void>;

  // Funções de substituição total (para importação de Excel)
  setValueTableDataAndCategories: (viewType: string, categories: Category[], data: Record<string, ValueTableItem[]>) => Promise<void>;
  bulkUpsertValueTable?: (viewType: string, categoryId: string, items: Omit<ValueTableItem, 'id'>[]) => Promise<{ updated: number; created: number }>;
  isLoading?: boolean;
  syncAllDataFromSupabase?: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Função auxiliar para reindexar scripts mantendo ordem numérica
const reindexScripts = (scripts: ScriptItem[]): ScriptItem[] => {
  // Primeiro, ordena os scripts existentes por ordem atual
  const sortedScripts = [...scripts].sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.title.localeCompare(b.title, 'pt-BR');
  });

  // Depois, reatribui números sequenciais começando de 1
  return sortedScripts.map((script, index) => ({
    ...script,
    order: index + 1
  }));
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User Name State
  const [userName, setUserName] = useState<string>('');

  // Header Tags State
  const [headerTagData, setHeaderTagData] = useState<HeaderTagInfo[]>(initialHeaderTagData);

  // Scripts State
  const [scriptCategories, setScriptCategories] = useState<Record<string, Category[]>>(initialScriptCategories);
  const [scriptData, setScriptData] = useState<Record<string, Record<string, ScriptItem[]>>>(initialScriptData);

  // Exams State
  const [examCategories, setExamCategories] = useState<Category[]>(initialExamCategories);
  const [examData, setExamData] = useState<Record<string, ExamItem[]>>(initialExamData);

  // Contacts State
  const [contactCategories, setContactCategories] = useState<Record<string, Category[]>>(initialContactCategories);
  // IMPORTANT: contactData now holds ContactGroup[]
  const [contactData, setContactData] = useState<Record<string, Record<string, ContactGroup[]>>>(initialContactData as Record<string, Record<string, ContactGroup[]>>);

  // Value Tables State
  const [valueTableCategories, setValueTableCategories] = useState<Record<string, Category[]>>(initialValueTableCategories);
  const [valueTableData, setValueTableData] = useState<Record<string, Record<string, ValueTableItem[]>>>(initialValueTableData);

  // Professionals State
  const [professionalData, setProfessionalData] = useState<Record<string, Record<string, Professional[]>>>(initialProfessionalData);

  // Offices State
  const [officeData, setOfficeData] = useState<Office[]>(initialOfficeData);

  // Notices State
  const [noticeData, setNoticeData] = useState<Notice[]>(initialNoticeData);

  // Exam Delivery Attendants State
  const [examDeliveryAttendants, setExamDeliveryAttendants] = useState<ExamDeliveryAttendant[]>(initialExamDeliveryAttendants);

  // Recados State
  const [recadoCategories, setRecadoCategories] = useState<RecadoCategory[]>(initialRecadoCategories);
  const [recadoData, setRecadoData] = useState<Record<string, RecadoItem[]>>(initialRecadoData);

  // Info (Anotações) State
  const [infoTags, setInfoTags] = useState<InfoTag[]>(initialInfoTags);
  const [infoData, setInfoData] = useState<Record<string, InfoItem[]>>(initialInfoData);

  // Estomaterapia State
  const [estomaterapiaTags, setEstomaterapiaTags] = useState<InfoTag[]>(initialEstomaterapiaTags);
  const [estomaterapiaData, setEstomaterapiaData] = useState<Record<string, InfoItem[]>>(initialEstomaterapiaData);

  // Data Management State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Header Tags Functions
  const updateHeaderTag = (id: string, updates: Omit<HeaderTagInfo, 'id' | 'tag'>) => {
    setHeaderTagData(prev => prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
    setHasUnsavedChanges(true);
  };

  // Scripts Functions (omitted for brevity, no changes here)
  const addScriptCategory = (viewType: string, category: Category) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category]
    }));
    setScriptData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [category.id]: []
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateScriptCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].map(cat => cat.id === categoryId ? { ...cat, ...updates } : cat)
    }));
    setHasUnsavedChanges(true);
  };

  const deleteScriptCategory = (viewType: string, categoryId: string) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].filter(cat => cat.id !== categoryId)
    }));
    setScriptData(prev => {
      const viewData = prev[viewType] || {};
      const { [categoryId]: deleted, ...rest } = viewData;
      return {
        ...prev,
        [viewType]: rest
      };
    });
    setHasUnsavedChanges(true);
  };

  const reorderScriptCategories = (viewType: string, oldIndex: number, newIndex: number) => {
    setScriptCategories(prev => ({
      ...prev,
      [viewType]: arrayMove(prev[viewType], oldIndex, newIndex)
    }));
    setHasUnsavedChanges(true);
  };

  const addScript = (viewType: string, categoryId: string, script: ScriptItem) => {
    setScriptData(prev => {
      const currentScripts = prev[viewType]?.[categoryId] || [];
      const newScript = {
        ...script,
        // Se não tiver ordem definida, coloca no final
        order: script.order || currentScripts.length + 1
      };

      // Adiciona o novo script e reindexa todos
      const updatedScripts = [...currentScripts, newScript];
      const reindexedScripts = reindexScripts(updatedScripts);

      return {
        ...prev,
        [viewType]: {
          ...prev[viewType],
          [categoryId]: reindexedScripts
        }
      };
    });
    setHasUnsavedChanges(true);
  };

  const updateScript = (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    setScriptData(prev => {
      const currentScripts = prev[viewType]?.[categoryId] || [];
      const updatedScripts = currentScripts.map(script =>
        script.id === scriptId ? { ...script, ...updates } : script
      );

      // Se a ordem foi alterada, reindexa todos
      const shouldReindex = 'order' in updates;
      const finalScripts = shouldReindex ? reindexScripts(updatedScripts) : updatedScripts;

      return {
        ...prev,
        [viewType]: {
          ...prev[viewType],
          [categoryId]: finalScripts
        }
      };
    });
    setHasUnsavedChanges(true);
  };

  const deleteScript = (viewType: string, categoryId: string, scriptId: string) => {
    setScriptData(prev => {
      const currentScripts = prev[viewType]?.[categoryId] || [];
      const filteredScripts = currentScripts.filter(script => script.id !== scriptId);

      // Reindexa os scripts restantes para manter numeração sequencial
      const reindexedScripts = reindexScripts(filteredScripts);

      return {
        ...prev,
        [viewType]: {
          ...prev[viewType],
          [categoryId]: reindexedScripts
        }
      };
    });
    setHasUnsavedChanges(true);
  };

  // Exams Functions (omitted for brevity, no changes here)
  const addExamCategory = (category: Category) => {
    setExamCategories(prev => [...prev, category]);
    setExamData(prev => ({
      ...prev,
      [category.id]: []
    }));
    setHasUnsavedChanges(true);
  };

  const updateExamCategory = (categoryId: string, updates: Partial<Category>) => {
    setExamCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, ...updates } : cat));
    setHasUnsavedChanges(true);
  };

  const deleteExamCategory = (categoryId: string) => {
    setExamCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setExamData(prev => {
      const { [categoryId]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const reorderExamCategories = (oldIndex: number, newIndex: number) => {
    setExamCategories(prev => arrayMove(prev, oldIndex, newIndex));
    setHasUnsavedChanges(true);
  };

  const addExam = (categoryId: string, exam: ExamItem) => {
    setExamData(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), exam]
    }));
    setHasUnsavedChanges(true);
  };

  const updateExam = (categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    setExamData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).map(exam =>
        exam.id === examId ? { ...exam, ...updates } : exam
      )
    }));
    setHasUnsavedChanges(true);
  };

  const deleteExam = (categoryId: string, examId: string) => {
    setExamData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(exam => exam.id !== examId)
    }));
    setHasUnsavedChanges(true);
  };

  // Sync Value Table to Exams
  const syncValueTableToExams = () => {
    // This is a placeholder implementation
    // In a real app, this would sync data from valueTableData to examData
    setHasUnsavedChanges(true);
  };

  // Contacts Functions (UPDATED)
  const addContactCategory = (viewType: string, category: Category) => {
    setContactCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category]
    }));
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [category.id]: []
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateContactCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setContactCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].map(cat => cat.id === categoryId ? { ...cat, ...updates } : cat)
    }));
    setHasUnsavedChanges(true);
  };

  const deleteContactCategory = (viewType: string, categoryId: string) => {
    setContactCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].filter(cat => cat.id !== categoryId)
    }));
    setContactData(prev => {
      const viewData = prev[viewType] || {};
      const { [categoryId]: deleted, ...rest } = viewData;
      return {
        ...prev,
        [viewType]: rest
      };
    });
    setHasUnsavedChanges(true);
  };

  const reorderContactCategories = (viewType: string, oldIndex: number, newIndex: number) => {
    setContactCategories(prev => ({
      ...prev,
      [viewType]: arrayMove(prev[viewType], oldIndex, newIndex)
    }));
    setHasUnsavedChanges(true);
  };

  // Group CRUD
  const addContactGroup = (viewType: string, categoryId: string, group: Omit<ContactGroup, 'id' | 'points'>) => {
    const newGroup: ContactGroup = {
      ...group,
      id: `cg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: []
    };
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), newGroup]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateContactGroup = (viewType: string, categoryId: string, groupId: string, updates: Partial<ContactGroup>) => {
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(group =>
          group.id === groupId ? { ...group, ...updates } : group
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  const deleteContactGroup = (viewType: string, categoryId: string, groupId: string) => {
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(group => group.id !== groupId)
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Point CRUD
  const addContactPoint = (viewType: string, categoryId: string, groupId: string, point: Omit<ContactPoint, 'id'>) => {
    const newPoint: ContactPoint = {
      ...point,
      id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(group =>
          group.id === groupId ? { ...group, points: [...group.points, newPoint] } : group
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateContactPoint = (viewType: string, categoryId: string, groupId: string, pointId: string, updates: Partial<ContactPoint>) => {
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(group =>
          group.id === groupId ? {
            ...group,
            points: group.points.map(point =>
              point.id === pointId ? { ...point, ...updates } : point
            )
          } : group
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  const deleteContactPoint = (viewType: string, categoryId: string, groupId: string, pointId: string) => {
    setContactData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(group =>
          group.id === groupId ? {
            ...group,
            points: group.points.filter(point => point.id !== pointId)
          } : group
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Value Tables Functions (omitted for brevity, no changes here)
  const addValueCategory = (viewType: string, category: Category) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: [...(prev[viewType] || []), category]
    }));
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [category.id]: []
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateValueCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].map(cat => cat.id === categoryId ? { ...cat, ...updates } : cat)
    }));
    setHasUnsavedChanges(true);
  };

  const deleteValueCategory = (viewType: string, categoryId: string) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: prev[viewType].filter(cat => cat.id !== categoryId)
    }));
    setValueTableData(prev => {
      const viewData = prev[viewType] || {};
      const { [categoryId]: deleted, ...rest } = viewData;
      return {
        ...prev,
        [viewType]: rest
      };
    });
    setHasUnsavedChanges(true);
  };

  const reorderValueCategories = (viewType: string, oldIndex: number, newIndex: number) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: arrayMove(prev[viewType], oldIndex, newIndex)
    }));
    setHasUnsavedChanges(true);
  };

  const addValueTable = (viewType: string, categoryId: string, item: Omit<ValueTableItem, 'id'>) => {
    const newItem: ValueTableItem = {
      ...item,
      id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), newItem]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const moveAndUpdateValueTable = (viewType: string, oldCategoryId: string, newCategoryId: string, itemId: string, updates: Partial<ValueTableItem>) => {
    setValueTableData(prev => {
      const currentViewData = prev[viewType] || {};
      const oldCategoryItems = currentViewData[oldCategoryId] || [];
      const itemToUpdate = oldCategoryItems.find(item => item.id === itemId);

      if (!itemToUpdate) return prev;

      const updatedItem: ValueTableItem = { ...itemToUpdate, ...updates };

      if (oldCategoryId === newCategoryId) {
        // Apenas atualiza dentro da mesma categoria
        return {
          ...prev,
          [viewType]: {
            ...currentViewData,
            [oldCategoryId]: oldCategoryItems.map(item =>
              item.id === itemId ? updatedItem : item
            )
          }
        };
      } else {
        // Move para a nova categoria
        const newCategoryItems = currentViewData[newCategoryId] || [];

        return {
          ...prev,
          [viewType]: {
            ...currentViewData,
            // Remove da categoria antiga
            [oldCategoryId]: oldCategoryItems.filter(item => item.id !== itemId),
            // Adiciona na nova categoria
            [newCategoryId]: [...newCategoryItems, updatedItem]
          }
        };
      }
    });
    setHasUnsavedChanges(true);
  };

  const deleteValueTable = (viewType: string, categoryId: string, itemId: string) => {
    setValueTableData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(item => item.id !== itemId)
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Professionals Functions (omitted for brevity, no changes here)
  const addProfessional = (viewType: string, categoryId: string, professional: Omit<Professional, 'id'>) => {
    const newProfessional: Professional = {
      ...professional,
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: [...(prev[viewType]?.[categoryId] || []), newProfessional]
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateProfessional = (viewType: string, categoryId: string, professionalId: string, updates: Partial<Professional>) => {
    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).map(professional =>
          professional.id === professionalId ? { ...professional, ...updates } : professional
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  const deleteProfessional = (viewType: string, categoryId: string, professionalId: string) => {
    setProfessionalData(prev => ({
      ...prev,
      [viewType]: {
        ...prev[viewType],
        [categoryId]: (prev[viewType]?.[categoryId] || []).filter(professional => professional.id !== professionalId)
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Offices Functions (omitted for brevity, no changes here)
  const addOffice = (office: Omit<Office, 'id'>) => {
    const newOffice: Office = {
      ...office,
      id: `o-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setOfficeData(prev => [...prev, newOffice]);
    setHasUnsavedChanges(true);
  };

  const updateOffice = (office: Office) => {
    setOfficeData(prev => prev.map(o => o.id === office.id ? office : o));
    setHasUnsavedChanges(true);
  };

  const deleteOffice = (id: string) => {
    setOfficeData(prev => prev.filter(office => office.id !== id));
    setHasUnsavedChanges(true);
  };

  // Notices Functions (omitted for brevity, no changes here)
  const addNotice = (notice: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...notice,
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setNoticeData(prev => [...prev, newNotice]);
    setHasUnsavedChanges(true);
  };

  const updateNotice = (notice: Notice) => {
    setNoticeData(prev => prev.map(n => n.id === notice.id ? notice : n));
    setHasUnsavedChanges(true);
  };

  const deleteNotice = (id: string) => {
    setNoticeData(prev => prev.filter(notice => notice.id !== id));
    setHasUnsavedChanges(true);
  };

  // Exam Delivery Attendants Functions (omitted for brevity, no changes here)
  const addExamDeliveryAttendant = (attendant: Omit<ExamDeliveryAttendant, 'id'>) => {
    const newAttendant: ExamDeliveryAttendant = {
      ...attendant,
      id: `eda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setExamDeliveryAttendants(prev => [...prev, newAttendant]);
    setHasUnsavedChanges(true);
  };

  const updateExamDeliveryAttendant = (attendant: ExamDeliveryAttendant) => {
    setExamDeliveryAttendants(prev => prev.map(a => a.id === attendant.id ? attendant : a));
    setHasUnsavedChanges(true);
  };

  const deleteExamDeliveryAttendant = (id: string) => {
    setExamDeliveryAttendants(prev => prev.filter(attendant => attendant.id !== id));
    setHasUnsavedChanges(true);
  };

  // Recados Functions (omitted for brevity, no changes here)
  const addRecadoCategory = (category: Omit<RecadoCategory, 'id'>) => {
    const newCategory: RecadoCategory = {
      ...category,
      id: `rc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setRecadoCategories(prev => [...prev, newCategory]);
    setRecadoData(prev => ({
      ...prev,
      [newCategory.id]: []
    }));
    setHasUnsavedChanges(true);
  };

  const updateRecadoCategory = (category: RecadoCategory) => {
    setRecadoCategories(prev => prev.map(c => c.id === category.id ? category : c));
    setHasUnsavedChanges(true);
  };

  const deleteRecadoCategory = (id: string) => {
    setRecadoCategories(prev => prev.filter(category => category.id !== id));
    setRecadoData(prev => {
      const { [id]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const reorderRecadoCategories = (oldIndex: number, newIndex: number) => {
    setRecadoCategories(prev => arrayMove(prev, oldIndex, newIndex));
    setHasUnsavedChanges(true);
  };

  const addRecadoItem = (categoryId: string, item: Omit<RecadoItem, 'id'>) => {
    const newItem: RecadoItem = {
      ...item,
      id: `ri-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), newItem]
    }));
    setHasUnsavedChanges(true);
  };

  const updateRecadoItem = (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
    setHasUnsavedChanges(true);
  };

  const deleteRecadoItem = (categoryId: string, itemId: string) => {
    setRecadoData(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(item => item.id !== itemId)
    }));
    setHasUnsavedChanges(true);
  };

  // Info (Anotações) Functions (omitted for brevity, no changes here)
  const addInfoTag = (tag: Omit<InfoTag, 'id'>) => {
    const newTag: InfoTag = {
      ...tag,
      id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setInfoTags(prev => [...prev, newTag]);
    setInfoData(prev => ({
      ...prev,
      [newTag.id]: []
    }));
    setHasUnsavedChanges(true);
  };

  const updateInfoTag = (tag: InfoTag) => {
    setInfoTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    setHasUnsavedChanges(true);
  };

  const deleteInfoTag = (tagId: string) => {
    setInfoTags(prev => prev.filter(tag => tag.id !== tagId));
    setInfoData(prev => {
      const { [tagId]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const reorderInfoTags = (oldIndex: number, newIndex: number) => {
    setInfoTags(prev => arrayMove(prev, oldIndex, newIndex));
    setHasUnsavedChanges(true);
  };

  const addInfoItem = (item: Omit<InfoItem, 'id' | 'date'>) => {
    const newItem: InfoItem = {
      ...item,
      id: `ii-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleDateString('pt-BR')
    };
    setInfoData(prev => ({
      ...prev,
      [item.tagId]: [...(prev[item.tagId] || []), newItem]
    }));
    setHasUnsavedChanges(true);
  };

  const updateInfoItem = (item: InfoItem) => {
    setInfoData(prev => ({
      ...prev,
      [item.tagId]: (prev[item.tagId] || []).map(i =>
        i.id === item.id ? { ...item, date: new Date().toLocaleDateString('pt-BR') } : i
      )
    }));
    setHasUnsavedChanges(true);
  };

  const deleteInfoItem = (itemId: string, tagId: string) => {
    setInfoData(prev => ({
      ...prev,
      [tagId]: (prev[tagId] || []).filter(item => item.id !== itemId)
    }));
    setHasUnsavedChanges(true);
  };

  // Estomaterapia Functions (omitted for brevity, no changes here)
  const addEstomaterapiaTag = (tag: Omit<InfoTag, 'id'>) => {
    const newTag: InfoTag = {
      ...tag,
      id: `est-tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setEstomaterapiaTags(prev => [...prev, newTag]);
    setEstomaterapiaData(prev => ({
      ...prev,
      [newTag.id]: []
    }));
    setHasUnsavedChanges(true);
  };

  const updateEstomaterapiaTag = (tag: InfoTag) => {
    setEstomaterapiaTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    setHasUnsavedChanges(true);
  };

  const deleteEstomaterapiaTag = (tagId: string) => {
    setEstomaterapiaTags(prev => prev.filter(tag => tag.id !== tagId));
    setEstomaterapiaData(prev => {
      const { [tagId]: deleted, ...rest } = prev;
      return rest;
    });
    setHasUnsavedChanges(true);
  };

  const reorderEstomaterapiaTags = (oldIndex: number, newIndex: number) => {
    setEstomaterapiaTags(prev => arrayMove(prev, oldIndex, newIndex));
    setHasUnsavedChanges(true);
  };

  const addEstomaterapiaItem = (item: Omit<InfoItem, 'id' | 'date'>) => {
    const newItem: InfoItem = {
      ...item,
      id: `est-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleDateString('pt-BR')
    };
    setEstomaterapiaData(prev => ({
      ...prev,
      [item.tagId]: [...(prev[item.tagId] || []), newItem]
    }));
    setHasUnsavedChanges(true);
  };

  const updateEstomaterapiaItem = (item: InfoItem) => {
    setEstomaterapiaData(prev => ({
      ...prev,
      [item.tagId]: (prev[item.tagId] || []).map(i =>
        i.id === item.id ? { ...item, date: new Date().toLocaleDateString('pt-BR') } : i
      )
    }));
    setHasUnsavedChanges(true);
  };

  const deleteEstomaterapiaItem = (itemId: string, tagId: string) => {
    setEstomaterapiaData(prev => ({
      ...prev,
      [tagId]: (prev[tagId] || []).filter(item => item.id !== itemId)
    }));
    setHasUnsavedChanges(true);
  };

  // Data Management Functions (omitted for brevity, no changes here)
  const saveToLocalStorage = () => {
    const dataToSave = {
      userName,
      headerTagData,
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
      noticeData,
      examDeliveryAttendants,
      recadoCategories,
      recadoData,
      infoTags,
      infoData,
      estomaterapiaTags,
      estomaterapiaData
    };
    localStorage.setItem('cdu_data', JSON.stringify(dataToSave));
    setHasUnsavedChanges(false);
  };

  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem('cdu_data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUserName(parsedData.userName || '');
        setHeaderTagData(parsedData.headerTagData || initialHeaderTagData);
        setScriptCategories(parsedData.scriptCategories || initialScriptCategories);
        setScriptData(parsedData.scriptData || initialScriptData);
        setExamCategories(parsedData.examCategories || initialExamCategories);
        setExamData(parsedData.examData || initialExamData);
        setContactCategories(parsedData.contactCategories || initialContactCategories);
        setContactData(parsedData.contactData || initialContactData);
        setValueTableCategories(parsedData.valueTableCategories || initialValueTableCategories);
        setValueTableData(parsedData.valueTableData || initialValueTableData);
        setProfessionalData(parsedData.professionalData || initialProfessionalData);
        setOfficeData(parsedData.officeData || initialOfficeData);
        setNoticeData(parsedData.noticeData || initialNoticeData);
        setExamDeliveryAttendants(parsedData.examDeliveryAttendants || initialExamDeliveryAttendants);
        setRecadoCategories(parsedData.recadoCategories || initialRecadoCategories);
        setRecadoData(parsedData.recadoData || initialRecadoData);
        setInfoTags(parsedData.infoTags || initialInfoTags);
        setInfoData(parsedData.infoData || initialInfoData);
        setEstomaterapiaTags(parsedData.estomaterapiaTags || initialEstomaterapiaTags);
        setEstomaterapiaData(parsedData.estomaterapiaData || initialEstomaterapiaData);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  };

  const exportAllData = () => {
    const dataToExport = {
      userName,
      headerTagData,
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
      noticeData,
      examDeliveryAttendants,
      recadoCategories,
      recadoData,
      infoTags,
      infoData,
      estomaterapiaTags,
      estomaterapiaData
    };
    return JSON.stringify(dataToExport, null, 2);
  };

  const importAllData = async (jsonData: string): Promise<boolean> => {
    try {
      const parsedData = JSON.parse(jsonData);
      setUserName(parsedData.userName || '');
      setHeaderTagData(parsedData.headerTagData || initialHeaderTagData);
      setScriptCategories(parsedData.scriptCategories || initialScriptCategories);
      setScriptData(parsedData.scriptData || initialScriptData);
      setExamCategories(parsedData.examCategories || initialExamCategories);
      setExamData(parsedData.examData || initialExamData);
      setContactCategories(parsedData.contactCategories || initialContactCategories);
      setContactData(parsedData.contactData || initialContactData);
      setValueTableCategories(parsedData.valueTableCategories || initialValueTableCategories);
      setValueTableData(parsedData.valueTableData || initialValueTableData);
      setProfessionalData(parsedData.professionalData || initialProfessionalData);
      setOfficeData(parsedData.officeData || initialOfficeData);
      setNoticeData(parsedData.noticeData || initialNoticeData);
      setExamDeliveryAttendants(parsedData.examDeliveryAttendants || initialExamDeliveryAttendants);
      setRecadoCategories(parsedData.recadoCategories || initialRecadoCategories);
      setRecadoData(parsedData.recadoData || initialRecadoData);
      setInfoTags(parsedData.infoTags || initialInfoTags);
      setInfoData(parsedData.infoData || initialInfoData);
      setEstomaterapiaTags(parsedData.estomaterapiaTags || initialEstomaterapiaTags);
      setEstomaterapiaData(parsedData.estomaterapiaData || initialEstomaterapiaData);
      setHasUnsavedChanges(true);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  const loadExamsFromDatabase = async () => {
    // Placeholder for database loading
    // In a real app, this would fetch data from a database
    console.log('Loading exams from database...');
  };

  const setValueTableDataAndCategories = async (viewType: string, categories: Category[], data: Record<string, ValueTableItem[]>) => {
    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: categories
    }));
    setValueTableData(prev => ({
      ...prev,
      [viewType]: data
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <DataContext.Provider value={{
      // User Name
      userName,
      setUserName,

      // Header Tags
      headerTagData,
      updateHeaderTag,

      // Scripts
      scriptCategories,
      scriptData,
      addScriptCategory,
      updateScriptCategory,
      deleteScriptCategory,
      reorderScriptCategories,
      addScript,
      updateScript,
      deleteScript,

      // Exams
      examCategories,
      examData,
      addExamCategory,
      updateExamCategory,
      deleteExamCategory,
      reorderExamCategories,
      addExam,
      updateExam,
      deleteExam,
      syncValueTableToExams,

      // Contacts
      contactCategories,
      contactData: contactData as Record<string, Record<string, ContactGroup[]>>,
      addContactCategory,
      updateContactCategory,
      deleteContactCategory,
      reorderContactCategories,
      addContactGroup,
      updateContactGroup,
      deleteContactGroup,
      addContactPoint,
      updateContactPoint,
      deleteContactPoint,

      // Value Tables
      valueTableCategories,
      valueTableData,
      addValueCategory,
      updateValueCategory,
      deleteValueCategory,
      reorderValueCategories,
      addValueTable,
      moveAndUpdateValueTable,
      deleteValueTable,
      setValueTableDataAndCategories,

      // Professionals
      professionalData,
      addProfessional,
      updateProfessional,
      deleteProfessional,

      // Offices
      officeData,
      addOffice,
      updateOffice,
      deleteOffice,

      // Notices
      noticeData,
      addNotice,
      updateNotice,
      deleteNotice,

      // Exam Delivery Attendants
      examDeliveryAttendants,
      addExamDeliveryAttendant,
      updateExamDeliveryAttendant,
      deleteExamDeliveryAttendant,

      // Recados
      recadoCategories,
      recadoData,
      addRecadoCategory,
      updateRecadoCategory,
      deleteRecadoCategory,
      reorderRecadoCategories,
      addRecadoItem,
      updateRecadoItem,
      deleteRecadoItem,

      // Info (Anotações)
      infoTags,
      infoData,
      addInfoTag,
      updateInfoTag,
      deleteInfoTag,
      reorderInfoTags,
      addInfoItem,
      updateInfoItem,
      deleteInfoItem,

      // Estomaterapia
      estomaterapiaTags,
      estomaterapiaData,
      addEstomaterapiaTag,
      updateEstomaterapiaTag,
      deleteEstomaterapiaTag,
      reorderEstomaterapiaTags,
      addEstomaterapiaItem,
      updateEstomaterapiaItem,
      deleteEstomaterapiaItem,

      // Data Management
      hasUnsavedChanges,
      saveToLocalStorage,
      loadFromLocalStorage,
      exportAllData,
      importAllData,
      loadExamsFromDatabase
    }}>
      {children}
    </DataContext.Provider>
  );
};