import { expect, test } from "@playwright/test";

test("landing pública acolhe iniciantes e permite ir ao login", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /a chama que te move/i })).toBeVisible();
  const primaryCta = page.getByRole("link", { name: "Quero começar na FLERNK" });
  await expect(primaryCta).toHaveAttribute("href", /instagram\.com\/flernk\.assessoria/);
  await expect(primaryCta).toHaveAttribute("target", "_blank");
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Seu próximo passo pode começar agora." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Falar com a FLERNK no Instagram" })).toHaveAttribute(
    "href",
    /instagram\.com\/flernk\.assessoria/,
  );
  await expect(page.getByRole("heading", { name: /encontre o ponto de partida/i })).toBeVisible();
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
