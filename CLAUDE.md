# Проєкт coin-save-app

Веб-фронтенд для **CoinSave** — сімейного трекера витрат. Бекенд — окремий репозиторій
`coin-save-api` (NestJS), сусідня папка `../coin-save-api`. Повна специфікація лежить
локально в `docs/` (не в git — див. `.gitignore`):

- `docs/specs/2026-09-11-coin-save-design.md` — продуктова специфікація (джерело істини щодо вимог).
- `docs/specs/2026-09-14-coin-save-design-system.md` — дизайн-система (токени, типографіка, компоненти).
- `docs/superpowers/plans/` — плани реалізації бекенду (довідка: що і як зроблено на API).

API: Swagger UI — http://176.117.78.135/api/docs, контракт — http://176.117.78.135/api/docs.json.

Документація Next.js 16 лежить локально в `node_modules/next/dist/docs/` — для питань по Next читай її
(правила нижче з `AGENTS.md` керуються самим Next, не редагуй їх вручну):

@AGENTS.md

## Стек

- Next.js 16 (App Router), React 19, TypeScript, Node.js 24
- Стилі: Tailwind CSS v4 + shadcn/ui (Radix)
- Серверний стан: TanStack Query v5; локальний — `useState`/`useReducer` (Zustand — тільки якщо з'явиться реальний cross-tree client-only стан)
- API-клієнт: `openapi-typescript` + `openapi-fetch`, типи генеруються в `src/generated/` (gitignored)
- Realtime: `socket.io-client` (invalidation events)
- i18n: `next-intl` (`uk` — дефолт, `en`), URL-префікс `/{locale}/...`
- Форми: `react-hook-form` + `zod`
- Drag-and-drop: `@dnd-kit`
- Графіки: `recharts`
- Тести: `vitest` + `@testing-library/react` (unit), Playwright (E2E лише критичні флоу)
- Менеджер пакетів: **npm**. Версії — актуальні стабільні; перед використанням API бібліотеки
  звіряйся з документацією через context7, а не з пам'яттю (Next 16, Tailwind 4, zod 4 мають breaking changes).

## Команди

- Встановити залежності: `npm install`
- Дев-сервер: `npm run dev` (перед стартом генерує API-клієнт)
- Згенерувати API-клієнт: `npm run api:generate`
- Тести: `npm run test` (unit), `npm run test:e2e` (Playwright)
- Лінтер: `npm run lint`
- Тайпчек: `npm run typecheck`
- Білд: `npm run build`

## Архітектура

Feature-based (модульна), див. специфікацію §3.5:

```
src/
  app/[locale]/(auth)/    ← login, signup, verify, reset — тонкий шар роутингу
  app/[locale]/(app)/     ← захищені сторінки
  modules/<feature>/      ← auth, spaces, wallets, categories, expenses, recurring, analytics
    { components/, hooks/, api/, types/, index.ts }
  shared/
    ui/                   ← shadcn/ui компоненти
    lib/                  ← api-client, socket-client, formatters
    hooks/  i18n/  constants/  types/
  generated/              ← OpenAPI-типи (не редагувати руками)
```

- Модулі імпортують один одного **тільки** через `index.ts` (barrel). Глибокі імпорти в чужий модуль заборонені.
- Модулі вільно імпортують із `shared/`. `shared/` не імпортує з `modules/`.
- `app/` тонкий: сторінка рендерить компонент модуля або невелику композицію.

## Конвенції

- Стиль коду: ESLint + Prettier.
- Файли: kebab-case (`wallet-card.tsx`, `use-create-expense.ts`); компоненти — PascalCase в коді.
  Unit-тести поруч із кодом: `*.test.ts(x)`. E2E — `e2e/*.spec.ts`.
- **Гроші:** API повертає суми як рядки (Decimal). Ніколи не перетворювати в `number` для арифметики;
  для відображення — `formatCurrency()` з `shared/lib/formatters.ts` (`Intl.NumberFormat`).
- **Помилки API:** `{ statusCode, code, message, details }`. Показуємо користувачу тільки локалізований текст
  за `code` (`errors.<CODE>` у messages), `message` — лише для логів. Фолбек — `errors.UNKNOWN_ERROR`.
- **Типи API** беруться лише з `src/generated/`. Якщо в OpenAPI-контракті бракує схеми відповіді —
  не вигадувати тип вручну мовчки: повідом, бо це задача для бекенду.
- **Тексти UI** — тільки через `next-intl`, жодних захардкоджених рядків. Ключі додаються одночасно в `uk.json` і `en.json`.
- **React Query ключі** — як у специфікації §8.5 (`['wallets', spaceId]`, `['expenses', spaceId, period]` …),
  бо на них зав'язана інвалідація з WebSocket-подій.

### Auth і локальна розробка

- Токени — httpOnly cookies (`access`, `refresh`), ставить бекенд. Фронт токени не читає і не зберігає.
- Бекенд ставить cookie з `Secure` і не має CORS, тому фронт ходить в API **тільки same-origin**:
  у dev Next.js `rewrites` проксить `/api/*` і `/socket.io/*` на бекенд (`API_PROXY_TARGET`).
  Не викликати `http://176.117.78.135` напряму з браузера.
- Захист роутів — перевірка наявності cookie `access` у Next proxy/middleware, без запитів до API.
- На 401 — один раз `POST /api/auth/refresh` і повтор запиту; якщо refresh не вдався — редірект на `/{locale}/login`.

## Дизайн

Розробка UI ведеться **за дизайном у Figma** (доступ через MCP `TalkToFigma`) та дизайн-системою з `docs/specs/`.

- **Схематично** — розкладка, ієрархія і склад елементів мають відповідати макету, але pixel-perfect не потрібен
  (відступи — найближчі значення зі шкали 4/8/12/16/24/32/48/64).
- **Точно** — кольори, форми (радіуси, тіні), шрифти й типографічні стилі беруться з дизайн-системи без відхилень.
- Кольори та типографіка — лише через токени Tailwind-теми (визначені в `src/app/globals.css`, див. таблицю нижче).
  Жодних довільних hex/px-значень у компонентах (`bg-[#F97350]`, `text-[15px]`). Якщо потрібного токена немає — додай його в тему.
- Кожен компонент одразу підтримує світлу і темну тему.
- Перед версткою екрана/компонента — подивись відповідний фрейм у Figma. Якщо макета немає — спитай, а не вигадуй.
- Після верстки — перевір результат у браузері (обидві теми, desktop 1440 і mobile 390) і звір із макетом.

### Токени → класи Tailwind

Токени названі за семантикою shadcn/ui, щоб його компоненти підхоплювали їх без змін:

| Токен дизайн-системи       | Клас                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| accent / accent-hover      | `bg-primary`, `text-primary`, `hover:bg-primary-hover`; текст на ньому — `text-primary-foreground`                |
| success / warning / danger | `text-success`, `text-warning`, `text-destructive` (`bg-*` аналогічно)                                            |
| bg                         | `bg-background`                                                                                                   |
| surface                    | `bg-card`                                                                                                         |
| border                     | `border-border`                                                                                                   |
| text-primary               | `text-foreground`                                                                                                 |
| text-secondary             | `text-muted-foreground`                                                                                           |
| Радіуси                    | `rounded-card` (16px), `rounded-control` (10px), `rounded-full`                                                   |
| Тіні                       | `shadow-card`, `shadow-card-raised` (drag/hover), `shadow-modal`                                                  |
| Типографіка                | `text-display`, `text-h1`, `text-h2`, `text-body` (+ `font-medium` для Body Medium), `text-caption`, `text-money` |

## Робочий процес

- Задача → (специфікація/план у `docs/superpowers/` для великих фіч) → feature-гілка `feature/<name>` → PR у `main`.
- Коміти англійською, Conventional Commits (`feat:`, `fix:`, `chore:`, `test:` …).

## Правила для агента

- Перед завершенням задачі обов'язково прогнати `npm run lint` і `npm run test`.
  Playwright E2E (`npm run test:e2e`) — тільки коли задача зачіпає критичні флоу (специфікація §12.4).
- Не чіпати: `src/generated/` (згенерований код), `.env`-файли, секрети, CI-конфіги без явного запиту.
- Не змінювати бекенд (`../coin-save-api`) — проблеми з API фіксуй і повідомляй.
- У логи та консоль не потрапляють паролі, токени, персональні дані.
- Один PR = одна задача. Не робити побічних рефакторингів.
- Специфікація в `docs/specs/` — джерело істини щодо вимог, але не комітиться в git.
