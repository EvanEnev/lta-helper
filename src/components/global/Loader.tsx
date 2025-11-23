'use client'

import {useEffect, useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'

export default function Loader({
  loading: isLoading,
  isExiting = false,
  children,
  isDisabled = false,
}: {
  loading: boolean
  isExiting: boolean
  children: React.ReactNode[] | React.ReactNode
  isDisabled?: boolean
}) {
  const ANIMATION_DURATIONS = {
    spin: 1, // Скорость вращения спиннера
    fill: 0.6, // Время заполнения спиннера
    shrink: 0.4, // Время сжатия в точку
    reveal: 0.3, // Время раскрытия маски
    exit: 0.4, // Время анимации выхода
  }

  const [animationStage, setAnimationStage] = useState('spinning')

  useEffect(() => {
    if (isLoading) {
      setAnimationStage('spinning')
    } else if (isExiting) {
      // Анимация выхода - сжимаем маску и показываем спиннер
      setAnimationStage('exiting')
    } else {
      // Начинаем последовательность завершения
      setAnimationStage('filling')

      const fillTimer = setTimeout(() => {
        setAnimationStage('shrinking')
      }, ANIMATION_DURATIONS.fill * 1000)

      const shrinkTimer = setTimeout(
        () => {
          setAnimationStage('revealing')
        },
        (ANIMATION_DURATIONS.fill + ANIMATION_DURATIONS.shrink) * 1000,
      )

      return () => {
        clearTimeout(fillTimer)
        clearTimeout(shrinkTimer)
      }
    }
  }, [
    ANIMATION_DURATIONS.fill,
    ANIMATION_DURATIONS.shrink,
    isExiting,
    isLoading,
  ])

  const shouldShowOverlay =
    isLoading || isExiting || animationStage !== 'complete'
  const isExitingState = isExiting || animationStage === 'exiting'

  if (isDisabled) {
    return children
  }

  return (
    <>
      {/* Контент (всегда рендерится) */}
      {children}

      {/* Overlay загрузки */}
      <AnimatePresence>
        {shouldShowOverlay && (
          <motion.div
            className="bg-content1 absolute inset-0 z-2000 flex h-[100dvh] items-center justify-center"
            animate={{
              clipPath:
                animationStage === 'revealing'
                  ? 'circle(0% at 50% 50%)'
                  : 'circle(100% at 50% 50%)',
            }}
            initial={
              isExitingState ? {clipPath: 'circle(0% at 50% 50%)'} : undefined
            }
            transition={{
              duration: isExitingState
                ? ANIMATION_DURATIONS.exit
                : animationStage === 'revealing'
                  ? ANIMATION_DURATIONS.reveal
                  : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
            onAnimationComplete={() => {
              if (animationStage === 'revealing') {
                setAnimationStage('complete')
              }
            }}>
            <div className="relative h-16 w-16">
              {(animationStage === 'spinning' || isExitingState) && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-gray-600" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-white"
                    animate={{rotate: 360}}
                    transition={{
                      duration: ANIMATION_DURATIONS.spin,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </>
              )}

              {/* Заполнение и сжатие */}
              {(animationStage === 'filling' ||
                animationStage === 'shrinking' ||
                animationStage === 'revealing') && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white"
                  initial={{scale: 0}}
                  animate={{
                    scale:
                      animationStage === 'shrinking' ||
                      animationStage === 'revealing'
                        ? 0
                        : 1,
                  }}
                  transition={{
                    duration:
                      animationStage === 'filling'
                        ? ANIMATION_DURATIONS.fill
                        : ANIMATION_DURATIONS.shrink,
                    ease: animationStage === 'shrinking' ? 'easeIn' : 'easeOut',
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
