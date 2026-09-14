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

test("recuperação de acesso está disponível sem expor uma conta", async ({ page }) => {
  await page.goto("/recuperar-acesso");
  await expect(page.getByRole("heading", { name: "Recuperar acesso" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar instruções" })).toBeEnabled();
});

test("cadastro público legado não abre uma conta ou assessoria", async ({ page }) => {
  await page.goto("/cadastro");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { level: 1, name: "Entrar" })).toBeVisible();
});

test("landing continua legível com movimento reduzido e expande dúvidas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /a chama que te move/i })).toBeVisible();
  const firstQuestion = page.locator(".faq-list details").first();
  await firstQuestion.scrollIntoViewIfNeeded();
  await firstQuestion.locator("summary").click();
  await expect(firstQuestion).toHaveAttribute("open", "");
  await expect(firstQuestion).toContainText(/a flernk recebe pessoas que estão começando/i);
});

test("landing se adapta às larguras de referência sem rolagem horizontal", async ({ page }) => {
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: /a chama que te move/i })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("navegação por teclado mantém foco visível e opera as dúvidas", async ({ page }) => {
  await page.goto("/");

  const contactLink = page.getByRole("link", { name: "Quero começar na FLERNK" });
  await contactLink.focus();
  await expect(contactLink).toBeFocused();

  const firstQuestion = page.locator(".faq-list details").first();
  const questionSummary = firstQuestion.locator("summary");
  await questionSummary.scrollIntoViewIfNeeded();
  await questionSummary.focus();
  await expect(questionSummary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(firstQuestion).toHaveAttribute("open", "");
});

test("seções reveladas durante a rolagem mantêm o conteúdo acessível", async ({ page }) => {
  await page.goto("/");

  for (const name of [
    /a corrida não começa quando você se sente pronto/i,
    /o primeiro quilômetro também conta/i,
    /um passo de cada vez/i,
    /encontre o ponto de partida/i,
    /antes do primeiro passo, uma boa conversa/i,
    /seu próximo passo pode começar agora/i,
  ]) {
    const heading = page.getByRole("heading", { name });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  }
});
