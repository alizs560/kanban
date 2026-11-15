"use client";

import { useEffect, useId, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import {
  Calendar,
  Check,
  Copy,
  Globe2,
  Link2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Share2,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Feedback } from "@dnd-kit/dom";
import { DragDropProvider, useDroppable, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useAuthSession } from "@/lib/auth";
import {
  useCardTilt,
  animateLikeButton,
  animatePageAndCardsSequence,
  animateCardsDealSequence,
} from "@/lib/animations";
import { LoginForm } from "./LoginForm";
import { TimelineView } from "./TimelineView";
import { CalendarView } from "./CalendarView";
import { ProgressView } from "./ProgressView";
import { AppSidebar, type SidebarTab } from "./AppSidebar";
import { AppNavbar, type Theme } from "./AppNavbar";
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
  formatScheduleDate,
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
  type LocalizedText,
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
    shareTitle: "Share this project",
    shareDescription: "Invite teammates or copy a link to collaborate.",
    inviteMembers: "Invite people",
    invitePlaceholder: "name@company.com",
    invite: "Invite",
    invited: "Invited",
    membersCount: "members",
    copyLink: "Copy link",
    copied: "Link copied",
    permission: "Project access",
    permissionPublic: "Anyone with the link",
    permissionPublicHint: "Anyone with the link can view this project.",
    permissionPrivate: "Only invited people",
    permissionPrivateHint: "Only people you invite can open this project.",
    linkLabel: "Project link",
    close: "Close",
    owner: "Owner",
    member: "Member",
    like: "Like",
    visibility: "Public To All",
    views: "Board views",
    list: "List",
    boardView: "Board",
    timeline: "Timeline",
    calendar: "Calendar",
    progress: "Progress",
    soloMode: "Solo mode",
    teamMode: "Team mode",
    soloModeHint: "A simpler board for focused individual work",
    soloBacklog: "Backlog",
    soloTodo: "To do",
    soloDoing: "In progress",
    soloDone: "Complete",
    soloAddCard: "Add card",
    soloAddPlaceholder: "What needs to be done?",
    soloTrash: "Drop here to delete",
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
    overallProgress: "Overall Progress",
    tasksCompleted: "Tasks Completed",
    tasksInProgress: "In Progress",
    tasksRemaining: "To Do",
    phaseProgress: "Progress by Phase",
    priorityDistribution: "Priority Distribution",
    monthName: "December 2026",
    timelineStart: "Start",
    timelineDue: "Due",
    taskName: "Task",
    columnHeader: "Column",
    phaseHeader: "Phase",
    statusHeader: "Status",
    priorityHeader: "Priority",
    noTasksInView: "No tasks to display in this view.",
    prevMonth: "Previous",
    nextMonth: "Next",
    urgentPriority: "Urgent & High",
    importantPriority: "Important",
    normalPriority: "Normal",
    scheduleRange: "Schedule (Date Range)",
    startDate: "Start Date",
    dueDate: "Due Date",
    uploadImage: "Upload Image",
    customCover: "Custom Image",
    removeCover: "Remove Image",
    previewImage: "Image Preview",
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
    shareTitle: "اشتراک‌گذاری پروژه",
    shareDescription: "هم‌تیمی‌ها را دعوت کنید یا لینک پروژه را کپی کنید.",
    inviteMembers: "دعوت از افراد",
    invitePlaceholder: "name@company.com",
    invite: "دعوت",
    invited: "دعوت شد",
    membersCount: "عضو",
    copyLink: "کپی لینک",
    copied: "لینک کپی شد",
    permission: "دسترسی به پروژه",
    permissionPublic: "هرکس لینک را داشته باشد",
    permissionPublicHint: "هرکس لینک را داشته باشد می‌تواند این پروژه را ببیند.",
    permissionPrivate: "فقط افراد دعوت‌شده",
    permissionPrivateHint: "فقط افرادی که دعوت می‌کنید می‌توانند پروژه را باز کنند.",
    linkLabel: "لینک پروژه",
    close: "بستن",
    owner: "مالک",
    member: "عضو",
    like: "پسند",
    visibility: "عمومی برای همه",
    views: "نمای تخته",
    list: "فهرست",
    boardView: "تخته",
    timeline: "خط زمان",
    calendar: "تقویم",
    progress: "پیشرفت",
    soloMode: "حالت انفرادی",
    teamMode: "حالت تیمی",
    soloModeHint: "یک تخته ساده‌تر برای تمرکز روی کارهای شخصی",
    soloBacklog: "ایده‌ها",
    soloTodo: "لیست کارها",
    soloDoing: "در حال انجام",
    soloDone: "تکمیل شده",
    soloAddCard: "افزودن کارت",
    soloAddPlaceholder: "چه کاری باید انجام شود؟",
    soloTrash: "برای حذف اینجا رها کنید",
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
    overallProgress: "پیشرفت کل پروژه",
    tasksCompleted: "کارهای تکمیل‌شده",
    tasksInProgress: "در حال انجام",
    tasksRemaining: "لیست کارها",
    phaseProgress: "پیشرفت بر اساس بخش‌های کاری",
    priorityDistribution: "توزیع بر اساس اولویت",
    monthName: "دسامبر ۲۰۲۶ (آذر و دی)",
    timelineStart: "شروع",
    timelineDue: "سررسید",
    taskName: "نام کار",
    columnHeader: "ستون",
    phaseHeader: "بخش کاری",
    statusHeader: "وضعیت",
    priorityHeader: "اولویت",
    noTasksInView: "کاری برای نمایش در این نما وجود ندارد.",
    prevMonth: "قبلی",
    nextMonth: "بعدی",
    urgentPriority: "فوری و مهم",
    importantPriority: "مهم",
    normalPriority: "عادی",
    scheduleRange: "زمان‌بندی کار (بازه زمانی)",
    startDate: "تاریخ شروع",
    dueDate: "تاریخ سررسید / پایان",
    uploadImage: "آپلود تصویر",
    customCover: "تصویر آپلود شده",
    removeCover: "حذف تصویر",
    previewImage: "پیش‌نمایش تصویر",
  },
} as const;

export type Copy = (typeof copy)[Locale];
export type BoardView = "board" | "list" | "timeline" | "calendar" | "progress";
export type WorkspaceMode = "team" | "solo";
export type Tone = "started" | "ongoing" | "idle" | "done";
export type Priority = "P1" | "P2" | "P3";
export type Accent = "green" | "orange" | "red";

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

export type CardMeta = {
  tone: Tone;
  priority: Priority;
  accent?: Accent;
  comments: number;
  likes: number;
  avatar: string;
  image?: string;
  startDay: number;
  dueDay: number;
};

const defaultCardMeta = (): CardMeta => ({
  tone: "idle",
  priority: "P2",
  comments: 0,
  likes: 0,
  avatar: portraits[0],
  startDay: 1,
  dueDay: 7,
});

const initialCardMeta: Record<string, CardMeta> = {
  "card-brand-concept": { tone: "done", priority: "P1", accent: "orange", comments: 6, likes: 24, avatar: portraits[0], image: covers.room, startDay: 1, dueDay: 4 },
  "card-typography-system": { tone: "started", priority: "P2", comments: 3, likes: 18, avatar: portraits[1], startDay: 3, dueDay: 7 },
  "card-user-flow": { tone: "started", priority: "P1", accent: "green", comments: 8, likes: 35, avatar: portraits[2], startDay: 6, dueDay: 11 },
  "card-design-system": { tone: "idle", priority: "P2", comments: 4, likes: 29, avatar: portraits[3], image: covers.lens, startDay: 9, dueDay: 15 },
  "card-components": { tone: "ongoing", priority: "P1", accent: "orange", comments: 14, likes: 78, avatar: portraits[0], image: covers.camera, startDay: 13, dueDay: 20 },
  "card-motion-effects": { tone: "idle", priority: "P2", accent: "green", comments: 9, likes: 42, avatar: portraits[1], startDay: 16, dueDay: 22 },
  "card-backend-api": { tone: "idle", priority: "P1", accent: "red", comments: 11, likes: 38, avatar: portraits[2], startDay: 18, dueDay: 25 },
  "card-ai-copilot": { tone: "idle", priority: "P2", comments: 15, likes: 56, avatar: portraits[3], startDay: 21, dueDay: 27 },
  "card-docker-deploy": { tone: "idle", priority: "P2", accent: "green", comments: 19, likes: 92, avatar: portraits[0], image: covers.room, startDay: 24, dueDay: 29 },
  "card-performance-seo": { tone: "idle", priority: "P1", accent: "red", comments: 27, likes: 145, avatar: portraits[1], startDay: 26, dueDay: 31 },
};

const coverKeys: CoverKey[] = ["room", "lens", "camera"];
const tones: Tone[] = ["idle", "started", "ongoing", "done"];
const priorities: Priority[] = ["P1", "P2", "P3"];
const accents: (Accent | "none")[] = ["none", "green", "orange", "red"];

const priorityMetaConfig = {
  P1: {
    labelKey: "urgentPriority" as const,
    colorClass: "priority-p1",
    chipClass: "priority-chip-p1",
    dotColor: "#d92d20",
  },
  P2: {
    labelKey: "importantPriority" as const,
    colorClass: "priority-p2",
    chipClass: "priority-chip-p2",
    dotColor: "#f79009",
  },
  P3: {
    labelKey: "normalPriority" as const,
    colorClass: "priority-p3",
    chipClass: "priority-chip-p3",
    dotColor: "#026aa2",
  },
} as const;

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const likeBtnRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useCardTilt<HTMLElement>(isDragging || isEditing);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(locale === "fa" ? "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." : "Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawData = uploadEvent.target?.result as string;
      if (!rawData) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.78);
          setDraft((prev) => ({ ...prev, image: compressed }));
        } else {
          setDraft((prev) => ({ ...prev, image: rawData }));
        }
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  }

  function openEdit() {
    const currentTitle = getLocalizedText(card.title, locale);
    const currentDetails = getLocalizedText(card.details, locale);
    setTitle(currentTitle);
    setDetails(currentDetails);
    setDraft({ ...safeMeta });
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
        ref={tiltRef}
        className={`task-card${isDragging ? " is-dragging" : ""}${isEditing ? " is-editing" : ""}${safeMeta.image && !isEditing ? " has-cover" : ""}${safeMeta.accent ? ` accent-${safeMeta.accent}` : ""}`}
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
              {priorities.map((priority) => {
                const pMeta = priorityMetaConfig[priority];
                const isSelected = draft.priority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    className={`chip priority-chip ${pMeta.chipClass}${isSelected ? " is-selected" : ""}`}
                    aria-pressed={isSelected}
                    onClick={() => setDraft({ ...draft, priority })}
                  >
                    <span className="priority-dot" style={{ backgroundColor: pMeta.dotColor }} />
                    {labels[pMeta.labelKey]}
                  </button>
                );
              })}
            </div>
            <label>{labels.scheduleRange}</label>
            <div className="schedule-picker-container">
              <div className="schedule-field-col">
                <span className="schedule-sublabel">{labels.startDate}</span>
                <select
                  id={`${editTitleId}-startDay`}
                  value={draft.startDay || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    const curDue = draft.dueDay || 7;
                    setDraft({
                      ...draft,
                      startDay: val,
                      dueDay: Math.max(val, curDue),
                    });
                  }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {locale === "fa" ? `${d} دسامبر` : `Dec ${d}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="schedule-field-col">
                <span className="schedule-sublabel">{labels.dueDate}</span>
                <select
                  id={`${editTitleId}-dueDay`}
                  value={draft.dueDay || Math.max(draft.startDay || 1, 7)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setDraft({
                      ...draft,
                      dueDay: Math.max(draft.startDay || 1, val),
                    });
                  }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1)
                    .filter((d) => d >= (draft.startDay || 1))
                    .map((d) => (
                      <option key={d} value={d}>
                        {locale === "fa" ? `${d} دسامبر` : `Dec ${d}`}
                      </option>
                    ))}
                </select>
              </div>
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
            <div className="cover-picker-controls">
              <select
                id={`${editTitleId}-cover`}
                value={
                  draft.image === covers.room
                    ? "room"
                    : draft.image === covers.lens
                      ? "lens"
                      : draft.image === covers.camera
                        ? "camera"
                        : draft.image
                          ? "custom"
                          : "none"
                }
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === "none") {
                    setDraft({ ...draft, image: undefined });
                  } else if (next === "room" || next === "lens" || next === "camera") {
                    setDraft({ ...draft, image: covers[next as CoverKey] });
                  }
                }}
              >
                <option value="none">{labels.coverNone}</option>
                {coverKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
                {draft.image &&
                draft.image !== covers.room &&
                draft.image !== covers.lens &&
                draft.image !== covers.camera ? (
                  <option value="custom">{labels.customCover}</option>
                ) : null}
              </select>

              <button
                type="button"
                className="upload-image-btn"
                onClick={() => fileInputRef.current?.click()}
                title={labels.uploadImage}
              >
                <Upload size={14} aria-hidden="true" />
                <span>{labels.uploadImage}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>

            {draft.image ? (
              <div className="cover-preview-wrapper">
                <img src={draft.image} alt={labels.previewImage} className="cover-preview-thumbnail" />
                <button
                  type="button"
                  className="remove-cover-btn"
                  onClick={() => {
                    setDraft({ ...draft, image: undefined });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  title={labels.removeCover}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>{labels.removeCover}</span>
                </button>
              </div>
            ) : null}
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
              {(() => {
                const pMeta = priorityMetaConfig[safeMeta.priority] || priorityMetaConfig.P2;
                return (
                  <span className={`pill ${pMeta.colorClass}`}>
                    <span className="priority-dot" style={{ backgroundColor: pMeta.dotColor }} />
                    {labels[pMeta.labelKey]}
                  </span>
                );
              })()}
            </div>
            <div className="card-foot">
              <span className="avatar" aria-hidden="true">
                <img src={safeMeta.avatar} alt="" />
              </span>
              <span
                className="card-date"
                title={locale === "fa" ? "زمان‌بندی در دسامبر ۲۰۲۶" : "Scheduled in December 2026"}
              >
                <Calendar size={13} strokeWidth={2} aria-hidden="true" />
                {formatScheduleDate(safeMeta.startDay, safeMeta.dueDay, locale)}
              </span>
              <span className="card-stat">
                <MessageCircle size={13} strokeWidth={2} aria-hidden="true" />
                {safeMeta.comments}
              </span>
              <button
                ref={likeBtnRef}
                className={`card-stat like-button${liked ? " is-liked" : ""}`}
                type="button"
                aria-pressed={liked}
                aria-label={`${labels.like} ${cardTitle}`}
                onClick={() => {
                  animateLikeButton(likeBtnRef.current);
                  onLike(card.id);
                }}
              >
                <ThumbsUp size={13} strokeWidth={2} aria-hidden="true" />
                {likeCount}
              </button>
            </div>
            <div className="card-actions">
              <button
                className="icon-button edit-button"
                type="button"
                aria-label={labels.edit}
                onClick={openEdit}
              >
                <Pencil size={14} strokeWidth={2.1} aria-hidden="true" />
              </button>
              <button
                className="icon-button delete-button"
                type="button"
                aria-label={labels.delete}
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

type SoloColumnId = "backlog" | "todo" | "doing" | "done";
type SoloCard = { id: string; title: LocalizedText; column: SoloColumnId };

const SOLO_STORAGE_KEY = "kanban_solo_cards";
const soloColumns: { id: SoloColumnId; label: keyof Copy; color: string }[] = [
  { id: "backlog", label: "soloBacklog", color: "solo-column-muted" },
  { id: "todo", label: "soloTodo", color: "solo-column-yellow" },
  { id: "doing", label: "soloDoing", color: "solo-column-blue" },
  { id: "done", label: "soloDone", color: "solo-column-green" },
];

const initialSoloCards: SoloCard[] = [
  { id: "solo-1", title: { en: "Capture new ideas", fa: "ثبت ایده‌های جدید" }, column: "backlog" },
  { id: "solo-2", title: { en: "Plan the next milestone", fa: "برنامه‌ریزی مرحله بعد" }, column: "todo" },
  { id: "solo-3", title: { en: "Finish the current task", fa: "تکمیل کار فعلی" }, column: "doing" },
  { id: "solo-4", title: { en: "Review completed work", fa: "مرور کارهای تکمیل‌شده" }, column: "done" },
];

function getSavedSoloCards(): SoloCard[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SOLO_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (card): card is SoloCard =>
            Boolean(card && typeof card.id === "string" && typeof card.title === "object" && card.column),
        );
      }
    } catch {
      // Use the starter cards when solo storage is unavailable.
    }
  }
  return initialSoloCards;
}

function SoloBoard({
  locale,
  labels,
  cards,
  setCards,
}: {
  locale: Locale;
  labels: Copy;
  cards: SoloCard[];
  setCards: Dispatch<SetStateAction<SoloCard[]>>;
}) {
  const [activeTarget, setActiveTarget] = useState<SoloColumnId | "trash" | null>(null);
  const [addingTo, setAddingTo] = useState<SoloColumnId | null>(null);
  const [newTitle, setNewTitle] = useState("");

  function addSoloCard(event: FormEvent<HTMLFormElement>, column: SoloColumnId) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setCards((current) => [
      ...current,
      { id: generateCardId(), title: { en: title, fa: title }, column },
    ]);
    setNewTitle("");
    setAddingTo(null);
  }

  function moveSoloCard(cardId: string, column: SoloColumnId) {
    setCards((current) => current.map((card) => (card.id === cardId ? { ...card, column } : card)));
    setActiveTarget(null);
  }

  function deleteSoloCard(cardId: string) {
    setCards((current) => current.filter((card) => card.id !== cardId));
    setActiveTarget(null);
  }

  return (
    <section className="solo-board-shell" aria-label={labels.soloModeHint} dir={locale === "fa" ? "rtl" : "ltr"}>
      <div className="solo-board-header">
        <div>
          <span className="solo-eyebrow">{labels.soloMode}</span>
          <h2>{locale === "fa" ? "تمرکز روی کارهای خودت" : "Focus on your own work"}</h2>
          <p>{labels.soloModeHint}</p>
        </div>
        <span className="solo-card-count">{cards.length} {locale === "fa" ? "کارت" : "cards"}</span>
      </div>

      <div className="solo-board-grid">
        {soloColumns.map((column) => {
          const columnCards = cards.filter((card) => card.column === column.id);
          return (
            <section
              key={column.id}
              className={`solo-column ${column.color}${activeTarget === column.id ? " is-active" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setActiveTarget(column.id);
              }}
              onDragLeave={() => setActiveTarget(null)}
              onDrop={(event) => {
                event.preventDefault();
                const cardId = event.dataTransfer.getData("solo-card-id");
                if (cardId) moveSoloCard(cardId, column.id);
              }}
            >
              <header className="solo-column-header">
                <h3>{labels[column.label]}</h3>
                <span>{columnCards.length}</span>
              </header>
              <div className="solo-card-list">
                {columnCards.map((card) => (
                  <article
                    key={card.id}
                    className="solo-card"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("solo-card-id", card.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    aria-label={getLocalizedText(card.title, locale)}
                  >
                    <span>{getLocalizedText(card.title, locale)}</span>
                  </article>
                ))}
                {addingTo === column.id ? (
                  <form className="solo-add-form" onSubmit={(event) => addSoloCard(event, column.id)}>
                    <label className="sr-only" htmlFor={`solo-title-${column.id}`}>{labels.soloAddCard}</label>
                    <textarea
                      id={`solo-title-${column.id}`}
                      autoFocus
                      rows={2}
                      value={newTitle}
                      placeholder={labels.soloAddPlaceholder}
                      onChange={(event) => setNewTitle(event.target.value)}
                    />
                    <div className="solo-form-actions">
                      <button type="submit">{labels.soloAddCard}</button>
                      <button type="button" onClick={() => { setAddingTo(null); setNewTitle(""); }}>{labels.cancel}</button>
                    </div>
                  </form>
                ) : (
                  <button type="button" className="solo-add-button" onClick={() => setAddingTo(column.id)}>
                    <Plus size={15} aria-hidden="true" />
                    {labels.soloAddCard}
                  </button>
                )}
              </div>
            </section>
          );
        })}
        <button
          type="button"
          className={`solo-trash${activeTarget === "trash" ? " is-active" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setActiveTarget("trash"); }}
          onDragLeave={() => setActiveTarget(null)}
          onDrop={(event) => {
            event.preventDefault();
            const cardId = event.dataTransfer.getData("solo-card-id");
            if (cardId) deleteSoloCard(cardId);
          }}
          aria-label={labels.soloTrash}
        >
          <Trash2 size={26} aria-hidden="true" />
          <span>{labels.soloTrash}</span>
        </button>
      </div>
    </section>
  );
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
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("team");
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("loom-theme");
        if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
      } catch {
        // Ignore storage errors and keep the dark default.
      }
    }
    return "dark";
  });
  const [soloCards, setSoloCards] = useState<SoloCard[]>(getSavedSoloCards);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isInitialEntranceDone = useRef(false);

  function handleAiAddCard(title: string, columnId: string) {
    const id = `card-${Date.now()}`;
    const cardPhase = selectedPhase === "all" ? "brand" : selectedPhase;
    setBoard((current) => addCard(current, columnId, title, "", id, cardPhase));
  }
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [sharePermission, setSharePermission] = useState<"public" | "private">("public");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const currentPhases = getBoardPhases(board);
  const labels = copy[locale];
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/project/loom` : "/project/loom";
  const normalizedSearch = searchQuery.trim();
  const filteredCards = board.cards.filter(
    (card) =>
      (selectedPhase === "all" || card.phase === selectedPhase) &&
      matchesCardSearch(card, normalizedSearch),
  );

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
    try {
      localStorage.setItem(SOLO_STORAGE_KEY, JSON.stringify(soloCards));
    } catch {
      // Ignore quota errors
    }
  }, [soloCards]);

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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("loom-theme", theme);
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  useEffect(() => {
    if (!isShareOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsShareOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShareOpen]);

  useEffect(() => {
    if (!isInitialEntranceDone.current) {
      isInitialEntranceDone.current = true;
      animatePageAndCardsSequence();
    } else if (activeView === "board") {
      animateCardsDealSequence(".task-card");
    }
  }, [selectedPhase, activeView]);

  async function copyShareLink() {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    } catch {
      setShareCopied(false);
    }
  }

  function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email || invitedEmails.includes(email)) return;
    setInvitedEmails((current) => [...current, email]);
    setInviteEmail("");
  }

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
      <AppSidebar
        locale={locale}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        isOpen={isSidebarOpen}
        onToggleOpen={(open) => setIsSidebarOpen((prev) => (typeof open === "boolean" ? open : !prev))}
        onLogout={logout}
        board={board}
        onAiAddCard={handleAiAddCard}
      />

      <div className="workspace">
        <AppNavbar
          locale={locale}
          labels={labels}
          board={board}
          activeView={activeView}
          onViewChange={setActiveView}
          selectedPhase={selectedPhase}
          onPhaseSelect={setSelectedPhase}
          phases={currentPhases}
          onAddPhase={(name) => setBoard((current) => addPhase(current, name, locale))}
          onRenamePhase={(phaseId, newName) => setBoard((current) => renamePhase(current, phaseId, newName, locale))}
          onDeletePhase={(phaseId) => setBoard((current) => deletePhase(current, phaseId))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLocaleChange={setLocale}
          onOpenShare={() => setIsShareOpen(true)}
          onLogout={logout}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={(open) => setIsSidebarOpen((prev) => (typeof open === "boolean" ? open : !prev))}
          onOpenAi={() => {
            setSidebarTab("ai");
            setIsSidebarOpen(true);
          }}
          workspaceMode={workspaceMode}
          onWorkspaceModeChange={setWorkspaceMode}
          theme={theme}
          onThemeChange={setTheme}
        />

        {workspaceMode === "solo" ? (
          <SoloBoard locale={locale} labels={labels} cards={soloCards} setCards={setSoloCards} />
        ) : null}

        {workspaceMode === "team" && isShareOpen ? (
          <div className="share-modal-backdrop" role="presentation" onMouseDown={() => setIsShareOpen(false)}>
            <section
              className="share-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="share-modal-header">
                <div className="share-modal-heading">
                  <div className="share-modal-icon" aria-hidden="true">
                    <Share2 size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 id="share-modal-title">{labels.shareTitle}</h2>
                    <p>{labels.shareDescription}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-button share-modal-close"
                  aria-label={labels.close}
                  onClick={() => setIsShareOpen(false)}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="share-modal-section">
                <div className="share-section-title">
                  <span>{labels.permission}</span>
                  <ShieldCheck size={16} aria-hidden="true" />
                </div>
                <div className="share-permission-list">
                  <button
                    type="button"
                    className={`share-permission-option${sharePermission === "public" ? " is-selected" : ""}`}
                    onClick={() => setSharePermission("public")}
                    aria-pressed={sharePermission === "public"}
                  >
                    <span className="share-option-icon"><Globe2 size={17} aria-hidden="true" /></span>
                    <span className="share-option-copy">
                      <strong>{labels.permissionPublic}</strong>
                      <small>{labels.permissionPublicHint}</small>
                    </span>
                    <span className="share-radio" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`share-permission-option${sharePermission === "private" ? " is-selected" : ""}`}
                    onClick={() => setSharePermission("private")}
                    aria-pressed={sharePermission === "private"}
                  >
                    <span className="share-option-icon"><LockKeyhole size={17} aria-hidden="true" /></span>
                    <span className="share-option-copy">
                      <strong>{labels.permissionPrivate}</strong>
                      <small>{labels.permissionPrivateHint}</small>
                    </span>
                    <span className="share-radio" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="share-modal-section">
                <div className="share-section-title">
                  <span>{labels.inviteMembers}</span>
                  <span className="share-member-count">{invitedEmails.length + 3} {labels.membersCount}</span>
                </div>
                <form className="share-invite-form" onSubmit={inviteMember}>
                  <Mail size={17} aria-hidden="true" />
                  <label className="sr-only" htmlFor="share-invite-email">{labels.inviteMembers}</label>
                  <input
                    id="share-invite-email"
                    type="email"
                    value={inviteEmail}
                    placeholder={labels.invitePlaceholder}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <button type="submit" className="share-invite-button">{labels.invite}</button>
                </form>
                <div className="share-members-list">
                  <div className="share-member">
                    <img src={portraits[0]} alt="" />
                    <span><strong>Alex Morgan</strong><small>alex@loom.team</small></span>
                    <em>{labels.owner}</em>
                  </div>
                  <div className="share-member">
                    <img src={portraits[1]} alt="" />
                    <span><strong>Sam Chen</strong><small>sam@loom.team</small></span>
                    <em>{labels.member}</em>
                  </div>
                  {invitedEmails.map((email) => (
                    <div className="share-member" key={email}>
                      <span className="share-member-fallback">{email.slice(0, 1).toUpperCase()}</span>
                      <span><strong>{email}</strong><small>{labels.invited}</small></span>
                      <em>{labels.member}</em>
                    </div>
                  ))}
                </div>
              </div>

              <div className="share-link-box">
                <div className="share-link-copy">
                  <Link2 size={17} aria-hidden="true" />
                  <span><strong>{labels.linkLabel}</strong><small>{shareUrl}</small></span>
                </div>
                <button type="button" className={`share-copy-button${shareCopied ? " is-copied" : ""}`} onClick={copyShareLink}>
                  {shareCopied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                  {shareCopied ? labels.copied : labels.copyLink}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {workspaceMode === "team" && activeView === "timeline" ? (
          <section className="board-scroll" aria-label={labels.timeline}>
            <TimelineView
              cards={filteredCards}
              columns={board.columns}
              phases={currentPhases}
              cardMeta={cardMeta}
              locale={locale}
              labels={labels}
            />
          </section>
        ) : workspaceMode === "team" && activeView === "calendar" ? (
          <section className="board-scroll" aria-label={labels.calendar}>
            <CalendarView
              cards={filteredCards}
              columns={board.columns}
              phases={currentPhases}
              cardMeta={cardMeta}
              locale={locale}
              labels={labels}
            />
          </section>
        ) : workspaceMode === "team" && activeView === "progress" ? (
          <section className="board-scroll" aria-label={labels.progress}>
            <ProgressView
              cards={filteredCards}
              columns={board.columns}
              phases={currentPhases}
              cardMeta={cardMeta}
              locale={locale}
              labels={labels}
            />
          </section>
        ) : workspaceMode === "team" ? (
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
        ) : null}
      </div>
    </main>
  );
}
