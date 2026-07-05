import { useEffect, useRef, useState } from 'react'

import { ALL_COUNTRIES, COMMON_COUNTRIES, countryName } from '../utils/countries'
import Flag from './Flag'

interface CountryPickerProps {
  value: string | null | undefined
  onChange: (code: string) => void
  placeholder?: string
}

// busca acento-insensível
const normalize = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/**
 * Seletor de país com busca (autocomplete) e bandeira em imagem.
 * Sem busca, mostra os países comuns; ao digitar, filtra a lista completa por nome ou código.
 */
export default function CountryPicker({ value, onChange, placeholder = 'Select country…' }: CountryPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const q = normalize(query.trim())
  const list = q
    ? ALL_COUNTRIES.filter(
        (c) => normalize(c.name).includes(q) || c.code.toLowerCase().includes(q),
      )
    : COMMON_COUNTRIES

  const choose = (code: string) => {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white text-left"
      >
        {value ? (
          <>
            <Flag code={value} />
            <span className="text-gray-900">{countryName(value)}</span>
          </>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="ml-auto text-gray-400 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {value && (
              <li>
                <button
                  type="button"
                  onClick={() => choose('')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Clear selection
                </button>
              </li>
            )}
            {list.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches</li>
            ) : (
              list.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => choose(c.code)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-indigo-50 ${
                      c.code === value ? 'bg-indigo-50 font-medium' : ''
                    }`}
                  >
                    <Flag code={c.code} size={18} />
                    <span className="text-gray-900">{c.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{c.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
