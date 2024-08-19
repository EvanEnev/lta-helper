import globalCommentState from '@/src/state/globalCommentState'
import {useRecoilState} from 'recoil'

export default function GlobalComment() {
  const [globalComment, setGlobalComment] = useRecoilState(globalCommentState)

  const globalCommentHandler = (event: {target: {value: any}}) => {
    const text = event.target.value
    setGlobalComment(text)
  }
  return (
    <input
      type="text"
      placeholder="Глобальный комментарий"
      className="input input-bordered"
      value={globalComment}
      onChange={globalCommentHandler}
    />
  )
}
