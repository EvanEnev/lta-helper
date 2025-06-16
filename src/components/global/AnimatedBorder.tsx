'use-client'

import {motion} from 'framer-motion'

export default function AnimatedBorder({
  children,
  isDisabled = false,
  className = '',
}: {
  children: React.ReactNode | React.ReactNode[]
  isDisabled?: boolean
  className?: string
}) {
  if (isDisabled) return children

  return (
    <motion.div
      className={`rounded-2xl border-2 ${className}`}
      style={{borderColor: '#ff6b6b'}}
      animate={{
        borderColor: [
          '#ff6b6b',
          '#4ecdc4',
          '#45b7d1',
          '#96ceb4',
          '#ffeaa7',
          '#dda0dd',
          '#ff6b6b',
        ],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}>
      {children}
    </motion.div>
  )
}
