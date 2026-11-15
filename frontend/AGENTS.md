<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# راهنمای توسعه و معماری فرانت‌اند (Frontend Architecture Guide)

این مستند معماری، ساختار وضعیت، کامپوننت‌ها، فونت‌های محلی، سیستم احراز هویت و استانداردهای توسعه رابط کاربری پروژه کانبان را شرح می‌دهد.

## پشته فناوری فرانت‌اند

- فریم‌ورک: Next.js 16 (App Router) با خروجی کامپایل استاتیک (`output: "export"`)
- نحوه بیلد: `next build --webpack` جهت جلوگیری از خطاهای کرش فرآیند Turbopack در محیط ویندوز
- کتابخانه هسته: React 19 با TypeScript
- استایل‌دهی: Tailwind CSS v4، PostCSS با `@tailwindcss/postcss` و توکن‌های CSS در `src/app/globals.css`
- سیستم کشیدن و رها کردن: `@dnd-kit/react` و `@dnd-kit/dom`
- موتور انیمیشن: `gsap` و `@gsap/react` جهت چیدمان دانه‌دانه کارت‌ها، انیمیشن ورود اجزا، ۳D Tilt و ترنزیشن آبشاری پنل
- آیکون‌ها: `lucide-react`
- تست واحد: `vitest` با پوشش کامل توابع بورد و نشست احراز هویت (۱۹ تست پاس‌شده)

## سیستم تایپوگرافی و دو زبانه

- زبان پیش‌فرض: فارسی (`fa`) با جهت `rtl`.
- زبان ثانویه: انگلیسی (`en`) با جهت `ltr` قابل تغییر از نوار بالا.
- فونت‌های فارسی: فایل‌های محلی فونت پیدا در پوشه `public/fonts/`:
  - `Peyda-Light.ttf` (وزن ۳۰۰)
  - `Peyda-Medium.ttf` (وزن ۵۰۰)
  - `Peyda-Bold.ttf` (وزن ۷۰۰)
- فونت‌های انگلیسی: فونت‌های سیستمی لاتین (Segoe UI, Apple System, Roboto) طبق کلاس `font-latin` در `globals.css`. به هیچ عنوان از فونت پیدا برای متون انگلیسی استفاده نمی‌شود.
- استقلال از شبکه: بدون هیچ‌گونه فراخوانی برخط فونت‌های گوگل برای تضمین بیلد کاملاً آفلاین.

## ساختار فایل‌ها

- `src/app/page.tsx`: صفحه اصلی تخته شامل شل برنامه، بارگذاری اولیه کارت‌ها و متادیتا از LocalStorage، نوار ابزار، دکمه ورود و خروج، سوئیچ زبان و سایدبار هوش مصنوعی.
- `src/app/AppSidebar.tsx`: نوار کناری ناوبری شامل ریل آیکونی و پنل کشویی چندمنظوره (چت هوش مصنوعی، اعضای تیم، اعلان‌ها، رویدادها و تنظیمات).
- `src/app/AppNavbar.tsx`: نوار بالایی دولایه شامل هدر عمومی (جستجو، اشتراک، هوش مصنوعی، زبان، خروج) و کنترلر نماها و فازهای کاری.
- `src/app/TimelineView.tsx`: نمای خط زمان (گانت‌چارت تعاملی ۳۱ روزه دسامبر ۲۰۲۶ با تفکیک بازه زمانی هر تسک).
- `src/app/CalendarView.tsx`: نمای تقویم ماهانه شبکه‌ای با چینش راست‌به‌چپ و چپ‌به‌راست و پین‌های وضعیت تسک‌ها.
- `src/app/ProgressView.tsx`: داشبورد تحلیلی پیشرفت پروژه با شاخص‌های کلیدی، درصد پیشرفت هر فاز کاری و تفکیک اولویت‌ها.
- `src/app/LoginForm.tsx`: کامپوننت فرم ورود آزمایشی با اعتبارسنجی نام کاربری (`user`) و رمز عبور (`password`).
- `src/app/layout.tsx`: تنظیم ساختار صفحه HTML، تعریف `@font-face` برای فونت پیدا و کلاس‌های پایه تم.
- `src/app/globals.css`: تعاریف پالت رنگ رسمی پروژه، توکن‌های سیستم طراحی، استایل‌های شیشه‌ای و قوانین جهت متن (RTL/LTR).
- `src/lib/auth.ts`: مدیریت نشست احراز هویت در سمت کاربر با `useSyncExternalStore` و ذخیره‌سازی توکن در LocalStorage.
- `src/lib/auth.test.ts`: آزمون‌های واحد نشست کاربر (ورود معتبر، ورود نامعتبر، خروج و بررسی اعتبار توکن).
- `src/lib/animations.ts`: هوک‌ها و توابع ماژولار GSAP شامل تایم‌لاین ورود ترتیبی، چیدمان دانه‌دانه کارت‌ها، هوک `useCardTilt`، میکروبونس لایک و آبشار کشو.
- `src/lib/api.ts`: کلاینت فراخوانی سرویس‌های بک‌اند با الصاق خودکار هدر Bearer توکن.
- `src/lib/board.ts`: مدل داده خالص تخته کانبان، توابع پویا برای افزودن ستون (`addColumn`)، حذف ستون (`deleteColumn`)، تغییر نام (`renameColumn`)، افزودن فاز (`addPhase`)، ویرایش فاز (`renamePhase`)، حذف فاز (`deletePhase`) و فرمت‌بندی دو زبانه بازه زمان‌بندی (`formatScheduleDate`).
- `src/lib/board.test.ts`: آزمون‌های واحد Vitest برای اعتبارسنجی کلیه توابع وضعیت تخته، فازها و زمان‌بندی (۱۹ تست پاس‌شده).

## پالت رنگ استاندارد پروژه

کلیه متغیرهای تم در `globals.css` با استانداردهای تعریف‌شده هماهنگ هستند:
- زرد تأکیدی (`#ecad0a` / `--accent-yellow`): برای خطوط تأکیدی و ستون «در حال انجام»
- آبی اصلی (`#209dd7` / `--brand`): برای لینک‌ها، تب‌های فعال و ستون «لیست کارها»
- بنفش ثانویه (`#753991` / `--action-purple`): برای دکمه‌های ثبت و فاز توسعه فرانت‌اند
- سرمه‌ای تیره (`#032147` / `--ink`): برای عنوان‌های اصلی، پس‌زمینه تب‌های فعال و فاز بک‌اند
- خاکستری متن (`#888888` / `--muted`): برای متون توضیحی و برچسب‌ها

## ذخیره‌سازی محلی (LocalStorage Persistence)

- برای پایداری وضعیت تخته هنگام رفرش صفحه یا جابه‌جایی، وضعیت کارت‌ها و ستون‌ها و فازها در `kanban_board_state` و متادیتای کارت‌ها در `kanban_card_meta` ذخیره می‌شود.
- مدیریت نسخه دیتای لوکال با کلید `kanban_board_version: "v5-dynamic-columns-and-phases"` صورت می‌گیرد تا تغییرات ساختاری ستون‌ها و فازها به‌صورت خودکار در مرورگر اعمال شود.

## استانداردهای کدنویسی در فرانت‌اند

1. همواره از کامپوننت `<Link>` از `next/link` برای ناوبری‌های داخلی استفاده شود.
2. پیش از ارائه هر تغییر، دستورات `npm run lint` و `npm run test:unit` باید بدون هیچ خطایی اجرا شوند.
3. از هرگونه پیچیده‌سازی غیرضروری خودداری شود.
4. هرگز از ایموجی در کامپوننت‌ها، استایل‌ها و پیام‌های کاربری استفاده نشود.
