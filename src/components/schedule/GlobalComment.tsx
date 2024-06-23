import {GlobalStateContext} from '@/src/utils/stateProvider'
import {useContext} from 'react'

export default function GlobalComment() {
  const {globalComment, setGlobalComment} = useContext(GlobalStateContext)

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
