import {useEffect, useState} from 'react'

export default function useIsScrolled(): boolean {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setIsScrolled(prev => {
        if (prev !== isScrolled) return isScrolled
        return prev
      })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchmove', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [])

  return isScrolled
}
