import { describe, expect, it } from "vitest";
import {
  addCard,
  deleteCard,
  initialBoard,
  matchesCardSearch,
  moveCard,
  renameColumn,
  updateCard,
} from "./board";

function freshBoard() {
  return {
    columns: initialBoard.columns.map((column) => ({
      ...column,
      name: { ...column.name },
    })),
    cards: initialBoard.cards.map((card) => ({
      ...card,
      title: { ...card.title },
      details: { ...card.details },
    })),
  };
}

describe("board state", () => {
  it("starts with exactly five fixed columns and sample cards", () => {
    const board = freshBoard();

    expect(board.columns).toHaveLength(5);
    expect(board.columns.map((column) => column.id)).toEqual([
      "backlog",
      "todo",
      "in-progress",
      "review",
      "done",
    ]);
    expect(board.cards.length).toBeGreaterThan(0);
    expect(board.columns[0].name.fa).toBe("درخواست‌های جدید");
  });

  it("adds a trimmed card to an existing column and keeps its entered text across locales", () => {
    const board = freshBoard();
    const updated = addCard(board, "todo", "  Draft the outline  ", "  First pass  ", "new-1");
    const added = updated.cards.at(-1);

    expect(added?.columnId).toBe("todo");
    expect(added?.title).toEqual({ en: "Draft the outline", fa: "Draft the outline" });
    expect(added?.details.en).toBe("First pass");
    expect(updated.columns).toHaveLength(5);
    expect(board.cards).toHaveLength(initialBoard.cards.length);
  });

  it("rejects blank titles and unknown destination columns when adding", () => {
    const board = freshBoard();

    expect(addCard(board, "todo", "  ", "details", "new-1")).toBe(board);
    expect(addCard(board, "unknown", "Task", "details", "new-1")).toBe(board);
  });

  it("matches cards by title or details regardless of active locale text", () => {
    const board = freshBoard();
    const card = board.cards.find((item) => item.id === "card-brief");
    expect(card).toBeDefined();
    if (!card) return;

    expect(matchesCardSearch(card, "")).toBe(true);
    expect(matchesCardSearch(card, "launch")).toBe(true);
    expect(matchesCardSearch(card, "روایت")).toBe(true);
    expect(matchesCardSearch(card, "missing")).toBe(false);
  });

  it("updates a card title and details while keeping the same id", () => {
    const board = freshBoard();
    const updated = updateCard(board, "card-brief", "  Refined story  ", "  Updated notes  ");

    expect(updated.cards.find((card) => card.id === "card-brief")?.title).toEqual({
      en: "Refined story",
      fa: "Refined story",
    });
    expect(updated.cards.find((card) => card.id === "card-brief")?.details.en).toBe("Updated notes");
    expect(updateCard(board, "card-brief", "  ", "notes")).toBe(board);
    expect(updateCard(board, "missing", "Title", "details")).toBe(board);
  });

  it("deletes only the selected card", () => {
    const board = freshBoard();
    const updated = deleteCard(board, "card-brief");

    expect(updated.cards.some((card) => card.id === "card-brief")).toBe(false);
    expect(updated.cards).toHaveLength(board.cards.length - 1);
    expect(deleteCard(board, "missing-card")).toBe(board);
  });

  it("renames a column in both locales without changing the fixed column set", () => {
    const board = freshBoard();
    const updated = renameColumn(board, "todo", "  Ready next  ", "en");

    expect(updated.columns).toHaveLength(5);
    expect(updated.columns.find((column) => column.id === "todo")?.name).toEqual({
      en: "Ready next",
      fa: "Ready next",
    });
    expect(renameColumn(board, "todo", "  ", "fa")).toBe(board);
    expect(renameColumn(board, "missing-column", "Name", "en")).toBe(board);
  });

  it("moves cards between columns and places them before a target card", () => {
    const board = freshBoard();
    const updated = moveCard(board, "card-brief", "in-progress", "card-components");
    const moved = updated.cards.find((card) => card.id === "card-brief");
    const targetIndex = updated.cards.findIndex((card) => card.id === "card-components");

    expect(moved?.columnId).toBe("in-progress");
    expect(updated.cards[targetIndex - 1]?.id).toBe("card-brief");
    expect(updated.columns).toHaveLength(5);
  });

  it("reorders within a column and ignores unknown cards or columns", () => {
    const board = freshBoard();
    const updated = moveCard(board, "card-interviews", "backlog", "card-brief");

    expect(updated.cards.findIndex((card) => card.id === "card-interviews")).toBeLessThan(
      updated.cards.findIndex((card) => card.id === "card-brief"),
    );
    expect(moveCard(board, "missing-card", "todo")).toBe(board);
    expect(moveCard(board, "card-brief", "missing-column")).toBe(board);
  });
});
