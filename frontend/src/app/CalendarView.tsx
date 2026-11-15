"use client";

import type { Card, Column, Locale, Phase } from "@/lib/board";
import { getLocalizedText } from "@/lib/board";
import type { CardMeta, Copy } from "./page";

export function CalendarView({
  cards,
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

  // Day names header
  const weekDays = isFa
    ? ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Dec 1, 2026 is Tuesday.
  // In Persian week starting Saturday: Saturday=Nov 28, Sunday=Nov 29, Monday=Nov 30 -> 3 empty padding cells.
  // In English week starting Sunday: Sunday=Nov 29, Monday=Nov 30 -> 2 empty padding cells.
  const paddingCount = isFa ? 3 : 2;
  const paddingCells = Array.from({ length: paddingCount }, (_, i) => i);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar-view" dir={isFa ? "rtl" : "ltr"}>
      <header className="calendar-header-bar">
        <h3>{labels.monthName}</h3>
        <span className="calendar-summary-stat">
          {isFa
            ? `${cards.length} کار در تقویم زمان‌بندی شده‌اند`
            : `${cards.length} tasks scheduled in calendar`}
        </span>
      </header>

      <div className="calendar-grid-container">
        <div className="calendar-weekdays-header">
          {weekDays.map((dayName, idx) => (
            <div key={idx} className="calendar-weekday-cell">
              {dayName}
            </div>
          ))}
        </div>

        <div className="calendar-month-grid">
          {paddingCells.map((pad) => (
            <div key={`pad-${pad}`} className="calendar-day-cell is-padding" />
          ))}

          {monthDays.map((day) => {
            const dayCards = cards.filter((card) => {
              const meta = cardMeta[card.id] || { startDay: 1, dueDay: 7 };
              const start = meta.startDay || 1;
              const due = meta.dueDay || start + 5;
              return day >= start && day <= due;
            });

            return (
              <div key={day} className={`calendar-day-cell${dayCards.length > 0 ? " has-tasks" : ""}`}>
                <div className="calendar-day-top">
                  <span className="calendar-day-num">{day}</span>
                  {dayCards.length > 0 ? (
                    <span className="calendar-day-count">{dayCards.length}</span>
                  ) : null}
                </div>

                <div className="calendar-day-tasks">
                  {dayCards.slice(0, 3).map((card) => {
                    const meta = cardMeta[card.id] || { tone: "idle" };
                    const phase = phases.find((p) => p.id === card.phase);
                    const cardTitle = getLocalizedText(card.title, locale);

                    return (
                      <div
                        key={card.id}
                        className={`calendar-task-pill tone-${meta.tone}`}
                        title={`${cardTitle} (${phase ? getLocalizedText(phase.label, locale) : ""})`}
                      >
                        <span className="calendar-task-dot" />
                        <span className="calendar-task-text">{cardTitle}</span>
                      </div>
                    );
                  })}
                  {dayCards.length > 3 ? (
                    <span className="calendar-more-hint">
                      +{dayCards.length - 3} {isFa ? "مورد دیگر" : "more"}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
