# CLAUDE.md

## Документация — читай перед работой с UI

Перед созданием или рефакторингом UI — обращайся к актуальной документации HeroUI:

- **Полная документация:** https://heroui.com/react/llms-full.txt
- **Компоненты:** https://heroui.com/react/llms-components.txt
- **Паттерны:** https://heroui.com/react/llms-patterns.txt
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **Next.js 16 App Router:** https://nextjs.org/docs/app

---

## Стек

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 16.2 (App Router) |
| React | 19.2 |
| Язык | TypeScript 5.9 (strict) |
| UI-библиотека | HeroUI v3 (`@heroui/react@3.0.2`) |
| Стили | Tailwind CSS v4 + `@tailwindcss/postcss` |
| Иконки | Iconify (`@iconify/react`) |
| Анимации | Framer Motion 12 |
| Состояние | Jotai 2 |
| Дата/время | Luxon 3 + `@internationalized/date` |
| БД | PostgreSQL (`pg`) |
| Аутентификация | better-auth 1.5 |
| Real-time | Socket.IO 4 (клиент + сервер) |
| Карты | Leaflet + react-leaflet |
| Excel | ExcelJS |
| Сервер | Кастомный `server.ts` через `tsx` |
| Менеджер пакетов | pnpm |
| Module system | ESM (`"type": "module"`) |

---

## Структура проекта

```
.
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── distribute.ts
│   ├── admin/page.tsx
│   ├── api/                      # Route Handlers
│   │   ├── auth/[...all]/        # better-auth handler
│   │   ├── excel/                # Генерация Excel-отчётов
│   │   ├── payments/             # CRUD выплат
│   │   ├── payrolls/             # CRUD ведомостей
│   │   ├── salary/               # Данные зарплат
│   │   ├── workers/              # Управление сотрудниками
│   │   └── ...
│   ├── login/page.tsx
│   ├── payments/page.tsx
│   ├── payrolls/
│   │   ├── [id]/page.tsx         # Динамический роут
│   │   ├── create/page.tsx
│   │   └── issue/page.tsx
│   ├── profile/page.tsx
│   ├── salary/
│   │   ├── summarized/page.tsx
│   │   └── summarized2/page.tsx
│   ├── schedule/page.tsx
│   ├── workers/page.tsx
│   ├── globals.css               # Tailwind v4 + кастомные токены
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Главная страница
│
├── src/
│   ├── components/               # Все React-компоненты
│   │   ├── global/               # Общие компоненты (Header, провайдеры, LocationPicker...)
│   │   │   ├── header/
│   │   │   └── providers/
│   │   ├── admin/
│   │   ├── page/                 # Компоненты главной страницы
│   │   ├── payments/
│   │   ├── payrolls/
│   │   │   ├── create/
│   │   │   ├── details/
│   │   │   └── issue/
│   │   ├── profile/
│   │   ├── register/
│   │   ├── salary/
│   │   │   ├── summarized/
│   │   │   └── summarized2/
│   │   ├── schedule/
│   │   ├── workers/
│   │   └── wrapped/
│   ├── hooks/                    # Кастомные React-хуки
│   │   ├── useColors.ts
│   │   ├── useIsMobile.ts
│   │   ├── useIsScrolled.ts
│   │   └── useLongPress.ts
│   └── utils/                    # Утилиты фронтенда
│       ├── global/
│       │   ├── atoms.ts          # Jotai-атомы (глобальное состояние)
│       │   ├── fetchHandler.ts
│       │   ├── pathButtons.ts
│       │   └── providers.ts      # React-провайдеры
│       ├── admin/
│       ├── send/
│       └── types.ts              # Глобальные TypeScript-типы
│
├── lib/                          # Серверная логика
│   ├── auth/                     # better-auth: клиент, парсинг сессий
│   ├── functions/                # Бизнес-логика: зарплаты, ранги, геттеры
│   │   └── points/
│   ├── socket/                   # Socket.IO: dbListener, серверные функции
│   ├── auth.ts                   # Конфигурация better-auth
│   ├── database.ts               # Подключение к PostgreSQL
│   ├── google.ts                 # Google Sheets / OAuth
│   └── socket.ts                 # Socket.IO инстанс
│
├── public/
│   ├── icons/
│   │   └── locations/            # SVG/TSX иконки локаций
│   └── sw.js                     # Service Worker (Web Push)
│
├── server.ts                     # Кастомный HTTP-сервер (tsx)
├── Logger.ts                     # Winston-логгер
├── proxy.ts
├── next.config.mjs
├── postcss.config.cjs
├── tsconfig.json
└── CLAUDE.md
```

### Правило размещения файлов

- **Компоненты** → `src/components/[feature]/`
- **Хуки** → `src/hooks/`
- **Клиентские утилиты и атомы** → `src/utils/`
- **Серверная бизнес-логика** → `lib/`
- **Route Handlers (API)** → `app/api/`
- **Server Actions** → `app/actions/`
- **Страницы** → `app/[route]/page.tsx`

---

## HeroUI v3 — правила

### Импорты

```tsx
import { Button, Card, Input, Modal, Drawer } from "@heroui/react";
```

### Провайдер

HeroUI v3 **не требует** `HeroUIProvider`. Провайдер нужен только для локализации:

```tsx
// src/components/global/providers/ClientProviders.tsx
"use client";
import { I18nProvider } from "@heroui/react";

export function ClientProviders({ lang, children }) {
  return <I18nProvider locale={lang}>{children}</I18nProvider>;
}
```

### Изображения

Компонент `<Image>` из HeroUI **удалён в v3**:

```tsx
// ✅ правильно
import Image from "next/image";
<Image src="..." alt="..." width={300} height={200} className="rounded-lg" />

// ❌ не работает в v3
import { Image } from "@heroui/react";
```

### Кастомизация слотов

```tsx
<Input
  classNames={{
    base: "max-w-xs",
    inputWrapper: "border border-default-200",
    label: "text-sm font-medium",
  }}
/>
```

### Иконки — используй Iconify

```tsx
import { Icon } from "@iconify/react";

<Icon icon="lucide:user" className="text-xl" />
<Icon icon="lucide:calendar" width={20} />
```

Иконки ищи на https://icon-sets.iconify.design — предпочитай `lucide:*` и `mdi:*`.

---

## Tailwind CSS v4

- Конфигурация через `globals.css`, **нет** `tailwind.config.js`
- Импорт в `globals.css`:

```css
@import "tailwindcss";
@import "@heroui/styles";

@theme {
  /* кастомные токены здесь */
}
```

- Используй **семантические токены HeroUI** вместо серых:

```tsx
// ✅ адаптируется к теме
className="bg-default-100 text-foreground border-divider"

// ❌ хардкод
className="bg-gray-100 text-black"
```

Токены цветов: `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `foreground`, `background`, `divider`, `content1`–`content4`.

---

## Socket.IO

- Серверный инстанс: `lib/socket.ts`
- DB-слушатель: `lib/socket/dbListener.ts`
- Клиентское подключение: через `src/utils/global/providers.ts`

```tsx
// Клиент
"use client";
import { socket } from "@/utils/global/providers";

useEffect(() => {
  socket.on("salary:update", handler);
  return () => socket.off("salary:update", handler);
}, []);
```

---

## Дата и время

Используй **Luxon** для всех операций с датами:

```ts
import { DateTime } from "luxon";

const now = DateTime.now().setZone("Europe/Moscow");
const formatted = now.toFormat("dd.MM.yyyy");
const fromISO = DateTime.fromISO(isoString);
```

Для компонентов HeroUI (DatePicker, Calendar) — `@internationalized/date`:

```ts
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

const todayDate = today(getLocalTimeZone());
```

---

## Аутентификация — better-auth

- Конфиг: `lib/auth.ts`
- Клиент: `lib/auth/authClient.ts`
- Роут-хендлер: `app/api/auth/[...all]/`

```ts
// Серверная проверка сессии
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect("/login");
```

---

## Паттерны компонентов

### Страница = тонкая оболочка

`app/[route]/page.tsx` — только получение данных и передача в компонент:

```tsx
// app/salary/page.tsx
import { SalaryPage } from "@/src/components/salary/SalaryPage";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <SalaryPage session={session} />;
}
```

### Desktop/Mobile разделение

Паттерн в проекте: отдельные компоненты для десктопа и мобайла:

```tsx
// src/components/salary/SalaryPage.tsx
"use client";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { DesktopSalary } from "./DesktopSalary";
import { MobileSalary } from "./MobileSalary";

export function SalaryPage() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSalary /> : <DesktopSalary />;
}
```

### Структура файла компонента

```tsx
// src/components/[feature]/MyComponent.tsx
"use client"; // только если нужны хуки/события

import type { FC } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <Button onPress={onAction} startContent={<Icon icon="lucide:check" />}>
        Действие
      </Button>
    </div>
  );
};
```

---

## TypeScript

- `strict: true`, `"type": "module"` (ESM)
- `interface` для пропсов, `type` для union/utility типов
- Глобальные типы: `src/utils/types.ts`
- Серверные типы: `lib/` рядом с использованием
- Не используй `any` — используй `unknown` с type guard или конкретный тип
- Импорт типов: `import type { Foo } from "..."`

---

## Команды

```bash
pnpm dev        # dev-сервер (tsx watch server.ts)
pnpm build      # Next.js build
pnpm start      # продакшн (tsx server.ts)
pnpm test       # проверка типов (tsc --noEmit)
pnpm lint       # ESLint
```

---

## Частые ошибки — не допускай

```tsx
// ❌ HeroUIProvider не нужен в v3
import { HeroUIProvider } from "@heroui/react";

// ❌ Image из HeroUI удалён
import { Image } from "@heroui/react";

// ❌ useRouter из next/router (Pages Router)
import { useRouter } from "next/router"; // → next/navigation

// ❌ moment/date-fns вместо luxon
import moment from "moment";

// ❌ Прямые цвета вместо токенов
className="text-gray-500" // → text-default-500

// ❌ Хуки в Server Components
// Server Component не может использовать useState, useEffect и т.д.

// ❌ require() в ESM-проекте
const fs = require("fs"); // → import fs from "fs"
```