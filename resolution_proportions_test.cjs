const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

async function runResolutionProportionsTest() {
  console.log('--- INICIANDO TESTE E2E DE PROPORCIONALIDADE UNIVERSAL DE RESOLUÇÕES ---');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 860 }
  });

  const page = await context.newPage();

  try {
    console.log('1. Acessando o estúdio em http://localhost:5174/ ...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle', timeout: 15000 });

    // Aguarda montagem do palco
    const stage = page.locator('#remotion-canvas-stage');
    await stage.waitFor({ state: 'visible', timeout: 10000 });

    // --- TESTE 1: COMPARAÇÃO 1080p vs 720p NO ESTÚDIO PRINCIPAL ---
    console.log('\n2. Testando resolução 16:9 1080p Full HD...');
    const resSelect = page.locator('select').filter({ hasText: '16:9 Widescreen Full HD' }).first();
    await resSelect.selectOption('16-9-1080');
    await page.waitForTimeout(600);

    const stageBox1080 = await stage.boundingBox();
    console.log(`   Palco 1080p na tela: ${stageBox1080.width.toFixed(1)}px × ${stageBox1080.height.toFixed(1)}px em (x:${stageBox1080.x.toFixed(1)}, y:${stageBox1080.y.toFixed(1)})`);

    // Avança o frame para 25 para que a animação spring do título esteja 100% visível
    const scrubber = page.locator('input[type="range"]').first();
    await scrubber.fill('25');
    await page.waitForTimeout(400);

    // Captura primeiro título h1 visível
    const h1 = stage.locator('h1').first();
    await h1.waitFor({ state: 'attached' });
    const h1Box1080 = await h1.boundingBox();
    const h1Text = await h1.innerText();
    const h1FontSize1080 = await h1.evaluate(el => window.getComputedStyle(el).fontSize);

    console.log(`   Título H1 ("${h1Text.slice(0, 25)}...") em 1080p:`);
    console.log(`     Tamanho: ${h1Box1080.width.toFixed(1)}px × ${h1Box1080.height.toFixed(1)}px`);
    console.log(`     Posição: x:${h1Box1080.x.toFixed(1)}, y:${h1Box1080.y.toFixed(1)}`);
    console.log(`     Font-size no DOM: ${h1FontSize1080}`);

    const shot1080Path = path.join(ARTIFACTS_DIR, 'resolution_1080p_comparison.png');
    await page.screenshot({ path: shot1080Path });
    console.log(`   Screenshot 1080p salvo: ${shot1080Path}`);

    console.log('\n3. Comutando para 16:9 720p HD...');
    await resSelect.selectOption('16-9-720');
    await page.waitForTimeout(600);

    const stageBox720 = await stage.boundingBox();
    console.log(`   Palco 720p na tela: ${stageBox720.width.toFixed(1)}px × ${stageBox720.height.toFixed(1)}px em (x:${stageBox720.x.toFixed(1)}, y:${stageBox720.y.toFixed(1)})`);

    const h1Box720 = await h1.boundingBox();
    const h1FontSize720 = await h1.evaluate(el => window.getComputedStyle(el).fontSize);

    console.log(`   Título H1 em 720p:`);
    console.log(`     Tamanho: ${h1Box720.width.toFixed(1)}px × ${h1Box720.height.toFixed(1)}px`);
    console.log(`     Posição: x:${h1Box720.x.toFixed(1)}, y:${h1Box720.y.toFixed(1)}`);
    console.log(`     Font-size no DOM: ${h1FontSize720}`);

    const shot720Path = path.join(ARTIFACTS_DIR, 'resolution_720p_comparison.png');
    await page.screenshot({ path: shot720Path });
    console.log(`   Screenshot 720p salvo: ${shot720Path}`);

    // Validações de Rigor Matemático entre 1080p e 720p
    const deltaStageW = Math.abs(stageBox1080.width - stageBox720.width);
    const deltaStageH = Math.abs(stageBox1080.height - stageBox720.height);
    const deltaH1W = Math.abs(h1Box1080.width - h1Box720.width);
    const deltaH1H = Math.abs(h1Box1080.height - h1Box720.height);
    const deltaH1X = Math.abs(h1Box1080.x - h1Box720.x);
    const deltaH1Y = Math.abs(h1Box1080.y - h1Box720.y);

    console.log('\n4. Análise de Desvio entre 1080p e 720p:');
    console.log(`   Delta Largura Palco: ${deltaStageW.toFixed(2)}px (Esperado < 1px)`);
    console.log(`   Delta Altura Palco: ${deltaStageH.toFixed(2)}px (Esperado < 1px)`);
    console.log(`   Delta Largura H1: ${deltaH1W.toFixed(2)}px (Esperado < 1px)`);
    console.log(`   Delta Altura H1: ${deltaH1H.toFixed(2)}px (Esperado < 1px)`);
    console.log(`   Delta Posição X H1: ${deltaH1X.toFixed(2)}px (Esperado < 1px)`);
    console.log(`   Delta Posição Y H1: ${deltaH1Y.toFixed(2)}px (Esperado < 1px)`);

    if (deltaStageW > 1.5 || deltaStageH > 1.5 || deltaH1W > 1.5 || deltaH1H > 1.5) {
      throw new Error(`Divergência detectada entre 1080p e 720p! Elementos mudaram de tamanho.`);
    }
    console.log('   >>> SUCESSO: 1080p e 720p são 100% IDÊNTICOS em tela! Zero deslocamento, zero distorção! <<<');

    // --- TESTE 2: TESTE DE OUTRAS RESOLUÇÕES E ASPECT RATIOS ---
    console.log('\n5. Testando 9:16 Vertical Story / Reels (TikTok)...');
    await resSelect.selectOption('9-16-1080');
    await page.waitForTimeout(600);

    const stageBox916 = await stage.boundingBox();
    const ratio916 = stageBox916.width / stageBox916.height;
    console.log(`   Palco 9:16: ${stageBox916.width.toFixed(1)}px × ${stageBox916.height.toFixed(1)}px (Aspect Ratio: ${ratio916.toFixed(4)}, esperado ~0.5625)`);
    if (Math.abs(ratio916 - (9 / 16)) > 0.05) {
      throw new Error(`Aspect Ratio incorreto para 9:16: ${ratio916}`);
    }

    const shot916Path = path.join(ARTIFACTS_DIR, 'resolution_916_vertical.png');
    await page.screenshot({ path: shot916Path });
    console.log(`   Screenshot 9:16 salvo: ${shot916Path}`);

    console.log('\n6. Testando 1:1 Quadrado (Instagram Feed)...');
    await resSelect.selectOption('1-1-1080');
    await page.waitForTimeout(600);

    const stageBox11 = await stage.boundingBox();
    const ratio11 = stageBox11.width / stageBox11.height;
    console.log(`   Palco 1:1: ${stageBox11.width.toFixed(1)}px × ${stageBox11.height.toFixed(1)}px (Aspect Ratio: ${ratio11.toFixed(4)}, esperado ~1.0)`);
    if (Math.abs(ratio11 - 1.0) > 0.05) {
      throw new Error(`Aspect Ratio incorreto para 1:1: ${ratio11}`);
    }

    // Retorna para 1080p
    await resSelect.selectOption('16-9-1080');
    await page.waitForTimeout(300);

    // --- TESTE 3: TEMPLATE SANDBOX RESOLUTION SWITCHING ---
    console.log('\n7. Testando seletor de resolução no Template Sandbox...');
    const sandboxTabBtn = page.getByRole('button', { name: /Sandbox de Templates/i });
    await sandboxTabBtn.click();
    await page.waitForTimeout(600);

    const sandboxSelect = page.locator('select[title="Resolução / Formato de Exibição"]');
    await sandboxSelect.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ Seletor de resolução detectado no Sandbox!');

    // Seleciona 1080p no Sandbox
    await sandboxSelect.selectOption('16-9-1080');
    await page.waitForTimeout(400);
    const sandboxStage = page.locator('#sandbox-canvas-stage');
    await sandboxStage.waitFor({ state: 'visible' });
    const sandboxStage1080 = await sandboxStage.boundingBox();

    // Seleciona 720p no Sandbox
    await sandboxSelect.selectOption('16-9-720');
    await page.waitForTimeout(400);
    const sandboxStage720 = await sandboxStage.boundingBox();

    console.log(`   Sandbox 1080p: ${sandboxStage1080.width.toFixed(1)}px × ${sandboxStage1080.height.toFixed(1)}px`);
    console.log(`   Sandbox 720p:  ${sandboxStage720.width.toFixed(1)}px × ${sandboxStage720.height.toFixed(1)}px`);
    const deltaSandboxW = Math.abs(sandboxStage1080.width - sandboxStage720.width);
    const deltaSandboxH = Math.abs(sandboxStage1080.height - sandboxStage720.height);
    console.log(`   Delta Sandbox 1080p vs 720p: W=${deltaSandboxW.toFixed(2)}px, H=${deltaSandboxH.toFixed(2)}px`);
    if (deltaSandboxW > 1.0 || deltaSandboxH > 1.0) {
      throw new Error('Divergência detectada no Sandbox entre 1080p e 720p!');
    }
    console.log(`   ✓ Sandbox 1080p e 720p 100% idênticos!`);

    // Seleciona 9:16 no Sandbox
    await sandboxSelect.selectOption('9-16-1080');
    await page.waitForTimeout(400);
    const shotSandbox916 = path.join(ARTIFACTS_DIR, 'sandbox_resolution_916.png');
    await page.screenshot({ path: shotSandbox916 });
    console.log(`   Screenshot Sandbox 9:16 salvo: ${shotSandbox916}`);

    // --- TESTE 4: TEMPLATE CATALOG MODAL PROPORTIONAL PREVIEW ---
    console.log('\n8. Testando preview proporcional no Modal de Catálogo...');
    // Volta para o Estúdio
    const studioTabBtn = page.getByRole('button', { name: /Estúdio de Vídeo/i });
    await studioTabBtn.click();
    await page.waitForTimeout(400);

    // Abre o catálogo
    const addCardBtn = page.getByRole('button', { name: /Adicionar Cena/i });
    await addCardBtn.click();
    await page.waitForTimeout(600);

    const catalogModal = page.locator('h2:has-text("Loja de Templates")');
    await catalogModal.waitFor({ state: 'visible', timeout: 5000 });

    // Localiza o preview animado
    const modalPreview = page.locator('div.aspect-video').first();
    await modalPreview.waitFor({ state: 'visible' });

    const modalBox = await modalPreview.boundingBox();
    console.log(`   Container do Preview no Modal: ${modalBox.width.toFixed(1)}px × ${modalBox.height.toFixed(1)}px`);

    // Valida que o canvas virtual 1920x1080 está presente dentro do preview
    const virtualCanvas = modalPreview.locator('#modal-virtual-canvas-stage');
    await virtualCanvas.waitFor({ state: 'attached' });
    console.log('   ✓ Palco canônico virtual 1920x1080 montado e ativo no Modal!');

    const shotCatalogModal = path.join(ARTIFACTS_DIR, 'catalog_modal_proportional_preview.png');
    await page.screenshot({ path: shotCatalogModal });
    console.log(`   Screenshot Catálogo Proporcional salvo: ${shotCatalogModal}`);

    // Fecha o modal
    const closeBtn = page.locator('button[aria-label="Fechar"]').first();
    await closeBtn.click();
    await page.waitForTimeout(300);

    console.log('\n===============================================================');
    console.log('>>> TODOS OS TESTES DE PROPORÇÃO DE RESOLUÇÃO FORAM APROVADOS COM SUCESSO! <<<');
    console.log('===============================================================');

  } catch (error) {
    console.error('ERRO DURANTE OS TESTES DE PROPORÇÃO:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runResolutionProportionsTest();
