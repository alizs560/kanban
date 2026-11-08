"use client";

import { useId, useState, type FormEvent } from "react";
import {
  Check,
  GripVertical,
  Languages,
  PanelsTopLeft,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { DragDropProvider, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  addCard,
  deleteCard,
  initialBoard,
  moveCard,
  renameColumn,
  type BoardState,
  type Card,
  type Column,
  type Locale,
} from "@/lib/board";

const copy = {
  en: {
    workspace: "Workspace",
    board: "Project board",
    subtitle: "A clear view of what’s moving forward.",
    language: "Language",
    direction: "A little progress, every day.",
    cards: "cards",
    rename: "Rename column",
    saveName: "Save column name",
    addCard: "Add a card",
    cardTitle: "Card title",
    cardTitlePlaceholder: "Give this task a name",
    details: "Details",
    detailsPlaceholder: "A little context (optional)",
    create: "Add card",
    cancel: "Cancel",
    delete: "Delete",
    drag: "Drag to move card",
    empty: "Nothing here yet. Add a card to get started.",
    switchLanguage: "Switch language",
    current: "EN",
    brand: "FLOWBOARD",
  },
  fa: {
    workspace: "فضای کاری",
    board: "تخته پروژه",
    subtitle: "نمایی روشن از کارهایی که پیش می‌روند.",
    language: "زبان",
    direction: "هر روز، کمی پیشرفت.",
    cards: "کارت",
    rename: "تغییر نام ستون",
    saveName: "ذخیره نام ستون",
    addCard: "افزودن کارت",
    cardTitle: "عنوان کارت",
    cardTitlePlaceholder: "برای این کار نامی بنویس",
    details: "جزئیات",
    detailsPlaceholder: "توضیح کوتاه (اختیاری)",
    create: "افزودن کارت",
    cancel: "لغو",
    delete: "حذف",
    drag: "برای جابه‌جایی کارت بکش",
    empty: "هنوز کاری اینجا نیست. یک کارت اضافه کن.",
    switchLanguage: "تغییر زبان",
    current: "فا",
    brand: "مسیر کار",
  },
} as const;

type Copy = (typeof copy)[Locale];

function BoardCard({
  card,
  index,
  locale,
  labels,
  onDelete,
}: {
  card: Card;
  index: number;
  locale: Locale;
  labels: Copy;
  onDelete: (cardId: string) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: card.id,
    index,
    group: card.columnId,
    data: { kind: "card", cardId: card.id, columnId: card.columnId },
    transition: { duration: 180 },
  });

  return (
    <article
      ref={ref}
      className={`task-card${isDragging ? " is-dragging" : ""}`}
      dir={locale}
      data-card-id={card.id}
    >
      <div className="card-topline">
        <button
          ref={handleRef}
          className="icon-button drag-handle"
          type="button"
          aria-label={`${labels.drag}: ${card.title[locale]}`}
        >
          <GripVertical size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          className="icon-button delete-button"
          type="button"
          aria-label={`${labels.delete} ${card.title[locale]}`}
          onClick={() => onDelete(card.id)}
        >
          <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <h3>{card.title[locale]}</h3>
      {card.details[locale] ? <p>{card.details[locale]}</p> : null}
    </article>
  );
}

function BoardColumn({
  column,
  cards,
  locale,
  labels,
  onRename,
  onAdd,
  onDelete,
}: {
  column: Column;
  cards: Card[];
  locale: Locale;
  labels: Copy;
  onRename: (columnId: string, name: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(column.name[locale]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const titleId = useId();
  const detailsId = useId();
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `column-${column.id}`,
    data: { kind: "column", columnId: column.id },
  });
  const labelsForColumn = cards.length === 1 ? "1" : cards.length.toString();

  function saveName() {
    onRename(column.id, name);
    setIsRenaming(false);
  }

  function cancelName() {
    setName(column.name[locale]);
    setIsRenaming(false);
  }

  function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(column.id, title, details);
    setTitle("");
    setDetails("");
    setIsAdding(false);
  }

  return (
    <section
      ref={dropRef}
      className={`board-column${isDropTarget ? " is-drop-target" : ""}`}
      aria-label={column.name[locale]}
      data-column-id={column.id}
    >
      <header className="column-header">
        <div className="column-heading-wrap">
          <span className="column-marker" aria-hidden="true" />
          {isRenaming ? (
            <div className="rename-control">
              <input
                aria-label={labels.rename}
                value={name}
                maxLength={40}
                autoFocus
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveName();
                  if (event.key === "Escape") cancelName();
                }}
              />
              <button className="icon-button confirm-name" type="button" aria-label={labels.saveName} onClick={saveName}>
                <Check size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <h2>{column.name[locale]}</h2>
              <button
                className="icon-button rename-trigger"
                type="button"
                aria-label={`${labels.rename}: ${column.name[locale]}`}
                onClick={() => {
                  setName(column.name[locale]);
                  setIsRenaming(true);
                }}
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <span className="card-count" aria-label={`${labels.cards}: ${cards.length}`}>
          {labelsForColumn}
        </span>
      </header>

      <div className="card-list" role="list">
        {cards.length === 0 ? <p className="empty-hint">{labels.empty}</p> : null}
        {cards.map((card, index) => (
          <div
            className="sortable-card"
            key={card.id}
            data-sort-index={index}
            role="listitem"
          >
          <BoardCard card={card} index={index} locale={locale} labels={labels} onDelete={onDelete} />
          </div>
        ))}
      </div>

      {isAdding ? (
        <form className="add-card-form" onSubmit={saveCard}>
          <label htmlFor={titleId}>{labels.cardTitle}</label>
          <input
            id={titleId}
            autoFocus
            required
            maxLength={100}
            placeholder={labels.cardTitlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor={detailsId}>{labels.details}</label>
          <textarea
            id={detailsId}
            rows={3}
            maxLength={280}
            placeholder={labels.detailsPlaceholder}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
          <div className="form-actions">
            <button className="primary-button compact" type="submit">
              <Plus size={15} aria-hidden="true" /> {labels.create}
            </button>
            <button
              className="icon-button cancel-form"
              type="button"
              aria-label={labels.cancel}
              onClick={() => {
                setIsAdding(false);
                setTitle("");
                setDetails("");
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : (
        <button className="add-card-trigger" type="button" onClick={() => setIsAdding(true)}>
          <Plus size={17} strokeWidth={2} aria-hidden="true" />
          <span>{labels.addCard}</span>
        </button>
      )}
    </section>
  );
}

export default function Home() {
  const [board, setBoard] = useState<BoardState>(() => ({
    columns: initialBoard.columns.map((column) => ({ ...column, name: { ...column.name } })),
    cards: initialBoard.cards.map((card) => ({
      ...card,
      title: { ...card.title },
      details: { ...card.details },
    })),
  }));
  const [locale, setLocale] = useState<Locale>("en");
  const labels = copy[locale];

  function finishDrag(event: DragEndEvent) {
    if (event.canceled) return;
    const sourceData = event.operation.source?.data;
    const targetData = event.operation.target?.data;
    const cardId = sourceData?.cardId as string | undefined;
    const targetColumnId = targetData?.columnId as string | undefined;
    if (!cardId || !targetColumnId) return;

    const beforeCardId = targetData?.kind === "card" ? (targetData.cardId as string) : undefined;
    setBoard((current) => moveCard(current, cardId, targetColumnId, beforeCardId));
  }

  return (
    <main className="app-shell" dir={locale === "fa" ? "rtl" : "ltr"} lang={locale}>
      <div className="app-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <PanelsTopLeft size={19} strokeWidth={2} />
            </span>
            <span className="brand-name">{labels.brand}</span>
          </div>
          <div className="topbar-right">
            <span className="workspace-label">{labels.workspace}</span>
            <span className="topbar-divider" aria-hidden="true" />
            <div className="language-switch" role="group" aria-label={labels.switchLanguage}>
              <Languages size={15} aria-hidden="true" />
              <button
                type="button"
                aria-label="EN"
                aria-pressed={locale === "en"}
                className={locale === "en" ? "selected" : ""}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                aria-label="FA"
                aria-pressed={locale === "fa"}
                className={locale === "fa" ? "selected" : ""}
                onClick={() => setLocale("fa")}
              >
                FA
              </button>
            </div>
          </div>
        </header>

        <section className="board-intro">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              {labels.workspace}
            </p>
            <h1>{labels.board}</h1>
            <p className="board-subtitle">{labels.subtitle}</p>
          </div>
          <p className="daily-note">{labels.direction}</p>
        </section>

        <div className="flow-rail" aria-hidden="true">
          {board.columns.map((column, index) => (
            <span key={column.id} className={`rail-segment rail-${index + 1}`} />
          ))}
        </div>

        <DragDropProvider onDragEnd={finishDrag}>
          <section className="board-scroll" aria-label={labels.board}>
            <div className="board-columns">
              {board.columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  cards={board.cards.filter((card) => card.columnId === column.id)}
                  locale={locale}
                  labels={labels}
                  onRename={(columnId, name) =>
                    setBoard((current) => renameColumn(current, columnId, name, locale))
                  }
                  onAdd={(columnId, title, details) =>
                    setBoard((current) =>
                      addCard(current, columnId, title, details, crypto.randomUUID()),
                    )
                  }
                  onDelete={(cardId) =>
                    setBoard((current) => deleteCard(current, cardId))
                  }
                />
              ))}
            </div>
          </section>
        </DragDropProvider>

        <footer className="board-footer">
          <span className="footer-mark" aria-hidden="true" />
          <span>{board.cards.length} {labels.cards}</span>
          <span className="footer-spacer" />
          <span className="footer-caption">{labels.current}</span>
        </footer>
      </div>
    </main>
  );
}
