// Fonte de verdade das chaves de tradução (i18n Fase A1).
// As demais línguas são tipadas contra TranslationKey — tradução faltando é ERRO DE COMPILAÇÃO.
export const ptBR = {
  // Navegação (sidebar)
  'nav.hotels': 'Hotéis',
  'nav.events': 'Eventos',
  'nav.clients': 'Clientes',
  'nav.staff': 'Equipe',
  'nav.users': 'Usuários',

  // Layout
  'layout.logout': 'Sair',
  'layout.administrator': 'Administrador',
  'layout.footer': '© 2026 Event Operations Platform',
  'lang.label': 'Idioma',

  // Login
  'login.badge': 'Ambiente administrativo interno',
  'login.heroTitle': 'Event Operations Platform',
  'login.heroSubtitle':
    'Coordene eventos de hospitalidade por hotel, ciclo do evento, grupos de hóspedes, reservas, alocação de quartos e tarefas operacionais em uma única superfície.',
  'login.card1Title': 'Hotéis',
  'login.card1Text': 'Prepare infraestrutura, quartos e cadastros base.',
  'login.card2Title': 'Eventos',
  'login.card2Text': 'Opere por temporada e período, como Pessach 2027.',
  'login.card3Title': 'Execução',
  'login.card3Text': 'Gerencie reservas, alocação de quartos e tarefas do evento.',
  'login.kicker': 'Login administrativo',
  'login.title': 'Acesse o hub de operações',
  'login.subtitle': 'Entre para gerenciar hotéis, eventos, hóspedes, reservas, quartos e tarefas.',
  'login.username': 'Usuário',
  'login.password': 'Senha',
  'login.usernamePlaceholder': 'Digite seu usuário',
  'login.passwordPlaceholder': 'Digite sua senha',
  'login.submit': 'Entrar na área administrativa',
  'login.submitting': 'Entrando...',
  'login.failed': 'Falha no login. Tente novamente.',
  'login.devCredsTitle': 'Credenciais de desenvolvimento',
} as const

export type TranslationKey = keyof typeof ptBR
