import {CircularProgress} from '@nextui-org/react'

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-4">
      <CircularProgress
        aria-label="Загрузка..."
        size="lg"
        label="Загрузка..."
      />
    </main>
  )
}
