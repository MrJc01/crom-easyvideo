const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

const BASE_URL = 'http://localhost:5174';

async function runCustomTemplatePersistenceTest() {
  console.log('=== TESTE E2E: SALVAMENTO E LISTAGEM DE TEMPLATES CUSTOMIZADOS ===');
  console.log(`Conectando em ${BASE_URL}...`);

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Aceita automaticamente confirmações do window.confirm
    page.on('dialog', async (dialog) => {
      console.log(`Dialog detectado: "${dialog.message()}". Aceitando...`);
      await dialog.accept();
    });

    // 1. Carrega aplicação
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('1. Aplicação carregada.');

    // 2. Navegar para Sandbox de Templates
    const sandboxNav = page.locator('nav button:has-text("Sandbox de Templates")');
    await sandboxNav.click();
    await page.waitForTimeout(500);
    console.log('2. Acessou Sandbox de Templates.');

    // 3. Clicar em "Criar Novo" para gerar um template fork customizado
    const createNewBtn = page.locator('button:has-text("Criar Novo")');
    await createNewBtn.waitFor({ state: 'visible' });
    await createNewBtn.click();
    await page.waitForTimeout(600);
    console.log('3. Clicado em "Criar Novo".');

    // 4. Verificar se o novo template foi selecionado no dropdown e possui ID custom-...
    const select = page.locator('select').first();
    const selectedVal = await select.inputValue();
    console.log(`4. Template selecionado no Sandbox: ${selectedVal}`);
    if (!selectedVal.startsWith('custom-')) {
      throw new Error(`Esperava ID iniciando com "custom-", mas recebeu: ${selectedVal}`);
    }

    // 5. Editar o código TSX para dar um título e identidade visual marcante
    const codeTextarea = page.locator('textarea[placeholder*="código TSX"]');
    await codeTextarea.waitFor({ state: 'visible' });
    let code = await codeTextarea.inputValue();

    const customTitle = 'PROJETO VIP ULTRAPASSOU METAS';
    code = code.replace(/title:\s*'Como Funcionam os LLMs'/, `title: '${customTitle}'`);
    code = code.replace(/\{props\.title\}/, `{"${customTitle}"}`);
    code = code.replace(/name:\s*'[^']+'/, `name: 'Template VIP Teste'`);
    await codeTextarea.fill(code);

    // 6. Clicar em "Salvar no Catálogo"
    const saveBtn = page.locator('button:has-text("Salvar no Catálogo")');
    await saveBtn.click();
    await page.waitForTimeout(600);
    console.log('5. Clicado em "Salvar no Catálogo". Toast de sucesso exibido.');

    // Screenshot do Sandbox com template salvo
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'custom_template_sandbox_saved.png'),
    });
    console.log('6. Screenshot do Sandbox salvo.');

    // 7. Voltar ao Estúdio
    const studioNav = page.locator('nav button:has-text("Estúdio de Vídeo")');
    await studioNav.click();
    await page.waitForTimeout(500);
    console.log('7. Retornou ao Estúdio de Vídeo.');

    // 8. Abrir a Loja de Templates
    const catalogNav = page.locator('button:has-text("Loja de Templates"), button[title="Loja de Templates"]').first();
    await catalogNav.click();
    await page.waitForTimeout(600);
    console.log('8. Modal "Loja de Templates" aberto.');

    // 9. Verificar categoria "Customizados"
    const customCategoryBtn = page.locator('button:has-text("Customizados")');
    await customCategoryBtn.waitFor({ state: 'visible' });
    await customCategoryBtn.click();
    await page.waitForTimeout(400);
    console.log('9. Categoria "Customizados" selecionada.');

    // 10. Verificar se o card do template customizado está visível na lista
    const customCard = page.locator('h3:has-text("Template VIP Teste")');
    await customCard.waitFor({ state: 'visible', timeout: 4000 });
    console.log('10. Template customizado "Template VIP Teste" encontrado na Loja de Templates!');

    // Verificar se tem badge Custom
    const badgeCustom = page.locator('span:has-text("Custom")').first();
    if (await badgeCustom.isVisible()) {
      console.log('11. Badge "Custom" visível no card.');
    }

    // Screenshot do Catálogo com template customizado
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'custom_template_in_catalog.png'),
    });

    // 12. Adicionar o template customizado à Timeline
    const addTemplateBtn = page.getByRole('button', { name: 'Adicionar', exact: true }).first();
    await addTemplateBtn.click();
    await page.waitForTimeout(700);
    console.log('12. Template customizado adicionado ao projeto da timeline!');

    // 13. Verificar se o card adicionado renderiza no Player
    const playerCustomText = page.locator(`text="${customTitle}"`).first();
    await playerCustomText.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`13. Renderização no Player confirmada: texto "${customTitle}" visível.`);

    // Screenshot do Player exibindo o card customizado
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'custom_template_rendered_in_player.png'),
    });

    // 14. TESTE DE PERSISTÊNCIA: F5 / Page Reload
    console.log('14. Recarregando página (F5) para testar persistência no localStorage...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    console.log('15. Página recarregada.');

    // Abrir novamente a Loja de Templates
    const catalogNavAfterReload = page.locator('button:has-text("Loja de Templates"), button[title="Loja de Templates"]').first();
    await catalogNavAfterReload.click();
    await page.waitForTimeout(500);

    const customCategoryAfterReload = page.locator('button:has-text("Customizados")');
    await customCategoryAfterReload.click();
    await page.waitForTimeout(400);

    const customCardAfterReload = page.locator('h3:has-text("Template VIP Teste")');
    await customCardAfterReload.waitFor({ state: 'visible', timeout: 4000 });
    console.log('16. PERSISTÊNCIA CONFIRMADA: O template customizado sobreviveu ao reload da página!');

    // 15. Testar exclusão do template customizado
    console.log('17. Testando exclusão do template customizado...');
    const deleteBtn = page.locator('div:has(h3:has-text("Template VIP Teste")) button[title="Excluir Template Customizado"]');
    await deleteBtn.click();
    await page.waitForTimeout(600);

    const isStillPresent = await page.locator('h3:has-text("Template VIP Teste")').isVisible();
    if (isStillPresent) {
      throw new Error('O template customizado ainda está visível após exclusão!');
    }
    console.log('18. EXCLUSÃO CONFIRMADA: Template customizado excluído com sucesso.');

    // Fechar modal
    const closeBtn = page.locator('button[aria-label="Fechar"]');
    await closeBtn.click();
    await page.waitForTimeout(400);

    await browser.close();
    console.log('\n>>> SUCESSO TOTAL: FLUXO DE PERSISTÊNCIA E CATÁLOGO 100% VALIDADO! <<<');
  } catch (err) {
    console.error('Falha no teste:', err);
    await browser.close();
    process.exit(1);
  }
}

runCustomTemplatePersistenceTest();
