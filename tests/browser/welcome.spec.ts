import { test, expect } from "@playwright/test";
test("welcome explains features before signup and fits viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "BE WELL. BUILD YOURSELF." }),
  ).toBeVisible();
  await expect(page.getByText("Train with intention.")).toBeVisible();
  await expect(page.getByText("Fuel your potential.")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "BE WELL", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Build your beginning." }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("test@example.com");
  await page
    .getByLabel("Password · at least 8 characters")
    .fill("test-password-only");
  await page
    .getByRole("button", { name: "CREATE ACCOUNT", exact: true })
    .click();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "Authentication is not configured",
  );
});
test("password recovery and reload do not invent account state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "BE WELL", exact: true }).click();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Get back on track." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "BE WELL. BUILD YOURSELF." }),
  ).toBeVisible();
});
test("mutations reject GET and cross-origin requests", async ({ request }) => {
  const get = await request.get("/api/generate");
  expect(get.status()).toBe(405);
  const post = await request.post("/api/preferences", {
    headers: { Origin: "https://attacker.example" },
    data: {},
  });
  expect(post.status()).toBe(403);
  const hook = await request.post("/api/webhook", { data: {} });
  expect(hook.status()).toBe(503);
});
