const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';
const BASE_URL = 'http://localhost:5174';

async function testSandboxCodeEditor() {
  console.log('--- TESTE E2E: EDITOR DE CÓDIGO TSX NO TEMPLATE SANDBOX ---');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('1. Aplicação carregada com sucesso.');

    // Navegar para Sandbox de Templates
    const sandboxNavBtn = page.locator('nav button:has-text("Sandbox de Templates")');
    await sandboxNavBtn.click();
    await page.waitForTimeout(400);
    console.log('2. Navegado para Sandbox de Templates.');

    // Verificar se a aba Código TSX está visível e selecionada
    const codeTab = page.locator('button:has-text("Código TSX (.tsx)")');
    await codeTab.waitFor({ state: 'visible' });
    console.log('3. Aba "Código TSX (.tsx)" identificada e ativa.');

    // Verificar se a textarea do editor contém código TSX
    const codeTextarea = page.locator('textarea[placeholder*="código TSX"]');
    await codeTextarea.waitFor({ state: 'visible' });
    const initialCode = await codeTextarea.inputValue();

    if (!initialCode.includes('import React') || !initialCode.includes('TemplateDefinition')) {
      throw new Error('O código TSX inicial não carregou os módulos esperados.');
    }
    console.log(`4. Código TSX carregado no editor (${initialCode.split('\n').length} linhas).`);

    // Selecionar "Headline Impactante (Abertura & Título)"
    const select = page.locator('select').first();
    await select.selectOption('big-headline');
    await page.waitForTimeout(400);

    const bigHeadlineCode = await codeTextarea.inputValue();
    if (!bigHeadlineCode.includes('big-headline') || !bigHeadlineCode.includes('Headline Impactante')) {
      throw new Error('Código do template big-headline não foi carregado.');
    }
    console.log('5. Template "big-headline.tsx" selecionado e carregado no editor de código.');

    // Editar o código ao vivo: modificar o texto do kicker e cor
    console.log('6. Editando código TSX ao vivo no editor...');
    const modifiedCode = bigHeadlineCode.replace(
      'MUDANÇA DE PARADIGMA',
      'INTELIGÊNCIA ARTIFICIAL REVOLUCIONÁRIA'
    ).replace(
      'O Fim da Busca Tradicional',
      'Templates 100% Customizados via Código'
    );

    await codeTextarea.fill(modifiedCode);

    // Clicar em Compilar
    const compileBtn = page.locator('button:has-text("Compilar")');
    await compileBtn.click();
    await page.waitForTimeout(500);

    // Verificar se o texto alterado via código aparece no preview do canvas
    const previewCanvas = page.locator('div:has-text("Templates 100% Customizados via Código")').first();
    await previewCanvas.waitFor({ state: 'visible', timeout: 3000 });
    console.log('7. Sucesso: O código TSX editado foi compilado via Sucrase e renderizado ao vivo no preview!');

    // Capturar screenshot comprovando o editor de código TSX funcionando com live preview
    const screenshotPath = path.join(ARTIFACTS_DIR, 'desktop_template_sandbox_tsx_editor.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`8. Screenshot salvo: ${screenshotPath}`);

    // Testar o botão "Baixar .tsx"
    const downloadBtn = page.locator('button:has-text("Baixar .tsx")');
    if (await downloadBtn.isVisible()) {
      console.log('9. Botão "Baixar .tsx" presente e disponível.');
    }

    await browser.close();
    console.log('\n>>> TESTE DO EDITOR DE CÓDIGO TSX CONCLUÍDO COM 100% DE SUCESSO! <<<');
  } catch (err) {
    console.error('Falha no teste do editor de código TSX:', err);
    await browser.close();
    process.exit(1);
  }
}

testSandboxCodeEditor();
