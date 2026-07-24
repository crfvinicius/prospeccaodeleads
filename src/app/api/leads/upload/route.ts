import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseXlsxLeads, parseMarkdownLeads } from "@/lib/import-leads";
import type { LeadOrigem } from "@/generated/prisma/enums";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Envie um arquivo no campo 'file'." },
      { status: 400 }
    );
  }

  const filename = file.name.toLowerCase();
  const isXlsx = filename.endsWith(".xlsx");
  const isMarkdown = filename.endsWith(".md") || filename.endsWith(".markdown");

  if (!isXlsx && !isMarkdown) {
    return NextResponse.json(
      { error: "Formato não suportado. Envie um arquivo .xlsx ou .md." },
      { status: 400 }
    );
  }

  const rows = isXlsx
    ? await parseXlsxLeads(await file.arrayBuffer())
    : parseMarkdownLeads(await file.text());

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Nenhum lead válido encontrado no arquivo (coluna 'nome' é obrigatória)." },
      { status: 400 }
    );
  }

  const origem: LeadOrigem = isXlsx ? "UPLOAD_XLSX" : "UPLOAD_MARKDOWN";

  const created = await prisma.lead.createManyAndReturn({
    data: rows.map((row) => ({
      nome: row.nome,
      telefone: row.telefone ?? null,
      whatsapp: row.whatsapp ?? null,
      endereco: row.endereco ?? null,
      localidade: row.localidade ?? null,
      nicho: row.nicho ?? null,
      site: row.site ?? null,
      temSite: Boolean(row.site),
      temWhatsapp: Boolean(row.whatsapp),
      origem,
    })),
  });

  return NextResponse.json({ leads: created, total: created.length });
}
