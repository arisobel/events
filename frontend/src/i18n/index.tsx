/**
 * i18n sem dependência externa (Fase A1, decisão 2026-08-09).
 *
 * Por que não react-i18next: o build de produção usa `npm ci` com package-lock,
 * e não há node/npm na estação local para regenerar o lock — adicionar dependência
 * quebraria o deploy. Este módulo cobre o necessário (lookup tipado, interpolação
 * {var}, RTL, persistência) e as chamadas t('chave', {vars}) migram fácil se um
 * dia a lib entrar.
 *
 * Tipagem: ptBR é a fonte de verdade das chaves; en/he são Record<TranslationKey,
 * string> — tradução faltando é erro de compilação.
 */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

import { ptBR, TranslationKey } from './locales/ptBR'
import { en } from './locales/en'
import { he } from './locales/he'

export type Language = 'pt-BR' | 'en' | 'he'
export type Direction = 'ltr' | 'rtl'

export const LANGUAGES: { code: Language; label: string; dir: Direction }[] = [
  { code: 'pt-BR', label: 'Português', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'he', label: 'עברית', dir: 'rtl' },
]

const DICTS: Record<Language, Record<TranslationKey, string>> = { 'pt-BR': ptBR, en, he }
const STORAGE_KEY = 'app_language'

export function isLanguage(value: unknown): value is Language {
  return value === 'pt-BR' || value === 'en' || value === 'he'
}

export function languageDir(lang: Language): Direction {
  return lang === 'he' ? 'rtl' : 'ltr'
}

function detectLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isLanguage(stored)) return stored
  const nav = (navigator.language || '').toLowerCase()
  if (nav.startsWith('pt')) return 'pt-BR'
  if (nav.startsWith('he') || nav.startsWith('iw')) return 'he'
  return 'en'
}

export type TFunction = (key: TranslationKey, vars?: Record<string, string | number>) => string

interface I18nContextType {
  language: Language
  dir: Direction
  setLanguage: (lang: Language) => void
  t: TFunction
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  const dir = languageDir(language)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = dir
  }, [language, dir])

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang)
    setLanguageState(lang)
  }

  const t: TFunction = useMemo(() => {
    const dict = DICTS[language]
    return (key, vars) => {
      let text: string = dict[key] ?? ptBR[key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value))
        }
      }
      return text
    }
  }, [language])

  return (
    <I18nContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
