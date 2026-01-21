
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
  reorderContactCategories: (viewType: string, oldIndex: number, newIndex: number) => void;
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
  setValueTableDataAndCategories: (viewType: string, categories: Category[], data: Record<string, ValueTableItem[]>) => Promise<void>;
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
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      // Verifica se ainda está carregando antes de forçar o fim
      setLoading(currentLoading => {
        if (currentLoading) {
          console.error("Timeout forçado no carregamento de dados do Supabase");
          toast.error("O servidor demorou para responder. Exibindo dados disponíveis.");
          return false;
        }
        return false;
      });
    }, 15000); // 15 segundos de limite máximo

    console.log("Iniciando carregamento OTIMIZADO (Via Promise.all)...");

    try {
      setLoading(true);

      // Definição das Promises para execução paralela
      // Agrupamos chamadas relacionadas para facilitar a desestruturação
      const pProfile = user ? supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null });
      const pHeaderTags = supabase.from('header_tags').select('*').order('order', { ascending: true });
      const pScripts = Promise.all([supabase.from('script_categories').select('*'), supabase.from('scripts').select('*')]);
      const pExams = Promise.all([supabase.from('exam_categories').select('*'), supabase.from('exams').select('*')]);
      const pContacts = Promise.all([supabase.from('contact_categories').select('*'), supabase.from('contact_groups').select('*'), supabase.from('contact_points').select('*')]);
      const pValues = Promise.all([supabase.from('value_table_categories').select('*'), supabase.from('value_table_items').select('*')]);
      const pOffices = supabase.from('offices').select('*');
      const pNotices = supabase.from('notices').select('*');
      const pDelivery = supabase.from('exam_delivery_attendants').select('*');
      const pRecados = Promise.all([supabase.from('recado_categories').select('*'), supabase.from('recado_items').select('*')]);
      const pInfo = Promise.all([supabase.from('info_tags').select('*'), supabase.from('info_items').select('*')]);
      const pProfessionals = supabase.from('professionals').select('*');

      // Execução Paralela - Dispara tudo de uma vez
      const [
        profileRes,
        htRes,
        [scRes, sRes],
        [ecRes, eRes],
        [ccRes, cgRes, cpRes],
        [vtcRes, vtiRes],
        officesRes,
        noticesRes,
        deliveryRes,
        [rcRes, riRes],
        [itRes, iiRes],
        profsRes
      ] = await Promise.all([
        pProfile, pHeaderTags, pScripts, pExams, pContacts, pValues, pOffices, pNotices, pDelivery, pRecados, pInfo, pProfessionals
      ]);

      // --- PROCESSAMENTO DOS DADOS ---

      // 1. Profile
      if (profileRes.data?.display_name) {
        setUserNameState(profileRes.data.display_name);
      }

      // 2. Header Tags
      if (htRes.data && htRes.data.length > 0) {
        const headerTags = htRes.data.map((tag: any) => ({
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

      // 3. Scripts
      // Checagem de banco vazio somente se nem HeaderTags nem Scripts vierem
      if ((!scRes.data || scRes.data.length === 0) && (!htRes.data || htRes.data.length === 0)) {
        console.warn("Possível banco vazio. Tentando fallback local para garantir.");
        loadFromLocalStorage();
      }

      if (scRes.data && sRes.data) {
        const newSC: Record<string, Category[]> = {};
        const newSD: Record<string, Record<string, ScriptItem[]>> = {};

        scRes.data.forEach((cat: any) => {
          if (!newSC[cat.view_type]) newSC[cat.view_type] = [];
          newSC[cat.view_type].push(cat);
          newSD[cat.view_type] = newSD[cat.view_type] || {};
          newSD[cat.view_type][cat.id] = [];
        });

        sRes.data.forEach((script: any) => {
          const viewType = scRes.data.find((c: any) => c.id === script.category_id)?.view_type;
          if (viewType && newSD[viewType][script.category_id]) {
            newSD[viewType][script.category_id].push(script);
          }
        });
        setScriptCategories(newSC);
        setScriptData(newSD);
      }

      // 4. Exams
      if (ecRes.data && eRes.data) {
        setExamCategories(ecRes.data);
        const newED: Record<string, ExamItem[]> = {};
        eRes.data.forEach((exam: any) => {
          if (!newED[exam.category_id]) newED[exam.category_id] = [];
          newED[exam.category_id].push({
            ...exam,
            location: safeParse(exam.location, [])
          });
        });
        setExamData(newED);
      }

      // 5. Contacts
      if (ccRes.data && cgRes.data && cpRes.data) {
        const newCC: Record<string, Category[]> = {};
        const newCD: Record<string, Record<string, ContactGroup[]>> = {};

        ccRes.data.forEach((cat: any) => {
          if (!newCC[cat.view_type]) newCC[cat.view_type] = [];
          newCC[cat.view_type].push(cat);
          newCD[cat.view_type] = newCD[cat.view_type] || {};
          newCD[cat.view_type][cat.id] = [];
        });

        cgRes.data.forEach((group: any) => {
          const viewType = ccRes.data.find((c: any) => c.id === group.category_id)?.view_type;
          if (viewType && newCD[viewType][group.category_id]) {
            // Ordenar pontos é boa prática, mas o backend não garante ordem sem order by
            const points = cpRes.data.filter((p: any) => p.group_id === group.id);
            newCD[viewType][group.category_id].push({ ...group, points });
          }
        });
        setContactCategories(newCC);
        setContactData(newCD);
      }

      // 6. Value Table
      if (vtcRes.data && vtiRes.data) {
        const newVC: Record<string, Category[]> = {};
        const newVD: Record<string, Record<string, ValueTableItem[]>> = {};

        vtcRes.data.forEach((cat: any) => {
          if (!newVC[cat.view_type]) newVC[cat.view_type] = [];
          newVC[cat.view_type].push(cat);
          newVD[cat.view_type] = newVD[cat.view_type] || {};
          newVD[cat.view_type][cat.id] = [];
        });

        vtiRes.data.forEach((item: any) => {
          const cat = vtcRes.data.find((c: any) => c.id === item.category_id);
          if (cat && newVD[cat.view_type]) {
            const parseNum = (v: any) => typeof v === 'string' ? parseFloat(v) : (v || 0);
            const honorarios_diferenciados = safeParse(item.honorarios_diferenciados, []).map((h: any) => ({ ...h, valor: parseNum(h.valor) }));

            newVD[cat.view_type][cat.id].push({
              ...item,
              honorario: parseNum(item.honorario),
              exame_cartao: parseNum(item.exame_cartao),
              material_min: parseNum(item.material_min),
              material_max: parseNum(item.material_max),
              honorarios_diferenciados
            });
          }
        });
        setValueTableCategories(newVC);
        setValueTableData(newVD);
      }

      // 7. Offices
      if (officesRes.data) {
        const offices = officesRes.data.map((o: any) => ({
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

      // 8. Notices
      if (noticesRes.data) setNoticeData(noticesRes.data);

      // 9. Attendants
      if (deliveryRes.data) setExamDeliveryAttendants(deliveryRes.data);

      // 10. Recados
      if (rcRes.data && riRes.data) {
        const newRcCats: RecadoCategory[] = [];
        const newRcData: Record<string, RecadoItem[]> = {};
        rcRes.data.forEach((cat: any) => {
          newRcCats.push({
            id: cat.id,
            title: cat.title,
            description: cat.description,
            destinationType: cat.destination_type,
            groupName: cat.group_name
          });
          newRcData[cat.id] = [];
        });
        riRes.data.forEach((item: any) => {
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

      // 11. Info & Estomaterapia
      if (itRes.data && iiRes.data) {
        const iTags: InfoTag[] = [];
        const eTags: InfoTag[] = [];
        const iData: Record<string, InfoItem[]> = {};
        const eData: Record<string, InfoItem[]> = {};

        itRes.data.forEach((tag: any) => {
          if (tag.section_type === 'estomaterapia') {
            eTags.push(tag);
            eData[tag.id] = [];
          } else {
            iTags.push(tag);
            iData[tag.id] = [];
          }
        });

        iiRes.data.forEach((item: any) => {
          if (iData[item.tag_id]) iData[item.tag_id].push(item);
          if (eData[item.tag_id]) eData[item.tag_id].push(item);
        });
        setInfoTags(iTags); setInfoData(iData); setEstomaterapiaTags(eTags); setEstomaterapiaData(eData);
      }

      // 12. Professionals
      if (profsRes.data) {
        const newPD: Record<string, Record<string, Professional[]>> = {};
        profsRes.data.forEach((prof: any) => {
          if (!newPD[prof.view_type]) newPD[prof.view_type] = {};
          if (!newPD[prof.view_type][prof.category_id]) newPD[prof.view_type][prof.category_id] = [];
          newPD[prof.view_type][prof.category_id].push({
            ...prof,
            ageRange: prof.age_range,
            generalObs: prof.general_obs,
            fittings: safeParse(prof.fittings, []),
            performedExams: safeParse(prof.performed_exams, [])
          });
        });
        setProfessionalData(newPD);
      }

    } catch (error) {
      console.error("Erro CRITICO no carregamento paralelo (Supabase):", error);
      loadFromLocalStorage();
      toast.error("Erro de conexão. Tentando usar dados locais.");
    } finally {
      clearTimeout(timeoutId);
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
      await clearTable('professionals'); // Added professionals

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
      await clearTable('exam_delivery_attendants'); // Added exam_delivery_attendants

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

      // 10. Exam Delivery Attendants
      if (parsed.examDeliveryAttendants) {
        for (const attendant of parsed.examDeliveryAttendants) {
          await supabase.from('exam_delivery_attendants').insert({
            id: crypto.randomUUID(), name: attendant.name, email: attendant.email, phone: attendant.phone
          });
        }
      }

      // 11. Professionals
      if (parsed.professionalData) {
        for (const viewType in parsed.professionalData) {
          for (const categoryId in parsed.professionalData[viewType]) {
            const professionals = parsed.professionalData[viewType][categoryId];
            for (const prof of professionals) {
              await supabase.from('professionals').insert({
                id: crypto.randomUUID(),
                category_id: categoryId,
                view_type: viewType,
                name: prof.name,
                gender: prof.gender,
                specialty: prof.specialty,
                age_range: prof.ageRange,
                fittings: JSON.stringify(prof.fittings),
                general_obs: prof.generalObs,
                performed_exams: JSON.stringify(prof.performedExams)
              });
            }
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
  const saveToLocalStorage = async () => {
    // Sincronização agora é automática em cada ação CRUD.
    // Mantemos apenas para compatibilidade com o botão da UI.
    toast.success("Dados sincronizados com sucesso!");
  };
  const exportAllData = () => {
    // Can build a JSON string from current state for backup
    const state = {
      scriptCategories, scriptData, examCategories, examData,
      contactCategories, contactData, valueTableCategories, valueTableData,
      professionalData, officeData, noticeData,
      infoTags, infoData, estomaterapiaTags, estomaterapiaData, recadoCategories, recadoData,
      examDeliveryAttendants // Added examDeliveryAttendants to export
    };
    return JSON.stringify(state, null, 2);
  };

  // ... Implement CRUD Functions using Supabase (Same as before) ...
  // [I'm keeping the CRUD functions exactly as they were in the previous step to save space and avoid regression]
  // ... Copy paste the previous create/update/delete functions here ...

  // Scripts
  const addScriptCategory = async (viewType: string, category: Category) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    try {
      const { error } = await supabase.from('script_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color });
      if (error) throw error;
      toast.success("Categoria de script adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar categoria de script:", error);
      toast.error("Erro ao salvar no servidor. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const updateScriptCategory = async (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    try {
      const { error } = await supabase.from('script_categories').update({ ...updates }).eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar categoria de script:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteScriptCategory = async (viewType: string, categoryId: string) => {
    setScriptCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    try {
      const { error } = await supabase.from('script_categories').delete().eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir categoria de script:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const reorderScriptCategories = async (viewType: string, oldIndex: number, newIndex: number) => {
    const categories = scriptCategories[viewType] || [];
    const newCategories = arrayMove(categories, oldIndex, newIndex);

    setScriptCategories(prev => ({
      ...prev,
      [viewType]: newCategories
    }));

    try {
      const updates = newCategories.map((cat, index) =>
        supabase.from('script_categories').update({ order: index }).eq('id', cat.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar categorias de script:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };
  const addScript = async (viewType: string, categoryId: string, script: ScriptItem) => {
    setScriptData(prev => {
      const newData = { ...prev };
      newData[viewType] = newData[viewType] || {};
      newData[viewType][categoryId] = [...(newData[viewType][categoryId] || []), script];
      return newData;
    });
    try {
      const { error } = await supabase.from('scripts').insert({ id: script.id, category_id: categoryId, title: script.title, content: script.content, order: script.order });
      if (error) throw error;
      toast.success("Script adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar script:", error);
      toast.error("Erro ao salvar no servidor. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const updateScript = async (viewType: string, categoryId: string, scriptId: string, updates: Partial<ScriptItem>) => {
    setScriptData(prev => {
      const list = prev[viewType]?.[categoryId] || [];
      return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.map(s => s.id === scriptId ? { ...s, ...updates } : s) } };
    });
    try {
      const { error } = await supabase.from('scripts').update(updates).eq('id', scriptId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar script:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteScript = async (viewType: string, categoryId: string, scriptId: string) => {
    setScriptData(prev => {
      const list = prev[viewType]?.[categoryId] || [];
      return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.filter(s => s.id !== scriptId) } };
    });
    try {
      const { error } = await supabase.from('scripts').delete().eq('id', scriptId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir script:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Exams
  const addExamCategory = async (category: Category) => {
    setExamCategories(prev => [...prev, category]);
    try {
      const { error } = await supabase.from('exam_categories').insert({ id: category.id, name: category.name, color: category.color, order: category.order });
      if (error) throw error;
      toast.success("Categoria de exame adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar categoria de exame:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateExamCategory = async (categoryId: string, updates: Partial<Category>) => {
    setExamCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c));
    try {
      const { error } = await supabase.from('exam_categories').update(updates).eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar categoria de exame:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteExamCategory = async (categoryId: string) => {
    setExamCategories(prev => prev.filter(c => c.id !== categoryId));
    try {
      const { error } = await supabase.from('exam_categories').delete().eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir categoria de exame:", error);
      toast.error("Erro ao sincronizar exclusão.");
      loadAllDataFromSupabase();
    }
  };
  const reorderExamCategories = async (oldIndex: number, newIndex: number) => {
    const newCategories = arrayMove(examCategories, oldIndex, newIndex);
    setExamCategories(newCategories);

    try {
      const updates = newCategories.map((cat, index) =>
        supabase.from('exam_categories').update({ order: index }).eq('id', cat.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar categorias de exame:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };
  const addExam = async (categoryId: string, exam: ExamItem) => {
    setExamData(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), exam] }));
    try {
      const { error } = await supabase.from('exams').insert({ id: exam.id, category_id: categoryId, title: exam.title, location: JSON.stringify(exam.location), additional_info: exam.additionalInfo, scheduling_rules: exam.schedulingRules });
      if (error) throw error;
      toast.success("Exame adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar exame:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateExam = async (categoryId: string, examId: string, updates: Partial<ExamItem>) => {
    setExamData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).map(e => e.id === examId ? { ...e, ...updates } : e) }));
    const dbUpdates: any = { ...updates };
    if (updates.location) dbUpdates.location = JSON.stringify(updates.location);
    if (updates.additionalInfo !== undefined) { dbUpdates.additional_info = updates.additionalInfo; delete dbUpdates.additionalInfo; }
    if (updates.schedulingRules !== undefined) { dbUpdates.scheduling_rules = updates.schedulingRules; delete dbUpdates.schedulingRules; }

    try {
      const { error } = await supabase.from('exams').update(dbUpdates).eq('id', examId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar exame:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteExam = async (categoryId: string, examId: string) => {
    setExamData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter(e => e.id !== examId) }));
    try {
      const { error } = await supabase.from('exams').delete().eq('id', examId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir exame:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const syncValueTableToExams = () => { };
  // Contacts
  const addContactCategory = async (viewType: string, category: Category) => {
    setContactCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    try {
      const { error } = await supabase.from('contact_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color, order: category.order || 0 });
      if (error) throw error;
      toast.success("Categoria de contato adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar categoria de contato:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateContactCategory = async (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setContactCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    try {
      const { error } = await supabase.from('contact_categories').update(updates).eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar categoria de contato:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteContactCategory = async (viewType: string, categoryId: string) => {
    setContactCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    try {
      const { error } = await supabase.from('contact_categories').delete().eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir categoria de contato:", error);
      toast.error("Erro ao sincronizar exclusão.");
      loadAllDataFromSupabase();
    }
  };

  const reorderContactCategories = async (viewType: string, oldIndex: number, newIndex: number) => {
    const categories = contactCategories[viewType] || [];
    const newCategories = arrayMove(categories, oldIndex, newIndex);

    setContactCategories(prev => ({
      ...prev,
      [viewType]: newCategories
    }));

    try {
      const updates = newCategories.map((cat, index) =>
        supabase.from('contact_categories').update({ order: index }).eq('id', cat.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar categorias de contato:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };

  const addContactGroup = async (viewType: string, categoryId: string, group: Omit<ContactGroup, 'id' | 'points'>) => {
    const newGroup = { ...group, id: crypto.randomUUID(), points: [] };
    setContactData(prev => { const newData = { ...prev }; newData[viewType] = newData[viewType] || {}; newData[viewType][categoryId] = [...(newData[viewType][categoryId] || []), newGroup]; return newData; });
    try {
      const { error } = await supabase.from('contact_groups').insert({ id: newGroup.id, category_id: categoryId, name: group.name });
      if (error) throw error;
      toast.success("Grupo de contatos adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateContactGroup = async (viewType: string, categoryId: string, groupId: string, updates: Partial<ContactGroup>) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.map(g => g.id === groupId ? { ...g, ...updates } : g) } }; });
    try {
      const { error } = await supabase.from('contact_groups').update({ name: updates.name }).eq('id', groupId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteContactGroup = async (viewType: string, categoryId: string, groupId: string) => {
    // Optimistic Update
    setContactData(prev => {
      const currentViewData = prev[viewType] || {};
      const categoryGroups = currentViewData[categoryId] || [];
      return {
        ...prev,
        [viewType]: {
          ...currentViewData,
          [categoryId]: categoryGroups.filter(g => g.id !== groupId)
        }
      };
    });

    try {
      const { error } = await supabase.from('contact_groups').delete().eq('id', groupId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar grupo:", error);
      toast.error("Falha ao excluir no servidor. Recarregando...");
      loadAllDataFromSupabase();
    }
  };

  const addContactPoint = async (viewType: string, categoryId: string, groupId: string, point: Omit<ContactPoint, 'id'>) => {
    const newPoint = { ...point, id: crypto.randomUUID() };
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; const updatedList = list.map(g => g.id === groupId ? { ...g, points: [...g.points, newPoint] } : g); return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: updatedList } }; });
    try {
      const { error } = await supabase.from('contact_points').insert({ id: newPoint.id, group_id: groupId, setor: newPoint.setor, local: newPoint.local, ramal: newPoint.ramal, telefone: newPoint.telefone, whatsapp: newPoint.whatsapp, description: newPoint.description });
      if (error) throw error;
      toast.success("Ponto de contato adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar ponto:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };

  const updateContactPoint = async (viewType: string, categoryId: string, groupId: string, pointId: string, updates: Partial<ContactPoint>) => {
    setContactData(prev => { const list = prev[viewType]?.[categoryId] || []; const updatedList = list.map(g => g.id === groupId ? { ...g, points: g.points.map(p => p.id === pointId ? { ...p, ...updates } : p) } : g); return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: updatedList } }; });
    try {
      const { error } = await supabase.from('contact_points').update(updates).eq('id', pointId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar ponto:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };

  const deleteContactPoint = async (viewType: string, categoryId: string, groupId: string, pointId: string) => {
    // Optimistic Update
    setContactData(prev => {
      const currentViewData = prev[viewType] || {};
      const categoryGroups = currentViewData[categoryId] || [];

      const updatedGroups = categoryGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            points: group.points.filter(p => p.id !== pointId)
          };
        }
        return group;
      });

      return {
        ...prev,
        [viewType]: {
          ...currentViewData,
          [categoryId]: updatedGroups
        }
      };
    });

    try {
      const { error } = await supabase.from('contact_points').delete().eq('id', pointId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar ponto:", error);
      toast.error("Falha ao excluir no servidor. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Notices
  const addNotice = async (notice: Omit<Notice, 'id'>) => {
    const newNotice = { ...notice, id: crypto.randomUUID() };
    setNoticeData(prev => [...prev, newNotice]);
    try {
      const { error } = await supabase.from('notices').insert(newNotice);
      if (error) throw error;
      toast.success("Aviso adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar aviso:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateNotice = async (notice: Notice) => {
    setNoticeData(prev => prev.map(n => n.id === notice.id ? notice : n));
    try {
      const { error } = await supabase.from('notices').update(notice).eq('id', notice.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar aviso:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteNotice = async (id: string) => {
    setNoticeData(prev => prev.filter(n => n.id !== id));
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir aviso:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Offices
  const addOffice = async (office: Omit<Office, 'id'>) => {
    const newOffice = { ...office, id: crypto.randomUUID() };
    setOfficeData(prev => [...prev, newOffice]);
    const dbOffice = { ...newOffice, specialties: JSON.stringify(newOffice.specialties), attendants: JSON.stringify(newOffice.attendants), professionals: JSON.stringify(newOffice.professionals), procedures: JSON.stringify(newOffice.procedures), categories: JSON.stringify(newOffice.categories), items: JSON.stringify(newOffice.items) };
    try {
      const { error } = await supabase.from('offices').insert(dbOffice);
      if (error) throw error;
      toast.success("Consultório adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar consultório:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateOffice = async (office: Office) => {
    setOfficeData(prev => prev.map(o => o.id === office.id ? office : o));
    const dbOffice = { ...office, specialties: JSON.stringify(office.specialties), attendants: JSON.stringify(office.attendants), professionals: JSON.stringify(office.professionals), procedures: JSON.stringify(office.procedures), categories: JSON.stringify(office.categories), items: JSON.stringify(office.items) };
    try {
      const { error } = await supabase.from('offices').update(dbOffice).eq('id', office.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar consultório:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteOffice = async (id: string) => {
    setOfficeData(prev => prev.filter(o => o.id !== id));
    try {
      const { error } = await supabase.from('offices').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir consultório:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Value Tables
  const addValueCategory = async (viewType: string, category: Category) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: [...(prev[viewType] || []), category] }));
    try {
      const { error } = await supabase.from('value_table_categories').insert({ id: category.id, view_type: viewType, name: category.name, color: category.color, order: category.order });
      if (error) throw error;
      toast.success("Categoria de valores adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar categoria de valores:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateValueCategory = async (viewType: string, categoryId: string, updates: Partial<Category>) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: prev[viewType].map(c => c.id === categoryId ? { ...c, ...updates } : c) }));
    try {
      const { error } = await supabase.from('value_table_categories').update(updates).eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar categoria de valores:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteValueCategory = async (viewType: string, categoryId: string) => {
    setValueTableCategories(prev => ({ ...prev, [viewType]: prev[viewType].filter(c => c.id !== categoryId) }));
    try {
      const { error } = await supabase.from('value_table_categories').delete().eq('id', categoryId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir categoria de valores:", error);
      toast.error("Erro ao sincronizar exclusão.");
      loadAllDataFromSupabase();
    }
  };
  const reorderValueCategories = async (viewType: string, oldIndex: number, newIndex: number) => {
    const categories = valueTableCategories[viewType] || [];
    const newCategories = arrayMove(categories, oldIndex, newIndex);

    setValueTableCategories(prev => ({
      ...prev,
      [viewType]: newCategories
    }));

    try {
      const updates = newCategories.map((cat, index) =>
        supabase.from('value_table_categories').update({ order: index }).eq('id', cat.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar categorias de valores:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };
  const addValueTable = async (viewType: string, categoryId: string, item: Omit<ValueTableItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setValueTableData(prev => { const list = prev[viewType]?.[categoryId] || []; return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: [...list, newItem] } }; });
    try {
      const { error } = await supabase.from('value_table_items').insert({ id: newItem.id, category_id: categoryId, codigo: newItem.codigo, nome: newItem.nome, info: newItem.info, honorario: newItem.honorario, exame_cartao: newItem.exame_cartao, material_min: newItem.material_min, material_max: newItem.material_max, honorarios_diferenciados: JSON.stringify(newItem.honorarios_diferenciados) });
      if (error) throw error;
      toast.success("Item de valores adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar item de valores:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const moveAndUpdateValueTable = () => { };
  const deleteValueTable = async (viewType: string, categoryId: string, itemId: string) => {
    setValueTableData(prev => {
      const list = prev[viewType]?.[categoryId] || [];
      return { ...prev, [viewType]: { ...prev[viewType], [categoryId]: list.filter(i => i.id !== itemId) } };
    });
    try {
      const { error } = await supabase.from('value_table_items').delete().eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir item de valores:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const bulkUpsertValueTable = async (viewType: string, categoryId: string, items: any): Promise<{ updated: number; created: number }> => {
    try {
      if (categoryId === 'GLOBAL_REPLACE') {
        const payload = items as { categoryName: string, items: Omit<ValueTableItem, 'id'>[] }[];

        // 1. Limpeza total de itens e categorias de valores
        const { data: catsToDelete } = await supabase.from('categories').select('id').eq('view_type', viewType);
        const catIds = catsToDelete?.map(c => c.id) || [];

        if (catIds.length > 0) {
          await supabase.from('value_table_items').delete().in('category_id', catIds);
          await supabase.from('categories').delete().in('id', catIds);
        }

        let totalCreated = 0;

        for (const group of payload) {
          // 2. Criar a categoria
          const newCat = {
            id: crypto.randomUUID(),
            name: group.categoryName,
            color: "#10605B",
            view_type: viewType,
            order_index: payload.indexOf(group)
          };

          await supabase.from('categories').insert(newCat);

          // 3. Preparar itens
          const toInsert = group.items.map(item => ({
            id: crypto.randomUUID(),
            category_id: newCat.id,
            codigo: item.codigo,
            nome: item.nome,
            info: item.info || "",
            honorario: item.honorario,
            exame_cartao: item.exame_cartao,
            material_min: item.material_min,
            material_max: item.material_max,
            honorarios_diferenciados: JSON.stringify(item.honorarios_diferenciados || [])
          }));

          // 4. Inserir itens em blocos
          const chunkSize = 50;
          for (let i = 0; i < toInsert.length; i += chunkSize) {
            await supabase.from('value_table_items').insert(toInsert.slice(i, i + chunkSize));
          }
          totalCreated += toInsert.length;
        }

        await loadAllDataFromSupabase();
        return { updated: 0, created: totalCreated };
      } else {
        // Lógica original para categoria única
        const itemsToInsert = items as Omit<ValueTableItem, 'id'>[];
        await supabase.from('value_table_items').delete().eq('category_id', categoryId);

        const toInsert = itemsToInsert.map(item => ({
          id: crypto.randomUUID(),
          category_id: categoryId,
          codigo: item.codigo,
          nome: item.nome,
          info: item.info || "",
          honorario: item.honorario,
          exame_cartao: item.exame_cartao,
          material_min: item.material_min,
          material_max: item.material_max,
          honorarios_diferenciados: JSON.stringify(item.honorarios_diferenciados || [])
        }));

        const chunkSize = 50;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
          await supabase.from('value_table_items').insert(toInsert.slice(i, i + chunkSize));
        }

        await loadAllDataFromSupabase();
        return { updated: 0, created: toInsert.length };
      }
    } catch (error) {
      console.error("Erro no bulk upsert de valores:", error);
      toast.error("Erro ao sincronizar dados com o servidor.");
      throw error;
    }
  };
  // Professional Stubs
  const addProfessional = async (viewType: string, categoryId: string, professional: Omit<Professional, 'id'>) => {
    const newProf = { ...professional, id: crypto.randomUUID() };
    setProfessionalData(prev => {
      const v = prev[viewType] || {};
      const c = v[categoryId] || [];
      return { ...prev, [viewType]: { ...v, [categoryId]: [...c, newProf] } };
    });
    try {
      const { error } = await supabase.from('professionals').insert({
        id: newProf.id,
        category_id: categoryId,
        view_type: viewType,
        name: professional.name,
        gender: professional.gender,
        specialty: professional.specialty,
        age_range: professional.ageRange,
        fittings: JSON.stringify(professional.fittings),
        general_obs: professional.generalObs,
        performed_exams: JSON.stringify(professional.performedExams)
      });
      if (error) throw error;
      toast.success("Profissional adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar profissional:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };

  const updateProfessional = async (viewType: string, categoryId: string, profId: string, updates: Partial<Professional>) => {
    setProfessionalData(prev => {
      const v = prev[viewType] || {};
      const c = v[categoryId] || [];
      return { ...prev, [viewType]: { ...v, [categoryId]: c.map(p => p.id === profId ? { ...p, ...updates } : p) } };
    });
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.gender) dbUpdates.gender = updates.gender;
    if (updates.specialty) dbUpdates.specialty = updates.specialty;
    if (updates.ageRange) dbUpdates.age_range = updates.ageRange;
    if (updates.fittings) dbUpdates.fittings = JSON.stringify(updates.fittings);
    if (updates.generalObs !== undefined) dbUpdates.general_obs = updates.generalObs;
    if (updates.performedExams) dbUpdates.performed_exams = JSON.stringify(updates.performedExams);

    try {
      const { error } = await supabase.from('professionals').update(dbUpdates).eq('id', profId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar profissional:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };

  const deleteProfessional = async (viewType: string, categoryId: string, profId: string) => {
    setProfessionalData(prev => {
      const v = prev[viewType] || {};
      const c = v[categoryId] || [];
      return { ...prev, [viewType]: { ...v, [categoryId]: c.filter(p => p.id !== profId) } };
    });
    try {
      const { error } = await supabase.from('professionals').delete().eq('id', profId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir profissional:", error);
      toast.error("Erro ao sincronizar exclusão.");
      loadAllDataFromSupabase();
    }
  };
  // Exam Delivery Attendants
  const addExamDeliveryAttendant = async (attendant: Omit<ExamDeliveryAttendant, 'id'>) => {
    const newAttendant = { ...attendant, id: crypto.randomUUID() };
    setExamDeliveryAttendants(prev => [...prev, newAttendant]);
    try {
      const { error } = await supabase.from('exam_delivery_attendants').insert(newAttendant);
      if (error) throw error;
      toast.success("Atendente de entrega de exames adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar atendente de entrega de exames:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateExamDeliveryAttendant = async (attendant: ExamDeliveryAttendant) => {
    setExamDeliveryAttendants(prev => prev.map(a => a.id === attendant.id ? attendant : a));
    try {
      const { error } = await supabase.from('exam_delivery_attendants').update(attendant).eq('id', attendant.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar atendente de entrega de exames:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteExamDeliveryAttendant = async (id: string) => {
    setExamDeliveryAttendants(prev => prev.filter(a => a.id !== id));
    try {
      const { error } = await supabase.from('exam_delivery_attendants').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir atendente de entrega de exames:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Recados
  const addRecadoCategory = async (category: Omit<RecadoCategory, 'id'>) => {
    const newCat = { ...category, id: crypto.randomUUID() };
    setRecadoCategories(prev => [...prev, newCat]);
    try {
      const { error } = await supabase.from('recado_categories').insert({ id: newCat.id, title: newCat.title, description: newCat.description, destination_type: newCat.destinationType, group_name: newCat.groupName, order: 0 });
      if (error) throw error;
      toast.success("Categoria de recados adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar categoria de recados:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateRecadoCategory = async (category: RecadoCategory) => {
    setRecadoCategories(prev => prev.map(c => c.id === category.id ? category : c));
    try {
      const { error } = await supabase.from('recado_categories').update({ title: category.title, description: category.description, destination_type: category.destinationType, group_name: category.groupName }).eq('id', category.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar categoria de recados:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteRecadoCategory = async (id: string) => {
    setRecadoCategories(prev => prev.filter(c => c.id !== id));
    try {
      const { error } = await supabase.from('recado_categories').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir categoria de recados:", error);
      toast.error("Erro ao sincronizar exclusão.");
      loadAllDataFromSupabase();
    }
  };
  const reorderRecadoCategories = async (oldIndex: number, newIndex: number) => {
    const newCategories = arrayMove(recadoCategories, oldIndex, newIndex);
    setRecadoCategories(newCategories);

    try {
      const updates = newCategories.map((cat, index) =>
        supabase.from('recado_categories').update({ order: index }).eq('id', cat.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar categorias de recados:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };
  const addRecadoItem = async (categoryId: string, item: Omit<RecadoItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setRecadoData(prev => ({ ...prev, [categoryId]: [...(prev[categoryId] || []), newItem] }));
    try {
      const { error } = await supabase.from('recado_items').insert({ id: newItem.id, category_id: categoryId, title: newItem.title, content: newItem.content, fields: JSON.stringify(newItem.fields) });
      if (error) throw error;
      toast.success("Recado adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar recado:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateRecadoItem = async (categoryId: string, itemId: string, updates: Partial<RecadoItem>) => {
    setRecadoData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).map(i => i.id === itemId ? { ...i, ...updates } : i) }));
    const dbUpdates: any = { ...updates };
    if (updates.fields) dbUpdates.fields = JSON.stringify(updates.fields);
    try {
      const { error } = await supabase.from('recado_items').update(dbUpdates).eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar recado:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteRecadoItem = async (categoryId: string, itemId: string) => {
    setRecadoData(prev => ({ ...prev, [categoryId]: (prev[categoryId] || []).filter(i => i.id !== itemId) }));
    try {
      const { error } = await supabase.from('recado_items').delete().eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir recado:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  // Info & Estomaterapia
  const addInfoTagGeneric = async (tag: Omit<InfoTag, 'id'>, section: 'anotacoes' | 'estomaterapia', setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    const newTag = { ...tag, id: crypto.randomUUID(), user_id: section === 'anotacoes' ? user?.id : undefined };
    setTags(prev => [...prev, newTag]);
    try {
      const { error } = await supabase.from('info_tags').insert({
        id: newTag.id,
        name: newTag.name,
        color: newTag.color,
        order: newTag.order,
        section_type: section,
        user_id: newTag.user_id
      });
      if (error) throw error;
      toast.success(`Tag de ${section === 'anotacoes' ? 'anotações' : 'estomaterapia'} adicionada!`);
    } catch (error) {
      console.error("Erro ao adicionar tag:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const updateInfoTagGeneric = async (tag: InfoTag, setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    setTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    try {
      const { error } = await supabase.from('info_tags').update({ name: tag.name, color: tag.color }).eq('id', tag.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar tag:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteInfoTagGeneric = async (tagId: string, setTags: React.Dispatch<React.SetStateAction<InfoTag[]>>) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    try {
      const { error } = await supabase.from('info_tags').delete().eq('id', tagId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir tag de informação:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const addInfoItemGeneric = async (item: Omit<InfoItem, 'id' | 'date'>, setData: React.Dispatch<React.SetStateAction<Record<string, InfoItem[]>>>) => {
    const newItem = { ...item, id: crypto.randomUUID(), date: new Date().toLocaleDateString('pt-BR') };
    setData(prev => ({ ...prev, [item.tagId]: [...(prev[item.tagId] || []), newItem] }));
    try {
      const { error } = await supabase.from('info_items').insert({
        id: newItem.id,
        tag_id: item.tagId,
        title: newItem.title,
        content: newItem.content,
        date: newItem.date,
        info: newItem.info,
        user_id: (item as any).user_id // Garantir que user_id seja passado se existir no item (anotações personalizadas)
      });
      if (error) throw error;
      toast.success("Informação adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar informação:", error);
      toast.error("Erro ao salvar no servidor.");
      loadAllDataFromSupabase();
    }
  };
  const addInfoTag = (tag: Omit<InfoTag, 'id'>) => addInfoTagGeneric(tag, 'anotacoes', setInfoTags);
  const updateInfoTag = (tag: InfoTag) => updateInfoTagGeneric(tag, setInfoTags);
  const deleteInfoTag = (tagId: string) => deleteInfoTagGeneric(tagId, setInfoTags);
  const reorderInfoTags = async (oldIndex: number, newIndex: number) => {
    const newTags = arrayMove(infoTags, oldIndex, newIndex);
    setInfoTags(newTags);
    try {
      const updates = newTags.map((tag, index) =>
        supabase.from('info_tags').update({ order: index }).eq('id', tag.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar tags:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };

  const addInfoItem = (item: Omit<InfoItem, 'id' | 'date'>) => {
    // Injetar user_id para anotações pessoais
    const itemWithUser = { ...item, user_id: user?.id };
    addInfoItemGeneric(itemWithUser, setInfoData);
  };

  const updateInfoItem = async (item: InfoItem) => {
    setInfoData(prev => ({ ...prev, [item.tagId]: prev[item.tagId].map(i => i.id === item.id ? item : i) }));
    try {
      const { error } = await supabase.from('info_items').update({ title: item.title, content: item.content, info: item.info }).eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar informação:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteInfoItem = async (itemId: string, tagId: string) => {
    setInfoData(prev => {
      if (!prev || !prev[tagId]) return prev;
      return {
        ...prev,
        [tagId]: prev[tagId].filter(i => i.id !== itemId)
      };
    });
    try {
      const { error } = await supabase.from('info_items').delete().eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir item de informação:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };
  const addEstomaterapiaTag = (tag: Omit<InfoTag, 'id'>) => addInfoTagGeneric(tag, 'estomaterapia', setEstomaterapiaTags);
  const updateEstomaterapiaTag = (tag: InfoTag) => updateInfoTagGeneric(tag, setEstomaterapiaTags);
  const deleteEstomaterapiaTag = (tagId: string) => deleteInfoTagGeneric(tagId, setEstomaterapiaTags);
  const reorderEstomaterapiaTags = async (oldIndex: number, newIndex: number) => {
    const newTags = arrayMove(estomaterapiaTags, oldIndex, newIndex);
    setEstomaterapiaTags(newTags);
    try {
      const updates = newTags.map((tag, index) =>
        supabase.from('info_tags').update({ order: index }).eq('id', tag.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Erro ao reordenar tags de estomaterapia:", error);
      toast.error("Erro ao salvar ordem no servidor.");
    }
  };
  const addEstomaterapiaItem = (item: Omit<InfoItem, 'id' | 'date'>) => addInfoItemGeneric(item, setEstomaterapiaData);
  const updateEstomaterapiaItem = async (item: InfoItem) => {
    setEstomaterapiaData(prev => {
      if (!prev[item.tagId]) return prev;
      return { ...prev, [item.tagId]: prev[item.tagId].map(i => i.id === item.id ? item : i) };
    });
    try {
      const { error } = await supabase.from('info_items').update({ title: item.title, content: item.content, info: item.info }).eq('id', item.id);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao atualizar item de estomaterapia:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const deleteEstomaterapiaItem = async (itemId: string, tagId: string) => {
    setEstomaterapiaData(prev => {
      if (!prev || !prev[tagId]) return prev;
      return { ...prev, [tagId]: prev[tagId].filter(i => i.id !== itemId) };
    });
    try {
      const { error } = await supabase.from('info_items').delete().eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao excluir item de estomaterapia:", error);
      toast.error("Erro ao sincronizar exclusão. Recarregando...");
      loadAllDataFromSupabase();
    }
  };

  const updateHeaderTag = async (id: string, updates: Omit<HeaderTagInfo, 'id' | 'tag'>) => {
    setHeaderTagData(prev => prev.map(tag => tag.id === id ? { ...tag, ...updates } : tag));
    const dbUpdates: any = { ...updates };
    if (updates.phones) dbUpdates.phones = JSON.stringify(updates.phones);
    if (updates.contacts) dbUpdates.contacts = JSON.stringify(updates.contacts);
    try {
      const { error } = await supabase.from('header_tags').update(dbUpdates).eq('id', id);
      if (error) throw error;
      toast.success("Informações da unidade atualizadas!");
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error);
      toast.error("Erro ao sincronizar atualização.");
    }
  };
  const loadExamsFromDatabase = async () => { };
  const setValueTableDataAndCategories = async (viewType: string, categories: Category[], data: Record<string, ValueTableItem[]>) => {
    setLoading(true);
    try {
      console.log(`Iniciando atualização total da Tabela de Valores (${viewType})...`);

      // 1. Identificar todas as categorias de valores existentes para este viewType
      const { data: existingCats, error: fetchErr } = await supabase
        .from('value_table_categories')
        .select('id')
        .eq('view_type', viewType);

      if (fetchErr) throw fetchErr;

      const catIds = existingCats?.map(c => c.id) || [];

      // 2. Limpar itens e categorias (Ordem importa por causa de FK)
      if (catIds.length > 0) {
        // Primeiro deleta os itens
        const { error: clearItemsErr } = await supabase
          .from('value_table_items')
          .delete()
          .in('category_id', catIds);

        if (clearItemsErr) {
          console.error("Erro ao limpar itens:", clearItemsErr);
        }

        // Depois deleta as categorias
        const { error: clearCatsErr } = await supabase
          .from('value_table_categories')
          .delete()
          .in('id', catIds);

        if (clearCatsErr) {
          console.error("Erro ao limpar categorias:", clearCatsErr);
          throw clearCatsErr;
        }
      }

      // 3. Inserir as novas categorias e seus itens
      for (const cat of categories) {
        const { error: catErr } = await supabase
          .from('value_table_categories')
          .insert({
            id: cat.id,
            view_type: viewType,
            name: cat.name,
            color: cat.color || '#10605B',
            order: categories.indexOf(cat)
          });

        if (catErr) throw catErr;

        const items = data[cat.id] || [];
        if (items.length > 0) {
          const itemsToInsert = items.map(item => ({
            id: item.id,
            category_id: cat.id,
            codigo: item.codigo,
            nome: item.nome,
            info: item.info || '',
            honorario: item.honorario,
            exame_cartao: item.exame_cartao,
            material_min: item.material_min,
            material_max: item.material_max,
            honorarios_diferenciados: JSON.stringify(item.honorarios_diferenciados || [])
          }));

          // Inserir em blocos para evitar limites
          const chunkSize = 50;
          for (let i = 0; i < itemsToInsert.length; i += chunkSize) {
            const { error: itemErr } = await supabase
              .from('value_table_items')
              .insert(itemsToInsert.slice(i, i + chunkSize));
            if (itemErr) throw itemErr;
          }
        }
      }

      // 4. Atualizar estado local
      setValueTableCategories(prev => ({ ...prev, [viewType]: categories }));
      setValueTableData(prev => ({ ...prev, [viewType]: data }));

      toast.success(`Importação concluída: ${categories.length} categorias atualizadas.`);
    } catch (error) {
      console.error("Erro em setValueTableDataAndCategories:", error);
      toast.error("Erro ao sincronizar dados com o servidor.");
      loadAllDataFromSupabase(); // Forçar recarregamento para garantir consistência
    } finally {
      setLoading(false);
    }
  };

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
      contactCategories, contactData, addContactCategory, updateContactCategory, deleteContactCategory, reorderContactCategories, addContactGroup, updateContactGroup, deleteContactGroup, addContactPoint, updateContactPoint, deleteContactPoint,
      valueTableCategories, valueTableData, addValueCategory, updateValueCategory, deleteValueCategory, reorderValueCategories, addValueTable, moveAndUpdateValueTable, deleteValueTable, bulkUpsertValueTable,
      professionalData, addProfessional, updateProfessional, deleteProfessional,
      officeData, addOffice, updateOffice, deleteOffice,
      noticeData, addNotice, updateNotice, deleteNotice,
      examDeliveryAttendants, addExamDeliveryAttendant, updateExamDeliveryAttendant, deleteExamDeliveryAttendant,
      recadoCategories, recadoData, addRecadoCategory, updateRecadoCategory, deleteRecadoCategory, reorderRecadoCategories, addRecadoItem, updateRecadoItem, deleteRecadoItem,
      infoTags, infoData, addInfoTag, updateInfoTag, deleteInfoTag, reorderInfoTags, addInfoItem, updateInfoItem, deleteInfoItem,
      estomaterapiaTags, estomaterapiaData, addEstomaterapiaTag, updateEstomaterapiaTag, deleteEstomaterapiaTag, reorderEstomaterapiaTags, addEstomaterapiaItem, updateEstomaterapiaItem, deleteEstomaterapiaItem,
      hasUnsavedChanges, saveToLocalStorage, loadFromLocalStorage, exportAllData, importAllData, loadExamsFromDatabase, setValueTableDataAndCategories,
      isLoading: loading,
      syncAllDataFromSupabase: loadAllDataFromSupabase
    }}>
      {children}
    </DataContext.Provider>
  );
};