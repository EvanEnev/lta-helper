'use-client'

import {motion} from 'framer-motion'

export default function AnimatedBorder({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <motion.div
      className="rounded-2xl border-2"
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
