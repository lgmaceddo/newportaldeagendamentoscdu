
import React, { useContext, useState, useEffect, ReactNode } from 'react';
import { DataContext } from './DataContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Category,
  ScriptItem,
  ExamItem,
  ContactGroup,
  ContactPoint,
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
import { Notice } from '@/types/notice';
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
import { arrayMove } from '@dnd-kit/sortable';

// Reusing the interface from DataContext
interface DataContextType {
  userName: string;
  setUserName: (name: string) => void;
  headerTagData: HeaderTagInfo[];
  updateHeaderTag: (id: string, updates: Omit<HeaderTagInfo, 'id' | 'tag'>) => void;
  scriptCategories: Record<string, Category[]>;
  scriptData: Record<string, Record<string, ScriptItem[]>>;
  addScriptCategory: (viewType: string, category: Category) => void;
  updateScriptCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteScriptCategory: (viewType: string, categoryId: string) => void;
  reorderScriptCategories: (viewType: string, oldIndex: number, newIndex: number) => void;
  addScript: (viewType: string, categoryId: string, script: ScriptItem) => void;
  updateScript: (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => void;
  deleteScript: (viewType: string, categoryId: string, scriptId: string) => void;
  examCategories: Category[];
  examData: Record<string, ExamItem[]>;
  addExamCategory: (category: Category) => void;
  updateExamCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteExamCategory: (categoryId: string) => void;
  reorderExamCategories: (oldIndex: number, newIndex: number) => void;
  addExam: (categoryId: string, exam: ExamItem) => void;
  updateExam: (categoryId: string, examId: string, updates: Partial<ExamItem>) => void;
  deleteExam: (categoryId: string, examId: string) => void;
  syncValueTableToExams: () => void;
  contactCategories: Record<string, Category[]>;
  contactData: Record<string, Record<string, ContactGroup[]>>;
  addContactCategory: (viewType: string, category: Category) => void;
  updateContactCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteContactCategory: (viewType: string, categoryId: string) => void;
  addContactGroup: (viewType: string, categoryId: string, group: Omit<ContactGroup, 'id' | 'points'>) => void;
  updateContactGroup: (viewType: string, categoryId: string, groupId: string, updates: Partial<ContactGroup>) => void;
  deleteContactGroup: (viewType: string, categoryId: string, groupId: string) => void;
  addContactPoint: (viewType: string, categoryId: string, groupId: string, point: Omit<ContactPoint, 'id'>) => void;
  updateContactPoint: (viewType: string, categoryId: string, groupId: string, pointId: string, updates: Partial<ContactPoint>) => void;
  deleteContactPoint: (viewType: string, categoryId: string, groupId: string, pointId: string) => void;
  valueTableCategories: Record<string, Category[]>;
  valueTableData: Record<string, Record<string, ValueTableItem[]>>;
  addValueCategory: (viewType: string, category: Category) => void;
  updateValueCategory: (viewType: string, categoryId: string, updates: Partial<Category>) => void;
  deleteValueCategory: (viewType: string, categoryId: string) => void;
  reorderValueCategories: (viewType: string, oldIndex: number, newIndex: number) => void;
  addValueTable: (viewType: string, categoryId: string, item: Omit<ValueTableItem, 'id'>) => void;
  moveAndUpdateValueTable: (viewType: string, oldCategoryId: string, newCategoryId: string, itemId: string, updates: Partial<ValueTableItem>) => void;
  deleteValueTable: (viewType: string, categoryId: string, itemId: string) => void;
  professionalData: Record<string, Record<string, Professional[]>>;
  addProfessional: (viewType: string, categoryId: string, professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (viewType: string, categoryId: string, professionalId: string, updates: Partial<Professional>) => void;
  deleteProfessional: (viewType: string, categoryId: string, professionalId: string) => void;
  officeData: Office[];
  addOffice: (office: Omit<Office, 'id'>) => void;
  updateOffice: (office: Office) => void;
  deleteOffice: (id: string) => void;
  noticeData: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (id: string) => void;
  examDeliveryAttendants: ExamDeliveryAttendant[];
  addExamDeliveryAttendant: (attendant: Omit<ExamDeliveryAttendant, 'id'>) => void;
  updateExamDeliveryAttendant: (attendant: ExamDeliveryAttendant) => void;
  deleteExamDeliveryAttendant: (id: string) => void;
  recadoCategories: RecadoCategory[];
  recadoData: Record<string, RecadoItem[]>;
  addRecadoCategory: (category: Omit<RecadoCategory, 'id'>) => void;
  updateRecadoCategory: (category: RecadoCategory) => void;
  deleteRecadoCategory: (id: string) => void;
  reorderRecadoCategories: (oldIndex: number, newIndex: number) => void;
  addRecadoItem: (categoryId: string, item: Omit<RecadoItem, 'id'>) => void;
  updateRecadoItem: (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => void;
  deleteRecadoItem: (categoryId: string, itemId: string) => void;
  infoTags: InfoTag[];
  infoData: Record<string, InfoItem[]>;
  addInfoTag: (tag: Omit<InfoTag, 'id'>) => void;
  updateInfoTag: (tag: InfoTag) => void;
  deleteInfoTag: (tagId: string) => void;
  reorderInfoTags: (oldIndex: number, newIndex: number) => void;
  addInfoItem: (item: Omit<InfoItem, 'id' | 'date'>) => void;
  updateInfoItem: (item: InfoItem) => void;
  deleteInfoItem: (itemId: string, tagId: string) => void;
  estomaterapiaTags: InfoTag[];
  estomaterapiaData: Record<string, InfoItem[]>;
  addEstomaterapiaTag: (tag: Omit<InfoTag, 'id'>) => void;
  updateEstomaterapiaTag: (tag: InfoTag) => void;
  deleteEstomaterapiaTag: (tagId: string) => void;
  reorderEstomaterapiaTags: (oldIndex: number, newIndex: number) => void;
  addEstomaterapiaItem: (item: Omit<InfoItem, 'id' | 'date'>) => void;
  updateEstomaterapiaItem: (item: InfoItem) => void;
  deleteEstomaterapiaItem: (itemId: string, tagId: string) => void;
  hasUnsavedChanges: boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  exportAllData: () => string;
  importAllData: (jsonData: string) => Promise<boolean>;
  loadExamsFromDatabase: () => Promise<void>;
  setValueTableDataAndCategories: (viewType: string, categories: Category[], data: Record<string, ValueTableItem[]>) => void;
  isLoading: boolean;
}

// Removed local DataContext creation
// const DataContext = createContext<DataContextType | undefined>(undefined);
// removed export useData since we use the one from DataContext.tsx

// Helper for safe JSON parsing
const safeParse = (data: any, fallback: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  return data || fallback;
};

// UUID mapping helper
const getNewId = (oldId: string, map: Map<string, string>) => {
  if (!map.has(oldId)) {
    map.set(oldId, crypto.randomUUID());
  }
  return map.get(oldId)!;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initial States
  const [userName, setUserNameState] = useState<string>('');
  const [headerTagData, setHeaderTagData] = useState<HeaderTagInfo[]>(initialHeaderTagData);
  const [scriptCategories, setScriptCategories] = useState<Record<string, Category[]>>(initialScriptCategories);
  const [scriptData, setScriptData] = useState<Record<string, Record<string, ScriptItem[]>>>(initialScriptData);
  const [examCategories, setExamCategories] = useState<Category[]>(initialExamCategories);
  const [examData, setExamData] = useState<Record<string, ExamItem[]>>(initialExamData);
  const [contactCategories, setContactCategories] = useState<Record<string, Category[]>>(initialContactCategories);
  const [contactData, setContactData] = useState<Record<string, Record<string, ContactGroup[]>>>(initialContactData as Record<string, Record<string, ContactGroup[]>>);
  const [valueTableCategories, setValueTableCategories] = useState<Record<string, Category[]>>(initialValueTableCategories);
  const [valueTableData, setValueTableData] = useState<Record<string, Record<string, ValueTableItem[]>>>(initialValueTableData);
  const [professionalData, setProfessionalData] = useState<Record<string, Record<string, Professional[]>>>(initialProfessionalData);
  const [officeData, setOfficeData] = useState<Office[]>(initialOfficeData);
  const [noticeData, setNoticeData] = useState<Notice[]>(initialNoticeData);
  const [examDeliveryAttendants, setExamDeliveryAttendants] = useState<ExamDeliveryAttendant[]>(initialExamDeliveryAttendants);
  const [recadoCategories, setRecadoCategories] = useState<RecadoCategory[]>(initialRecadoCategories);
  const [recadoData, setRecadoData] = useState<Record<string, RecadoItem[]>>(initialRecadoData);
  const [infoTags, setInfoTags] = useState<InfoTag[]>(initialInfoTags);
  const [infoData, setInfoData] = useState<Record<string, InfoItem[]>>(initialInfoData);
  const [estomaterapiaTags, setEstomaterapiaTags] = useState<InfoTag[]>(initialEstomaterapiaTags);
  const [estomaterapiaData, setEstomaterapiaData] = useState<Record<string, InfoItem[]>>(initialEstomaterapiaData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem('cdu_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.headerTagData) setHeaderTagData(parsed.headerTagData);
        if (parsed.scriptCategories) setScriptCategories(parsed.scriptCategories);
        if (parsed.scriptData) setScriptData(parsed.scriptData);
        if (parsed.examCategories) setExamCategories(parsed.examCategories);
        if (parsed.examData) setExamData(parsed.examData);
        if (parsed.contactCategories) setContactCategories(parsed.contactCategories);
        if (parsed.contactData) setContactData(parsed.contactData);
        if (parsed.valueTableCategories) setValueTableCategories(parsed.valueTableCategories);
        if (parsed.valueTableData) setValueTableData(parsed.valueTableData);
        if (parsed.professionalData) setProfessionalData(parsed.professionalData);
        if (parsed.officeData) setOfficeData(parsed.officeData);
        if (parsed.noticeData) setNoticeData(parsed.noticeData);
        if (parsed.examDeliveryAttendants) setExamDeliveryAttendants(parsed.examDeliveryAttendants);
        if (parsed.recadoCategories) setRecadoCategories(parsed.recadoCategories);
        if (parsed.recadoData) setRecadoData(parsed.recadoData);
        if (parsed.infoTags) setInfoTags(parsed.infoTags);
        if (parsed.infoData) setInfoData(parsed.infoData);
        if (parsed.estomaterapiaTags) setEstomaterapiaTags(parsed.estomaterapiaTags);
        if (parsed.estomaterapiaData) setEstomaterapiaData(parsed.estomaterapiaData);
        return true;
      } catch (error) {
        console.error('Error loading legacy local storage data:', error);
        return false;
      }
    }
    return false;
  };

  // Data Loading from Supabase
  useEffect(() => {
    if (user) {
      loadAllDataFromSupabase();
    }
  }, [user]);

  const loadAllDataFromSupabase = async () => {
    console.log("Iniciando carregamento de dados do Supabase...");
    try {
      setLoading(true);

      // Fetch User Name from Profile
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.display_name) {
          setUserNameState(profileData.display_name);
        }
      }

      // Fetch Header Tags
      const { data: htData } = await supabase.from('header_tags').select('*').order('order', { ascending: true });
      if (htData && htData.length > 0) {
        const headerTags = htData.map((tag: any) => ({
          id: tag.id,
          tag: tag.tag,
          title: tag.title,
          address: tag.address || '',
          phones: safeParse(tag.phones, []),
          whatsapp: tag.whatsapp || '',
          contacts: safeParse(tag.contacts, [])
        }));
        setHeaderTagData(headerTags);
      }

      // Fetch Script Categories & Scripts
      console.log("Buscando categorias e scripts...");
      const { data: scData, error: scError } = await supabase.from('script_categories').select('*');
      if (scError) console.error("Erro script_categories:", scError);

      const { data: sData, error: sError } = await supabase.from('scripts').select('*');
      if (sError) console.error("Erro scripts:", sError);

      // CHECK: If DB is empty, use LocalStorage as fallback
      if (!scData || scData.length === 0) {
        console.warn("Supabase returned no script categories. Attempting fallback to LocalStorage.");
        const loaded = loadFromLocalStorage();
        if (loaded) {
          toast.warning("Banco de dados vazio. Dados locais recuperados (Modo Offline/Migração).");
        } else {
          // Initialize with defaults if absolutely nothing exists
          setScriptCategories(initialScriptCategories);
          setScriptData(initialScriptData);
          toast.info("Banco de dados vazio. Iniciando com dados padrão.");
        }
        setLoading(false);
        // Return here to allow UI to render with local/default data while DB is empty
        return;
      }

      if (scData && sData) {
        const newSC: Record<string, Category[]> = {};
        const newSD: Record<string, Record<string, ScriptItem[]>> = {};

        scData.forEach((cat: any) => {
          if (!newSC[cat.view_type]) newSC[cat.view_type] = [];
          newSC[cat.view_type].push(cat);
          newSD[cat.view_type] = newSD[cat.view_type] || {};
          newSD[cat.view_type][cat.id] = [];
        });

        sData.forEach((script: any) => {
          const viewType = scData.find((c: any) => c.id === script.category_id)?.view_type;
          if (viewType && newSD[viewType][script.category_id]) {
            newSD[viewType][script.category_id].push(script);
          }
        });

        setScriptCategories(newSC);
        setScriptData(newSD);
      }

      // Fetch Exam Categories & Exams
      const { data: ecData } = await supabase.from('exam_categories').select('*');
      const { data: eData } = await supabase.from('exams').select('*');
      if (ecData && eData) {
        setExamCategories(ecData);
        const newED: Record<string, ExamItem[]> = {};
        eData.forEach((exam: any) => {
          if (!newED[exam.category_id]) newED[exam.category_id] = [];
          // Ensure location is array
          const examWithFixedLocation = {
            ...exam,
            location: safeParse(exam.location, [])
          };
          newED[exam.category_id].push(examWithFixedLocation);
        });
        setExamData(newED);
      }

      // Fetch Contact Categories, Groups, Points
      const { data: ccData } = await supabase.from('contact_categories').select('*');
      const { data: cgData } = await supabase.from('contact_groups').select('*');
      const { data: cpData } = await supabase.from('contact_points').select('*');

      if (ccData && cgData && cpData) {
        const newCC: Record<string, Category[]> = {};
        const newCD: Record<string, Record<string, ContactGroup[]>> = {};

        ccData.forEach((cat: any) => {
          if (!newCC[cat.view_type]) newCC[cat.view_type] = [];
          newCC[cat.view_type].push(cat);
          newCD[cat.view_type] = newCD[cat.view_type] || {};
          newCD[cat.view_type][cat.id] = [];
        });

        cgData.forEach((group: any) => {
          const viewType = ccData.find((c: any) => c.id === group.category_id)?.view_type;
          if (viewType && newCD[viewType][group.category_id]) {
            const points = cpData.filter((p: any) => p.group_id === group.id);
            newCD[viewType][group.category_id].push({ ...group, points });
          }
        });
        setContactCategories(newCC);
        setContactData(newCD);
      }

      // Notices
      const { data: nData } = await supabase.from('notices').select('*');
      if (nData) setNoticeData(nData);

      // Fetch Offices
      const { data: oData } = await supabase.from('offices').select('*');
      if (oData) {
        const offices = oData.map((o: any) => ({
          ...o,
          specialties: safeParse(o.specialties, []),
          attendants: safeParse(o.attendants, []),
          professionals: safeParse(o.professionals, []),
          procedures: safeParse(o.procedures, []),
          categories: safeParse(o.categories, []),
          items: safeParse(o.items, {}),
        }));
        setOfficeData(offices);
      }

      // Fetch Value Tables
      const { data: vtcData } = await supabase.from('value_table_categories').select('*');
      const { data: vtiData } = await supabase.from('value_table_items').select('*');
      if (vtcData && vtiData) {
        const newVC: Record<string, Category[]> = {};
        const newVD: Record<string, Record<string, ValueTableItem[]>> = {};

        vtcData.forEach((cat: any) => {
          if (!newVC[cat.view_type]) newVC[cat.view_type] = [];
          newVC[cat.view_type].push(cat);
          newVD[cat.view_type] = newVD[cat.view_type] || {};
          newVD[cat.view_type][cat.id] = [];
        });

        vtiData.forEach((item: any) => {
          const cat = vtcData.find((c: any) => c.id === item.category_id);
          if (cat && newVD[cat.view_type]) {
            // IMPORTANTE: Garantir que valores numéricos sejam números, não strings
            const honorarios_parsed = safeParse(item.honorarios_diferenciados, []);
            const honorarios_diferenciados = Array.isArray(honorarios_parsed)
              ? honorarios_parsed.map((h: any) => ({
                ...h,
                valor: typeof h.valor === 'string' ? parseFloat(h.valor) : (h.valor || 0)
              }))
              : [];

            const fixedItem = {
              ...item,
              honorario: typeof item.honorario === 'string' ? parseFloat(item.honorario) : (item.honorario || 0),
              exame_cartao: typeof item.exame_cartao === 'string' ? parseFloat(item.exame_cartao) : (item.exame_cartao || 0),
              material_min: typeof item.material_min === 'string' ? parseFloat(item.material_min) : (item.material_min || 0),
              material_max: typeof item.material_max === 'string' ? parseFloat(item.material_max) : (item.material_max || 0),
              honorarios_diferenciados: honorarios_diferenciados
            };
            newVD[cat.view_type][cat.id].push(fixedItem);
          }
        });
        setValueTableCategories(newVC);
        setValueTableData(newVD);
      }

      // Info and Estomaterapia (Shared logic)
      const { data: itData } = await supabase.from('info_tags').select('*');
      const { data: iiData } = await supabase.from('info_items').select('*');

      if (itData && iiData) {
        const iTags: InfoTag[] = [];
        const eTags: InfoTag[] = [];
        const iData: Record<string, InfoItem[]> = {};
        const eData: Record<string, InfoItem[]> = {};

        itData.forEach((tag: any) => {
          if (tag.section_type === 'estomaterapia') {
            eTags.push(tag);
            eData[tag.id] = [];
          } else {
            iTags.push(tag);
            iData[tag.id] = [];
          }
        });

        iiData.forEach((item: any) => {
          if (iData[item.tag_id]) iData[item.tag_id].push(item);
          if (eData[item.tag_id]) eData[item.tag_id].push(item);
        });

        setInfoTags(iTags);
        setInfoData(iData);
        setEstomaterapiaTags(eTags);
        setEstomaterapiaData(eData);
      }

      // Recados
      const { data: rcData } = await supabase.from('recado_categories').select('*');
      const { data: riData } = await supabase.from('recado_items').select('*');
      if (rcData && riData) {
        const newRcCats: RecadoCategory[] = [];
        const newRcData: Record<string, RecadoItem[]> = {};

        rcData.forEach((cat: any) => {
          const mappedCat = {
            id: cat.id,
            title: cat.title,
            description: cat.description,
            destinationType: cat.destination_type,
            groupName: cat.group_name
          };
          newRcCats.push(mappedCat);
          newRcData[cat.id] = [];
        });

        riData.forEach((item: any) => {
          if (newRcData[item.category_id]) {
            newRcData[item.category_id].push({
              ...item,
              fields: safeParse(item.fields, [])
            });
          }
        });
        setRecadoCategories(newRcCats);
        setRecadoData(newRcData);
      }


    } catch (error) {
      console.error('Error loading Supabase data:', error);
      toast.error('Erro ao carregar do servidor. Testando backup local...');
      loadFromLocalStorage(); // Fallback on error too
    } finally {
      setLoading(false);
    }
  };

  // --- IMPORT FUNCTION ---
  const importAllData = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData);
      console.log("Starting Import...");

      // CRITICAL: Clean up existing data to prevent duplication
      console.log("Cleaning up existing data...");
      const clearTable = async (table: string) => {
        // Using 'neq' with a nil UUID to match all valid UUIDs.
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.warn(`Warning clearing ${table} (UUID check failed, trying simple delete):`, error.message);
          // Fallback: try to delete where id is not null (should cover everything)
          await supabase.from(table).delete().not('id', 'is', null);
        }
      };

      // 1. Delete Child Tables first to avoid Foreign Key constraints
      await clearTable('scripts');
      await clearTable('exams');
      await clearTable('contact_points');
      await clearTable('contact_groups');
      await clearTable('value_table_items');
      await clearTable('recado_items');
      await clearTable('info_items');

      // 2. Delete Parent/Standalone Tables
      await clearTable('script_categories');
      await clearTable('exam_categories');
      await clearTable('contact_categories');
      await clearTable('value_table_categories');
      await clearTable('recado_categories');
      await clearTable('info_tags');
      await clearTable('notices');
      await clearTable('offices');
      await clearTable('header_tags');

      console.log("Existing data cleared. Starting insertion...");

      const idMap = new Map<string, string>();

      // 0. User Name - Update profile
      if (parsed.userName && user) {
        await supabase.from('profiles').update({
          display_name: parsed.userName,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
        setUserNameState(parsed.userName);
      }

      // 1. Header Tags (CDU, SEDE, GERENCIA)
      if (parsed.headerTagData && Array.isArray(parsed.headerTagData)) {
        for (let idx = 0; idx < parsed.headerTagData.length; idx++) {
          const tag = parsed.headerTagData[idx];
          await supabase.from('header_tags').insert({
            id: crypto.randomUUID(),
            tag: tag.tag,
            title: tag.title,
            address: tag.address || '',
            phones: JSON.stringify(tag.phones || []),
            whatsapp: tag.whatsapp || '',
            contacts: JSON.stringify(tag.contacts || []),
            order: idx
          });
        }
      }

      // 2. Script Categories & Scripts
      if (parsed.scriptCategories && parsed.scriptData) {
        for (const viewType in parsed.scriptCategories) {
          for (const cat of parsed.scriptCategories[viewType]) {
            const newCatId = getNewId(cat.id, idMap);
            await supabase.from('script_categories').insert({
              id: newCatId, view_type: viewType, name: cat.name, color: cat.color
            });

            const scripts = parsed.scriptData[viewType]?.[cat.id] || [];
            for (const s of scripts) {
              await supabase.from('scripts').insert({
                id: crypto.randomUUID(), category_id: newCatId, title: s.title, content: s.content, order: s.order
              });
            }
          }
        }
      }

      // 3. Exam Categories & Exams
      if (parsed.examCategories && parsed.examData) {
        const examCats = Array.isArray(parsed.examCategories) ? parsed.examCategories : [];

        for (const cat of examCats) {
          const newCatId = getNewId(cat.id, idMap);
          await supabase.from('exam_categories').insert({
            id: newCatId, name: cat.name, color: cat.color, order: cat.order
          });

          const exams = parsed.examData[cat.id] || [];
          for (const e of exams) {
            await supabase.from('exams').insert({
              id: crypto.randomUUID(), category_id: newCatId,
              title: e.title, location: JSON.stringify(e.location),
              additional_info: e.additionalInfo, scheduling_rules: e.schedulingRules
            });
          }
        }
      }

      // 4. Contact Categories -> Groups -> Points
      if (parsed.contactCategories && parsed.contactData) {
        for (const viewType in parsed.contactCategories) {
          for (const cat of parsed.contactCategories[viewType]) {
            const newCatId = getNewId(cat.id, idMap);
            await supabase.from('contact_categories').insert({
              id: newCatId, view_type: viewType, name: cat.name, color: cat.color
            });

            const groups = parsed.contactData[viewType]?.[cat.id] || [];
            for (const g of groups) {
              const newGroupId = crypto.randomUUID();
              await supabase.from('contact_groups').insert({
                id: newGroupId, category_id: newCatId, name: g.name
              });

              for (const p of (g.points || [])) {
                await supabase.from('contact_points').insert({
                  id: crypto.randomUUID(), group_id: newGroupId,
                  setor: p.setor, local: p.local, ramal: p.ramal, telefone: p.telefone, whatsapp: p.whatsapp
                });
              }
            }
          }
        }
      }

      // 5. Value Tables
      if (parsed.valueTableCategories && parsed.valueTableData) {
        for (const viewType in parsed.valueTableCategories) {
          for (const cat of parsed.valueTableCategories[viewType]) {
            const newCatId = getNewId(cat.id, idMap);
            await supabase.from('value_table_categories').insert({
              id: newCatId, view_type: viewType, name: cat.name, color: cat.color
            });

            const items = parsed.valueTableData[viewType]?.[cat.id] || [];
            for (const i of items) {
              // IMPORTANTE: Converter strings para números para garantir cálculos corretos
              // Total Exame = honorario + exame_cartao
              // Total c/ Material = Total Exame + material_max
              const honorario = typeof i.honorario === 'string' ? parseFloat(i.honorario) : (i.honorario || 0);
              const exame_cartao = typeof i.exame_cartao === 'string' ? parseFloat(i.exame_cartao) : (i.exame_cartao || 0);
              const material_min = typeof i.material_min === 'string' ? parseFloat(i.material_min) : (i.material_min || 0);
              const material_max = typeof i.material_max === 'string' ? parseFloat(i.material_max) : (i.material_max || 0);

              // Converter valores nos honorários diferenciados também
              const honorarios_diferenciados = (i.honorarios_diferenciados || []).map((h: any) => ({
                ...h,
                valor: typeof h.valor === 'string' ? parseFloat(h.valor) : (h.valor || 0)
              }));

              await supabase.from('value_table_items').insert({
                id: crypto.randomUUID(), category_id: newCatId,
                codigo: i.codigo, nome: i.nome, info: i.info,
                honorario: honorario,
                exame_cartao: exame_cartao,
                material_min: material_min,
                material_max: material_max,
                honorarios_diferenciados: JSON.stringify(honorarios_diferenciados)
              });
            }
          }
        }
      }

      // 6. Notices
      if (parsed.noticeData) {
        for (const n of parsed.noticeData) {
          await supabase.from('notices').insert({
            id: crypto.randomUUID(), title: n.title, content: n.content, date: n.date, tag: n.tag
          });
        }
      }

      // 7. Offices
      if (parsed.officeData) {
        for (const o of parsed.officeData) {
          await supabase.from('offices').insert({
            id: crypto.randomUUID(), name: o.name, ramal: o.ramal, schedule: o.schedule,
            specialties: JSON.stringify(o.specialties),
            attendants: JSON.stringify(o.attendants),
            professionals: JSON.stringify(o.professionals),
            procedures: JSON.stringify(o.procedures),
            categories: JSON.stringify(o.categories),
            items: JSON.stringify(o.items)
          });
        }
      }

      // 8. Info Tags & Items
      const processInfo = async (tags: InfoTag[], dataMap: Record<string, InfoItem[]>, section: 'anotacoes' | 'estomaterapia') => {
        if (!tags) return;
        for (const tag of tags) {
          const newTagId = getNewId(tag.id, idMap);
          await supabase.from('info_tags').insert({
            id: newTagId, name: tag.name, color: tag.color, order: tag.order, section_type: section
          });

          const items = dataMap[tag.id] || [];
          for (const i of items) {
            await supabase.from('info_items').insert({
              id: crypto.randomUUID(), tag_id: newTagId, title: i.title, content: i.content, date: i.date, info: i.info
            });
          }
        }
      };

      await processInfo(parsed.infoTags, parsed.infoData, 'anotacoes');
      await processInfo(parsed.estomaterapiaTags, parsed.estomaterapiaData, 'estomaterapia');

      // 9. Recados
      if (parsed.recadoCategories && parsed.recadoData) {
        for (const cat of parsed.recadoCategories) {
          const newCatId = getNewId(cat.id, idMap);
          await supabase.from('recado_categories').insert({
            id: newCatId, title: cat.title, description: cat.description,
            destination_type: cat.destinationType, group_name: cat.groupName
          });

          const items = parsed.recadoData[cat.id] || [];
          for (const i of items) {
            await supabase.from('recado_items').insert({
              id: crypto.randomUUID(), category_id: newCatId,
              title: i.title, content: i.content, fields: JSON.stringify(i.fields)
            });
          }
        }
      }

      toast.success("Migração concluída com sucesso! Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
      return true;

    } catch (error) {
      console.error("Migration Error", error);
      toast.error("Erro na migração. Verifique o console.");
      return false;
    }
  };

  // Legacy support functions
  const saveToLocalStorage = () => { toast.info("Salvamento agora é automático no servidor!"); };
  const exportAllData = () => {
    // Can build a JSON string from current state for backup
    const state = {
      scriptCategories, scriptData, examCategories, examData,
      contactCategories, contactData, valueTableCategories, valueTableData,
      professionalData, officeData, noticeData,
      infoTags, infoData, estomaterapiaTags, estomaterapiaData, recadoCategories, recadoData
    };
    return JSON.stringify(state, null, 2);
  };

  // ... Implement CRUD Functions using Supabase (Same as before) ...
  // [I'm keeping the CRUD functions exactly as they were in the previous step to save space and avoid regression]
  // ... Copy paste the previous create/update/delete functions here ...

  // Scripts
  const addScriptCategory = async (viewType: string, category: Category) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    await supabase.from('script_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color });
  };
  const updateScriptCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    supabase.from('script_categories').update({ ...updates }).eq('id', categoryId).then();
  };
  const deleteScriptCategory = (viewType: string, categoryId: string) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    supabase.from('script_categories').delete().eq('id', categoryId).then();
  };
  const reorderScriptCategories = () => { };
  const addScript = async (viewType: string, categoryId: string, script: ScriptItem) => {
    setScriptData(prev => {
      const newData = { ...prev };
      newData[viewType] = newData[viewType] || {};
      newData[viewType][categoryId] = [...(newData[viewType][categoryId] || []), script];
      return newData;
    });
    await supabase.from('scripts').insert({ id: script.id, category_id: categoryId, title: script.title, content: script.content, order: script.order });
  };
  const updateScript = (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    setScriptData(prev => {
      const list = prev[viewType]?.[categoryId] || [];
      return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.map(s => s.id === scriptId ? { ...s, ...updates } : s) } };
    });
    supabase.from('scripts').update(updates).eq('id', scriptId).then();
  };
  const deleteScript = (viewType: string, categoryId: string, scriptId: string) => {
    setScriptData(prev => {
      const list = prev[viewType]?.[categoryId] || [];
      return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.filter(s => s.id !== scriptId) } };
    });
    supabase.from('scripts').delete().eq('id', scriptId).then();
  };
  // Exams
  const addExamCategory = async (category: Category) => {
    setExamCategories(prev => [...prev, category]);
    await supabase.from('exam_categories').insert({ id: category.id, name: category.name, color: category.color, order: category.order });
  };
  const updateExamCategory = (categoryId: string, updates: Partial<Category>) => {
    setExamCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c));
    supabase.from('exam_categories').update(updates).eq('id', categoryId).then();
  };
  const deleteExamCategory = (categoryId: string) => {
    setExamCategories(prev => prev.filter(c => c.id !== categoryId));
    supabase.from('exam_categories').delete().eq('id', categoryId).then();
  };
  const reorderExamCategories = () => { };
  const addExam = async (categoryId: string, exam: ExamItem) => {
    setExamData(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), exam] }));
    await supabase.from('exams').insert({ id: exam.id, category_id: categoryId, title: exam.title, location: JSON.stringify(exam.location), additional_info: exam.additionalInfo, scheduling_rules: exam.schedulingRules });
  };
  const updateExam = (categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    setExamData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).map(e => e.id === examId ? { ...e, ...updates } : e) }));
    const dbUpdates: any = { ...updates };
    if (updates.location) dbUpdates.location = JSON.stringify(updates.location);
    if (updates.additionalInfo !== undefined) { dbUpdates.additional_info = updates.additionalInfo; delete dbUpdates.additionalInfo; }
    if (updates.schedulingRules !== undefined) { dbUpdates.scheduling_rules = updates.schedulingRules; delete dbUpdates.schedulingRules; }
    supabase.from('exams').update(dbUpdates).eq('id', examId).then();
  };
  const deleteExam = (categoryId: string, examId: string) => {
    setExamData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter(e => e.id !== examId) }));
    supabase.from('exams').delete().eq('id', examId).then();
  };
  const syncValueTableToExams = () => { };
  // Contacts
  const addContactCategory = async (viewType: string, category: Category) => {
    setContactCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    await supabase.from('contact_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color });
  };
  const updateContactCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setContactCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    supabase.from('contact_categories').update(updates).eq('id', categoryId).then();
  };
  const deleteContactCategory = (viewType: string, categoryId: string) => {
    setContactCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    supabase.from('contact_categories').delete().eq('id', categoryId).then();
  };
  const addContactGroup = async (viewType: string, categoryId: string, group: Omit<ContactGroup, 'id' | 'points'>) => {
    const newGroup = { ...group, id: crypto.randomUUID(), points: [] };
    setContactData(prev => { const newData = { ...prev }; newData[viewType] = newData[viewType] || {}; newData[viewType][categoryId] = [...(newData[viewType][categoryId] || []), newGroup]; return newData; });
    await supabase.from('contact_groups').insert({ id: newGroup.id, category_id: categoryId, name: group.name });
  };
  const updateContactGroup = (viewType: string, categoryId: string, groupId: string, updates: Partial<ContactGroup>) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.map(g => g.id === groupId ? { ...g, ...updates } : g) } }; });
    supabase.from('contact_groups').update({ name: updates.name }).eq('id', groupId).then();
  };
  const deleteContactGroup = (viewType: string, categoryId: string, groupId: string) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.filter(g => g.id !== groupId) } }; });
    supabase.from('contact_groups').delete().eq('id', groupId).then();
  };
  const addContactPoint = async (viewType: string, categoryId: string, groupId: string, point: Omit<ContactPoint, 'id'>) => {
    const newPoint = { ...point, id: crypto.randomUUID() };
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; const updatedList = list.map(g => g.id === groupId ? { ...g, points: [...g.points, newPoint] } : g); return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: updatedList } }; });
    await supabase.from('contact_points').insert({ id: newPoint.id, group_id: groupId, setor: point.setor, local: point.local, ramal: point.ramal, telefone: point.telefone, whatsapp: point.whatsapp });
  };
  const updateContactPoint = (viewType: string, categoryId: string, groupId: string, pointId: string, updates: Partial<ContactPoint>) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; const updatedList = list.map(g => g.id === groupId ? { ...g, points: g.points.map(p => p.id === pointId ? { ...p, ...updates } : p) } : g); return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: updatedList } }; });
    supabase.from('contact_points').update(updates).eq('id', pointId).then();
  };
  const deleteContactPoint = (viewType: string, categoryId: string, groupId: string, pointId: string) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; const updatedList = list.map(g => g.id === groupId ? { ...g, points: g.points.filter(p => p.id !== pointId) } : g); return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: updatedList } }; });
    supabase.from('contact_points').delete().eq('id', pointId).then();
  };
  // Notices
  const addNotice = async (notice: Omit<Notice, 'id'>) => {
    const newNotice = { ...notice, id: crypto.randomUUID() };
    setNoticeData(prev => [...prev, newNotice]);
    await supabase.from('notices').insert(newNotice);
  };
  const updateNotice = (notice: Notice) => {
    setNoticeData(prev => prev.map(n => n.id === notice.id ? notice : n));
    supabase.from('notices').update(notice).eq('id', notice.id).then();
  };
  const deleteNotice = (id: string) => {
    setNoticeData(prev => prev.filter(n => n.id !== id));
    supabase.from('notices').delete().eq('id', id).then();
  };
  // Offices
  const addOffice = async (office: Omit<Office, 'id'>) => {
    const newOffice = { ...office, id: crypto.randomUUID() };
    setOfficeData(prev => [...prev, newOffice]);
    const dbOffice = { ...newOffice, specialties: JSON.stringify(newOffice.specialties), attendants: JSON.stringify(newOffice.attendants), professionals: JSON.stringify(newOffice.professionals), procedures: JSON.stringify(newOffice.procedures), categories: JSON.stringify(newOffice.categories), items: JSON.stringify(newOffice.items) };
    await supabase.from('offices').insert(dbOffice);
  };
  const updateOffice = (office: Office) => {
    setOfficeData(prev => prev.map(o => o.id === office.id ? office : o));
    const dbOffice = { ...office, specialties: JSON.stringify(office.specialties), attendants: JSON.stringify(office.attendants), professionals: JSON.stringify(office.professionals), procedures: JSON.stringify(office.procedures), categories: JSON.stringify(office.categories), items: JSON.stringify(office.items) };
    supabase.from('offices').update(dbOffice).eq('id', office.id).then();
  };
  const deleteOffice = (id: string) => {
    setOfficeData(prev => prev.filter(o => o.id !== id));
    supabase.from('offices').delete().eq('id', id).then();
  };
  // Value Tables
  const addValueCategory = async (viewType: string, category: Category) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    await supabase.from('value_table_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color, order: category.order });
  };
  const updateValueCategory = (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    supabase.from('value_table_categories').update(updates).eq('id', categoryId).then();
  };
  const deleteValueCategory = (viewType: string, categoryId: string) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    supabase.from('value_table_categories').delete().eq('id', categoryId).then();
  };
  const reorderValueCategories = () => { };
  const addValueTable = async (viewType: string, categoryId: string, item: Omit<ValueTableItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setValueTableData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: [...list, newItem] } }; });
    await supabase.from('value_table_items').insert({ id: newItem.id, category_id: categoryId, codigo: newItem.codigo, nome: newItem.nome, info: newItem.info, honorario: newItem.honorario, exame_cartao: newItem.exame_cartao, material_min: newItem.material_min, material_max: newItem.material_max, honorarios_diferenciados: JSON.stringify(newItem.honorarios_diferenciados) });
  };
  const moveAndUpdateValueTable = () => { };
  const deleteValueTable = (viewType: string, categoryId: string, itemId: string) => {
    setValueTableData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.filter(i => i.id !== itemId) } }; });
    supabase.from('value_table_items').delete().eq('id', itemId).then();
  };
  // Professional Stubs
  const addProfessional = () => { }; const updateProfessional = () => { }; const deleteProfessional = () => { };
  // Recados
  const addRecadoCategory = async (category: Omit<RecadoCategory, 'id'>) => {
    const newCat = { ...category, id: crypto.randomUUID() };
    setRecadoCategories(prev => [...prev, newCat]);
    await supabase.from('recado_categories').insert({ id: newCat.id, title: newCat.title, description: newCat.description, destination_type: newCat.destinationType, group_name: newCat.groupName });
  };
  const updateRecadoCategory = (category: RecadoCategory) => {
    setRecadoCategories(prev => prev.map(c => c.id === category.id ? category : c));
    supabase.from('recado_categories').update({ title: category.title, description: category.description, destination_type: category.destinationType, group_name: category.groupName }).eq('id', category.id).then();
  };
  const deleteRecadoCategory = (id: string) => {
    setRecadoCategories(prev => prev.filter(c => c.id !== id));
    supabase.from('recado_categories').delete().eq('id', id).then();
  };
  const reorderRecadoCategories = () => { };
  const addRecadoItem = async (categoryId: string, item: Omit<RecadoItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setRecadoData(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), newItem] }));
    await supabase.from('recado_items').insert({ id: newItem.id, category_id: categoryId, title: newItem.title, content: newItem.content, fields: JSON.stringify(newItem.fields) });
  };
  const updateRecadoItem = (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    setRecadoData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).map(i => i.id === itemId ? { ...i, ...updates } : i) }));
    const dbUpdates: any = { ...updates };
    if (updates.fields) dbUpdates.fields = JSON.stringify(updates.fields);
    supabase.from('recado_items').update(dbUpdates).eq('id', itemId).then();
  };
  const deleteRecadoItem = (categoryId: string, itemId: string) => {
    setRecadoData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter(i => i.id !== itemId) }));
    supabase.from('recado_items').delete().eq('id', itemId).then();
  };
  // Info & Estomaterapia
  const addInfoTagGeneric = async (tag: Omit<InfoTag, 'id'>, section: 'anotacoes' | 'estomaterapia', setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    const newTag = { ...tag, id: crypto.randomUUID(), user_id: section === 'anotacoes' ? user?.id : undefined };
    setTags(prev => [...prev, newTag]);
    await supabase.from('info_tags').insert({
      id: newTag.id,
      name: newTag.name,
      color: newTag.color,
      order: newTag.order,
      section_type: section,
      user_id: newTag.user_id
    });
  };
  const updateInfoTagGeneric = (tag: InfoTag, setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    setTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    supabase.from('info_tags').update({ name: tag.name, color: tag.color }).eq('id', tag.id).then();
  };
  const deleteInfoTagGeneric = (tagId: string, setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    supabase.from('info_tags').delete().eq('id', tagId).then();
  };
  const addInfoItemGeneric = async (item: Omit<InfoItem, 'id' | 'date'>, setData: React.Dispatch<React.SetStateAction<Record<string, InfoItem[]>>>) => {
    const newItem = { ...item, id: crypto.randomUUID(), date: new Date().toLocaleDateString('pt-BR') };
    setData(prev => ({ ...prev, [item.tagId]: [...(prev[item.tagId] || []), newItem] }));
    await supabase.from('info_items').insert({
      id: newItem.id,
      tag_id: item.tagId,
      title: newItem.title,
      content: newItem.content,
      date: newItem.date,
      info: newItem.info,
      user_id: newItem.user_id
    });
  };
  const addInfoTag = (tag: Omit<InfoTag, 'id'>) => addInfoTagGeneric(tag, 'anotacoes', setInfoTags);
  const updateInfoTag = (tag: InfoTag) => updateInfoTagGeneric(tag, setInfoTags);
  const deleteInfoTag = (tagId: string) => deleteInfoTagGeneric(tagId, setInfoTags);
  const reorderInfoTags = () => { };

  const addInfoItem = (item: Omit<InfoItem, 'id' | 'date'>) => {
    // Injetar user_id para anotações pessoais
    const itemWithUser = { ...item, user_id: user?.id };
    addInfoItemGeneric(itemWithUser, setInfoData);
  };

  const updateInfoItem = (item: InfoItem) => {
    setInfoData(prev => ({ ...prev, [item.tagId]: prev[item.tagId].map(i => i.id === item.id ? item : i) }));
    supabase.from('info_items').update({ title: item.title, content: item.content, info: item.info }).eq('id', item.id).then();
  };
  const deleteInfoItem = (itemId: string, tagId: string) => {
    setInfoData(prev => ({ ...prev, [tagId]: prev[tagId].filter(i => i.id !== itemId) }));
    supabase.from('info_items').delete().eq('id', itemId).then();
  };
  const addEstomaterapiaTag = (tag: Omit<InfoTag, 'id'>) => addInfoTagGeneric(tag, 'estomaterapia', setEstomaterapiaTags);
  const updateEstomaterapiaTag = (tag: InfoTag) => updateInfoTagGeneric(tag, setEstomaterapiaTags);
  const deleteEstomaterapiaTag = (tagId: string) => deleteInfoTagGeneric(tagId, setEstomaterapiaTags);
  const reorderEstomaterapiaTags = () => { };
  const addEstomaterapiaItem = (item: Omit<InfoItem, 'id' | 'date'>) => addInfoItemGeneric(item, setEstomaterapiaData);
  const updateEstomaterapiaItem = (item: InfoItem) => {
    setEstomaterapiaData(prev => ({ ...prev, [item.tagId]: prev[item.tagId].map(i => i.id === item.id ? item : i) }));
    supabase.from('info_items').update({ title: item.title, content: item.content, info: item.info }).eq('id', item.id).then();
  };
  const deleteEstomaterapiaItem = (itemId: string, tagId: string) => {
    setEstomaterapiaData(prev => ({ ...prev, [tagId]: prev[tagId].filter(i => i.id !== itemId) }));
    supabase.from('info_items').delete().eq('id', itemId).then();
  };

  // Stubs
  const addExamDeliveryAttendant = () => { };
  const updateExamDeliveryAttendant = () => { };
  const deleteExamDeliveryAttendant = () => { };
  const updateHeaderTag = async (id: string, updates: Omit<HeaderTagInfo, 'id' | 'tag'>) => {
    setHeaderTagData(prev => prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
    const dbUpdates: any = { ...updates };
    if (updates.phones) dbUpdates.phones = JSON.stringify(updates.phones);
    if (updates.contacts) dbUpdates.contacts = JSON.stringify(updates.contacts);
    await supabase.from('header_tags').update(dbUpdates).eq('id', id);
  };
  const loadExamsFromDatabase = async () => { };
  const setValueTableDataAndCategories = () => { };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    if (user) {
      try {
        // Update both profiles table and auth metadata
        await supabase.from('profiles').update({
          display_name: name,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);

        await updateProfile({ displayName: name });
      } catch (error) {
        console.error('Error updating user name:', error);
      }
    }
  };

  return (
    <DataContext.Provider value={{
      userName, setUserName,
      headerTagData, updateHeaderTag,
      scriptCategories, scriptData, addScriptCategory, updateScriptCategory, deleteScriptCategory, reorderScriptCategories, addScript, updateScript, deleteScript,
      examCategories, examData, addExamCategory, updateExamCategory, deleteExamCategory, reorderExamCategories, addExam, updateExam, deleteExam, syncValueTableToExams,
      contactCategories, contactData, addContactCategory, updateContactCategory, deleteContactCategory, addContactGroup, updateContactGroup, deleteContactGroup, addContactPoint, updateContactPoint, deleteContactPoint,
      valueTableCategories, valueTableData, addValueCategory, updateValueCategory, deleteValueCategory, reorderValueCategories, addValueTable, moveAndUpdateValueTable, deleteValueTable,
      professionalData, addProfessional, updateProfessional, deleteProfessional,
      officeData, addOffice, updateOffice, deleteOffice,
      noticeData, addNotice, updateNotice, deleteNotice,
      examDeliveryAttendants, addExamDeliveryAttendant, updateExamDeliveryAttendant, deleteExamDeliveryAttendant,
      recadoCategories, recadoData, addRecadoCategory, updateRecadoCategory, deleteRecadoCategory, reorderRecadoCategories, addRecadoItem, updateRecadoItem, deleteRecadoItem,
      infoTags, infoData, addInfoTag, updateInfoTag, deleteInfoTag, reorderInfoTags, addInfoItem, updateInfoItem, deleteInfoItem,
      estomaterapiaTags, estomaterapiaData, addEstomaterapiaTag, updateEstomaterapiaTag, deleteEstomaterapiaTag, reorderEstomaterapiaTags, addEstomaterapiaItem, updateEstomaterapiaItem, deleteEstomaterapiaItem,
      hasUnsavedChanges, saveToLocalStorage, loadFromLocalStorage, exportAllData, importAllData, loadExamsFromDatabase, setValueTableDataAndCategories,
      isLoading: loading
    }}>
      {children}
    </DataContext.Provider>
  );
};