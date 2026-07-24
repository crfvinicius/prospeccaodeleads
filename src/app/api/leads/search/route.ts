import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSearchSchema } from "@/lib/validation";
import { searchPlaces, GooglePlacesError } from "@/lib/google-places";
import { checkOnWhatsApp, getWhatsAppStatus } from "@/lib/whatsapp/socket";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSearchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    localidade,
    nicho,
    quantidade,
    avaliacaoMinima,
    somenteComSite,
    somenteSemSite,
    somenteComWhatsapp,
  } = parsed.data;

  let candidates;
  try {
    // busca um pool maior, já que filtros locais (avaliação, site) reduzem o total
    candidates = await searchPlaces({
      localidade,
      nicho,
      quantidade: Math.min(quantidade * 3, 60),
    });
  } catch (error) {
    if (error instanceof GooglePlacesError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }

  let filtered = candidates.filter((place) => {
    if (avaliacaoMinima != null && (place.avaliacaoGoogle ?? 0) < avaliacaoMinima) {
      return false;
    }
    if (somenteComSite && !place.site) return false;
    if (somenteSemSite && place.site) return false;
    return true;
  });

  let whatsappWarning: string | null = null;
  if (somenteComWhatsapp) {
    if (getWhatsAppStatus().status !== "conectado") {
      whatsappWarning =
        "WhatsApp não está conectado — o filtro 'somente com WhatsApp' foi ignorado.";
    } else {
      const checked: typeof filtered = [];
      for (const place of filtered) {
        if (!place.telefone) continue;
        try {
          const exists = await checkOnWhatsApp(place.telefone);
          if (exists) checked.push(place);
        } catch {
          // ignora falha pontual de verificação para um número
        }
        if (checked.length >= quantidade) break;
      }
      filtered = checked;
    }
  }

  filtered = filtered.slice(0, quantidade);

  const searchQuery = await prisma.searchQuery.create({
    data: {
      localidade,
      nicho,
      quantidade,
      avaliacaoMinima,
      somenteComSite,
      somenteComWhatsapp,
    },
  });

  const leads = await Promise.all(
    filtered.map((place) =>
      prisma.lead.upsert({
        where: { googlePlaceId: place.googlePlaceId },
        create: {
          nome: place.nome,
          telefone: place.telefone,
          endereco: place.endereco,
          localidade,
          nicho,
          avaliacaoGoogle: place.avaliacaoGoogle,
          totalAvaliacoes: place.totalAvaliacoes,
          site: place.site,
          temSite: Boolean(place.site),
          origem: "GOOGLE_PLACES",
          googlePlaceId: place.googlePlaceId,
          searchQueryId: searchQuery.id,
        },
        update: {
          telefone: place.telefone,
          endereco: place.endereco,
          avaliacaoGoogle: place.avaliacaoGoogle,
          totalAvaliacoes: place.totalAvaliacoes,
          site: place.site,
          temSite: Boolean(place.site),
        },
      })
    )
  );

  return NextResponse.json({ searchQueryId: searchQuery.id, leads, whatsappWarning });
}
