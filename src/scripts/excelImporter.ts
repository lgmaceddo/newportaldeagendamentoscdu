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

function parseMoneyValue(value: string | undefined): number {
    if (!value) return 0;

    // Ensure value is treated as string for replacement operations
    const stringValue = String(value);

    // Remove "R$", espaços, e pontos de milhar
    const cleaned = stringValue.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
}

// Helper to normalize string (remove accents, convert to uppercase, remove non-alphanumeric)
function normalizeKey(str: string): string {
    if (typeof str !== 'string') return '';
    // Remove acentos, caracteres não alfanuméricos (exceto espaços), e converte para maiúsculas
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9\s]/g, '').replace(/\s/g, '');
}

// Mapeamento de chaves de busca para colunas essenciais
const KEY_MAP: Record<string, string[]> = {
    codigo: ['ITEM', 'CODIGO', 'COD', 'CDU', 'PROCEDIMENTO', 'COD_PROCEDIMENTO', 'CODIGO PROCEDIMENTO'],
    descricao: ['DESCRICAO', 'NOME', 'EXAME', 'PROCEDIMENTO', 'NOME EXAME', 'DESCRICAO PROCEDIMENTO'],
    honorario: ['HONORARIOMEDICO', 'HM', 'HONORARIO', 'PIX', 'MEDICO', 'VALOR HM'],
    exameCartao: ['VALOREXAME', 'PACOTECDU', 'VALORTOTAL', 'TOTAL', 'CARTAO', 'VALOR', 'PRECO', 'VALOR TOTAL'],
    material: ['CONTRASTE', 'MATERIAIS', 'MATERIAL', 'MEDICAMENTOS', 'MATERIAISEMEDICAMENTOS', 'MAT/MED'], // Coluna de material
};

/**
 * Tenta encontrar a linha de cabeçalho e mapear os índices das colunas.
 * @param rawData Array de arrays representando as linhas do Excel.
 * @returns Objeto com o índice da linha de dados e o mapa de colunas.
 */
function findHeaderAndMapColumns(rawData: any[][]): { dataRowIndex: number; columnMap: Record<keyof typeof KEY_MAP, number> } {
    const columnMap: Record<keyof typeof KEY_MAP, number> = {};
    let dataRowIndex = -1;

    // Procurar nas primeiras 20 linhas pelo cabeçalho
    for (let i = 0; i < Math.min(rawData.length, 20); i++) {
        const row = rawData[i];
        if (!row) continue;

        const tempMap: Record<keyof typeof KEY_MAP, number> = {};
        let foundCount = 0;

        row.forEach((cell, index) => {
            if (cell !== undefined && cell !== null) {
                const normalizedCell = normalizeKey(String(cell));

                (Object.keys(KEY_MAP) as (keyof typeof KEY_MAP)[]).forEach(key => {
                    // Verificação mais flexivel (se o cabeçalho contém uma das palavras-chave)
                    if (KEY_MAP[key].some(searchKey => normalizedCell.includes(normalizeKey(searchKey)))) {
                        if (tempMap[key] === undefined) { // Pega a primeira ocorrência
                            tempMap[key] = index;
                            foundCount++;
                        }
                    }
                });
            }
        });

        // Se encontrarmos pelo menos o código e a descrição, consideramos esta a linha de cabeçalho
        if (tempMap.codigo !== undefined && tempMap.descricao !== undefined) {
            Object.assign(columnMap, tempMap);
            dataRowIndex = i + 1;
            return { dataRowIndex, columnMap };
        }
    }

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

                    const categoryId = `vt-cat-${sheetIndex}-${Date.now()}`;
                    const category: Category = {
                        id: categoryId,
                        name: sheetName.toUpperCase(),
                        color: getCategoryColor(sheetName),
                    };

                    importedCategories.push(category);
                    valuesByCategory[categoryId] = [];

                    const dataRows = rawData.slice(dataRowIndex);
                    const seenCodesInSheet = new Set<string>();

                    dataRows.forEach((row) => {
                        if (!row) return;
                        const codigo = row[columnMap.codigo];
                        const descricao = row[columnMap.descricao];

                        // Validação básica
                        if (!codigo || !descricao || String(codigo).trim() === '' || String(descricao).trim() === '') return;

                        const normalizedCodigo = normalizeKey(String(codigo));
                        const normalizedDescricao = normalizeKey(String(descricao));

                        // 1. Regras de Pular Linhas (Solicitadas pelo Usuário)
                        // Pular se Nome do Exame (Descrição) contiver: DESCRIÇÃO, PROCEDIMENTO, TOTAL
                        const skipByDescription = ['DESCRICAO', 'PROCEDIMENTO', 'TOTAL'].some(kw => normalizedDescricao.includes(kw));

                        // Pular se CÓDIGO (Item) contiver: ITEM, CÓDIGO
                        const skipByCode = ['ITEM', 'CODIGO'].some(kw => normalizedCodigo.includes(kw));

                        if (skipByDescription || skipByCode) {
                            return;
                        }

                        // 2. Extrair Material do Excel
                        let material_min = 0;
                        let material_max = 0;
                        let materialText = '';

                        if (columnMap.material !== undefined) {
                            const rawMaterial = String(row[columnMap.material] || '').trim();
                            if (rawMaterial) {
                                materialText = rawMaterial;
                                // Tenta extrair valores do formato "de R$ 500,00 a R$ 1.500,00"
                                const matches = rawMaterial.match(/R\$\s*([\d.,]+)/g);
                                if (matches && matches.length >= 2) {
                                    material_min = parseMoneyValue(matches[0]);
                                    material_max = parseMoneyValue(matches[1]);
                                } else if (matches && matches.length === 1) {
                                    material_min = parseMoneyValue(matches[0]);
                                    material_max = material_min;
                                }
                            }
                        }

                        // 3. Verificação de Duplicidade (Baseado no código + nome para ser único na aba)
                        const duplicateKey = `${normalizedCodigo}-${normalizedDescricao}`;
                        if (seenCodesInSheet.has(duplicateKey)) {
                            return;
                        }
                        seenCodesInSheet.add(duplicateKey);

                        // Parse dos valores monetários
                        const honorarioValue = columnMap.honorario !== undefined ? row[columnMap.honorario] : undefined;
                        const exameCartaoValue = columnMap.exameCartao !== undefined ? row[columnMap.exameCartao] : undefined;

                        const honorario = parseMoneyValue(honorarioValue);
                        const exameCartao = parseMoneyValue(exameCartaoValue);

                        // Se não tem valor nenhum, ignora
                        if (honorario === 0 && exameCartao === 0 && material_max === 0) return;

                        // Limpeza do nome: remove hífens e espaços iniciais
                        let cleanedName = String(descricao).trim();
                        cleanedName = cleanedName.replace(/^[\s-]+/, '').trim();

                        const item: ValueTableItem = {
                            id: `value-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            codigo: String(codigo).trim(),
                            nome: cleanedName,
                            info: materialText, // Salva o texto original do material no campo info/observação se necessário
                            honorario,
                            exame_cartao: exameCartao,
                            material_min,
                            material_max,
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