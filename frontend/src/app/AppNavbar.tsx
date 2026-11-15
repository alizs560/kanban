"use client";

import { useRef, useEffect, useState } from "react";
import {
  Calendar,
  Check,
  GanttChart,
  LayoutGrid,
  List,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  getLocalizedText,
  type BoardState,
  type Locale,
  type Phase,
  type PhaseId,
} from "@/lib/board";
import type { BoardView, Copy } from "./page";

interface AppNavbarProps {
  locale: Locale;
  labels: Copy;
  board: BoardState;
  activeView: BoardView;
  onViewChange: (view: BoardView) => void;
  selectedPhase: "all" | PhaseId;
  onPhaseSelect: (phaseId: "all" | PhaseId) => void;
  phases: Phase[];
  onAddPhase: (name: string) => void;
  onRenamePhase: (phaseId: PhaseId, newName: string) => void;
  onDeletePhase: (phaseId: PhaseId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocaleChange: (locale: Locale) => void;
  onOpenShare: () => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: (open?: boolean) => void;
  onOpenAi: () => void;
}

export function AppNavbar({
  locale,
  labels,
  board,
  activeView,
  onViewChange,
  selectedPhase,
  onPhaseSelect,
  phases,
  onAddPhase,
  onRenamePhase,
  onDeletePhase,
  searchQuery,
  onSearchChange,
  onLocaleChange,
  onOpenShare,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
  onOpenAi,
}: AppNavbarProps) {
  const isRtl = locale === "fa";
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Phase editing state
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editPhaseName, setEditPhaseName] = useState("");

  // Shortcut for Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const totalTasks = board.cards.length;

  return (
    <header className="navbar-container" dir={isRtl ? "rtl" : "ltr"}>
      {/* TIER 1: GLOBAL TOPBAR */}
      <div className="navbar-global">
        {/* Start: Toggle sidebar & Project info */}
        <div className="navbar-start">
          <button
            type="button"
            className="navbar-toggle-btn"
            onClick={() => onToggleSidebar(!isSidebarOpen)}
            aria-label={isSidebarOpen ? labels.close : (locale === "fa" ? "منوی کناری" : "Toggle Menu")}
            title={locale === "fa" ? "تغییر وضعیت پنل کناری" : "Toggle Sidebar Panel"}
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <div className="navbar-project-info">
            <div className="navbar-title-group">
              <h1 className="navbar-project-title">{labels.board}</h1>
              <span className="navbar-sprint-badge">
                <span className="sprint-status-dot" />
                {locale === "fa" ? "اسپرینت ۱ (فعال)" : "Sprint 1 (Active)"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="navbar-center">
          <div className="search-box-wrapper">
            <Search size={15} className="search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              className="navbar-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={labels.search}
              aria-label={labels.search}
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange("")}
                aria-label={labels.clearSearch}
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="search-kbd-hint">Ctrl K</kbd>
            )}
          </div>
        </div>

        {/* End: Quick Actions, AI Trigger, Share, Language, User */}
        <div className="navbar-end">
          {/* Quick AI Trigger button */}
          <button
            type="button"
            className="navbar-ai-trigger"
            onClick={onOpenAi}
            title={locale === "fa" ? "گفتگو با دستیار هوش مصنوعی" : "Chat with AI"}
            aria-label={locale === "fa" ? "دستیار هوش مصنوعی" : "AI Assistant"}
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span>{locale === "fa" ? "هوش مصنوعی" : "AI Copilot"}</span>
          </button>

          {/* Avatar stack */}
          <div className="navbar-avatar-stack" title={locale === "fa" ? "اعضای فعال در پروژه" : "Active project members"}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt=""
              className="stack-img"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
              alt=""
              className="stack-img"
            />
            <span className="stack-more">+2</span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            className="navbar-share-btn"
            aria-label={labels.share}
            onClick={onOpenShare}
          >
            <Share2 size={14} strokeWidth={2.2} />
            <span className="navbar-share-label">{labels.share}</span>
          </button>

          {/* Language Switch */}
          <div className="navbar-lang-switch" role="group" aria-label={labels.switchLanguage}>
            <button
              type="button"
              className={`lang-btn${locale === "fa" ? " is-active" : ""}`}
              onClick={() => onLocaleChange("fa")}
            >
              FA
            </button>
            <button
              type="button"
              className={`lang-btn${locale === "en" ? " is-active" : ""}`}
              onClick={() => onLocaleChange("en")}
            >
              EN
            </button>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            className="navbar-logout-btn"
            onClick={onLogout}
            title={labels.logout}
            aria-label={labels.logout}
          >
            <LogOut size={15} />
            <span className="logout-text">{labels.logout}</span>
          </button>
        </div>
      </div>

      {/* TIER 2: VIEW SWITCHER & WORKFLOW PHASES */}
      <div className="navbar-controls">
        {/* Left: View Switcher (Segmented Control) */}
        <div className="views-segmented-control" role="group" aria-label={labels.views}>
          <button
            type="button"
            className={`view-pill${activeView === "board" ? " is-active" : ""}`}
            onClick={() => onViewChange("board")}
            aria-pressed={activeView === "board"}
          >
            <LayoutGrid size={14} strokeWidth={2.2} />
            <span>{labels.boardView}</span>
          </button>

          <button
            type="button"
            className={`view-pill${activeView === "list" ? " is-active" : ""}`}
            onClick={() => onViewChange("list")}
            aria-pressed={activeView === "list"}
          >
            <List size={14} strokeWidth={2.2} />
            <span>{labels.list}</span>
          </button>

          <button
            type="button"
            className={`view-pill${activeView === "timeline" ? " is-active" : ""}`}
            onClick={() => onViewChange("timeline")}
            aria-pressed={activeView === "timeline"}
          >
            <GanttChart size={14} strokeWidth={2.2} />
            <span>{labels.timeline}</span>
          </button>

          <button
            type="button"
            className={`view-pill${activeView === "calendar" ? " is-active" : ""}`}
            onClick={() => onViewChange("calendar")}
            aria-pressed={activeView === "calendar"}
          >
            <Calendar size={14} strokeWidth={2.2} />
            <span>{labels.calendar}</span>
          </button>

          <button
            type="button"
            className={`view-pill${activeView === "progress" ? " is-active" : ""}`}
            onClick={() => onViewChange("progress")}
            aria-pressed={activeView === "progress"}
          >
            <Check size={14} strokeWidth={2.2} />
            <span>{labels.progress}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="controls-separator" />

        {/* Right / Flow: Workflow Phase Tabs */}
        <div
          className="phases-scroll-track"
          role="tablist"
          aria-label={locale === "fa" ? "فازهای کاری" : "Workflow Phases"}
        >
          {/* All Phases tab */}
          <button
            type="button"
            role="tab"
            aria-selected={selectedPhase === "all"}
            className={`phase-tab-pill${selectedPhase === "all" ? " is-active" : ""}`}
            onClick={() => onPhaseSelect("all")}
          >
            <span>{locale === "fa" ? "همه بخش‌ها" : "All Phases"}</span>
            <span className="phase-pill-badge">{totalTasks}</span>
          </button>

          {/* Project Phase tabs */}
          {phases.map((phase) => {
            const count = board.cards.filter((c) => c.phase === phase.id).length;
            const isEditing = editingPhaseId === phase.id;
            const phaseTitle = getLocalizedText(phase.label, locale);

            if (isEditing) {
              return (
                <form
                  key={phase.id}
                  className="phase-inline-edit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editPhaseName.trim()) {
                      onRenamePhase(phase.id, editPhaseName.trim());
                    }
                    setEditingPhaseId(null);
                  }}
                >
                  <input
                    type="text"
                    autoFocus
                    maxLength={30}
                    className="phase-inline-input"
                    value={editPhaseName}
                    onChange={(e) => setEditPhaseName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setEditingPhaseId(null);
                    }}
                  />
                  <button type="submit" className="phase-action-btn" aria-label={labels.save}>
                    <Check size={13} />
                  </button>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      className="phase-action-btn delete-btn"
                      onClick={() => {
                        onDeletePhase(phase.id);
                        if (selectedPhase === phase.id) onPhaseSelect("all");
                        setEditingPhaseId(null);
                      }}
                      aria-label={labels.deletePhase}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="phase-action-btn"
                    onClick={() => setEditingPhaseId(null)}
                    aria-label={labels.cancel}
                  >
                    <X size={13} />
                  </button>
                </form>
              );
            }

            return (
              <div key={phase.id} className="phase-tab-item">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPhase === phase.id}
                  className={`phase-tab-pill${selectedPhase === phase.id ? " is-active" : ""}`}
                  onClick={() => onPhaseSelect(phase.id)}
                >
                  <span>{phaseTitle}</span>
                  <span className="phase-pill-badge">{count}</span>
                </button>
                <button
                  type="button"
                  className="phase-quick-edit-trigger"
                  onClick={() => {
                    setEditingPhaseId(phase.id);
                    setEditPhaseName(phaseTitle);
                  }}
                  aria-label={`${labels.editPhase}: ${phaseTitle}`}
                >
                  <Pencil size={11} strokeWidth={2.2} />
                </button>
              </div>
            );
          })}

          {/* Add Phase Inline Form / Trigger */}
          {isAddingPhase ? (
            <form
              className="phase-inline-edit"
              onSubmit={(e) => {
                e.preventDefault();
                if (newPhaseName.trim()) {
                  onAddPhase(newPhaseName.trim());
                  setNewPhaseName("");
                }
                setIsAddingPhase(false);
              }}
            >
              <input
                type="text"
                autoFocus
                maxLength={30}
                placeholder={labels.newPhasePlaceholder}
                className="phase-inline-input"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsAddingPhase(false);
                }}
              />
              <button type="submit" className="phase-action-btn" aria-label={labels.addPhase}>
                <Check size={13} />
              </button>
              <button
                type="button"
                className="phase-action-btn"
                onClick={() => setIsAddingPhase(false)}
                aria-label={labels.cancel}
              >
                <X size={13} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="phase-add-trigger-btn"
              onClick={() => setIsAddingPhase(true)}
            >
              <Plus size={13} />
              <span>{labels.addPhase}</span>
            </button>
          )}
        </div>

        {/* Project visibility badge */}
        <div className="navbar-visibility-chip" title={locale === "fa" ? "دسترسی عمومی پروژه" : "Public access"}>
          <ShieldCheck size={14} className="visibility-icon" />
          <span>{labels.visibility}</span>
        </div>
      </div>
    </header>
  );
}
