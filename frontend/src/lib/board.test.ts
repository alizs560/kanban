import { describe, expect, it } from "vitest";
import {
  addCard,
  addColumn,
  addPhase,
  boardPhases,
  deleteCard,
  deleteColumn,
  deletePhase,
  formatScheduleDate,
  getBoardPhases,
  initialBoard,
  matchesCardSearch,
  moveCard,
  renameColumn,
  renamePhase,
  updateCard,
} from "./board";

function freshBoard() {
  return {
    columns: initialBoard.columns.map((column) => ({
      ...column,
      name: { ...column.name },
    })),
    phases: (initialBoard.phases || []).map((phase) => ({
      ...phase,
      label: { ...phase.label },
    })),
    cards: initialBoard.cards.map((card) => ({
      ...card,
      title: { ...card.title },
      details: { ...card.details },
    })),
  };
}

describe("board state", () => {
  it("starts with three simplified kanban columns and phased cards", () => {
    const board = freshBoard();

    expect(board.columns).toHaveLength(3);
    expect(board.columns.map((column) => column.id)).toEqual([
      "todo",
      "in-progress",
      "done",
    ]);
    expect(board.cards.length).toBeGreaterThan(0);
    expect(board.columns[0].name.fa).toBe("لیست کارها");

    const todoCards = board.cards.filter((card) => card.columnId === "todo");
    expect(todoCards.length).toBeGreaterThanOrEqual(7);

    expect(boardPhases).toHaveLength(5);
  });

  it("adds a trimmed card to an existing column and keeps its entered text across locales", () => {
    const board = freshBoard();
    const updated = addCard(board, "todo", "  Draft the outline  ", "  First pass  ", "new-1", "brand");
    const added = updated.cards.at(-1);

    expect(added?.columnId).toBe("todo");
    expect(added?.phase).toBe("brand");
    expect(added?.title).toEqual({ en: "Draft the outline", fa: "Draft the outline" });
    expect(added?.details.en).toBe("First pass");
    expect(updated.columns).toHaveLength(3);
    expect(board.cards).toHaveLength(initialBoard.cards.length);
  });

  it("rejects blank titles and unknown destination columns when adding", () => {
    const board = freshBoard();

    expect(addCard(board, "todo", "  ", "details", "new-1")).toBe(board);
    expect(addCard(board, "unknown", "Task", "details", "new-1")).toBe(board);
  });

  it("matches cards by title or details regardless of active locale text", () => {
    const board = freshBoard();
    const card = board.cards.find((item) => item.id === "card-brand-concept");
    expect(card).toBeDefined();
    if (!card) return;

    expect(matchesCardSearch(card, "")).toBe(true);
    expect(matchesCardSearch(card, "Brand")).toBe(true);
    expect(matchesCardSearch(card, "روایت")).toBe(true);
    expect(matchesCardSearch(card, "missing")).toBe(false);
  });

  it("updates a card title and details while keeping the same id", () => {
    const board = freshBoard();
    const updated = updateCard(board, "card-brand-concept", "  Refined story  ", "  Updated notes  ");

    expect(updated.cards.find((card) => card.id === "card-brand-concept")?.title).toEqual({
      en: "Refined story",
      fa: "Refined story",
    });
    expect(updated.cards.find((card) => card.id === "card-brand-concept")?.details.en).toBe("Updated notes");
    expect(updateCard(board, "card-brand-concept", "  ", "notes")).toBe(board);
    expect(updateCard(board, "missing", "Title", "details")).toBe(board);

    const updatedFa = updateCard(board, "card-brand-concept", "داستان بازنویسی شده", "توضیحات جدید", "fa");
    const faCard = updatedFa.cards.find((card) => card.id === "card-brand-concept");
    expect(faCard?.title.fa).toBe("داستان بازنویسی شده");
    expect(faCard?.title.en).toBe(board.cards.find((card) => card.id === "card-brand-concept")?.title.en);
  });

  it("deletes only the selected card", () => {
    const board = freshBoard();
    const updated = deleteCard(board, "card-brand-concept");

    expect(updated.cards.some((card) => card.id === "card-brand-concept")).toBe(false);
    expect(updated.cards).toHaveLength(board.cards.length - 1);
    expect(deleteCard(board, "missing-card")).toBe(board);
  });

  it("renames a column in both locales without changing the column count", () => {
    const board = freshBoard();
    const updated = renameColumn(board, "todo", "  Ready next  ", "en");

    expect(updated.columns).toHaveLength(3);
    expect(updated.columns.find((column) => column.id === "todo")?.name).toEqual({
      en: "Ready next",
      fa: "Ready next",
    });
    expect(renameColumn(board, "todo", "  ", "fa")).toBe(board);
    expect(renameColumn(board, "missing-column", "Name", "en")).toBe(board);
  });

  it("adds and deletes columns properly while preserving cards", () => {
    const board = freshBoard();
    const withNewCol = addColumn(board, "Review", "en", "col-review");

    expect(withNewCol.columns).toHaveLength(4);
    expect(withNewCol.columns.at(-1)?.id).toBe("col-review");
    expect(withNewCol.columns.at(-1)?.name.en).toBe("Review");

    const deleted = deleteColumn(withNewCol, "col-review");
    expect(deleted.columns).toHaveLength(3);

    // If deleting column with cards, cards are moved to first column safely
    const cardInDone = board.cards.find((c) => c.columnId === "done");
    expect(cardInDone).toBeDefined();
    const deletedDone = deleteColumn(board, "done");
    expect(deletedDone.columns).toHaveLength(2);
    const movedCard = deletedDone.cards.find((c) => c.id === cardInDone?.id);
    expect(movedCard?.columnId).toBe("todo");
  });

  it("adds, renames, and deletes workflow phases", () => {
    const board = freshBoard();
    const withPhase = addPhase(board, "Mobile App", "en", "phase-mobile");

    expect(getBoardPhases(withPhase)).toHaveLength(6);
    expect(getBoardPhases(withPhase).at(-1)?.id).toBe("phase-mobile");
    expect(getBoardPhases(withPhase).at(-1)?.label.en).toBe("Mobile App");

    const renamed = renamePhase(withPhase, "phase-mobile", "iOS App", "en");
    expect(getBoardPhases(renamed).find((p) => p.id === "phase-mobile")?.label.en).toBe("iOS App");

    const deleted = deletePhase(renamed, "phase-mobile");
    expect(getBoardPhases(deleted)).toHaveLength(5);
  });

  it("moves cards between columns and places them before a target card", () => {
    const board = freshBoard();
    const updated = moveCard(board, "card-typography-system", "in-progress", "card-components");
    const moved = updated.cards.find((card) => card.id === "card-typography-system");
    const targetIndex = updated.cards.findIndex((card) => card.id === "card-components");

    expect(moved?.columnId).toBe("in-progress");
    expect(updated.cards[targetIndex - 1]?.id).toBe("card-typography-system");
    expect(updated.columns).toHaveLength(3);
  });

  it("reorders within a column and ignores unknown cards or columns", () => {
    const board = freshBoard();
    const updated = moveCard(board, "card-typography-system", "todo", "card-user-flow");

    expect(updated.cards.findIndex((card) => card.id === "card-typography-system")).toBeLessThan(
      updated.cards.findIndex((card) => card.id === "card-user-flow"),
    );
    expect(moveCard(board, "missing-card", "todo")).toBe(board);
    expect(moveCard(board, "card-brand-concept", "missing-column")).toBe(board);
  });

  it("formats task schedule date ranges correctly in Persian and English", () => {
    expect(formatScheduleDate(1, 5, "en")).toBe("Dec 1 - 5");
    expect(formatScheduleDate(4, 4, "en")).toBe("Dec 4");
    expect(formatScheduleDate(3, 8, "fa")).toBe("۳ تا ۸ دسامبر");
    expect(formatScheduleDate(10, 10, "fa")).toBe("۱۰ دسامبر");
  });
});
