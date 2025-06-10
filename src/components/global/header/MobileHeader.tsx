import {Avatar, Button, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {ArrowLeft} from 'solar-icon-set'
import buttons from '@/src/utils/global/pathButtons'
import {LTWorker} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {useEffect} from 'react'

export default function MobileHeader({
  worker,
  scrolled,
}: {
  worker: LTWorker
  scrolled: boolean
}) {
  const path = usePathname()
  const {headerRef, setExiting} = useAuth()

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 left-0 z-1000 flex h-fit w-[100dvw] flex-wrap items-center justify-between gap-4 p-2 ${scrolled ? 'scrolled' : ''}`}>
      <Button
        as={Link}
        href="/"
        variant="ghost"
        size="lg"
        startContent={
          <ArrowLeft size={24} svgProps={{width: 24, height: 24}} />
        }
        onPress={() => {
          setExiting(true)
        }}
        className={`${path === '/' ? 'hidden' : ''}`}>
        На главную
      </Button>
      <span className="flex-1 text-center text-2xl font-bold">
        {buttons.find(obj => obj.href === path)?.name}
      </span>
      <div className="flex flex-1 items-center justify-center gap-2 text-2xl">
        <Avatar src={worker.photoUrl} />
        {worker.name}
      </div>
    </header>
  )
}
