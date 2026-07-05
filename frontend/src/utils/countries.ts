// Nacionalidade do grupo/família — código ISO 3166-1 alpha-2.
// Bandeira renderizada como imagem SVG (Twemoji via CDN) para funcionar também no Windows,
// onde o emoji de bandeira não é desenhado. O emoji serve de fallback (ver componente Flag).

export interface CountryOption {
  code: string // ISO alpha-2 (maiúsculo)
  name: string
}

// Países mais comuns nestes eventos — aparecem primeiro quando não há busca.
export const COMMON_COUNTRIES: CountryOption[] = [
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'IL', name: 'Israel' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'MX', name: 'México' },
  { code: 'CL', name: 'Chile' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'FR', name: 'França' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'PA', name: 'Panamá' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'ES', name: 'Espanha' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IT', name: 'Itália' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'CH', name: 'Suíça' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'AU', name: 'Austrália' },
  { code: 'RU', name: 'Rússia' },
]

// Demais países (busca completa). Nomes em PT-BR.
const OTHER_COUNTRIES: CountryOption[] = [
  { code: 'AL', name: 'Albânia' },
  { code: 'DZ', name: 'Argélia' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AM', name: 'Armênia' },
  { code: 'AT', name: 'Áustria' },
  { code: 'AZ', name: 'Azerbaijão' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrein' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Bielorrússia' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'BA', name: 'Bósnia e Herzegovina' },
  { code: 'BW', name: 'Botsuana' },
  { code: 'BG', name: 'Bulgária' },
  { code: 'KH', name: 'Camboja' },
  { code: 'CM', name: 'Camarões' },
  { code: 'CN', name: 'China' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croácia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Chipre' },
  { code: 'CZ', name: 'República Tcheca' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'EC', name: 'Equador' },
  { code: 'EG', name: 'Egito' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'EE', name: 'Estônia' },
  { code: 'ET', name: 'Etiópia' },
  { code: 'FI', name: 'Finlândia' },
  { code: 'GE', name: 'Geórgia' },
  { code: 'GH', name: 'Gana' },
  { code: 'GR', name: 'Grécia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungria' },
  { code: 'IS', name: 'Islândia' },
  { code: 'IN', name: 'Índia' },
  { code: 'ID', name: 'Indonésia' },
  { code: 'IR', name: 'Irã' },
  { code: 'IQ', name: 'Iraque' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japão' },
  { code: 'JO', name: 'Jordânia' },
  { code: 'KZ', name: 'Cazaquistão' },
  { code: 'KE', name: 'Quênia' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LV', name: 'Letônia' },
  { code: 'LB', name: 'Líbano' },
  { code: 'LY', name: 'Líbia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lituânia' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MO', name: 'Macau' },
  { code: 'MY', name: 'Malásia' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Maurício' },
  { code: 'MD', name: 'Moldávia' },
  { code: 'MC', name: 'Mônaco' },
  { code: 'MA', name: 'Marrocos' },
  { code: 'MZ', name: 'Moçambique' },
  { code: 'NA', name: 'Namíbia' },
  { code: 'NL', name: 'Países Baixos' },
  { code: 'NZ', name: 'Nova Zelândia' },
  { code: 'NI', name: 'Nicarágua' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'NO', name: 'Noruega' },
  { code: 'OM', name: 'Omã' },
  { code: 'PK', name: 'Paquistão' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'PL', name: 'Polônia' },
  { code: 'QA', name: 'Catar' },
  { code: 'RO', name: 'Romênia' },
  { code: 'SA', name: 'Arábia Saudita' },
  { code: 'RS', name: 'Sérvia' },
  { code: 'SG', name: 'Singapura' },
  { code: 'SK', name: 'Eslováquia' },
  { code: 'SI', name: 'Eslovênia' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Suécia' },
  { code: 'SY', name: 'Síria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzânia' },
  { code: 'TH', name: 'Tailândia' },
  { code: 'TN', name: 'Tunísia' },
  { code: 'TR', name: 'Turquia' },
  { code: 'UA', name: 'Ucrânia' },
  { code: 'AE', name: 'Emirados Árabes Unidos' },
  { code: 'VN', name: 'Vietnã' },
  { code: 'ZW', name: 'Zimbábue' },
]

// Lista completa para busca: comuns primeiro, restante em ordem alfabética.
export const ALL_COUNTRIES: CountryOption[] = [
  ...COMMON_COUNTRIES,
  ...OTHER_COUNTRIES.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
]

const COUNTRY_BY_CODE = new Map(ALL_COUNTRIES.map((c) => [c.code, c]))

function toCodePoints(iso2: string): string | null {
  const code = iso2.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null
  return [...code].map((ch) => (ch.charCodeAt(0) - 65 + 0x1f1e6).toString(16)).join('-')
}

/** Converte um código ISO alpha-2 na bandeira emoji correspondente ('' se inválido). */
export function countryFlagEmoji(iso2: string | null | undefined): string {
  if (!iso2) return ''
  const code = iso2.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return ''
  const OFFSET = 0x1f1e6 - 0x41 // 'A' → regional indicator 'A'
  return String.fromCodePoint(...[...code].map((ch) => ch.charCodeAt(0) + OFFSET))
}

/**
 * URL da bandeira como imagem SVG (Twemoji 14.0.2, tag arquivada e imutável, via jsDelivr).
 * Funciona em qualquer plataforma, inclusive Windows. Retorna null se o código for inválido.
 */
export function flagImageUrl(iso2: string | null | undefined): string | null {
  if (!iso2) return null
  const hex = toCodePoints(iso2)
  if (!hex) return null
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${hex}.svg`
}

/** Nome legível do país a partir do código; devolve o próprio código se não catalogado. */
export function countryName(iso2: string | null | undefined): string {
  if (!iso2) return ''
  const code = iso2.trim().toUpperCase()
  return COUNTRY_BY_CODE.get(code)?.name ?? code
}
