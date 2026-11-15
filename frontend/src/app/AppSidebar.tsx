"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Home as HomeIcon,
  LogOut,
  Plus,
  Send,
  Settings,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { BoardState, Locale } from "@/lib/board";
import { animateDrawerCascade, animateNewMessage } from "@/lib/animations";
import { apiFetch, apiUrl } from "@/lib/api";

export type SidebarTab =
  | "home"
  | "ai"
  | "members"
  | "schedule"
  | "activity"
  | "notifications"
  | "settings";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  actionTaken?: string;
}

interface AppSidebarProps {
  locale: Locale;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isOpen: boolean;
  onToggleOpen: (open?: boolean) => void;
  onLogout: () => void;
  board: BoardState;
  onBoardChange: (board: BoardState) => void;
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    animateNewMessage(bubbleRef.current);
  }, []);

  return (
    <div ref={bubbleRef} className="ai-message-bubble">
      <p className="ai-message-text">{msg.text}</p>
      {msg.actionTaken && (
        <div className="ai-action-badge">
          <CheckCheck size={12} />
          <span>{msg.actionTaken}</span>
        </div>
      )}
      <span className="ai-message-time">{msg.timestamp}</span>
    </div>
  );
}

export function AppSidebar({
  locale,
  activeTab,
  onTabChange,
  isOpen,
  onToggleOpen,
  onLogout,
  board,
  onBoardChange,
}: AppSidebarProps) {
  const isRtl = locale === "fa";
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      animateDrawerCascade(drawerRef.current);
    }
  }, [isOpen, activeTab]);

  // State for AI interactive chat panel
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text:
        locale === "fa"
          ? "سلام! من دستیار هوشمند پروژه هستم که به مدل openai/gpt-oss-120b متصل می‌شوم. چطور می‌توانم در مدیریت کارت‌ها و وظایف به شما کمک کنم؟"
          : "Hello! I am your project AI assistant powered by openai/gpt-oss-120b. How can I help you manage your tasks and board today?",
      timestamp: locale === "fa" ? "لحظاتی پیش" : "Just now",
    },
  ]);
  const [promptInput, setPromptInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Quick suggestions for AI
  const quickPrompts =
    locale === "fa"
      ? [
          "یک تسک برای تست‌های API اضافه کن",
          "کارت هویت بصری را بررسی کن",
          "خلاصه وضعیت ستون لیست کارها را بده",
        ]
      : [
          "Add task for API testing",
          "Review Brand Identity card",
          "Summarize To Do column tasks",
        ];

  // Dummy notifications
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: locale === "fa" ? "جابه‌جایی کارت" : "Card moved",
      desc:
        locale === "fa"
          ? "کارت «پیاده‌سازی گالری» به ستون در حال انجام منتقل شد."
          : "Card 'Components & Gallery' moved to In Progress.",
      time: locale === "fa" ? "۱۰ دقیقه پیش" : "10m ago",
      unread: true,
    },
    {
      id: "n-2",
      title: locale === "fa" ? "تکمیل مرحله" : "Phase completed",
      desc:
        locale === "fa"
          ? "فاز هویت بصری با موفقیت ۱۰۰٪ تکمیل شد."
          : "Brand & Identity phase completed 100%.",
      time: locale === "fa" ? "۱ ساعت پیش" : "1h ago",
      unread: true,
    },
    {
      id: "n-3",
      title: locale === "fa" ? "پیوست تصویر جدید" : "New cover attached",
      desc:
        locale === "fa"
          ? "کاور اختصاصی برای کارت سیستم طراحی ثبت گردید."
          : "Custom cover added to Design System card.",
      time: locale === "fa" ? "دیروز" : "Yesterday",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  async function handleSendPrompt(e?: FormEvent) {
    if (e) e.preventDefault();
    const cleanPrompt = promptInput.trim();
    if (!cleanPrompt || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: cleanPrompt,
      timestamp: locale === "fa" ? "هم‌اکنون" : "Now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput("");
    setIsAiThinking(true);

    try {
      const response = await apiFetch(apiUrl("/api/chat"), {
        method: "POST",
        body: JSON.stringify({ message: cleanPrompt }),
      });
      const result = (await response.json()) as {
        reply?: string;
        board?: BoardState;
        changed?: boolean;
        detail?: string;
      };
      if (!response.ok || !result.reply || !result.board) {
        throw new Error(result.detail || "chat_request_failed");
      }

      const reply = result.reply;
      onBoardChange(result.board);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: reply,
          timestamp: locale === "fa" ? "لحظاتی پیش" : "Just now",
          actionTaken: result.changed
            ? locale === "fa"
              ? "تغییرات برد ذخیره شد"
              : "Board changes saved"
            : undefined,
        },
      ]);
    } catch (error) {
      console.error("AI chat request failed", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: "ai",
          text:
            locale === "fa"
              ? "ارتباط با دستیار برقرار نشد. کلید OpenRouter و اجرای بک‌اند را بررسی کنید."
              : "The assistant could not be reached. Check the OpenRouter key and backend.",
          timestamp: locale === "fa" ? "اکنون" : "Now",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  }

  function handleNavClick(tab: SidebarTab) {
    if (tab === "home") {
      onTabChange("home");
      onToggleOpen(false);
      return;
    }

    if (activeTab === tab && isOpen) {
      onToggleOpen(false);
    } else {
      onTabChange(tab);
      onToggleOpen(true);
    }
  }

  const teamMembers = [
    {
      id: "u1",
      name: locale === "fa" ? "شما (مدیر پروژه)" : "You (Project Lead)",
      role: locale === "fa" ? "مدیر محصول و هدایت تیم" : "Product & Lead",
      status: "online",
      avatar: "/brand/loom-icon.png",
    },
    {
      id: "u2",
      name: locale === "fa" ? "سارا طاهری" : "Sara Taheri",
      role: locale === "fa" ? "طراح ارشد تجربه کاربری" : "Lead UI/UX Designer",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "u3",
      name: locale === "fa" ? "رضا عباسی" : "Reza Abbasi",
      role: locale === "fa" ? "توسعه‌دهنده فرانت‌اند و انیمیشن" : "Frontend Engineer",
      status: "offline",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: "u4",
      name: locale === "fa" ? "مهدی کاظمی" : "Mehdi Kazemi",
      role: locale === "fa" ? "معمار سیستم و توسعه‌دهنده بک‌اند" : "Backend Architect",
      status: "online",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    },
  ];

  return (
    <div className={`sidebar-container${isOpen ? " is-drawer-open" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Icon Rail */}
      <aside className="sidebar-rail" aria-label={locale === "fa" ? "نوار ناوبری اصلی" : "Main Navigation Rail"}>
        <div className="sidebar-rail-top">
          <Link className="brand-lockup" href="/" aria-label="LOOM Kanban">
            <img className="brand-mark" src="/brand/loom-icon.png" alt="" />
            <span className="brand-version-badge">v1</span>
          </Link>

          <nav className="rail-nav" aria-label={locale === "fa" ? "منوی اصلی" : "Primary Navigation"}>
            {/* Home / Board */}
            <button
              type="button"
              className={`rail-btn${activeTab === "home" && !isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("home")}
              aria-label={locale === "fa" ? "تخته کار و خانه" : "Home & Board"}
              title={locale === "fa" ? "تخته کار" : "Board"}
            >
              <HomeIcon size={19} strokeWidth={2} />
              <span className="rail-tooltip">{locale === "fa" ? "تخته کار" : "Board"}</span>
            </button>

            {/* AI Copilot Tab - Specially styled */}
            <button
              type="button"
              className={`rail-btn rail-btn-ai${activeTab === "ai" && isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("ai")}
              aria-label={locale === "fa" ? "دستیار هوش مصنوعی" : "AI Copilot"}
              title={locale === "fa" ? "دستیار هوش مصنوعی" : "AI Assistant"}
            >
              <div className="ai-icon-wrapper">
                <Sparkles size={18} strokeWidth={2.2} />
                <span className="ai-status-pulse" />
              </div>
              <span className="rail-tooltip">{locale === "fa" ? "دستیار هوش مصنوعی" : "AI Assistant"}</span>
            </button>

            {/* Team Members */}
            <button
              type="button"
              className={`rail-btn${activeTab === "members" && isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("members")}
              aria-label={locale === "fa" ? "اعضای تیم" : "Team Members"}
              title={locale === "fa" ? "اعضای تیم" : "Team Members"}
            >
              <Users size={19} strokeWidth={2} />
              <span className="rail-badge">4</span>
              <span className="rail-tooltip">{locale === "fa" ? "اعضای تیم" : "Team"}</span>
            </button>

            {/* Schedule */}
            <button
              type="button"
              className={`rail-btn${activeTab === "schedule" && isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("schedule")}
              aria-label={locale === "fa" ? "زمان‌بندی و تقویم" : "Schedule & Calendar"}
              title={locale === "fa" ? "زمان‌بندی" : "Schedule"}
            >
              <Calendar size={19} strokeWidth={2} />
              <span className="rail-tooltip">{locale === "fa" ? "زمان‌بندی" : "Schedule"}</span>
            </button>

            {/* Activity */}
            <button
              type="button"
              className={`rail-btn${activeTab === "activity" && isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("activity")}
              aria-label={locale === "fa" ? "رویدادها و فعالیت‌ها" : "Activity Feed"}
              title={locale === "fa" ? "فعالیت‌ها" : "Activity"}
            >
              <Zap size={19} strokeWidth={2} />
              <span className="rail-tooltip">{locale === "fa" ? "فعالیت‌ها" : "Activity"}</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className={`rail-btn${activeTab === "notifications" && isOpen ? " is-active" : ""}`}
              onClick={() => handleNavClick("notifications")}
              aria-label={locale === "fa" ? "اعلان‌ها" : "Notifications"}
              title={locale === "fa" ? "اعلان‌ها" : "Notifications"}
            >
              <Bell size={19} strokeWidth={2} />
              {unreadCount > 0 ? <span className="rail-badge rail-badge-accent">{unreadCount}</span> : null}
              <span className="rail-tooltip">{locale === "fa" ? "اعلان‌ها" : "Notifications"}</span>
            </button>
          </nav>
        </div>

        {/* Rail Bottom */}
        <div className="sidebar-rail-bottom">
          <button
            type="button"
            className={`rail-btn${activeTab === "settings" && isOpen ? " is-active" : ""}`}
            onClick={() => handleNavClick("settings")}
            aria-label={locale === "fa" ? "تنظیمات" : "Settings"}
            title={locale === "fa" ? "تنظیمات" : "Settings"}
          >
            <Settings size={19} strokeWidth={2} />
            <span className="rail-tooltip">{locale === "fa" ? "تنظیمات" : "Settings"}</span>
          </button>

          <button
            type="button"
            className="rail-btn rail-btn-danger"
            onClick={onLogout}
            aria-label={locale === "fa" ? "خروج از حساب" : "Sign Out"}
            title={locale === "fa" ? "خروج" : "Sign Out"}
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="rail-tooltip">{locale === "fa" ? "خروج" : "Sign Out"}</span>
          </button>

          <div
            className="user-profile-anchor"
            title={locale === "fa" ? "کاربر واردشده: user" : "Signed in as: user"}
          >
            <div className="user-avatar-wrapper">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="User"
                className="user-avatar-img"
              />
              <span className="user-online-dot" />
            </div>
          </div>
        </div>
      </aside>

      {/* Flyout Sub-Panel / Drawer */}
      <div ref={drawerRef} className={`sidebar-drawer${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            {activeTab === "ai" && (
              <div className="drawer-icon-box ai-box">
                <Bot size={18} />
              </div>
            )}
            {activeTab === "members" && (
              <div className="drawer-icon-box">
                <Users size={18} />
              </div>
            )}
            {activeTab === "activity" && (
              <div className="drawer-icon-box">
                <Zap size={18} />
              </div>
            )}
            {activeTab === "notifications" && (
              <div className="drawer-icon-box">
                <Bell size={18} />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="drawer-icon-box">
                <Settings size={18} />
              </div>
            )}
            {activeTab === "schedule" && (
              <div className="drawer-icon-box">
                <Calendar size={18} />
              </div>
            )}

            <div>
              <h2 className="drawer-title">
                {activeTab === "ai" && (locale === "fa" ? "دستیار هوش مصنوعی" : "AI Copilot")}
                {activeTab === "members" && (locale === "fa" ? "اعضای تیم پروژه" : "Team Members")}
                {activeTab === "schedule" && (locale === "fa" ? "زمان‌بندی وظایف" : "Schedule")}
                {activeTab === "activity" && (locale === "fa" ? "فعالیت‌های اخیر" : "Activity Log")}
                {activeTab === "notifications" && (locale === "fa" ? "اعلان‌ها" : "Notifications")}
                {activeTab === "settings" && (locale === "fa" ? "تنظیمات تخته" : "Settings")}
              </h2>
              <span className="drawer-subtitle">
                {activeTab === "ai" && (locale === "fa" ? "اتصال به OpenRouter / gpt-oss-120b" : "OpenRouter / gpt-oss-120b")}
                {activeTab === "members" && (locale === "fa" ? "۴ عضو فعال در تخته" : "4 active members")}
                {activeTab === "schedule" && (locale === "fa" ? "دسامبر ۲۰۲۶" : "December 2026")}
                {activeTab === "activity" && (locale === "fa" ? "ثبت رویدادهای زنده تخته" : "Live board updates")}
                {activeTab === "notifications" && (locale === "fa" ? `${unreadCount} اعلان خوانده‌نشده` : `${unreadCount} unread`)}
                {activeTab === "settings" && (locale === "fa" ? "پیکربندی بورد و دسترسی‌ها" : "Preferences & Access")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => onToggleOpen(false)}
            aria-label={locale === "fa" ? "بستن پنل" : "Close panel"}
          >
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {/* AI COPILOT TAB */}
          {activeTab === "ai" && (
            <div className="ai-chat-container">
              <div className="ai-header-status">
                <div className="ai-status-pill">
                  <span className="ai-indicator-dot" />
                  <span>{locale === "fa" ? "مدل آماده دریافت دستور" : "Model ready"}</span>
                </div>
                <span className="ai-model-tag">gpt-oss-120b</span>
              </div>

              {/* Chat message history */}
              <div className="ai-chat-feed">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ai-message-row${msg.sender === "user" ? " is-user" : " is-ai"}`}
                  >
                    {msg.sender === "ai" && (
                      <div className="ai-avatar-thumb">
                        <Bot size={14} />
                      </div>
                    )}
                    <ChatBubble msg={msg} />
                  </div>
                ))}
                {isAiThinking && (
                  <div className="ai-message-row is-ai">
                    <div className="ai-avatar-thumb">
                      <Sparkles size={14} />
                    </div>
                    <div className="ai-message-bubble ai-thinking-bubble">
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span className="thinking-dot" />
                      <span className="thinking-label">
                        {locale === "fa" ? "در حال پردازش..." : "Thinking..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="ai-quick-prompts">
                <span className="quick-prompts-label">
                  {locale === "fa" ? "پیشنهادهای آماده:" : "Suggestions:"}
                </span>
                <div className="quick-prompts-list">
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="quick-prompt-chip"
                      onClick={() => {
                        setPromptInput(item);
                      }}
                    >
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form className="ai-input-form" onSubmit={handleSendPrompt}>
                <input
                  type="text"
                  className="ai-text-input"
                  placeholder={
                    locale === "fa"
                      ? "دستور را بنویسید (مثلاً: کارت جدید تست اضافه کن)..."
                      : "Type a prompt (e.g. Add API test card)..."
                  }
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  disabled={isAiThinking}
                />
                <button
                  type="submit"
                  className="ai-send-btn"
                  disabled={!promptInput.trim() || isAiThinking}
                  aria-label={locale === "fa" ? "ارسال دستور" : "Send prompt"}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TEAM MEMBERS TAB */}
          {activeTab === "members" && (
            <div className="drawer-members-list">
              <div className="drawer-section-info">
                <span>{locale === "fa" ? "هم‌تیمی‌های دارای دسترسی به این بورد:" : "Teammates with access:"}</span>
              </div>
              {teamMembers.map((member) => (
                <div key={member.id} className="team-member-item">
                  <div className="team-member-avatar-box">
                    <img src={member.avatar} alt="" className="team-member-avatar" />
                    <span
                      className={`member-status-indicator ${member.status === "online" ? "is-online" : "is-offline"}`}
                    />
                  </div>
                  <div className="team-member-details">
                    <strong className="team-member-name">{member.name}</strong>
                    <span className="team-member-role">{member.role}</span>
                  </div>
                  <span className={`status-pill ${member.status}`}>
                    {member.status === "online"
                      ? locale === "fa"
                        ? "آنلاین"
                        : "Online"
                      : locale === "fa"
                        ? "آفلاین"
                        : "Offline"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="drawer-notifications-container">
              <div className="notifications-top-bar">
                <span>{locale === "fa" ? "لیست رویدادها و هشدارها" : "Recent alerts"}</span>
                {unreadCount > 0 && (
                  <button type="button" className="mark-read-btn" onClick={markAllRead}>
                    <Check size={13} />
                    <span>{locale === "fa" ? "خواندن همه" : "Mark all as read"}</span>
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notification-item${item.unread ? " is-unread" : ""}`}>
                    <div className="notification-dot-indicator" />
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <strong className="notification-title">{item.title}</strong>
                        <span className="notification-time">{item.time}</span>
                      </div>
                      <p className="notification-desc">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === "activity" && (
            <div className="drawer-activity-container">
              <div className="activity-timeline">
                <div className="activity-event">
                  <div className="activity-icon-node">
                    <Clock size={12} />
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">
                      <strong>{locale === "fa" ? "سارا طاهری" : "Sara Taheri"}</strong>{" "}
                      {locale === "fa" ? "کارت سیستم طراحی را ویرایش کرد." : "updated Design System card."}
                    </p>
                    <span className="activity-time">{locale === "fa" ? "۱۵ دقیقه قبل" : "15m ago"}</span>
                  </div>
                </div>

                <div className="activity-event">
                  <div className="activity-icon-node">
                    <CheckCheck size={12} />
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">
                      <strong>{locale === "fa" ? "مهدی کاظمی" : "Mehdi Kazemi"}</strong>{" "}
                      {locale === "fa"
                        ? "کارت هویت بصری را به ستون تکمیل شده منتقل کرد."
                        : "moved Brand Identity to Done."}
                    </p>
                    <span className="activity-time">{locale === "fa" ? "۱ ساعت قبل" : "1h ago"}</span>
                  </div>
                </div>

                <div className="activity-event">
                  <div className="activity-icon-node">
                    <Plus size={12} />
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">
                      <strong>{locale === "fa" ? "شما" : "You"}</strong>{" "}
                      {locale === "fa" ? "کارت جدیدی در بخش فرانت‌اند ایجاد کردید." : "created a new Frontend card."}
                    </p>
                    <span className="activity-time">{locale === "fa" ? "۳ ساعت قبل" : "3h ago"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE / TIMELINE SUMMARY TAB */}
          {activeTab === "schedule" && (
            <div className="drawer-schedule-summary">
              <div className="schedule-overview-card">
                <span className="schedule-header-badge">{locale === "fa" ? "ماه جاری" : "Current Month"}</span>
                <strong className="schedule-month-title">{locale === "fa" ? "دسامبر ۲۰۲۶ (آذر و دی)" : "December 2026"}</strong>
                <p className="schedule-summary-text">
                  {locale === "fa"
                    ? `تعداد کل تسک‌های زمان‌بندی‌شده در ماه: ${board.cards.length} وظیفه`
                    : `Total scheduled tasks this month: ${board.cards.length} items`}
                </p>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="drawer-settings-container">
              <div className="settings-group">
                <span className="settings-group-title">{locale === "fa" ? "حالت نمایش و زبان" : "Display & Language"}</span>
                <div className="settings-row">
                  <span>{locale === "fa" ? "جهت پیش‌فرض" : "Direction"}</span>
                  <span className="settings-value-pill">{locale === "fa" ? "RTL (راست به چپ)" : "LTR (Left-to-Right)"}</span>
                </div>
                <div className="settings-row">
                  <span>{locale === "fa" ? "فونت سیستم" : "Typography"}</span>
                  <span className="settings-value-pill">{locale === "fa" ? "پیدا (Peyda)" : "System Sans"}</span>
                </div>
              </div>

              <div className="settings-group">
                <span className="settings-group-title">{locale === "fa" ? "داده‌ها و نسخه بورد" : "Board & Sync"}</span>
                <div className="settings-row">
                  <span>{locale === "fa" ? "نسخه ذخیره‌سازی" : "Storage Engine"}</span>
                  <span className="settings-value-pill">v5-dynamic</span>
                </div>
                <div className="settings-row">
                  <span>{locale === "fa" ? "کاربر جاری" : "Active User"}</span>
                  <span className="settings-value-pill">user</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
