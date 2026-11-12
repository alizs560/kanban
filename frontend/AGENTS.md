<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# راهنمای توسعه و معماری فرانت‌اند (Frontend Architecture Guide)

این مستند معماری، ساختار وضعیت، کامپوننت‌ها و استانداردهای توسعه رابط کاربری پروژه کانبان LOOM را شرح می‌دهد.

## پشته فناوری فرانت‌اند

- فریم‌ورک: Next.js 16 (App Router)
- کتابخانه هسته: React 19 با TypeScript
- استایل‌دهی: Tailwind CSS v4 و توکن‌های اختصاصی CSS در `src/app/globals.css`
- سیستم کشیدن و رها کردن: `@dnd-kit/react` و `@dnd-kit/dom`
- آیکون‌ها: `lucide-react`
- فریم‌ورک‌های آزمون: `vitest` برای تست‌های واحد و `@playwright/test` برای تست‌های e2e

## ساختار فایل‌ها

- `src/app/page.tsx`: صفحه اصلی تخته شامل شل برنامه، نوار ابزار بالا، نمای تخته و لیست، مدیریت فرم افزودن و ویرایش کارت‌ها و اتصال سایدبار هوش مصنوعی.
- `src/app/layout.tsx`: تنظیم ساختار کلی صفحه HTML، زبان، جهت متون و فونت‌ها.
- `src/app/globals.css`: تعاریف پالت رنگ رسمی پروژه، توکن‌های سیستم طراحی و قوانین واکنش‌گرایی و حالت دوزبانه (RTL/LTR).
- `src/lib/board.ts`: مدل داده خالص تخته کانبان و توابع تغییر وضعیت تغییرناپذیر (افزودن کارت، ویرایش، حذف، جابه‌جایی، تغییر نام ستون، جستجو).
- `src/lib/board.test.ts`: آزمون‌های واحد Vitest برای اعتبارسنجی کلیه توابع وضعیت تخته.

## پالت رنگ استاندارد پروژه

کلیه متغیرهای تم در `globals.css` با استانداردهای تعریف‌شده در سند ریشه هماهنگ شده‌اند:
- زرد تأکیدی (`#ecad0a` / `--accent-yellow`): برای خطوط تأکیدی و ستون‌های در حال انجام
- آبی اصلی (`#209dd7` / `--brand`): برای لینک‌ها، تب‌های فعال و بخش‌های کلیدی
- بنفش ثانویه (`#753991` / `--action-purple`): برای دکمه‌های ثبت و اقدامات مهم
- سرمه‌ای تیره (`#032147` / `--ink`): برای عنوان‌های اصلی و متون تیره
- خاکستری متن (`#888888` / `--muted`): برای متون توضیحی و برچسب‌ها

## مدیریت وضعیت و داده‌های دو زبانه

- نوع داده `LocalizedText` برای عنوان و توضیحات کارت‌ها و نام ستون‌ها دو کلید `en` و `fa` دارد.
- تابع `updateCard` در `board.ts` از پارامتر `locale` برای ویرایش امن متن زبان جاری بدون تداخل با زبان دیگر پشتیبانی می‌کند.
- تمام ویرایش‌های وضعیت تخته باید به‌صورت تغییرناپذیر (Immutable) پیاده‌سازی شوند تا تاریخچه‌گیری و قابلیت Undo برای اقدامات هوش مصنوعی بدون نقص عمل کند.

## استانداردهای کدنویسی در فرانت‌اند

1. همواره از کامپوننت `<Link>` از `next/link` برای ناوبری‌های داخلی استفاده شود و از تگ `<a>` اجتناب گردد.
2. پیش از ارائه هر تغییر، دستورات `npm run lint` و `npm run test:unit` باید بدون هیچ خطایی اجرا شوند.
3. از هرگونه پیچیده‌سازی غیرضروری خودداری شود.
4. هرگز از ایموجی در کامپوننت‌ها، استایل‌ها، و پیام‌های کاربری استفاده نشود.
