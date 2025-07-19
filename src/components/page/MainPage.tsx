'use client'

import useIsMobile from '@/src/hooks/useIsMobile'
import MobilePage from '@/src/components/page/MobilePage'
import DesktopPage from '@/src/components/page/DesktopPage'
import {ShortSalary} from '@/app/page'
import {useAuth} from '@/src/components/global/providers/authProvider'
import {Button} from '@heroui/react'
import {useEffect} from 'react'

export default function MainPage({salaryData}: {salaryData: ShortSalary}) {
  const isMobile = useIsMobile()
  const {setPageSettings} = useAuth()

  useEffect(() => {
    setPageSettings([
      {
        label: 'test',
        components: [
          <div>
            <Button></Button>
          </div>,
        ],
      },
    ])
  }, [])

  return isMobile ? (
    <MobilePage salaryData={salaryData} />
  ) : (
    <DesktopPage salaryData={salaryData} />
  )
}
