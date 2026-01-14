export default function escapeMarkdown(text: string, disable?: boolean) {
  if (disable) return text

  const markdownCharacters: string[] = [
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!',
  ]

  const escapeSet = new Set(markdownCharacters)

  return text
    ?.split('')
    ?.map(char => {
      return escapeSet.has(char) ? `\\${char}` : char
    })
    ?.join('')
}
