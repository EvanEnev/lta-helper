import {useEffect, useState} from 'react'

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false)

  const handleResize = () => {
    setIsMobile(window.innerWidth <= breakpoint)
  }

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
