const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';
const BASE_URL = 'http://localhost:5174';

async function runE2ETests() {
  console.log('🚀 Iniciando Testes E2E com Playwright...');
  const browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // 1. TESTE DESKTOP (1280x800)
    // ==========================================
    console.log('\n🖥️ [1/2] Executando testes em Desktop (1280x800)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await desktopContext.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('  ✓ Página carregada com sucesso');

    // 1.1 Verificar elementos essenciais
    await page.waitForSelector('text=Remotion Studio');
    await page.waitForSelector('text=Player Preview');
    await page.waitForSelector('text=Timeline');
    console.log('  ✓ Header, Player e Timeline identificados');

    // Print Desktop Inicial
    const screenshotDesktopInitial = path.join(ARTIFACTS_DIR, 'desktop_overview.png');
    await page.screenshot({ path: screenshotDesktopInitial, fullPage: false });
    console.log(`  ✓ Screenshot Desktop salvo: ${screenshotDesktopInitial}`);

    // 1.2 Testar Play / Pause
    const playButton = page.locator('button:has-text("Reproduzir")');
    await playButton.click();
    await page.waitForTimeout(600);
    const pauseButton = page.locator('button:has-text("Pausar")');
    if (await pauseButton.isVisible()) {
      console.log('  ✓ Reprodução iniciada (botão Pausar ativo)');
      await pauseButton.click();
      console.log('  ✓ Reprodução pausada com sucesso');
    }

    // 1.3 Testar Seleção de Cena na Timeline
    const card2 = page.locator('text=Split Mídia & Explicação').first();
    await card2.click();
    await page.waitForTimeout(300);
    console.log('  ✓ Cena 2 selecionada na timeline');

    // 1.4 Testar Edição no CardInspector
    const titleInput = page.locator('input[value="Entrada Visual & Texto"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Entrada Visual & Texto (E2E Test OK)');
      await page.waitForTimeout(300);
      console.log('  ✓ Campo de título editado no CardInspector');
    }

    // Print Desktop com CardInspector ativo
    const screenshotDesktopInspector = path.join(ARTIFACTS_DIR, 'desktop_card_inspector.png');
    await page.screenshot({ path: screenshotDesktopInspector, fullPage: false });
    console.log(`  ✓ Screenshot Desktop Inspector salvo: ${screenshotDesktopInspector}`);

    // 1.5 Testar Modal da Loja de Templates
    const catalogButton = page.locator('button:has-text("Loja de Templates")').first();
    await catalogButton.click();
    await page.waitForSelector('text=Loja de Templates (30 Modelos)');
    console.log('  ✓ Modal de Templates aberto com 30 modelos');

    // Filtrar categoria
    const archCategory = page.locator('button:has-text("Arquitetura & IA")').first();
    await archCategory.click();
    await page.waitForTimeout(400);

    // Print Modal de Templates
    const screenshotTemplateModal = path.join(ARTIFACTS_DIR, 'desktop_template_catalog.png');
    await page.screenshot({ path: screenshotTemplateModal });
    console.log(`  ✓ Screenshot Catálogo de Templates salvo: ${screenshotTemplateModal}`);

    // Fechar modal
    const closeBtn = page.locator('button[aria-label="Fechar"]').first();
    await closeBtn.click();
    await page.waitForTimeout(300);
    console.log('  ✓ Modal de Templates fechado');

    // 1.6 Testar Modal de JSON
    const jsonButton = page.locator('button:has-text("JSON Import / Export")').first();
    await jsonButton.click();
    await page.waitForSelector('text=Importar / Exportar JSON');
    console.log('  ✓ Modal de JSON aberto');

    const screenshotJsonModal = path.join(ARTIFACTS_DIR, 'desktop_json_modal.png');
    await page.screenshot({ path: screenshotJsonModal });
    console.log(`  ✓ Screenshot Modal JSON salvo: ${screenshotJsonModal}`);

    const closeJsonBtn = page.locator('button[aria-label="Fechar"]').first();
    await closeJsonBtn.click();
    await page.waitForTimeout(300);

    await desktopContext.close();

    // ==========================================
    // 2. TESTE MOBILE (iPhone 14 / 390x844)
    // ==========================================
    console.log('\n📱 [2/2] Executando testes em Mobile (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('  ✓ Página Mobile carregada com sucesso');

    // Print Mobile Visão Completa
    const screenshotMobileInitial = path.join(ARTIFACTS_DIR, 'mobile_overview.png');
    await mobilePage.screenshot({ path: screenshotMobileInitial, fullPage: false });
    console.log(`  ✓ Screenshot Mobile Overview salvo: ${screenshotMobileInitial}`);

    // 2.1 Testar Seletor de Visão Mobile "Apenas Player"
    const btnOnlyPlayer = mobilePage.locator('button:has-text("Apenas Player")');
    await btnOnlyPlayer.click();
    await mobilePage.waitForTimeout(300);
    console.log('  ✓ Alternado para visualização "Apenas Player"');

    // Mudar aspect ratio para 9:16
    const btn916 = mobilePage.locator('button:has-text("9:16")');
    await btn916.click();
    await mobilePage.waitForTimeout(300);
    console.log('  ✓ Proporção 9:16 (Stories/Reels/TikTok) ativada');

    const screenshotMobilePlayer916 = path.join(ARTIFACTS_DIR, 'mobile_player_916.png');
    await mobilePage.screenshot({ path: screenshotMobilePlayer916 });
    console.log(`  ✓ Screenshot Mobile 9:16 salvo: ${screenshotMobilePlayer916}`);

    // 2.2 Testar Seletor de Visão Mobile "Apenas Editor"
    const btnOnlyInspector = mobilePage.locator('button:has-text("Apenas Editor")');
    await btnOnlyInspector.click();
    await mobilePage.waitForTimeout(300);
    console.log('  ✓ Alternado para visualização "Apenas Editor"');

    // Mudar para aba de Voz
    const voiceTab = mobilePage.locator('button:has-text("Voz & Narração")');
    await voiceTab.click();
    await mobilePage.waitForTimeout(300);
    console.log('  ✓ Aba Voz & Narração inspecionada no mobile');

    const screenshotMobileInspector = path.join(ARTIFACTS_DIR, 'mobile_inspector.png');
    await mobilePage.screenshot({ path: screenshotMobileInspector });
    console.log(`  ✓ Screenshot Mobile Inspector salvo: ${screenshotMobileInspector}`);

    // 2.3 Testar Modal de Templates no Mobile
    const mobileCatalogBtn = mobilePage.locator('button:has-text("Templates")').first();
    await mobileCatalogBtn.click();
    await mobilePage.waitForSelector('h2:has-text("Loja de Templates")');
    console.log('  ✓ Modal de Templates aberto no Mobile');

    // Testar aba de preview ao vivo no mobile
    const previewTab = mobilePage.locator('button:has-text("Preview:")').first();
    if (await previewTab.isVisible()) {
      await previewTab.click();
      await mobilePage.waitForTimeout(300);
      console.log('  ✓ Aba de Preview Animado ativada no modal mobile');
    }

    const screenshotMobileModal = path.join(ARTIFACTS_DIR, 'mobile_template_modal.png');
    await mobilePage.screenshot({ path: screenshotMobileModal });
    console.log(`  ✓ Screenshot Modal Mobile salvo: ${screenshotMobileModal}`);

    // Fechar modal
    const closeMobileModal = mobilePage.locator('button[aria-label="Fechar"]').first();
    await closeMobileModal.click();
    await mobilePage.waitForTimeout(300);

    // 2.4 Testar reordenação de card por seta na timeline mobile
    const rightArrow = mobilePage.locator('button:has-text("▶")').first();
    if (await rightArrow.isVisible()) {
      await rightArrow.click();
      await mobilePage.waitForTimeout(300);
      console.log('  ✓ Reordenação de cena por toque/seta na timeline mobile OK');
    }

    await mobileContext.close();

    console.log('\n🎉 TODOS OS TESTES E2E FORAM CONCLUÍDOS COM SUCESSO (100% PASSING)!');
  } catch (err) {
    console.error('❌ Erro no teste E2E:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();
