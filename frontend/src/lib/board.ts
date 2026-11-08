export type Locale = "en" | "fa";

export type LocalizedText = Record<Locale, string>;

export type Column = {
  id: string;
  name: LocalizedText;
};

export type Card = {
  id: string;
  columnId: string;
  title: LocalizedText;
  details: LocalizedText;
};

export type BoardState = {
  columns: Column[];
  cards: Card[];
};

const text = (en: string, fa: string): LocalizedText => ({ en, fa });

export const initialBoard: BoardState = {
  columns: [
    { id: "backlog", name: text("Backlog", "در صف") },
    { id: "todo", name: text("To Do", "برای انجام") },
    { id: "in-progress", name: text("In Progress", "در حال انجام") },
    { id: "review", name: text("Review", "بازبینی") },
    { id: "done", name: text("Done", "انجام‌شده") },
  ],
  cards: [
    {
      id: "card-brief",
      columnId: "backlog",
      title: text("Shape the launch story", "روایت رونمایی را شکل بده"),
      details: text(
        "Bring the clearest idea to the first page.",
        "روشن‌ترین ایده را به صفحه اول بیاور.",
      ),
    },
    {
      id: "card-interviews",
      columnId: "backlog",
      title: text("Gather customer notes", "یادداشت‌های مشتریان را جمع کن"),
      details: text(
        "Pull recurring questions into one place.",
        "پرسش‌های پرتکرار را یک‌جا جمع کن.",
      ),
    },
    {
      id: "card-flow",
      columnId: "todo",
      title: text("Map the first-run flow", "مسیر شروع را طراحی کن"),
      details: text(
        "Keep the first session focused and calm.",
        "اولین تجربه را ساده و آرام نگه دار.",
      ),
    },
    {
      id: "card-copy",
      columnId: "todo",
      title: text("Polish the welcome copy", "متن خوشامد را پرداخت کن"),
      details: text(
        "Make every step sound clear and human.",
        "هر مرحله را روشن و صمیمی بنویس.",
      ),
    },
    {
      id: "card-components",
      columnId: "in-progress",
      title: text("Build the core components", "اجزای اصلی را بساز"),
      details: text(
        "Buttons, fields, and their quiet states.",
        "دکمه‌ها، ورودی‌ها و حالت‌های ساده‌شان.",
      ),
    },
    {
      id: "card-board",
      columnId: "in-progress",
      title: text("Arrange the board", "تخته را مرتب کن"),
      details: text(
        "Give each task room to breathe.",
        "برای هر کار فضای کافی بگذار.",
      ),
    },
    {
      id: "card-contrast",
      columnId: "review",
      title: text("Check color contrast", "کنتراست رنگ را بررسی کن"),
      details: text(
        "Review the key actions in both themes.",
        "اقدام‌های اصلی را در هر دو حالت ببین.",
      ),
    },
    {
      id: "card-mobile",
      columnId: "review",
      title: text("Review the mobile layout", "چیدمان موبایل را بازبینی کن"),
      details: text(
        "Make sure the board scrolls naturally.",
        "از روان بودن پیمایش تخته مطمئن شو.",
      ),
    },
    {
      id: "card-kickoff",
      columnId: "done",
      title: text("Set the project direction", "مسیر پروژه را مشخص کن"),
      details: text(
        "A shared brief is ready for the team.",
        "شرح مشترک پروژه برای تیم آماده است.",
      ),
    },
    {
      id: "card-palette",
      columnId: "done",
      title: text("Choose the core palette", "پالت رنگ اصلی را انتخاب کن"),
      details: text(
        "Five colors now guide the interface.",
        "پنج رنگ، راهنمای رابط کاربری هستند.",
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
      },
    ],
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
  if (!column || column.name[locale] === cleanName) return board;

  return {
    ...board,
    columns: board.columns.map((item) =>
      item.id === columnId
        ? { ...item, name: { ...item.name, en: cleanName, fa: cleanName } }
        : item,
    ),
  };
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
