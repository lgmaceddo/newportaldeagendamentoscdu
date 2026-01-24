import * as XLSX from 'xlsx';
import { ValueTableItem, Category } from '../types/data';

// Define a flexible row type for parsing
type FlexibleExcelRow = Record<string, any>;

// Helper para obter uma cor consistente para a categoria (baseado no nome)
function getCategoryColor(name: string): string {
    const colors = [
        'text-teal-800', 'text-blue-800', 'text-red-800', 'text-purple-800',
        'text-orange-800', 'text-green-800', 'text-pink-800', 'text-indigo-800'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function parseMoneyValue(value: any): number {
    if (value === undefined || value === null || value === '') return 0;

    // Se já for número, retorna ele mesmo
    if (typeof value === 'number') return value;

    // Se for string, limpa e converte
    const stringValue = String(value).trim();
    if (!stringValue) return 0;

    // Remove "R$", espaços, e trata pontos/vírgulas
    // Lógica para PT-BR: "1.200,50" -> "1200.50"
    const cleaned = stringValue
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

function parsePriceRange(value: any): { min: number, max: number } {
    if (value === undefined || value === null || value === '') return { min: 0, max: 0 };

    // Se for número, min e max são iguais
    if (typeof value === 'number') return { min: value, max: value };

    const stringValue = String(value).trim();
    if (!stringValue) return { min: 0, max: 0 };

    // Tenta encontrar números na string (ex: "500 a 1500" ou "500 - 1500")
    // Remove "R$" e espaços primeiro
    const normalized = stringValue.replace(/R\$/g, '').replace(/\s/g, '');

    // Procura por números com vírgula ou ponto decimal
    const matches = normalized.match(/[\d.]+(,[\d]+)?/g);

    if (matches && matches.length >= 2) {
        const n1 = parseMoneyValue(matches[0]);
        const n2 = parseMoneyValue(matches[1]);
        return { min: Math.min(n1, n2), max: Math.max(n1, n2) };
    }

    const val = parseMoneyValue(stringValue);
    return { min: val, max: val };
}

// Helper to normalize string (remove accents, convert to uppercase, remove non-alphanumeric)
function normalizeKey(str: string): string {
    if (typeof str !== 'string') return '';
    // Remove acentos, caracteres não alfanuméricos (exceto espaços), e converte para maiúsculas
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s/g, '');
}

// Mapeamento de chaves de busca para colunas essenciais
const KEY_MAP: Record<string, string[]> = {
    codigo: ['ITEM', 'CODIGO', 'COD', 'CDU', 'PROCEDIMENTO', 'CODIGO DO EXAME'],
    descricao: ['DESCRIÇÃO', 'DESCRICAO', 'NOME', 'EXAME', 'PROCEDIMENTO', 'NOME DO EXAME'],
    honorario: ['HONORÁRIO MÉDICO', 'HONORARIOMEDICO', 'HM', 'HONORARIO', 'PIX', 'HONORARIO PIX'],
    exameCartao: ['VALOR EXAME', 'VALOREXAME', 'PACOTECDU', 'VALORTOTAL', 'TOTAL', 'CARTAO', 'EXAME CARTAO', 'VALOR DO EXAME', 'VALOR TOTAL SEM CONTRASTE'],
    material: ['CONTRASTE, MATERIAIS E MEDICAMENTOS', 'CONTRASTE', 'MATERIAIS', 'MATERIAL', 'MEDICAMENTOS', 'MATERIAISEMEDICAMENTOS'], // Coluna de material
};

/**
 * Tenta encontrar a linha de cabeçalho e mapear os índices das colunas.
 * @param rawData Array de arrays representando as linhas do Excel.
 * @returns Objeto com o índice da linha de dados e o mapa de colunas.
 */
function findHeaderAndMapColumns(rawData: any[][]): { dataRowIndex: number; columnMap: Record<keyof typeof KEY_MAP, number> } {
    const columnMap: Record<keyof typeof KEY_MAP, number> = {};
    let dataRowIndex = -1;

    // Procurar nas primeiras 10 linhas pelo cabeçalho
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
        const row = rawData[i];
        const tempMap: Record<keyof typeof KEY_MAP, number> = {};
        let foundCount = 0;

        row.forEach((cell, index) => {
            if (typeof cell === 'string') {
                const normalizedCell = normalizeKey(cell);

                (Object.keys(KEY_MAP) as (keyof typeof KEY_MAP)[]).forEach(key => {
                    if (KEY_MAP[key].some(searchKey => normalizeKey(searchKey) === normalizedCell)) {
                        tempMap[key] = index;
                        foundCount++;
                    }
                });
            }
        });

        // Se encontrarmos pelo menos o código e a descrição, consideramos esta a linha de cabeçalho
        if (tempMap.codigo !== undefined && tempMap.descricao !== undefined) {
            // Usar o mapa encontrado e definir a próxima linha como o início dos dados
            Object.assign(columnMap, tempMap);
            dataRowIndex = i + 1;
            return { dataRowIndex, columnMap };
        }
    }

    // Se não encontrar, retorna -1 para indicar falha
    return { dataRowIndex: -1, columnMap: {} as Record<keyof typeof KEY_MAP, number> };
}


export function importExcelData(file: File): Promise<{
    values: Record<string, ValueTableItem[]>; // Retorna valores agrupados por CategoryId
    categories: Category[];
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                const importedCategories: Category[] = [];
                const valuesByCategory: Record<string, ValueTableItem[]> = {};

                const sheetNames = workbook.SheetNames;

                if (sheetNames.length === 0) {
                    return resolve({ values: {}, categories: [] });
                }

                sheetNames.forEach((sheetName, sheetIndex) => {
                    const worksheet = workbook.Sheets[sheetName];

                    const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

                    if (rawData.length === 0) return;

                    const { dataRowIndex, columnMap } = findHeaderAndMapColumns(rawData);

                    if (dataRowIndex === -1) {
                        console.warn(`Aviso: Não foi possível identificar o cabeçalho na aba "${sheetName}". Ignorando esta aba.`);
                        return;
                    }

                    const categoryId = crypto.randomUUID();
                    const category: Category = {
                        id: categoryId,
                        name: sheetName.trim().toUpperCase(),
                        color: getCategoryColor(sheetName),
                    };

                    importedCategories.push(category);
                    valuesByCategory[categoryId] = [];

                    const dataRows = rawData.slice(dataRowIndex);

                    // Determinar os valores de material para esta categoria/sheet
                    let material_min = 0;
                    let material_max = 0;

                    // Se a coluna 'material' foi detectada no cabeçalho, aplica o valor fixo
                    if (columnMap.material !== undefined) {
                        material_min = 0; // Removido valor fixo para evitar erros de interpretação
                        material_max = 0;
                    }

                    dataRows.forEach((row) => {
                        const codigo = row[columnMap.codigo];
                        const descricao = row[columnMap.descricao];

                        // Validação básica
                        if (!codigo || !descricao || String(codigo).trim() === '' || String(descricao).trim() === '') return;

                        // Ignora linhas que são obviamente cabeçalhos repetidos ou totais
                        const normalizedDescricao = normalizeKey(String(descricao));
                        const normalizedCodigo = normalizeKey(String(codigo));

                        // Se o código for igual ao cabeçalho "ITEM", "CODIGO", etc, ignora
                        if (KEY_MAP.codigo.some(k => normalizeKey(k) === normalizedCodigo)) return;

                        // Lista de palavras que indicam totais ou headers indesejados
                        const skipKeywords = ['TOTAL', 'VALORTOTAL', 'HONORARIOMEDICO', 'REPASSE', 'VALOREXAME'];
                        if (skipKeywords.some(keyword => normalizedDescricao === keyword || normalizedCodigo === keyword)) {
                            return;
                        }

                        // Parse dos valores monetários
                        const honorarioValue = columnMap.honorario !== undefined ? row[columnMap.honorario] : undefined;
                        const exameCartaoValue = columnMap.exameCartao !== undefined ? row[columnMap.exameCartao] : undefined;
                        const materialValue = columnMap.material !== undefined ? row[columnMap.material] : undefined;

                        const honorario = parseMoneyValue(honorarioValue);
                        const exameCartao = parseMoneyValue(exameCartaoValue);
                        const materialRange = parsePriceRange(materialValue);

                        // Se não tem valor nenhum e não é material, ignora
                        if (honorario === 0 && exameCartao === 0 && materialRange.max === 0) return;

                        // Limpeza do nome: remove hífens e espaços iniciais
                        let cleanedName = String(descricao).trim();
                        cleanedName = cleanedName.replace(/^[\s-]+/, '').trim(); // Remove hífens e espaços no início

                        const item: ValueTableItem = {
                            id: crypto.randomUUID(),
                            codigo: String(codigo).trim(),
                            nome: cleanedName,
                            info: '',
                            honorario,
                            exame_cartao: exameCartao,
                            material_min: materialRange.min,
                            material_max: materialRange.max,
                            honorarios_diferenciados: []
                        };

                        valuesByCategory[categoryId].push(item);
                    });

                    // Ordena alfabeticamente pelo nome do exame dentro da categoria
                    valuesByCategory[categoryId].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
                });

                // Ordena as categorias por nome
                importedCategories.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

                resolve({
                    values: valuesByCategory,
                    categories: importedCategories
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsBinaryString(file);
    });
}