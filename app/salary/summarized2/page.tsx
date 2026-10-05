import {redirect} from 'next/navigation'

// «Сводная 2» объединена с «Сводной»: это пресет «Заработок» одной страницы
export default function Summarized2() {
  redirect('/salary/summarized?preset=earnings')
}
