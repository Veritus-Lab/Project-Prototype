import { expect, test } from "@playwright/test";

test("landing pública apresenta a marca e permite ir ao login", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /FLERNK: evolua/i })).toBeVisible();
  await page.getByRole("banner").getByRole("link", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
});

test("login anônimo expõe campos acessíveis sem enviar credenciais", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeEnabled();
});
