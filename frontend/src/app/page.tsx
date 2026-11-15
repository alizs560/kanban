"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  GanttChart,
  Home as HomeIcon,
  LayoutGrid,
  List,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  ThumbsUp,
  Trash2,
  UserRound,
  X,
  Zap,
  LogOut,
} from "lucide-react";
import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useAuthSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import {
  BOARD_STORAGE_KEY,
  BOARD_VERSION_KEY,
  CARD_META_STORAGE_KEY,
  CURRENT_BOARD_VERSION,
  addCard,
  addColumn,
  addPhase,
  deleteCard,
  deleteColumn,
  deletePhase,
  getBoardPhases,
  getLocalizedText,
  initialBoard,
  matchesCardSearch,
  moveCard,
  renameColumn,
  renamePhase,
  updateCard,
  type BoardState,
  type Card,
  type Column,
  type Locale,
  type Phase,
  type PhaseId,
} from "@/lib/board";

const copy = {
  en: {
    product: "LOOM",
    board: "LOOM",
    language: "Language",
    rename: "Rename column",
    saveName: "Save column name",
    addCard: "Add a card",
    cardTitle: "Card title",
    cardTitlePlaceholder: "Task name",
    details: "Details",
    detailsPlaceholder: "Details",
    create: "Add card",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit card",
    save: "Save",
    status: "Status",
    priority: "Priority",
    accent: "Accent bar",
    accentNone: "None",
    assignee: "Assignee",
    cover: "Cover",
    coverNone: "None",
    drag: "Drag to move card",
    empty: "Nothing here yet.",
    switchLanguage: "Switch language",
    search: "Search tasks...",
    clearSearch: "Clear search",
    searchEmpty: "No matching cards.",
    share: "Share",
    like: "Like",
    visibility: "Public To All",
    views: "Board views",
    list: "List",
    boardView: "Board",
    timeline: "Timeline",
    calendar: "Calendar",
    progress: "Progress",
    nav: "Project navigation",
    home: "Home",
    members: "Members",
    schedule: "Schedule",
    activity: "Activity",
    notifications: "Notifications",
    settings: "Settings",
    started: "Started",
    ongoing: "Ongoing",
    idle: "Not Started",
    done: "Completed",
    date: "Dec 2 - 8",
    logout: "Sign Out",
    addColumn: "Add column",
    newColumnPlaceholder: "Column name...",
    deleteColumn: "Delete column",
    addPhase: "Add phase",
    newPhasePlaceholder: "Phase name...",
    editPhase: "Edit phase",
    deletePhase: "Delete phase",
  },
  fa: {
    product: "LOOM",
    board: "LOOM",
    language: "زبان",
    rename: "تغییر نام ستون",
    saveName: "ذخیره نام ستون",
    addCard: "افزودن کارت",
    cardTitle: "عنوان کارت",
    cardTitlePlaceholder: "نام کار",
    details: "جزئیات",
    detailsPlaceholder: "جزئیات",
    create: "افزودن کارت",
    cancel: "لغو",
    delete: "حذف",
    edit: "ویرایش کارت",
    save: "ذخیره",
    status: "وضعیت",
    priority: "اولویت",
    accent: "نوار رنگ",
    accentNone: "بدون",
    assignee: "مسئول",
    cover: "تصویر",
    coverNone: "بدون",
    drag: "برای جابه‌جایی کارت بکش",
    empty: "هنوز کاری اینجا نیست.",
    switchLanguage: "تغییر زبان",
    search: "جستجوی کارها...",
    clearSearch: "پاک کردن جستجو",
    searchEmpty: "کارت مطابقتی نیست.",
    share: "اشتراک",
    like: "پسند",
    visibility: "عمومی برای همه",
    views: "نمای تخته",
    list: "فهرست",
    boardView: "تخته",
    timeline: "خط زمان",
    calendar: "تقویم",
    progress: "پیشرفت",
    nav: "ناوبری پروژه",
    home: "خانه",
    members: "اعضا",
    schedule: "زمان‌بندی",
    activity: "فعالیت",
    notifications: "اعلان‌ها",
    settings: "تنظیمات",
    started: "شروع‌شده",
    ongoing: "در جریان",
    idle: "شروع‌نشده",
    done: "تکمیل‌شده",
    date: "۲ تا ۸ دسامبر",
    logout: "خروج از حساب",
    addColumn: "افزودن ستون",
    newColumnPlaceholder: "نام ستون جدید...",
    deleteColumn: "حذف ستون",
    addPhase: "افزودن بخش",
    newPhasePlaceholder: "نام بخش جدید...",
    editPhase: "ویرایش بخش",
    deletePhase: "حذف بخش",
  },
} as const;

type Copy = (typeof copy)[Locale];
type BoardView = "board" | "list";
type Tone = "started" | "ongoing" | "idle" | "done";
type Priority = "P1" | "P2" | "P3";
type Accent = "green" | "orange" | "red";

const portraits = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=60",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&h=96&q=60",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=96&h=96&q=60",
];

const covers = {
  room: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=720&h=420&q=60",
  lens: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=720&h=420&q=60",
  camera: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=720&h=420&q=60",
};

type CoverKey = keyof typeof covers;

type CardMeta = {
  tone: Tone;
  priority: Priority;
  accent?: Accent;
  comments: number;
  likes: number;
  avatar: string;
  image?: string;
};

const defaultCardMeta = (): CardMeta => ({
  tone: "idle",
  priority: "P2",
  comments: 0,
  likes: 0,
  avatar: portraits[0],
});

const initialCardMeta: Record<string, CardMeta> = {
  "card-brand-concept": { tone: "started", priority: "P1", accent: "orange", comments: 6, likes: 24, avatar: portraits[0], image: covers.room },
  "card-typography-system": { tone: "started", priority: "P2", comments: 3, likes: 18, avatar: portraits[1] },
  "card-user-flow": { tone: "ongoing", priority: "P1", accent: "green", comments: 8, likes: 35, avatar: portraits[2] },
  "card-design-system": { tone: "idle", priority: "P2", comments: 4, likes: 29, avatar: portraits[3], image: covers.lens },
  "card-components": { tone: "ongoing", priority: "P1", accent: "orange", comments: 14, likes: 78, avatar: portraits[0], image: covers.camera },
  "card-motion-effects": { tone: "started", priority: "P2", accent: "green", comments: 9, likes: 42, avatar: portraits[1] },
  "card-backend-api": { tone: "started", priority: "P1", accent: "red", comments: 11, likes: 38, avatar: portraits[2] },
  "card-ai-copilot": { tone: "ongoing", priority: "P2", comments: 15, likes: 56, avatar: portraits[3] },
  "card-docker-deploy": { tone: "done", priority: "P2", accent: "green", comments: 19, likes: 92, avatar: portraits[0], image: covers.room },
  "card-performance-seo": { tone: "done", priority: "P1", accent: "red", comments: 27, likes: 145, avatar: portraits[1] },
};

const coverKeys: CoverKey[] = ["room", "lens", "camera"];
const tones: Tone[] = ["idle", "started", "ongoing", "done"];
const priorities: Priority[] = ["P1", "P2", "P3"];
const accents: (Accent | "none")[] = ["none", "green", "orange", "red"];

function BoardCard({
  card,
  index,
  locale,
  labels,
  phases,
  meta,
  liked,
  likeCount,
  onLike,
  onSave,
  onDelete,
}: {
  card: Card;
  index: number;
  locale: Locale;
  labels: Copy;
  phases: Phase[];
  meta?: CardMeta;
  liked: boolean;
  likeCount: number;
  onLike: (cardId: string) => void;
  onSave: (cardId: string, title: string, details: string, meta: CardMeta, phase?: PhaseId) => void;
  onDelete: (cardId: string) => void;
}) {
  const safeMeta = meta || defaultCardMeta();
  const cardTitle = getLocalizedText(card.title, locale);
  const cardDetails = getLocalizedText(card.details, locale);
  const phaseInfo = card.phase ? phases.find((p) => p.id === card.phase) : null;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(cardTitle);
  const [details, setDetails] = useState(cardDetails);
  const [draft, setDraft] = useState<CardMeta>(safeMeta);
  const [draftPhase, setDraftPhase] = useState<PhaseId>(card.phase || "brand");
  const editTitleId = useId();
  const editDetailsId = useId();
  const { ref, isDragging, isDragSource } = useSortable({
    id: card.id,
    index,
    group: card.columnId,
    data: { kind: "card", cardId: card.id, columnId: card.columnId },
    transition: { duration: 180, idle: true },
    disabled: isEditing,
    plugins: (defaults) => [...defaults, Feedback.configure({ feedback: "clone" })],
  });
  const safeTone = safeMeta?.tone && labels[safeMeta.tone] ? safeMeta.tone : "idle";
  const toneLabel = labels[safeTone];
  const coverKey =
    safeMeta.image === covers.room
      ? "room"
      : safeMeta.image === covers.lens
        ? "lens"
        : safeMeta.image === covers.camera
          ? "camera"
          : "none";

  function openEdit() {
    const currentTitle = getLocalizedText(card.title, locale);
    const currentDetails = getLocalizedText(card.details, locale);
    setTitle(currentTitle);
    setDetails(currentDetails);
    setDraft(safeMeta);
    setDraftPhase(card.phase || "brand");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(card.id, title, details, draft, draftPhase);
    setIsEditing(false);
  }

  return (
    <div
      ref={ref}
      className={`sortable-card${isDragSource ? " is-drag-placeholder" : ""}${isEditing ? " is-editing" : ""}`}
      data-sort-index={index}
      role="listitem"
    >
      <article
        className={`task-card${isDragging ? " is-dragging" : ""}${isEditing ? " is-editing" : ""}${safeMeta.image ? " has-cover" : ""}${safeMeta.accent ? ` accent-${safeMeta.accent}` : ""}`}
        dir={locale === "fa" ? "rtl" : "ltr"}
        data-card-id={card.id}
        aria-label={`${labels.drag}: ${cardTitle}`}
      >
        {isEditing ? (
          <form className="card-edit-form" onSubmit={saveEdit}>
            <label htmlFor={editTitleId}>{labels.cardTitle}</label>
            <input
              id={editTitleId}
              required
              maxLength={100}
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label htmlFor={editDetailsId}>{labels.details}</label>
            <textarea
              id={editDetailsId}
              rows={3}
              maxLength={280}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
            <label>{labels.status}</label>
            <select
              value={draft.tone}
              onChange={(event) => setDraft({ ...draft, tone: event.target.value as Tone })}
            >
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {labels[tone]}
                </option>
              ))}
            </select>
            <label>{labels.priority}</label>
            <div className="option-row" role="group" aria-label={labels.priority}>
              {priorities.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={`chip${draft.priority === priority ? " is-selected" : ""}`}
                  aria-pressed={draft.priority === priority}
                  onClick={() => setDraft({ ...draft, priority })}
                >
                  {priority}
                </button>
              ))}
            </div>
            <label>{labels.accent}</label>
            <div className="option-row" role="group" aria-label={labels.accent}>
              {accents.map((accent) => (
                <button
                  key={accent}
                  type="button"
                  className={`chip accent-chip accent-${accent}${draft.accent === accent || (!draft.accent && accent === "none") ? " is-selected" : ""}`}
                  aria-pressed={draft.accent === accent || (!draft.accent && accent === "none")}
                  onClick={() =>
                    setDraft({ ...draft, accent: accent === "none" ? undefined : (accent as Accent) })
                  }
                >
                  {accent === "none" ? labels.accentNone : accent}
                </button>
              ))}
            </div>
            <label>{labels.assignee}</label>
            <div className="avatar-picker" role="group" aria-label={labels.assignee}>
              {portraits.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`avatar-choice${draft.avatar === src ? " is-selected" : ""}`}
                  aria-pressed={draft.avatar === src}
                  onClick={() => setDraft({ ...draft, avatar: src })}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
            <label htmlFor={`${editTitleId}-phase`}>{locale === "fa" ? "بخش کاری" : "Phase"}</label>
            <select
              id={`${editTitleId}-phase`}
              value={draftPhase}
              onChange={(event) => setDraftPhase(event.target.value as PhaseId)}
            >
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {getLocalizedText(phase.label, locale)}
                </option>
              ))}
            </select>
            <label htmlFor={`${editTitleId}-cover`}>{labels.cover}</label>
            <select
              id={`${editTitleId}-cover`}
              value={coverKey}
              onChange={(event) => {
                const next = event.target.value as CoverKey | "none";
                setDraft({ ...draft, image: next === "none" ? undefined : covers[next] });
              }}
            >
              <option value="none">{labels.coverNone}</option>
              {coverKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button className="share-button compact" type="submit">
                {labels.save}
              </button>
              <button className="icon-button" type="button" aria-label={labels.cancel} onClick={cancelEdit}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </form>
        ) : (
          <>
            {safeMeta.image ? <img className="card-cover" src={safeMeta.image} alt="" draggable={false} /> : null}
            {safeMeta.accent && !safeMeta.image ? <span className="card-accent" aria-hidden="true" /> : null}
            <h3>{cardTitle}</h3>
            {cardDetails ? <p>{cardDetails}</p> : null}
            <div className="card-pills">
              {phaseInfo ? (
                <span className={`pill ${phaseInfo.badgeClass}`}>
                  {getLocalizedText(phaseInfo.label, locale)}
                </span>
              ) : null}
              <span className={`pill tone-${safeMeta.tone}`}>{toneLabel}</span>
              <span className={`pill priority-${safeMeta.priority.toLowerCase()}`}>{safeMeta.priority}</span>
            </div>
            <div className="card-foot">
              <span className="avatar" aria-hidden="true">
                <img src={safeMeta.avatar} alt="" />
              </span>
              <span className="card-date">{labels.date}</span>
              <span className="card-stat">
                <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
                {safeMeta.comments}
              </span>
              <button
                className={`card-stat like-button${liked ? " is-liked" : ""}`}
                type="button"
                aria-pressed={liked}
                aria-label={`${labels.like} ${cardTitle}`}
                onClick={() => onLike(card.id)}
              >
                <ThumbsUp size={13} strokeWidth={2} aria-hidden="true" />
                {likeCount}
              </button>
            </div>
            <div className="card-actions">
              <button
                className="icon-button edit-button"
                type="button"
                aria-label={`${labels.edit}: ${cardTitle}`}
                onClick={openEdit}
              >
                <Pencil size={14} strokeWidth={2.1} aria-hidden="true" />
              </button>
              <button
                className="icon-button delete-button"
                type="button"
                aria-label={`${labels.delete} ${cardTitle}`}
                onClick={() => onDelete(card.id)}
              >
                <X size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </article>
    </div>
  );
}

function BoardColumn({
  column,
  cards,
  locale,
  labels,
  phases,
  likedIds,
  onLike,
  onSaveCard,
  onRename,
  onAdd,
  onDelete,
  canDeleteColumn,
  onDeleteColumn,
  cardMeta,
  searchQuery,
  view,
}: {
  column: Column;
  cards: Card[];
  locale: Locale;
  labels: Copy;
  phases: Phase[];
  likedIds: Record<string, boolean>;
  cardMeta: Record<string, CardMeta>;
  onLike: (cardId: string) => void;
  onSaveCard: (cardId: string, title: string, details: string, meta: CardMeta, phase?: PhaseId) => void;
  onRename: (columnId: string, name: string) => void;
  onAdd: (columnId: string, title: string, details: string) => void;
  onDelete: (cardId: string) => void;
  canDeleteColumn?: boolean;
  onDeleteColumn?: (columnId: string) => void;
  searchQuery: string;
  view: BoardView;
}) {
  const isFiltering = searchQuery.trim().length > 0;
  const [isRenaming, setIsRenaming] = useState(false);
  const columnName = getLocalizedText(column.name, locale);
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const titleId = useId();
  const detailsId = useId();
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `column-${column.id}`,
    data: { kind: "column", columnId: column.id },
  });

  function startRename() {
    setName(columnName);
    setIsRenaming(true);
  }

  function saveName() {
    if (name.trim()) {
      onRename(column.id, name);
    }
    setIsRenaming(false);
  }

  function cancelName() {
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
      className={`board-column${view === "list" ? " is-list" : ""}${isDropTarget ? " is-drop-target" : ""}`}
      aria-label={columnName}
      data-column-id={column.id}
    >
      <header className="column-header">
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
              <Check size={15} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <h2>{columnName}</h2>
        )}
        <div className="column-tools">
          <button className="icon-button" type="button" aria-label={labels.addCard} onClick={() => setIsAdding(true)}>
            <Plus size={16} strokeWidth={2.1} aria-hidden="true" />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label={`${labels.rename}: ${columnName}`}
            onClick={startRename}
          >
            <Pencil size={14} strokeWidth={2.1} aria-hidden="true" />
          </button>
          {canDeleteColumn && onDeleteColumn ? (
            <button
              className="icon-button delete-col-btn"
              type="button"
              aria-label={`${labels.deleteColumn}: ${columnName}`}
              onClick={() => onDeleteColumn(column.id)}
            >
              <Trash2 size={14} strokeWidth={2.1} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="card-list" role="list">
        {cards.length === 0 ? (
          <p className="empty-hint">{isFiltering ? labels.searchEmpty : labels.empty}</p>
        ) : null}
        {cards.map((card, index) => (
          <BoardCard
            key={card.id}
            card={card}
            index={index}
            locale={locale}
            labels={labels}
            phases={phases}
            meta={cardMeta[card.id] ?? defaultCardMeta()}
            liked={likedIds[card.id] ?? false}
            likeCount={(cardMeta[card.id]?.likes ?? 0) + (likedIds[card.id] ? 1 : 0)}
            onLike={onLike}
            onSave={onSaveCard}
            onDelete={onDelete}
          />
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
            <button className="share-button compact" type="submit">
              {labels.create}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label={labels.cancel}
              onClick={() => {
                setIsAdding(false);
                setTitle("");
                setDetails("");
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function generateCardId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails in restricted context
    }
  }
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getSavedBoard(): BoardState {
  if (typeof window !== "undefined") {
    try {
      const version = localStorage.getItem(BOARD_VERSION_KEY);
      if (version === CURRENT_BOARD_VERSION) {
        const raw = localStorage.getItem(BOARD_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.cards)) {
            return parsed;
          }
        }
      } else {
        localStorage.setItem(BOARD_VERSION_KEY, CURRENT_BOARD_VERSION);
      }
    } catch {
      // Fallback
    }
  }
  return {
    columns: initialBoard.columns.map((column) => ({ ...column, name: { ...column.name } })),
    cards: initialBoard.cards.map((card) => ({
      ...card,
      title: { ...card.title },
      details: { ...card.details },
    })),
  };
}

function getSavedCardMeta(): Record<string, CardMeta> {
  if (typeof window !== "undefined") {
    try {
      const version = localStorage.getItem(BOARD_VERSION_KEY);
      if (version === CURRENT_BOARD_VERSION) {
        const raw = localStorage.getItem(CARD_META_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            return { ...initialCardMeta, ...parsed };
          }
        }
      }
    } catch {
      // Fallback
    }
  }
  return { ...initialCardMeta };
}

export default function BoardPage() {
  const { isAuthenticated, logout } = useAuthSession();
  const [board, setBoard] = useState<BoardState>(getSavedBoard);
  const [cardMeta, setCardMeta] = useState<Record<string, CardMeta>>(getSavedCardMeta);
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kanban_locale");
        if (saved === "en" || saved === "fa") return saved;
      } catch {
        // Ignore storage errors
      }
    }
    return "fa";
  });
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<PhaseId | "all">("all");
  const [activeView, setActiveView] = useState<BoardView>("board");
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isCreatingPhase, setIsCreatingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");
  const currentPhases = getBoardPhases(board);
  const labels = copy[locale];
  const normalizedSearch = searchQuery.trim();

  // Save board changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board));
    } catch {
      // Ignore quota errors
    }
  }, [board]);

  // Save card metadata to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CARD_META_STORAGE_KEY, JSON.stringify(cardMeta));
    } catch {
      // Ignore quota errors
    }
  }, [cardMeta]);

  useEffect(() => {
    const isFa = locale === "fa";
    document.documentElement.lang = locale;
    document.documentElement.dir = isFa ? "rtl" : "ltr";
    document.body.classList.toggle("locale-fa", isFa);
    document.body.classList.toggle("locale-en", !isFa);
    try {
      localStorage.setItem("kanban_locale", locale);
    } catch {
      // Ignore storage errors
    }
  }, [locale]);

  function onLike(cardId: string) {
    setLikedIds((current) => ({ ...current, [cardId]: !current[cardId] }));
  }

  function onSaveCard(
    cardId: string,
    title: string,
    details: string,
    meta: CardMeta,
    phase?: PhaseId,
  ) {
    setBoard((current) => updateCard(current, cardId, title, details, locale, phase));
    setCardMeta((current) => ({ ...current, [cardId]: meta }));
  }

  function onDeleteCard(cardId: string) {
    setBoard((current) => deleteCard(current, cardId));
    setCardMeta((current) => {
      const next = { ...current };
      delete next[cardId];
      return next;
    });
    setLikedIds((current) => {
      const next = { ...current };
      delete next[cardId];
      return next;
    });
  }

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

  if (!isAuthenticated) {
    return (
      <LoginForm
        locale={locale}
        onLocaleChange={setLocale}
        onLoginSuccess={() => {}}
      />
    );
  }

  return (
    <main className="app-shell" dir={locale === "fa" ? "rtl" : "ltr"} lang={locale}>
      <aside className="sidebar" aria-label={labels.nav}>
        <Link className="brand-lockup" href="/" aria-label={labels.product}>
          <img className="brand-mark" src="/brand/loom-icon.png" alt="" />
        </Link>
        <nav className="side-nav">
          <button type="button" className="side-link is-active" aria-label={labels.home} aria-current="page">
            <HomeIcon size={18} strokeWidth={2} />
          </button>
          <button type="button" className="side-link" aria-label={labels.members}>
            <UserRound size={18} strokeWidth={2} />
          </button>
          <button type="button" className="side-link" aria-label={labels.schedule}>
            <Calendar size={18} strokeWidth={2} />
          </button>
          <button type="button" className="side-link" aria-label={labels.activity}>
            <Zap size={18} strokeWidth={2} />
          </button>
          <button type="button" className="side-link" aria-label={labels.notifications}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </nav>
        <div className="side-bottom">
          <button
            type="button"
            className="side-link"
            aria-label={labels.logout}
            title={labels.logout}
            onClick={logout}
          >
            <LogOut size={18} strokeWidth={2} />
          </button>
          <button type="button" className="side-link" aria-label={labels.settings}>
            <Settings size={18} strokeWidth={2} />
          </button>
          <img className="sidebar-avatar" src={portraits[0]} alt="" />
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="title-row">
            <h1 className="project-brand">
              <img className="project-brand-logo" src="/brand/loom-icon.png" alt="" />
              <span className="project-brand-name">{labels.board}</span>
            </h1>
            <div className="title-tools">
              <label className="search-field">
                <Search size={15} strokeWidth={2} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  placeholder={labels.search}
                  aria-label={labels.search}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {normalizedSearch ? (
                  <button
                    type="button"
                    className="search-clear"
                    aria-label={labels.clearSearch}
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                ) : null}
              </label>
              <div className="avatar-stack" aria-hidden="true">
                {portraits.slice(0, 3).map((src) => (
                  <img key={src} src={src} alt="" />
                ))}
                <b>+3</b>
              </div>
              <button className="share-button" type="button">
                <Share2 size={14} strokeWidth={2.2} aria-hidden="true" />
                {labels.share}
              </button>
              <div className="language-switch" role="group" aria-label={labels.switchLanguage}>
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
              <button
                type="button"
                className="logout-button"
                onClick={logout}
                aria-label={labels.logout}
                title={labels.logout}
              >
                <LogOut size={14} aria-hidden="true" />
                <span>{labels.logout}</span>
              </button>
            </div>
          </div>

          <div className="view-row">
            <div className="view-switch" role="group" aria-label={labels.views}>
              <button
                type="button"
                className={activeView === "list" ? "is-selected" : ""}
                aria-pressed={activeView === "list"}
                onClick={() => setActiveView("list")}
              >
                <List size={15} strokeWidth={2} aria-hidden="true" />
                {labels.list}
              </button>
              <button
                type="button"
                className={activeView === "board" ? "is-selected" : ""}
                aria-pressed={activeView === "board"}
                onClick={() => setActiveView("board")}
              >
                <LayoutGrid size={15} strokeWidth={2} aria-hidden="true" />
                {labels.boardView}
              </button>
              <button type="button">
                <GanttChart size={15} strokeWidth={2} aria-hidden="true" />
                {labels.timeline}
              </button>
              <button type="button">
                <Calendar size={15} strokeWidth={2} aria-hidden="true" />
                {labels.calendar}
              </button>
              <button type="button">
                <Check size={15} strokeWidth={2.2} aria-hidden="true" />
                {labels.progress}
              </button>
            </div>
            <button className="visibility" type="button">
              {labels.visibility}
              <ChevronDown size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>

          <div
            className="phase-tabs-row"
            role="tablist"
            aria-label={locale === "fa" ? "فازهای کاری" : "Workflow Phases"}
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedPhase === "all"}
              className={`phase-tab${selectedPhase === "all" ? " is-active" : ""}`}
              onClick={() => setSelectedPhase("all")}
            >
              <span>{locale === "fa" ? "همه بخش‌ها" : "All Phases"}</span>
              <span className="phase-tab-count">{board.cards.length}</span>
            </button>
            {currentPhases.map((phase) => {
              const isEditingThisPhase = editingPhaseId === phase.id;
              const count = board.cards.filter((c) => c.phase === phase.id).length;

              if (isEditingThisPhase) {
                return (
                  <form
                    key={phase.id}
                    className="phase-tab-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editPhaseName.trim()) {
                        setBoard((current) => renamePhase(current, phase.id, editPhaseName, locale));
                      }
                      setEditingPhaseId(null);
                    }}
                  >
                    <input
                      autoFocus
                      maxLength={30}
                      value={editPhaseName}
                      onChange={(e) => setEditPhaseName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setEditingPhaseId(null);
                      }}
                    />
                    <button type="submit" className="icon-button" aria-label={labels.save}>
                      <Check size={14} aria-hidden="true" />
                    </button>
                    {currentPhases.length > 1 ? (
                      <button
                        type="button"
                        className="icon-button delete-phase-icon"
                        aria-label={labels.deletePhase}
                        onClick={() => {
                          setBoard((current) => deletePhase(current, phase.id));
                          if (selectedPhase === phase.id) setSelectedPhase("all");
                          setEditingPhaseId(null);
                        }}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={labels.cancel}
                      onClick={() => setEditingPhaseId(null)}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </form>
                );
              }

              return (
                <div key={phase.id} className="phase-tab-wrapper">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedPhase === phase.id}
                    className={`phase-tab${selectedPhase === phase.id ? " is-active" : ""}`}
                    onClick={() => setSelectedPhase(phase.id)}
                  >
                    <span>{getLocalizedText(phase.label, locale)}</span>
                    <span className="phase-tab-count">{count}</span>
                  </button>
                  {selectedPhase === phase.id ? (
                    <button
                      type="button"
                      className="phase-tab-edit-trigger"
                      aria-label={`${labels.editPhase}: ${getLocalizedText(phase.label, locale)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPhaseName(getLocalizedText(phase.label, locale));
                        setEditingPhaseId(phase.id);
                      }}
                    >
                      <Pencil size={11} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              );
            })}

            {isCreatingPhase ? (
              <form
                className="phase-tab-edit-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPhaseName.trim()) {
                    setBoard((current) => addPhase(current, newPhaseName, locale));
                    setNewPhaseName("");
                    setIsCreatingPhase(false);
                  }
                }}
              >
                <input
                  autoFocus
                  maxLength={30}
                  placeholder={labels.newPhasePlaceholder}
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsCreatingPhase(false);
                      setNewPhaseName("");
                    }
                  }}
                />
                <button type="submit" className="icon-button" aria-label={labels.save}>
                  <Check size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={labels.cancel}
                  onClick={() => {
                    setIsCreatingPhase(false);
                    setNewPhaseName("");
                  }}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="phase-tab add-phase-tab"
                onClick={() => setIsCreatingPhase(true)}
                aria-label={labels.addPhase}
              >
                <Plus size={14} strokeWidth={2.2} aria-hidden="true" />
                <span>{labels.addPhase}</span>
              </button>
            )}
          </div>
        </header>

        <DragDropProvider onDragEnd={finishDrag}>
          <section
            className={`board-scroll${normalizedSearch ? " is-filtering" : ""}${activeView === "list" ? " is-list-view" : ""}`}
            aria-label={labels.board}
          >
            <div className={activeView === "board" ? "board-columns" : "board-list"}>
              {board.columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  view={activeView}
                  phases={currentPhases}
                  canDeleteColumn={board.columns.length > 1}
                  onDeleteColumn={(columnId) => {
                    setBoard((current) => deleteColumn(current, columnId));
                  }}
                  cards={board.cards.filter(
                    (card) =>
                      card.columnId === column.id &&
                      (selectedPhase === "all" || card.phase === selectedPhase) &&
                      matchesCardSearch(card, normalizedSearch),
                  )}
                  searchQuery={normalizedSearch}
                  locale={locale}
                  labels={labels}
                  likedIds={likedIds}
                  cardMeta={cardMeta}
                  onLike={onLike}
                  onSaveCard={onSaveCard}
                  onRename={(columnId, name) =>
                    setBoard((current) => renameColumn(current, columnId, name, locale))
                  }
                  onAdd={(columnId, title, details) => {
                    const id = generateCardId();
                    const cardPhase = selectedPhase !== "all" ? selectedPhase : "brand";
                    setBoard((current) => addCard(current, columnId, title, details, id, cardPhase));
                    setCardMeta((current) => ({ ...current, [id]: defaultCardMeta() }));
                  }}
                  onDelete={onDeleteCard}
                />
              ))}

              {activeView === "board" ? (
                isCreatingColumn ? (
                  <form
                    className="board-column add-column-card is-editing"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newColumnName.trim()) {
                        setBoard((current) => addColumn(current, newColumnName, locale));
                        setNewColumnName("");
                        setIsCreatingColumn(false);
                      }
                    }}
                  >
                    <div className="add-column-form">
                      <input
                        autoFocus
                        required
                        maxLength={40}
                        value={newColumnName}
                        placeholder={labels.newColumnPlaceholder}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsCreatingColumn(false);
                            setNewColumnName("");
                          }
                        }}
                      />
                      <div className="form-actions">
                        <button className="share-button compact" type="submit">
                          {labels.save}
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={labels.cancel}
                          onClick={() => {
                            setIsCreatingColumn(false);
                            setNewColumnName("");
                          }}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="add-column-button"
                    onClick={() => setIsCreatingColumn(true)}
                  >
                    <Plus size={18} strokeWidth={2.2} aria-hidden="true" />
                    <span>{labels.addColumn}</span>
                  </button>
                )
              ) : null}
            </div>
          </section>
        </DragDropProvider>
      </div>
    </main>
  );
}
