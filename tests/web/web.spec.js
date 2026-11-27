// Testes Web (Playwright). Pré-requisito: aplicação rodando em http://localhost:3000 com a massa original.
const { test, expect } = require('@playwright/test');

const PASS = 'Senha@123';
async function login(page, email, senha = PASS) {
  await page.goto('/');
  await page.fill('#email', email);
  await page.fill('#password', senha);
  await page.click('form button[type=submit]');
}

test('CT-AUT-07 sem sessão exibe a tela de login', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#login')).toBeVisible();
  await expect(page.locator('#app')).toBeHidden();
  await expect(page.locator('#slip')).toBeHidden();
});

test('CT-LOG-14 senha inválida mostra erro e permanece no login', async ({ page }) => {
  await login(page, 'ana@empresa.com', 'Errada@1');
  await expect(page.locator('#loginErr')).toHaveText('E-mail ou senha inválidos.');
  await expect(page.locator('#login')).toBeVisible();
});

for (const [id, email, senha] of [
  ['CT-LOG-06 senha vazia', 'ana@empresa.com', ''],
  ['CT-LOG-08 e-mail em formato inválido', 'ana.empresa.com', PASS],
  ['CT-LOG-09 e-mail vazio', '', PASS]]) {
  test(`${id} (Web)`, async ({ page }) => {
    await login(page, email, senha);
    await expect(page.locator('#loginErr')).toHaveText(/.+/);
    await expect(page.locator('#app')).toBeHidden();
  });
}

test('CT-CON-01 Ana vê o holerite mais atual (fluxo completo)', async ({ page }) => {
  await login(page, 'ana@empresa.com');
  await expect(page.locator('#who')).toHaveText('Ana Souza');
  const slip = page.locator('#slip');
  await expect(slip).toContainText('Outubro de 2026');
  await expect(slip).toContainText(/Versão 2.*05\/11\/2026/);
  await expect(slip).toContainText(/R\$\s*5\.745,00/);
});

test('CT-CON-01 Bruno vê o holerite mais atual', async ({ page }) => {
  await login(page, 'bruno@empresa.com');
  await expect(page.locator('#who')).toHaveText('Bruno Lima');
  await expect(page.locator('#slip')).toContainText('Outubro de 2026');
  await expect(page.locator('#slip')).toContainText(/Versão 1/);
  await expect(page.locator('#slip')).toContainText(/R\$\s*6\.806,00/);
});

test('CT-CON-02 valores dos proventos e descontos da Ana', async ({ page }) => {
  await login(page, 'ana@empresa.com');
  const slip = page.locator('#slip');
  await expect(slip).toContainText(/Salário base.*6\.500,00/);
  await expect(slip).toContainText(/Ajuste retroativo.*350,00/);
  await expect(slip).toContainText(/INSS.*585,00/);
  await expect(slip).toContainText(/IRRF.*520,00/);
});

test('CT-CON-03 e CT-CON-09 Carla vê a mensagem e não vê o seletor', async ({ page }) => {
  await login(page, 'carla@empresa.com');
  await expect(page.locator('#empty')).toHaveText('Você ainda não possui holerites disponibilizados.');
  await expect(page.locator('#slip')).toBeHidden();
  await expect(page.locator('#pick')).toBeHidden();
  await expect(page.locator('#appErr')).toHaveText('');
});

test('CT-CON-06 e CT-CON-08 seletor da Ana: 2 opções, sem novembro, troca para setembro', async ({ page }) => {
  await login(page, 'ana@empresa.com');
  await expect(page.locator('#pick')).toBeVisible();
  await expect(page.locator('#comp option')).toHaveText(['Outubro de 2026', 'Setembro de 2026']);
  await page.selectOption('#comp', { label: 'Setembro de 2026' });
  await expect(page.locator('#slip')).toContainText(/Versão 1/);
  await expect(page.locator('#slip')).toContainText(/R\$\s*5\.395,00/);
});

test('CT-CON-06 seletor do Bruno: setembro mostra a v1 (v2 é rascunho)', async ({ page }) => {
  await login(page, 'bruno@empresa.com');
  await expect(page.locator('#comp option')).toHaveText(['Outubro de 2026', 'Setembro de 2026']);
  await page.selectOption('#comp', { label: 'Setembro de 2026' });
  await expect(page.locator('#slip')).toContainText(/Versão 1/);
});

test('CT-CON-11 login usando somente o teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ana@empresa.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type(PASS);
  await page.keyboard.press('Enter');
  await expect(page.locator('#who')).toHaveText('Ana Souza');
});

test('CT-AUT-08 logout encerra a sessão, inclusive após recarregar', async ({ page }) => {
  await login(page, 'ana@empresa.com');
  await expect(page.locator('#app')).toBeVisible();
  await page.click('#logout');
  await expect(page.locator('#login')).toBeVisible();
  await page.reload();
  await expect(page.locator('#login')).toBeVisible();
  await expect(page.locator('#slip')).toBeHidden();
});
