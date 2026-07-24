const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
].join(",");

export interface PlaceResult {
  googlePlaceId: string;
  nome: string;
  endereco: string | null;
  avaliacaoGoogle: number | null;
  totalAvaliacoes: number | null;
  site: string | null;
  telefone: string | null;
}

interface GooglePlacesTextSearchResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
  }>;
}

export class GooglePlacesError extends Error {}

/**
 * Busca estabelecimentos via Google Places API (Text Search - New).
 * `quantidade` é limitado a 20 por página; a API não pagina além disso
 * sem um pageToken, então buscamos em lotes até atingir o total pedido.
 */
export async function searchPlaces(params: {
  localidade: string;
  nicho: string;
  quantidade: number;
}): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new GooglePlacesError(
      "GOOGLE_PLACES_API_KEY não configurada. Defina a variável de ambiente para buscar leads."
    );
  }

  const results: PlaceResult[] = [];
  const seen = new Set<string>();
  let pageToken: string | undefined;
  const textQuery = `${params.nicho} em ${params.localidade}`;

  do {
    const response = await fetch(PLACES_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": `${FIELD_MASK},nextPageToken`,
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "pt-BR",
        pageToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new GooglePlacesError(
        `Google Places API retornou ${response.status}: ${errorBody}`
      );
    }

    const data = (await response.json()) as GooglePlacesTextSearchResponse & {
      nextPageToken?: string;
    };

    for (const place of data.places ?? []) {
      if (seen.has(place.id)) continue;
      seen.add(place.id);

      results.push({
        googlePlaceId: place.id,
        nome: place.displayName?.text ?? "Sem nome",
        endereco: place.formattedAddress ?? null,
        avaliacaoGoogle: place.rating ?? null,
        totalAvaliacoes: place.userRatingCount ?? null,
        site: place.websiteUri ?? null,
        telefone:
          place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null,
      });

      if (results.length >= params.quantidade) break;
    }

    pageToken = data.nextPageToken;
  } while (pageToken && results.length < params.quantidade);

  return results.slice(0, params.quantidade);
}
