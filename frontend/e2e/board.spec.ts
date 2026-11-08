import { expect, test } from "@playwright/test";

test("shows the seeded five-column board", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Project board" })).toBeVisible();
  await expect(page.locator(".board-column")).toHaveCount(5);
  await expect(page.getByText("Shape the launch story")).toBeVisible();
  await expect(page.getByText("Choose the core palette")).toBeVisible();
});

test("switches to Persian and renders the board right-to-left", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "FA" }).click();

  await expect(page.locator("main.app-shell")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "تخته پروژه" })).toBeVisible();
  await expect(page.locator('[data-column-id="in-progress"] h2')).toHaveText("در حال انجام");
  await expect(page.getByText("روایت رونمایی را شکل بده")).toBeVisible();
});

test("renames a column and keeps the entered name after switching languages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Rename column: To Do" }).click();
  const nameInput = page.getByRole("textbox", { name: "Rename column" });
  await nameInput.fill("Ready next");
  await nameInput.press("Enter");
  await expect(page.locator('[data-column-id="todo"] h2')).toHaveText("Ready next");

  await page.getByRole("button", { name: "FA" }).click();
  await expect(page.locator('[data-column-id="todo"] h2')).toHaveText("Ready next");
});

test("adds a card with optional details and deletes it", async ({ page }) => {
  await page.goto("/");
  const todo = page.locator('[data-column-id="todo"]');
  await todo.getByRole("button", { name: "Add a card" }).click();
  await todo.getByRole("textbox", { name: "Card title" }).fill("Prepare the handoff");
  await todo.getByRole("textbox", { name: "Details" }).fill("Share the final notes.");
  await todo.getByRole("button", { name: "Add card" }).click();

  await expect(todo.getByText("Prepare the handoff")).toBeVisible();
  await expect(todo.getByText("Share the final notes.")).toBeVisible();
  await todo.getByRole("button", { name: "Delete Prepare the handoff" }).click();
  await expect(todo.getByText("Prepare the handoff")).toHaveCount(0);
});

test("moves a card by dragging it into another column", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('[data-card-id="card-brief"]');
  const destination = page.locator('[data-column-id="in-progress"]');
  await card.locator(".drag-handle").dragTo(destination, {
    targetPosition: { x: 140, y: 110 },
  });

  await expect(destination.locator('[data-card-id="card-brief"]')).toHaveCount(1);
  await expect(page.locator('[data-column-id="backlog"] [data-card-id="card-brief"]')).toHaveCount(0);
});

test("keeps columns horizontally scrollable on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const boardScroll = page.locator(".board-scroll");
  const dimensions = await boardScroll.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await expect(page.locator(".board-column")).toHaveCount(5);
});
