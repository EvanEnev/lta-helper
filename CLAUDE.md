# CLAUDE.md

## Документация

- shadcn (стиль `base-nova`, на `@base-ui/react`): https://ui.shadcn.com/docs
- Base UI: https://base-ui.com/react/overview/quick-start
- Tailwind CSS v4: https://tailwindcss.com/docs
- Next.js 16 App Router: https://nextjs.org/docs/app
- Иконки: https://lucide.dev/icons

## Стек

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 16.2 (App Router, Turbopack) |
| React | 19.2 |
| Язык | TypeScript 5.9 (strict) |
| UI | shadcn на Base UI (`components/ui`) |
| Стили | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Иконки | `lucide-react` (логотипы брендов: `src/components/global/BrandIcons.tsx`) |
| Состояние | Jotai 2 |
| Дата/время | Luxon 3 |
| БД | PostgreSQL (`pg`) |
| Аутентификация | better-auth 1.5 |
| Real-time | Socket.IO 4 |
| Карты | Leaflet |
| Excel | ExcelJS |
| Сервер | Кастомный `server.ts` через `tsx` |
| Менеджер пакетов | pnpm |

## Структура

```
app/                  страницы, Route Handlers (app/api), Server Actions (app/actions)
components/ui/        shadcn-компоненты
src/components/       компоненты по разделам (global, payrolls, salary, ...)
src/hooks/            хуки
src/utils/            клиентские утилиты, атомы, типы
lib/                  серверная логика: auth, socket, functions, payrolls
public/               статика, сервис-воркер
proxy.ts              вход обязателен для всех страниц (кроме /login)
server.ts             Next + Socket.IO
```

- Страница `app/**/page.tsx` тонкая: получает данные и отдаёт в компонент.
- Один адаптивный компонент для телефона и ПК (брейкпоинты Tailwind). `useIsMobile` в разметке не использовать: он даёт мерцание при загрузке.

## UI

- Импорты: `@/components/ui/*`, иконки из `lucide-react`.
- Ссылка-кнопка: `<Button render={<Link href="..." />} nativeButton={false}>`.
- Цвета только через токены темы (`bg-background`, `text-muted-foreground`, `border`, `text-success`, `text-destructive`), без хардкода.
- Прокручиваемая область с липкой шапкой: `min-h-0 flex-1 overflow-auto [contain:inline-size]`.
- Тяжёлые списки: `LazyMount`, `React.memo`, ввод чисел через `CommitNumberInput` (запись по потере фокуса).
- Компоненты `Image` из `next/image`.

## Безопасность

- Любой Route Handler и Server Action сам проверяет сессию (`auth.api.getSession`) и права (`checkPermissions`): `proxy.ts` на `/api` не действует.
- SQL только с параметрами (`$1`, `$2`), никаких подстановок через `${}`. Несколько записей подряд: транзакция (`db.connect()`, `begin`/`commit`/`rollback`).
- Входные данные проверять (тип, диапазон, длина) до обращения к БД.
- Ответы без внутренних сообщений ошибок БД.
- Путь возврата после входа: `lib/auth/safeRedirect.ts`.

## Дата и время

Luxon, часовой пояс `Europe/Moscow`:

```ts
import {DateTime} from 'luxon'

const now = DateTime.now().setZone('Europe/Moscow')
```

## Команды

```bash
pnpm dev     # tsx watch server.ts
pnpm build   # next build
pnpm start   # продакшен
pnpm test    # проверка типов (tsc --noEmit)
pnpm lint    # ESLint
```

## Правила кода

- `strict: true`, без `any` (использовать `unknown` и проверки типа).
- `interface` для пропсов, `type` для union.
- Комментарии в коде не пишем.
- Не использовать: `HeroUI`, `@iconify/react`, `moment`, `date-fns` напрямую, `require()`, `next/router`.
