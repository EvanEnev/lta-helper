import {Avatar, Button, Link} from '@heroui/react'
import {usePathname} from 'next/navigation'
import {ArrowLeft} from 'solar-icon-set'
import buttons from '@/src/utils/global/pathButtons'

export default function MobileHeader({worker}: {worker: any | null}) {
  const path = usePathname()

  return (
    <header className="flex h-fit flex-wrap items-center justify-between gap-4 p-2">
      <Button
        as={Link}
        href="/"
        variant="ghost"
        size="lg"
        startContent={
          <ArrowLeft size={24} svgProps={{width: 24, height: 24}} />
        }
        className={`${path === '/' ? 'hidden' : ''}`}>
        На главную
      </Button>
      <span className="flex-1 text-center text-2xl font-bold">
        {buttons.find(obj => obj.href === path)?.name}
      </span>
      <div className="flex flex-1 items-center justify-center gap-2 text-2xl">
        <Avatar src={worker.photo_url} />
        {worker.name}
      </div>
    </header>
  )
}
