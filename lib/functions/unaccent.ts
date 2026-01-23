const RU_MAP: Record<string, string> = {
  ё: 'е',
  Ё: 'Е',
}

export default function unaccent(text: string): string {
  return text.replace(/[ёЁ]/g, char => RU_MAP[char] ?? char)
}
