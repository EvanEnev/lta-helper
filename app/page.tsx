'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import DesktopPage from '@/src/components/page/DesktopPage'
import MobilePage from '@/src/components/page/MobilePage'

export default function Home() {
  const isMobile = useIsMobile()

  return isMobile ? <MobilePage /> : <DesktopPage />
  // return (
  //   <main className="flex min-h-screen flex-col items-center justify-start p-4 gap-4">
  //     <h1 className="text-5xl font-bold">LTArena Helper</h1>
  //     <p className="text-3xl">Позывной: {session?.user.name}</p>
  //     <div className="flex flex-col gap-4">
  //       <Button href="/schedule" as={Link} color="primary" size="lg">
  //         Заполнить график работы
  //       </Button>
  //       {session?.user.permission_level === 4 ? (
  //         <Button href="/admin" as={Link} color="primary" size="lg">
  //           Заполнить график персонала
  //         </Button>
  //       ) : (
  //         ''
  //       )}
  //     </div>
  //   </main>
  // )
}
