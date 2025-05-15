import getRandomNumber from '@/lib/functions/getRandomNumber'

const variants = [
  'сотрудник',
  'работник',
  'испытуемый',
  'игрок',
  'участник',
  'участник тестирования',
  'испытатель',
  'полевой исследователь',
  'участник эксперимента',
]

export default function getRandomPhrase() {
  return variants[getRandomNumber(variants.length)]
}
