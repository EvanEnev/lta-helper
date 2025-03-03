import {Divider} from '@nextui-org/react'

export default function Header({children}: {children?: string[]}) {
  return (
    <div
      className={`sticky top-3 z-50 flex max-w-full justify-around gap-2 rounded-lg bg-content1 py-4`}>
      {children?.map((child, index) => (
        <>
          <span className="w-full min-w-[7rem] text-center">{child}</span>
          <Divider
            orientation="vertical"
            className={`${index === children.length - 1 ? 'hidden' : ''}`}
          />
        </>
      ))}
    </div>
  )
}
