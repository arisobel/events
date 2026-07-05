// Nacionalidade do grupo/família — código ISO 3166-1 alpha-2 → bandeira emoji.
// Sem assets de imagem: a bandeira é derivada dos regional indicator symbols.

export interface CountryOption {
  code: string // ISO alpha-2 (maiúsculo)
  name: string
}

// Países comuns em eventos internacionais deste tipo (kosher/Pessach).
// Ordenados por relevância aproximada; a busca resolve o resto.
export const COUNTRY_OPTIONS: CountryOption[] = [
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

const COUNTRY_BY_CODE = new Map(COUNTRY_OPTIONS.map((c) => [c.code, c]))

/** Converte um código ISO alpha-2 na bandeira emoji correspondente ('' se inválido). */
export function countryFlagEmoji(iso2: string | null | undefined): string {
  if (!iso2) return ''
  const code = iso2.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return ''
  const OFFSET = 0x1f1e6 - 0x41 // 'A' → regional indicator 'A'
  return String.fromCodePoint(...[...code].map((ch) => ch.charCodeAt(0) + OFFSET))
}

/** Nome legível do país a partir do código; devolve o próprio código se não catalogado. */
export function countryName(iso2: string | null | undefined): string {
  if (!iso2) return ''
  const code = iso2.trim().toUpperCase()
  return COUNTRY_BY_CODE.get(code)?.name ?? code
}
