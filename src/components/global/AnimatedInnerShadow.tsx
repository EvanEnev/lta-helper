import {motion} from 'framer-motion'

export default function AnimatedInnerShadow({
  color,
  className = '',
}: {
  color: string
  className?: string
}) {
  console.debug(color)
  return (
    <motion.div
      className={`${className} pointer-events-none absolute inset-0`}
      animate={{
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        boxShadow: `inset 0 0 15px ${color}`,
      }}
    />
  )
}
