'use client'

import React, {useState, useEffect, useRef, Fragment} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Separator} from '@heroui/react-beta'
import RankIcon from '@/src/components/global/RankIcon'
import {
  WrappedLocations,
  WrappedSchedule,
  WrappedShifts,
  WrapperWorkers,
} from '@/src/utils/types'
import {useAuth} from '@/src/components/global/providers/authProvider'
import useIsMobile from '@/src/hooks/useIsMobile'
import {Card} from '@heroui/react'
import {i} from 'mathjs'

interface WrappedPageProps {
  workersData: WrapperWorkers[]
  locationsData: WrappedLocations[]
  shiftsData: WrappedShifts
  scheduleData: WrappedSchedule
}

export default function FullPageScroll({
  workersData,
  locationsData,
  shiftsData,
  scheduleData,
}: WrappedPageProps) {
  const {headerRef} = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const isMobile = useIsMobile()
  const touchStart = useRef({x: 0, y: 0})
  const scrollTimeout = useRef(null)

  useEffect(() => {
    headerRef.current?.classList.add('hidden')
  }, [headerRef.current])

  const sections = [
    {
      id: 1,
      title: 'Это бы прекрасный год',
      description: 'Посмотрим его итоги',
      className: 'bg-gradient-to-br from-purple-600 to-blue-600',
    },
    {
      id: 2,
      title: 'Топ 10 любимых сотрудников',
      className: 'bg-gradient-to-br from-blue-600 to-cyan-500 max-h-full',
      content: (
        <div className="glass flex flex-col justify-around gap-2 bg-black/30 p-4">
          <div className="flex items-center justify-around gap-2">
            <p className="text-foreground-500">Позывной</p>
            <p className="text-foreground-500">Пересечений</p>
          </div>
          <Separator />
          {workersData
            .filter((_, i) => i < 10)
            .map((data, index) => (
              <Fragment key={index}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RankIcon rank={data.rank} />
                    <p>{data.worker}</p>
                  </div>
                  <p>{data.count}</p>
                </div>
                {index !== workersData.filter((_, i) => i < 10).length - 1 && (
                  <Separator />
                )}
              </Fragment>
            ))}
        </div>
      ),
    },
    {
      id: 3,
      title: 'Топ 10 любимых администраторов',
      className: 'bg-gradient-to-br from-cyan-500 to-teal-500 max-h-full',
      content: (
        <div className="glass flex flex-col justify-around gap-2 bg-black/30 p-4">
          <div className="flex items-center justify-around gap-2">
            <p className="text-foreground-500">Позывной</p>
            <p className="text-foreground-500">Пересечений</p>
          </div>
          <Separator />
          {workersData
            .filter(d => ['Платиновый', 'Золотой'].includes(d.rank))
            .filter((_, i) => i < 10)
            .map((data, index) => (
              <Fragment key={index}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RankIcon rank={data.rank} />
                    <p>{data.worker}</p>
                  </div>
                  <p>{data.count}</p>
                </div>
                {index !==
                  workersData
                    .filter(d => ['Платиновый', 'Золотой'].includes(d.rank))
                    .filter((_, i) => i < 10).length -
                    1 && <Separator />}
              </Fragment>
            ))}
        </div>
      ),
    },
    {
      id: 4,
      title: 'Portfolio',
      className: 'bg-gradient-to-br from-teal-500 to-green-500',
    },
    {
      id: 5,
      title: 'Contact',
      className: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
  ]

  const scrollToSection = (index, dir) => {
    if (index >= 0 && index < sections.length && !isScrolling) {
      setDirection(dir)
      setCurrentSection(index)
      setIsScrolling(true)
      setTimeout(() => setIsScrolling(false), 1000)
    }
  }

  useEffect(() => {
    const handleWheel = e => {
      e.preventDefault()

      if (isScrolling || isMobile) return

      clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        if (e.deltaY > 0) {
          scrollToSection(currentSection + 1, 1)
        } else {
          scrollToSection(currentSection - 1, -1)
        }
      }, 50)
    }

    const handleKeyDown = e => {
      if (isMobile) return

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        scrollToSection(currentSection + 1, 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        scrollToSection(currentSection - 1, -1)
      }
    }

    const handleTouchStart = e => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }

    const handleTouchEnd = e => {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      }

      const diffX = touchStart.current.x - touchEnd.x
      const diffY = touchStart.current.y - touchEnd.y

      // Determine if swipe is more horizontal or vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe (mobile)
        if (Math.abs(diffX) > 30) {
          if (diffX > 0) {
            scrollToSection(currentSection + 1, 1)
          } else {
            scrollToSection(currentSection - 1, -1)
          }
        }
      } else {
        // Vertical swipe (desktop touch)
        if (Math.abs(diffY) > 30 && !isMobile) {
          if (diffY > 0) {
            scrollToSection(currentSection + 1, 1)
          } else {
            scrollToSection(currentSection - 1, -1)
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, {passive: false})
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      clearTimeout(scrollTimeout.current)
    }
  }, [currentSection, isScrolling, isMobile])

  const slideVariants = {
    enter: direction => ({
      x: isMobile ? (direction > 0 ? '100%' : '-100%') : 0,
      y: isMobile ? 0 : direction > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: direction => ({
      x: isMobile ? (direction > 0 ? '-100%' : '100%') : 0,
      y: isMobile ? 0 : direction > 0 ? '-100%' : '100%',
      opacity: 1,
    }),
  }

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${sections[currentSection].bg}`}>
      {/* Navigation Dots */}
      <div
        className={`fixed z-50 flex ${
          isMobile
            ? 'bottom-6 left-1/2 -translate-x-1/2 flex-row gap-3'
            : 'top-1/2 right-8 -translate-y-1/2 flex-col gap-4'
        }`}>
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() =>
              scrollToSection(index, index > currentSection ? 1 : -1)
            }
            className={`rounded-full transition-all duration-300 ${
              isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
            } ${
              currentSection === index
                ? 'scale-125 bg-white'
                : 'bg-white/40 hover:bg-white/60 active:bg-white/80'
            }`}
            aria-label={`Go to ${section.title}`}
          />
        ))}
      </div>

      {/* Sections */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSection}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96]}}
          className={`absolute inset-0 flex flex-col items-center justify-center overflow-y-auto py-2 ${sections[currentSection].className}`}>
          <motion.div
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{delay: 0.3, duration: 0.6}}
            className="px-6 text-center md:px-8">
            <motion.h1
              className="mb-4 text-5xl font-bold sm:text-6xl md:mb-6 md:text-7xl lg:text-8xl"
              initial={{y: 20, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              transition={{delay: 0.5, duration: 0.6}}>
              {sections[currentSection].title}
            </motion.h1>
            {sections[currentSection].content}
          </motion.div>

          {/* Scroll Indicator */}
          {currentSection < sections.length - 1 && (
            <motion.div
              initial={{opacity: 0}}
              animate={{
                opacity: 1,
                x: isMobile ? [0, 10, 0] : 0,
                y: isMobile ? 0 : [0, 10, 0],
              }}
              transition={{
                opacity: {delay: 1, duration: 0.5},
                x: {delay: 1.5, duration: 1.5, repeat: Infinity},
                y: {delay: 1.5, duration: 1.5, repeat: Infinity},
              }}
              className={`absolute ${
                isMobile
                  ? 'top-1/2 right-6 -translate-y-1/2'
                  : 'bottom-8 left-1/2 -translate-x-1/2'
              }`}></motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
