interface CarouselProps {
  children: React.ReactNode[]
  visibleCount?: number
}

export default function Carousel({children, visibleCount = 3}: CarouselProps) {
  return (
    <div className="max-w-full overflow-hidden">
      <div className="snap-x snap-mandatory overflow-x-auto scroll-smooth">
        <div className="flex w-max gap-4 px-4">
          {children.map((child, i) => (
            <div
              key={i}
              className="shrink-0 snap-center"
              style={{width: `${100 / visibleCount}%`}}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
