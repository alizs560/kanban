# LOOM — تخته کانبان تک‌صفحه‌ای

**LOOM** یک اپلیکیشن وب Kanban است: یک تخته با پنج ستون ثابت، کارت‌های دو‌زبانه (انگلیسی / فارسی)، کشیدن و رها کردن، و نمای Board و List. کد برنامه در پوشه‌ی `frontend` است (Next.js، App Router).

داده‌ها فقط در حافظه‌ی مرورگر نگه داشته می‌شوند. با رفرش صفحه، تخته دوباره با **داده‌ی نمونه** پر می‌شود.

## امکانات (MVP)

- پنج ستون با شناسه‌های ثابت: `backlog`, `todo`, `in-progress`, `review`, `done` (نام ستون قابل ویرایش؛ افزودن یا حذف ستون پشتیبانی نمی‌شود)
- کارت با عنوان و جزئیات در هر دو زبان؛ افزودن، ویرایش و حذف کارت
- جابه‌جایی کارت بین ستون‌ها با drag and drop (`@dnd-kit`)
- جست‌وجو روی عنوان و جزئیات (هر دو زبان)
- تعویض زبان UI و جهت متن (`dir`، فونت Vazirmatn برای فارسی)
- نمای **Board** (ستون‌های افقی) و **List** (بخش‌های عمودی)

تب‌های Timeline، Calendar و Progress در رابط دیده می‌شوند اما هنوز پیاده‌سازی نشده‌اند.

## پیش‌نیاز

- [Node.js](https://nodejs.org/) (نسخه‌ای که با Next.js 16 سازگار باشد)
- npm

در ریشه‌ی این مخزن فایل `package.json` وجود ندارد؛ همه‌ی دستورات npm از داخل `frontend` اجرا می‌شوند.

## راه‌اندازی

```bash
cd frontend
npm install
npm run dev
```

مرورگر: [http://localhost:3000](http://localhost:3000)

### ساخت نسخه production

```bash
cd frontend
npm run build
npm run start
```

### آزمون

```bash
cd frontend
npm run test          # واحد (Vitest) + e2e (Playwright)
npm run test:unit     # فقط Vitest
npm run test:e2e      # فقط Playwright (e2e/board.spec.ts)
npm run lint          # ESLint
```

## ساختار مخزن

| مسیر | توضیح |
|------|--------|
| `frontend/src/app/page.tsx` | صفحه اصلی: UI، DnD، جست‌وجو، Board/List |
| `frontend/src/app/layout.tsx` | layout، فونت‌ها، metadata |
| `frontend/src/lib/board.ts` | مدل تخته و توابع (افزودن/حذف/جابه‌جایی کارت و …) |
| `frontend/src/app/globals.css` | استایل سراسری و توکن‌های رنگ LOOM |
| `frontend/public/brand/` | دارایی‌های برند (مثلاً آیکون) |
| `AGENTS.md` | محدوده محصول، نقشه فایل‌ها و راهنمای توسعه برای عامل/مشارکت‌کننده |

## خارج از محدودهٔ فعلی

چند تخته، احراز هویت، API یا ذخیره‌سازی سرور، بایگانی، فیلتر پیشرفته، و ویوهای Timeline / Calendar / Progress عمداً در این MVP نیستند.

## فنی

- Next.js 16، React 19، TypeScript
- وابستگی‌های UI: `@dnd-kit/react`, `lucide-react`

برای جزئیات بیشتر محدوده و قراردادهای کد، `AGENTS.md` را ببینید. راه‌اندازی کوتاه به انگلیسی: `frontend/README.md`.
