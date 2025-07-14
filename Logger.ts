import winston from 'winston'
import Transport from 'winston-transport'

interface LokiStream {
  stream: Record<string, string>
  values: string[][]
}

interface LokiPayload {
  streams: LokiStream[]
}

class LokiTransport extends Transport {
  private lokiUrl: string
  private batchSize: number
  private batchTimeout: number
  private logBatch: any[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private serviceName: string

  constructor(opts: any) {
    super(opts)
    this.lokiUrl = opts.lokiUrl || 'http://localhost:3100'
    this.batchSize = opts.batchSize || 100
    this.batchTimeout = opts.batchTimeout || 5000
    this.serviceName = opts.serviceName || 'nextjs-app'
  }

  private async sendToLoki(entries: any[]): Promise<void> {
    if (entries.length === 0) return

    try {
      const payload: LokiPayload = {
        streams: this.groupEntriesByLabels(entries),
      }

      const response = await fetch(`${this.lokiUrl}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      // Fallback to console if Loki is unavailable
      console.error('Failed to send logs to Loki:', error)
      entries.forEach(entry => {
        console.log(
          `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        )
      })
    }
  }

  private groupEntriesByLabels(entries: any[]): LokiStream[] {
    const streams: Map<string, LokiStream> = new Map()

    entries.forEach(entry => {
      const labels = {
        level: entry.level,
        service: this.serviceName,
        job: 'nextjs',
      }

      const labelKey = JSON.stringify(labels)

      if (!streams.has(labelKey)) {
        streams.set(labelKey, {
          stream: labels,
          values: [],
        })
      }

      const logLine = JSON.stringify({
        message: entry.message,
        metadata: entry.metadata || {},
        ...entry,
      })

      const timestampNs = (
        new Date(entry.timestamp).getTime() * 1000000
      ).toString()
      streams.get(labelKey)!.values.push([timestampNs, logLine])
    })

    return Array.from(streams.values())
  }

  private addToBatch(info: any): void {
    this.logBatch.push(info)

    if (this.logBatch.length >= this.batchSize) {
      this.flushBatch()
    } else {
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
      }
      this.batchTimer = setTimeout(() => {
        this.flushBatch()
      }, this.batchTimeout)
    }
  }

  private flushBatch(): void {
    if (this.logBatch.length === 0) return

    const batch = [...this.logBatch]
    this.logBatch = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    this.sendToLoki(batch)
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info)
    })

    this.addToBatch(info)
    callback()
  }

  async flush(): Promise<void> {
    this.flushBatch()
    // Даем время для отправки
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  async close(): Promise<void> {
    await this.flush()
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }
  }
}

// Создаем Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.errors({stack: true}),
  ),
  defaultMeta: {service: 'lta-web'},
  transports: [
    // Console transport для development
    ...(process.env.NODE_ENV === 'development'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
        ]
      : []),

    // Loki transport
    new LokiTransport({
      lokiUrl: process.env.LOKI_URL || 'http://localhost:3100',
      serviceName: process.env.SERVICE_NAME || 'lta-web ',
      batchSize: 100,
      batchTimeout: 5000,
    }),
  ],
})

if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Shutting down logger...')
    await logger.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('Shutting down logger...')
    await logger.close()
    process.exit(0)
  })
}

export default logger
