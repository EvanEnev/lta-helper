import getRandomNumber from '@/src/utils/getRandomNumber'

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
