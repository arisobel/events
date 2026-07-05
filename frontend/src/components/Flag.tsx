import { useState } from 'react'

import { countryFlagEmoji, countryName, flagImageUrl } from '../utils/countries'

interface FlagProps {
  code: string | null | undefined
  size?: number
  className?: string
}

/**
 * Bandeira do país como imagem SVG (Twemoji via CDN) — funciona também no Windows.
 * Se a imagem não carregar (offline/CDN fora), cai para o emoji nativo.
 */
export default function Flag({ code, size = 18, className }: FlagProps) {
  const [failed, setFailed] = useState(false)
  const url = flagImageUrl(code)
  if (!url) return null

  const name = countryName(code)

  if (failed) {
    return (
      <span className={className} title={name} style={{ fontSize: size, lineHeight: 1 }}>
        {countryFlagEmoji(code)}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt={name}
      title={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        objectFit: 'contain',
        verticalAlign: '-0.15em',
      }}
    />
  )
}
