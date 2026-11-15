export type LocalizedText = {
  en: string;
  fa: string;
};

export type Locale = "en" | "fa";

export type PhaseId = string;

export type Phase = {
  id: PhaseId;
  label: LocalizedText;
  badgeClass: string;
};

export const defaultBoardPhases: Phase[] = [
  {
    id: "brand",
    label: { en: "Brand & Identity", fa: "هویت بصری" },
    badgeClass: "phase-badge-brand",
  },
  {
    id: "uiux",
    label: { en: "UI/UX & Prototype", fa: "طراحی تجربه و رابط کاربری" },
    badgeClass: "phase-badge-uiux",
  },
  {
    id: "frontend",
    label: { en: "Frontend & Motion", fa: "توسعه فرانت‌اند" },
    badgeClass: "phase-badge-frontend",
  },
  {
    id: "backend",
    label: { en: "Backend & Architecture", fa: "توسعه بک‌اند" },
    badgeClass: "phase-badge-backend",
  },
  {
    id: "launch",
    label: { en: "QA & Launch", fa: "انتشار و سئو" },
    badgeClass: "phase-badge-launch",
  },
];

export const boardPhases = defaultBoardPhases;

export function getBoardPhases(board: BoardState): Phase[] {
  return board.phases && board.phases.length > 0 ? board.phases : defaultBoardPhases;
}

export type Column = {
  id: string;
  name: LocalizedText;
};

export type Card = {
  id: string;
  columnId: string;
  title: LocalizedText;
  details: LocalizedText;
  phase?: PhaseId;
};

export type BoardState = {
  columns: Column[];
  cards: Card[];
  phases?: Phase[];
};

const text = (en: string, fa: string): LocalizedText => ({ en, fa });

export const initialBoard: BoardState = {
  columns: [
    { id: "todo", name: text("To Do", "لیست کارها") },
    { id: "in-progress", name: text("In Progress", "در حال انجام") },
    { id: "done", name: text("Done", "تکمیل شده") },
  ],
  phases: defaultBoardPhases,
  cards: [
    {
      id: "card-brand-concept",
      columnId: "done",
      phase: "brand",
      title: text("Define Visual Identity & Brand DNA", "روایت برند و هویت بصری شاخص"),
      details: text(
        "Craft the design language with deep navy (#032147), vibrant blue (#209dd7), and golden accent (#ecad0a).",
        "تعریف زبان طراحی با پالت اختصاصی سرمه‌ای، آبی درخشان و خطوط تأکیدی طلایی.",
      ),
    },
    {
      id: "card-typography-system",
      columnId: "todo",
      phase: "brand",
      title: text("Curate Typography & Modular Grid", "تایپوگرافی دوزبانه و شبکه ماژولار"),
      details: text(
        "Pair local Peyda font for Persian with precision modern Latin sans across responsive vertical rhythm.",
        "ترکیب قلم معاصر پیدا با تایپوگرافی مدرن لاتین و تنظیم ریتم عمودی و گرید ۱۲ ستونه.",
      ),
    },
    {
      id: "card-user-flow",
      columnId: "todo",
      phase: "uiux",
      title: text("Map User Journey & Interactive Prototype", "معماری جریان کاربر و پروتوتایپ تعاملی"),
      details: text(
        "Design frictionless showcase exploration, project filtering, and memorable micro-interactions.",
        "طراحی مسیر روان بازدید نمونه‌کارها، فیلتر آنی دسته‌بندی‌ها و سناریوهای ثبت سفارش هوشمند.",
      ),
    },
    {
      id: "card-design-system",
      columnId: "todo",
      phase: "uiux",
      title: text("Atomic Design System & Glass Surfaces", "کتابخانه اجزا و سطوح شیشه‌ای مات"),
      details: text(
        "Document button states, frosted glass cards, glow shaders, and cohesive motion tokens in Figma.",
        "مستندسازی کامپوننت‌های اتمیک، کارت‌های شیشه‌ای بلور و الگوهای حرکتی در فیگما.",
      ),
    },
    {
      id: "card-components",
      columnId: "in-progress",
      phase: "frontend",
      title: text("Build Dynamic Portfolio Showcase", "پیاده‌سازی گالری سه‌بعدی و کارت‌ها"),
      details: text(
        "Next.js 16 App Router components with smooth drag-and-drop feedback and layout transitions.",
        "توسعه کامپوننت‌های نکست با درگ‌اند‌دراپ تعاملی و ترنزیشن‌های بدون پرش فریمِر.",
      ),
    },
    {
      id: "card-motion-effects",
      columnId: "todo",
      phase: "frontend",
      title: text("Refine Parallax & Tactile Hover Physics", "پرداخت انیمیشن‌های پارالاکس و لمسی"),
      details: text(
        "Add bespoke magnetic cursors, fluid tilt physics on project cards, and 60fps smooth scrolling.",
        "افزودن نشانگر مگنتی، فیزیک چرخش نرم کارت‌ها و پیمایش فوق‌العاده روان ۶۰ فریم بر ثانیه.",
      ),
    },
    {
      id: "card-backend-api",
      columnId: "todo",
      phase: "backend",
      title: text("FastAPI Endpoints & Database Engine", "معماری API پرسرعت و پایگاه داده"),
      details: text(
        "High-performance FastAPI async routes, SQLite schema for boards and cards, and bearer session auth.",
        "طراحی روت‌های اسنکرون با پایتون، شمای ارتباطی چندکاربره و اعتبارسنجی توکن دسترسی.",
      ),
    },
    {
      id: "card-ai-copilot",
      columnId: "todo",
      phase: "backend",
      title: text("OpenRouter AI Intelligence Assistant", "اتصال دستیار هوش مصنوعی OpenRouter"),
      details: text(
        "Wire gpt-oss-120b agent to generate, reorder, and refine kanban cards via structured JSON.",
        "پیاده‌سازی پرامپت هوشمند برای دستکاری خودکار تخته با مدل gpt-oss-120b و خروجی ساختاریافته.",
      ),
    },
    {
      id: "card-docker-deploy",
      columnId: "todo",
      phase: "launch",
      title: text("Multi-Stage Docker & uv Container", "بسته‌بندی کانتینر داکر با ابزار uv"),
      details: text(
        "Clean container packaging Next.js static export served directly through FastAPI root with zero bloat.",
        "تولید ایمیج کم‌حجم داکر حاوی بیلد استاتیک فرانت‌اند و سرور FastAPI با اسکریپت‌های راه‌اندازی.",
      ),
    },
    {
      id: "card-performance-seo",
      columnId: "todo",
      phase: "launch",
      title: text("Lighthouse 100/100 Benchmark & Launch", "کسب امتیاز ۱۰۰ لایت‌هاوس و انتشار عمومی"),
      details: text(
        "Flawless offline self-hosted fonts, zero cumulative layout shift (CLS), and sub-second load times.",
        "بهینه‌سازی کامل لود بدون اینترنت فونت‌ها، سئو تکنیکال و دستیابی به سرعت بارگذاری زیر ۱ ثانیه.",
      ),
    },
  ],
};

export function addCard(
  board: BoardState,
  columnId: string,
  title: string,
  details: string,
  id: string,
  phase?: PhaseId,
): BoardState {
  const cleanTitle = title.trim();
  const columnExists = board.columns.some((column) => column.id === columnId);

  if (!cleanTitle || !columnExists) return board;

  return {
    ...board,
    cards: [
      ...board.cards,
      {
        id,
        columnId,
        title: text(cleanTitle, cleanTitle),
        details: text(details.trim(), details.trim()),
        ...(phase ? { phase } : {}),
      },
    ],
  };
}

export function updateCard(
  board: BoardState,
  cardId: string,
  title: string,
  details: string,
  locale?: Locale,
  phase?: PhaseId,
): BoardState {
  const cleanTitle = title.trim();
  const card = board.cards.find((item) => item.id === cardId);
  if (!card || !cleanTitle) return board;

  const cleanDetails = details.trim();
  if (locale) {
    const currentTitle = typeof card.title === "string" ? card.title : card.title?.[locale];
    const currentDetails = typeof card.details === "string" ? card.details : card.details?.[locale];
    if (currentTitle === cleanTitle && currentDetails === cleanDetails && (!phase || card.phase === phase)) {
      return board;
    }

    const oldTitleObj =
      typeof card.title === "object" && card.title !== null
        ? card.title
        : { en: cleanTitle, fa: cleanTitle };
    const oldDetailsObj =
      typeof card.details === "object" && card.details !== null
        ? card.details
        : { en: cleanDetails, fa: cleanDetails };

    return {
      ...board,
      cards: board.cards.map((item) =>
        item.id === cardId
          ? {
              ...item,
              title: { ...oldTitleObj, [locale]: cleanTitle },
              details: { ...oldDetailsObj, [locale]: cleanDetails },
              ...(phase ? { phase } : {}),
            }
          : item,
      ),
    };
  }

  return {
    ...board,
    cards: board.cards.map((item) =>
      item.id === cardId
        ? {
            ...item,
            title: text(cleanTitle, cleanTitle),
            details: text(cleanDetails, cleanDetails),
            ...(phase ? { phase } : {}),
          }
        : item,
    ),
  };
}

export function deleteCard(board: BoardState, cardId: string): BoardState {
  const cards = board.cards.filter((card) => card.id !== cardId);
  return cards.length === board.cards.length ? board : { ...board, cards };
}

export function renameColumn(
  board: BoardState,
  columnId: string,
  name: string,
  locale: Locale,
): BoardState {
  const cleanName = name.trim();
  if (!cleanName) return board;

  const column = board.columns.find((item) => item.id === columnId);
  if (!column) return board;
  const currentName = typeof column.name === "string" ? column.name : column.name?.[locale];
  if (currentName === cleanName) return board;

  const oldNameObj =
    typeof column.name === "object" && column.name !== null
      ? column.name
      : { en: cleanName, fa: cleanName };

  return {
    ...board,
    columns: board.columns.map((item) =>
      item.id === columnId
        ? { ...item, name: { ...oldNameObj, en: cleanName, fa: cleanName } }
        : item,
    ),
  };
}

export function addColumn(
  board: BoardState,
  name: string,
  locale: Locale = "en",
  id = `col-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
): BoardState {
  const cleanName = name.trim();
  if (!cleanName) return board;

  const newColumn: Column = {
    id,
    name: {
      en: locale === "en" ? cleanName : cleanName,
      fa: locale === "fa" ? cleanName : cleanName,
    },
  };

  return {
    ...board,
    columns: [...board.columns, newColumn],
  };
}

export function deleteColumn(board: BoardState, columnId: string): BoardState {
  if (board.columns.length <= 1) return board;
  const remaining = board.columns.filter((c) => c.id !== columnId);
  if (remaining.length === board.columns.length) return board;

  const fallbackId = remaining[0].id;
  const updatedCards = board.cards.map((card) =>
    card.columnId === columnId ? { ...card, columnId: fallbackId } : card,
  );

  return {
    ...board,
    columns: remaining,
    cards: updatedCards,
  };
}

export function addPhase(
  board: BoardState,
  name: string,
  locale: Locale = "en",
  id = `phase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
): BoardState {
  const cleanName = name.trim();
  if (!cleanName) return board;

  const currentPhases = getBoardPhases(board);
  const badgeClasses = [
    "phase-badge-brand",
    "phase-badge-uiux",
    "phase-badge-frontend",
    "phase-badge-backend",
    "phase-badge-launch",
  ];
  const badgeClass = badgeClasses[currentPhases.length % badgeClasses.length];

  const newPhase: Phase = {
    id,
    label: {
      en: locale === "en" ? cleanName : cleanName,
      fa: locale === "fa" ? cleanName : cleanName,
    },
    badgeClass,
  };

  return {
    ...board,
    phases: [...currentPhases, newPhase],
  };
}

export function renamePhase(
  board: BoardState,
  phaseId: string,
  name: string,
  locale: Locale = "en",
): BoardState {
  const cleanName = name.trim();
  if (!cleanName) return board;

  const currentPhases = getBoardPhases(board);
  const target = currentPhases.find((p) => p.id === phaseId);
  if (!target) return board;

  return {
    ...board,
    phases: currentPhases.map((phase) =>
      phase.id === phaseId
        ? {
            ...phase,
            label: { ...phase.label, [locale]: cleanName },
          }
        : phase,
    ),
  };
}

export function deletePhase(board: BoardState, phaseId: string): BoardState {
  const currentPhases = getBoardPhases(board);
  if (currentPhases.length <= 1) return board;

  const remaining = currentPhases.filter((p) => p.id !== phaseId);
  if (remaining.length === currentPhases.length) return board;

  return {
    ...board,
    phases: remaining,
    cards: board.cards.map((card) =>
      card.phase === phaseId ? { ...card, phase: undefined } : card,
    ),
  };
}

export const BOARD_STORAGE_KEY = "kanban_board_state";
export const CARD_META_STORAGE_KEY = "kanban_card_meta";
export const BOARD_VERSION_KEY = "kanban_board_version";
export const CURRENT_BOARD_VERSION = "v5-dynamic-columns-and-phases";

export function getLocalizedText(
  value: LocalizedText | string | undefined | null,
  locale: Locale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.fa || value.en || "";
}

export function matchesCardSearch(card: Card, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const titleEn = typeof card.title === "string" ? card.title : card.title?.en || "";
  const titleFa = typeof card.title === "string" ? card.title : card.title?.fa || "";
  const detailsEn = typeof card.details === "string" ? card.details : card.details?.en || "";
  const detailsFa = typeof card.details === "string" ? card.details : card.details?.fa || "";

  const haystack = [titleEn, titleFa, detailsEn, detailsFa].join(" ").toLowerCase();
  return haystack.includes(needle);
}

export function moveCard(
  board: BoardState,
  cardId: string,
  targetColumnId: string,
  beforeCardId?: string,
): BoardState {
  const card = board.cards.find((item) => item.id === cardId);
  const targetExists = board.columns.some((column) => column.id === targetColumnId);
  if (!card || !targetExists || (beforeCardId === cardId && card.columnId === targetColumnId)) {
    return board;
  }

  const remaining = board.cards.filter((item) => item.id !== cardId);
  const nextCard = { ...card, columnId: targetColumnId };
  const targetCardIndex = beforeCardId
    ? remaining.findIndex(
        (item) => item.id === beforeCardId && item.columnId === targetColumnId,
      )
    : -1;

  if (targetCardIndex >= 0) remaining.splice(targetCardIndex, 0, nextCard);
  else remaining.push(nextCard);

  return { ...board, cards: remaining };
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export function formatScheduleDate(
  startDay = 1,
  dueDay = 7,
  locale: Locale = "en",
): string {
  const start = Math.max(1, Math.min(31, startDay || 1));
  const due = Math.max(start, Math.min(31, dueDay || start));
  if (locale === "fa") {
    if (start === due) return `${toPersianDigits(start)} دسامبر`;
    return `${toPersianDigits(start)} تا ${toPersianDigits(due)} دسامبر`;
  }
  if (start === due) return `Dec ${start}`;
  return `Dec ${start} - ${due}`;
}
