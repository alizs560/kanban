"use client";

import type { Card, Column, Locale, Phase } from "@/lib/board";
import { getLocalizedText } from "@/lib/board";
import type { CardMeta, Copy } from "./page";

export function ProgressView({
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
  const total = cards.length;

  // Status metrics
  const doneCards = cards.filter((c) => {
    const meta = cardMeta[c.id];
    return c.columnId === "done" || meta?.tone === "done";
  });
  const inProgressCards = cards.filter((c) => {
    const meta = cardMeta[c.id];
    return (c.columnId === "in-progress" || meta?.tone === "ongoing" || meta?.tone === "started") && !doneCards.includes(c);
  });
  const todoCards = cards.filter((c) => !doneCards.includes(c) && !inProgressCards.includes(c));

  const percentDone = total > 0 ? Math.round((doneCards.length / total) * 100) : 0;
  const percentInProgress = total > 0 ? Math.round((inProgressCards.length / total) * 100) : 0;
  const percentTodo = Math.max(0, 100 - percentDone - percentInProgress);

  // Priority metrics
  const p1Count = cards.filter((c) => (cardMeta[c.id]?.priority || "P2") === "P1").length;
  const p2Count = cards.filter((c) => (cardMeta[c.id]?.priority || "P2") === "P2").length;
  const p3Count = cards.filter((c) => (cardMeta[c.id]?.priority || "P2") === "P3").length;

  return (
    <div className="progress-dashboard-view" dir={isFa ? "rtl" : "ltr"}>
      <header className="progress-dashboard-header">
        <div>
          <h3>{labels.overallProgress}</h3>
          <p className="progress-subtitle">
            {isFa
              ? "وضعیت و شاخص‌های کلیدی پیشرفت توسعه وب‌سایت پورتفولیو"
              : "Key performance indicators & portfolio website progress"}
          </p>
        </div>
        <div className="progress-overall-badge">
          <span className="progress-percent-large">{percentDone}%</span>
          <span className="progress-percent-caption">
            {isFa ? "تکمیل شده" : "Completed"}
          </span>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="progress-kpi-grid">
        <div className="progress-kpi-card card-total">
          <span className="kpi-label">{isFa ? "کل کارها" : "Total Tasks"}</span>
          <span className="kpi-value">{total}</span>
          <span className="kpi-subtext">{isFa ? "در تمام بخش‌ها" : "Across all phases"}</span>
        </div>

        <div className="progress-kpi-card card-done">
          <span className="kpi-label">{labels.tasksCompleted}</span>
          <span className="kpi-value">{doneCards.length}</span>
          <span className="kpi-subtext">{percentDone}% {isFa ? "کل پروژه" : "of project"}</span>
        </div>

        <div className="progress-kpi-card card-ongoing">
          <span className="kpi-label">{labels.tasksInProgress}</span>
          <span className="kpi-value">{inProgressCards.length}</span>
          <span className="kpi-subtext">{percentInProgress}% {isFa ? "در حال پیاده‌سازی" : "in development"}</span>
        </div>

        <div className="progress-kpi-card card-todo">
          <span className="kpi-label">{labels.tasksRemaining}</span>
          <span className="kpi-value">{todoCards.length}</span>
          <span className="kpi-subtext">{percentTodo}% {isFa ? "در صف شروع" : "queued"}</span>
        </div>
      </div>

      {/* Overall Multi-Segment Progress Bar */}
      <div className="progress-overview-section">
        <div className="progress-segment-bar-container">
          <div
            className="progress-segment segment-done"
            style={{ width: `${percentDone}%` }}
            title={`${labels.tasksCompleted}: ${percentDone}%`}
          />
          <div
            className="progress-segment segment-ongoing"
            style={{ width: `${percentInProgress}%` }}
            title={`${labels.tasksInProgress}: ${percentInProgress}%`}
          />
          <div
            className="progress-segment segment-todo"
            style={{ width: `${percentTodo}%` }}
            title={`${labels.tasksRemaining}: ${percentTodo}%`}
          />
        </div>

        <div className="progress-legend">
          <div className="legend-item">
            <span className="legend-dot dot-done" />
            <span>{labels.tasksCompleted} ({doneCards.length})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-ongoing" />
            <span>{labels.tasksInProgress} ({inProgressCards.length})</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-todo" />
            <span>{labels.tasksRemaining} ({todoCards.length})</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Phase Progress & Priority Distribution */}
      <div className="progress-details-grid">
        {/* Phase Progress Card */}
        <div className="progress-detail-card">
          <h4>{labels.phaseProgress}</h4>
          <div className="phase-progress-list">
            {phases.map((phase) => {
              const phaseCards = cards.filter((c) => c.phase === phase.id);
              const phaseDone = phaseCards.filter((c) => {
                const meta = cardMeta[c.id];
                return c.columnId === "done" || meta?.tone === "done";
              }).length;
              const phasePercent = phaseCards.length > 0 ? Math.round((phaseDone / phaseCards.length) * 100) : 0;

              return (
                <div key={phase.id} className="phase-progress-item">
                  <div className="phase-progress-info">
                    <span className={`pill ${phase.badgeClass}`}>
                      {getLocalizedText(phase.label, locale)}
                    </span>
                    <span className="phase-progress-counts">
                      {phaseDone} / {phaseCards.length} ({phasePercent}%)
                    </span>
                  </div>
                  <div className="phase-progress-bar-bg">
                    <div
                      className="phase-progress-bar-fill"
                      style={{ width: `${phasePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority & Column Distribution Card */}
        <div className="progress-detail-card">
          <h4>{labels.priorityDistribution}</h4>
          <div className="priority-progress-list">
            <div className="priority-item">
              <div className="priority-item-header">
                <span className="pill priority-p1">
                  <span className="priority-dot" style={{ backgroundColor: "#d92d20" }} />
                  {labels.urgentPriority}
                </span>
                <span className="priority-count">{p1Count} {isFa ? "کار" : "tasks"}</span>
              </div>
              <div className="priority-bar-bg">
                <div
                  className="priority-bar-fill fill-p1"
                  style={{ width: `${total > 0 ? (p1Count / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-item-header">
                <span className="pill priority-p2">
                  <span className="priority-dot" style={{ backgroundColor: "#f79009" }} />
                  {labels.importantPriority}
                </span>
                <span className="priority-count">{p2Count} {isFa ? "کار" : "tasks"}</span>
              </div>
              <div className="priority-bar-bg">
                <div
                  className="priority-bar-fill fill-p2"
                  style={{ width: `${total > 0 ? (p2Count / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-item-header">
                <span className="pill priority-p3">
                  <span className="priority-dot" style={{ backgroundColor: "#026aa2" }} />
                  {labels.normalPriority}
                </span>
                <span className="priority-count">{p3Count} {isFa ? "کار" : "tasks"}</span>
              </div>
              <div className="priority-bar-bg">
                <div
                  className="priority-bar-fill fill-p3"
                  style={{ width: `${total > 0 ? (p3Count / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="column-distribution-box">
            <h5>{labels.columnHeader}</h5>
            <div className="column-stat-chips">
              {columns.map((col) => {
                const count = cards.filter((c) => c.columnId === col.id).length;
                return (
                  <div key={col.id} className="column-stat-chip">
                    <span className="col-stat-name">{getLocalizedText(col.name, locale)}</span>
                    <span className="col-stat-num">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
