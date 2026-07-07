// Vocabulário de tipos de espaço do domínio (decisão 2026-07-07).
// Espelha o Literal SpaceType do backend (app/modules/hotel/schemas.py).
export const SPACE_TYPES = [
  'sinagoga',
  'restaurante',
  'salao_refeicao',
  'salao_shows',
  'sala_aula',
  'piscina',
  'quadra',
  'praia',
  'lobby',
  'academia',
  'outro',
] as const

export type SpaceTypeValue = (typeof SPACE_TYPES)[number]

const SPACE_TYPE_LABELS: Record<SpaceTypeValue, string> = {
  sinagoga: 'Sinagoga',
  restaurante: 'Restaurante',
  salao_refeicao: 'Salão de refeição',
  salao_shows: 'Salão de shows',
  sala_aula: 'Sala de aula',
  piscina: 'Piscina',
  quadra: 'Quadra',
  praia: 'Praia',
  lobby: 'Lobby',
  academia: 'Academia',
  outro: 'Outro',
}

// Linhas legadas podem ter tipos fora do vocabulário (hall/pool/gym...) — exibe o valor cru
export function spaceTypeLabel(type: string): string {
  return SPACE_TYPE_LABELS[type as SpaceTypeValue] ?? type
}
