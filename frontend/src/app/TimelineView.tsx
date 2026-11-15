"use client";

import type { Card, Column, Locale, Phase } from "@/lib/board";
import { getLocalizedText } from "@/lib/board";
import type { CardMeta, Copy } from "./page";

export function TimelineView({
  cards,
  columns,
  phases,
  cardMeta,
  locale,
  labels,
}: {
  cards: Card[];
  columns: Column[];
  phases: Phase[];
  cardMeta: Record<string, CardMeta>;
  locale: Locale;
  labels: Copy;
}) {
  const isFa = locale === "fa";
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [
    { label: isFa ? "هفته اول (۱-۷)" : "Week 1 (1-7)", start: 1, end: 7 },
    { label: isFa ? "هفته دوم (۸-۱۴)" : "Week 2 (8-14)", start: 8, end: 14 },
    { label: isFa ? "هفته سوم (۱۵-۲۱)" : "Week 3 (15-21)", start: 15, end: 21 },
    { label: isFa ? "هفته چهارم (۲۲-۳۱)" : "Week 4 (22-31)", start: 22, end: 31 },
  ];

  if (cards.length === 0) {
    return (
      <div className="view-empty-state">
        <p>{labels.noTasksInView}</p>
      </div>
    );
  }

  return (
    <div className="timeline-view" dir={isFa ? "rtl" : "ltr"}>
      <header className="timeline-header-bar">
        <h3>{labels.monthName}</h3>
        <span className="timeline-hint">
          {isFa
            ? `${cards.length} کار در خط زمان برنامه‌ریزی شده است`
            : `${cards.length} tasks scheduled on the timeline`}
        </span>
      </header>

      <div className="timeline-table-container">
        <div className="timeline-table">
          {/* Header Row */}
          <div className="timeline-grid-header">
            <div className="timeline-task-col-header">
              <span>{labels.taskName}</span>
            </div>
            <div className="timeline-tracks-header">
              <div className="timeline-weeks-row">
                {weeks.map((week, idx) => (
                  <div key={idx} className="timeline-week-cell" style={{ flex: week.end - week.start + 1 }}>
                    {week.label}
                  </div>
                ))}
              </div>
              <div className="timeline-days-row">
                {days.map((day) => (
                  <div key={day} className="timeline-day-num-cell">
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          <div className="timeline-body">
            {cards.map((card) => {
              const meta = cardMeta[card.id] || {
                tone: "idle",
                priority: "P2",
                startDay: 1,
                dueDay: 7,
                avatar: "",
              };
              const col = columns.find((c) => c.id === card.columnId);
              const phase = phases.find((p) => p.id === card.phase);
              const cardTitle = getLocalizedText(card.title, locale);

              const start = Math.max(1, Math.min(daysInMonth, meta.startDay || 1));
              const due = Math.max(start, Math.min(daysInMonth, meta.dueDay || start + 5));
              const leftPercent = ((start - 1) / daysInMonth) * 100;
              const widthPercent = Math.max(3.2, ((due - start + 1) / daysInMonth) * 100);

              return (
                <div key={card.id} className="timeline-row">
                  <div className="timeline-task-col">
                    <span className="avatar timeline-avatar" aria-hidden="true">
                      {meta.avatar ? <img src={meta.avatar} alt="" /> : null}
                    </span>
                    <div className="timeline-task-meta">
                      <span className="timeline-task-title" title={cardTitle}>
                        {cardTitle}
                      </span>
                      <div className="timeline-task-tags">
                        {phase ? (
                          <span className={`pill compact ${phase.badgeClass}`}>
                            {getLocalizedText(phase.label, locale)}
                          </span>
                        ) : null}
                        {col ? (
                          <span className="pill compact tone-idle">
                            {getLocalizedText(col.name, locale)}
                          </span>
                        ) : null}
                        {meta.priority ? (
                          <span className={`pill compact priority-${meta.priority.toLowerCase()}`}>
                            <span
                              className="priority-dot"
                              style={{
                                backgroundColor:
                                  meta.priority === "P1"
                                    ? "#d92d20"
                                    : meta.priority === "P2"
                                      ? "#f79009"
                                      : "#026aa2",
                              }}
                            />
                            {meta.priority === "P1"
                              ? labels.urgentPriority
                              : meta.priority === "P2"
                                ? labels.importantPriority
                                : labels.normalPriority}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="timeline-track-cell">
                    <div className="timeline-track-grid-bg">
                      {days.map((day) => (
                        <div key={day} className="timeline-grid-guide" />
                      ))}
                    </div>

                    <div
                      className={`timeline-bar tone-${meta.tone}`}
                      style={{
                        [isFa ? "right" : "left"]: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={`${cardTitle}: ${labels.timelineStart} ${start} - ${labels.timelineDue} ${due}`}
                    >
                      <span className="timeline-bar-text">{cardTitle}</span>
                      <span className="timeline-bar-dates">
                        {start} - {due}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
