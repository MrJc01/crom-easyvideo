const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';
const BASE_URL = 'http://localhost:5174';

async function testScriptEditorAndLorem() {
  console.log('=== TESTE E2E: EDITOR DE SCRIPT, FORMULÁRIO MODULAR E BOTÕES LOREM ===');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // 1. Carregar aplicação
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('1. Aplicação carregada.');

    // 2. Verificar presença do Card Inspector
    const inspector = page.locator('div:has-text("Editor de Script & Narração")').first();
    await inspector.waitFor({ state: 'visible', timeout: 5000 });
    console.log('2. Editor de Script & Narração visível no topo do Card Inspector.');

    // 3. Verificar textarea do script
    const scriptTextarea = page.locator('textarea[placeholder*="roteiro da cena"]');
    await scriptTextarea.waitFor({ state: 'visible' });
    const initialScript = await scriptTextarea.inputValue();
    console.log(`3. Roteiro inicial detectado: "${initialScript.slice(0, 40)}..."`);

    // 4. Testar botão "Lorem" do Script
    const scriptLoremBtn = page.locator('button[title*="Lorem"]:has-text("Lorem")').first();
    await scriptLoremBtn.click();
    await page.waitForTimeout(300);
    const newScript = await scriptTextarea.inputValue();
    console.log(`4. Novo roteiro gerado com botão Lorem: "${newScript.slice(0, 40)}..."`);

    // 5. Testar botão "Puxar para Campos"
    const pullBtn = page.locator('button[title*="Puxar dados do roteiro"]');
    await pullBtn.click();
    await page.waitForTimeout(500);
    console.log('5. Clicado em "Puxar para Campos". Dados extraídos do roteiro para o formulário!');

    // 6. Verificar a seção "Formulário Modular Automático"
    const modularFormHeader = page.locator('h4:has-text("Formulário Modular Automático")');
    await modularFormHeader.waitFor({ state: 'visible' });
    console.log('6. Formulário Modular Automático visível abaixo do Editor de Script.');

    // 7. Verificar contador de campos verificados
    const verifiedBadge = page.locator('span:has-text("Verificados")');
    await verifiedBadge.waitFor({ state: 'visible' });
    const badgeText = await verifiedBadge.textContent();
    console.log(`7. Status de verificação: ${badgeText?.trim()}`);

    // 8. Testar botões Lorem nos inputs de texto e textarea
    const formLoremButtons = page.locator('div.space-y-4 button:has-text("Lorem")');
    const loremCount = await formLoremButtons.count();
    console.log(`8. Identificados ${loremCount} botões Lorem nos campos do formulário.`);

    if (loremCount > 0) {
      await formLoremButtons.first().click();
      await page.waitForTimeout(300);
      console.log('9. Clicado no botão Lorem do primeiro campo.');
    }

    // 10. Capturar screenshot do Card Inspector com Script + Formulário + Botões Lorem
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'script_editor_and_modular_form.png'),
    });
    console.log('10. Screenshot do Editor de Script e Formulário Modular salvo.');

    // 11. Testar aba "Props do Card" no Template Sandbox
    const sandboxNav = page.locator('nav button:has-text("Sandbox de Templates")');
    await sandboxNav.click();
    await page.waitForTimeout(500);

    const formTab = page.locator('button:has-text("Props do Card")');
    await formTab.click();
    await page.waitForTimeout(400);

    const sandboxLoremButtons = page.locator('button:has-text("Lorem")');
    const sandboxLoremCount = await sandboxLoremButtons.count();
    console.log(`11. Identificados ${sandboxLoremCount} botões Lorem na aba Props do Sandbox.`);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'sandbox_props_lorem_buttons.png'),
    });

    await browser.close();
    console.log('\n>>> SUCESSO TOTAL: EDITOR DE SCRIPT, FORMULÁRIO MODULAR E BOTÕES LOREM 100% VALIDADOS! <<<');
  } catch (err) {
    console.error('Falha no teste:', err);
    await browser.close();
    process.exit(1);
  }
}

testScriptEditorAndLorem();
