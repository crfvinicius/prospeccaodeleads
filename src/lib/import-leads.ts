import ExcelJS from "exceljs";

export interface ImportedLeadRow {
  nome: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  localidade?: string;
  nicho?: string;
  site?: string;
}

const HEADER_ALIASES: Record<keyof ImportedLeadRow, string[]> = {
  nome: ["nome", "name", "empresa", "razaosocial"],
  telefone: ["telefone", "phone", "celular", "fone"],
  whatsapp: ["whatsapp", "whats", "zap"],
  endereco: ["endereco", "address", "logradouro"],
  localidade: ["localidade", "cidade", "city", "municipio"],
  nicho: ["nicho", "niche", "categoria", "category", "segmento"],
  site: ["site", "website", "url", "dominio"],
};

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

function buildFieldLookup(headers: string[]): Map<number, keyof ImportedLeadRow> {
  const lookup = new Map<number, keyof ImportedLeadRow>();
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
      keyof ImportedLeadRow,
      string[],
    ][]) {
      if (aliases.includes(normalized)) {
        lookup.set(index, field);
        break;
      }
    }
  });
  return lookup;
}

function rowsFromTable(
  headers: string[],
  rows: (string | undefined)[][]
): ImportedLeadRow[] {
  const lookup = buildFieldLookup(headers);
  const result: ImportedLeadRow[] = [];

  for (const row of rows) {
    const entry: Partial<ImportedLeadRow> = {};
    lookup.forEach((field, index) => {
      const value = row[index]?.toString().trim();
      if (value) entry[field] = value;
    });
    if (entry.nome) result.push(entry as ImportedLeadRow);
  }

  return result;
}

export async function parseXlsxLeads(buffer: ArrayBuffer): Promise<ImportedLeadRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rows: (string | undefined)[][] = [];
  let headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    const values = (row.values as ExcelJS.CellValue[]).slice(1).map((cell) =>
      cell == null ? undefined : String(cell)
    );
    if (rowNumber === 1) {
      headers = values.map((v) => v ?? "");
    } else {
      rows.push(values);
    }
  });

  return rowsFromTable(headers, rows);
}

export function parseMarkdownLeads(markdown: string): ImportedLeadRow[] {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  if (lines.length < 2) return [];

  const parseLine = (line: string) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());

  const headers = parseLine(lines[0]);
  // a segunda linha é o separador (---|---), demais são dados
  const dataLines = lines.slice(2);
  const rows = dataLines.map(parseLine);

  return rowsFromTable(headers, rows);
}
