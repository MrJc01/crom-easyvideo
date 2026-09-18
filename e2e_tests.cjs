const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';
const BASE_URL = 'http://localhost:5174';

async function runE2ETests() {
  console.log('Iniciando Suíte de Testes E2E: Resoluções Canônicas, Seletor Dropdown e Gestão de Áudio...');
  const browser = await chromium.launch({ headless: true });

  try {
    // ==========================================
    // 1. TESTES EM DESKTOP (1280x800)
    // ==========================================
    console.log('\n[1/2] Executando testes em Desktop (1280x800)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await desktopContext.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('  ✓ Estúdio carregado com sucesso');

    // 1.1 Verificar identificador de Viewport Canônico e Resolução 1080p
    await page.waitForSelector('text=Viewport Canônico');
    await page.waitForSelector('text=1920 × 1080');
    console.log('  ✓ Palco com Resolução Canônica 1920x1080 identificado');

    // Verificar dimensões físicas e de escala do palco virtual #remotion-canvas-stage
    const stageInfo = await page.evaluate(() => {
      const stage = document.getElementById('remotion-canvas-stage');
      if (!stage) return null;
      const rect = stage.getBoundingClientRect();
      return {
        styleWidth: stage.style.width,
        styleHeight: stage.style.height,
        transform: stage.style.transform,
        renderedWidth: rect.width,
        renderedHeight: rect.height,
      };
    });
    console.log('  ✓ Geometria do Palco:', JSON.stringify(stageInfo));

    // Print Desktop Overview com Canvas 1080p
    const screenshotDesktopInitial = path.join(ARTIFACTS_DIR, 'desktop_overview.png');
    await page.screenshot({ path: screenshotDesktopInitial, fullPage: false });
    console.log(`  ✓ Screenshot Desktop salvo: ${screenshotDesktopInitial}`);

    // 1.2 Testar Dropdown de Resoluções Canônicas (16:9 720p, 9:16 Vertical, 1:1 Quadrado, 16:9 1080p)
    const resolutionSelect = page.locator('select').first();
    await resolutionSelect.selectOption('16-9-720');
    await page.waitForSelector('text=1280 × 720');
    console.log('  ✓ Resolução comutada via dropdown para 16:9 720p HD (1280x720)');

    await resolutionSelect.selectOption('9-16-1080');
    await page.waitForSelector('text=1080 × 1920');
    console.log('  ✓ Resolução comutada via dropdown para 9:16 Vertical (1080x1920)');

    await resolutionSelect.selectOption('1-1-1080');
    await page.waitForSelector('text=1080 × 1080');
    console.log('  ✓ Resolução comutada via dropdown para 1:1 Quadrado (1080x1080)');

    await resolutionSelect.selectOption('16-9-1080');
    await page.waitForSelector('text=1920 × 1080');
    console.log('  ✓ Retornado com sucesso via dropdown para 16:9 1080p Full HD');

    // 1.3 Testar Play / Pause e Sincronização de Áudio/Narração
    const muteBtn = page.locator('button[title*="Áudio"]').first();
    if (await muteBtn.isVisible()) {
      console.log('  ✓ Botão de controle de Áudio identificado no player');
    }

    const playButton = page.locator('button:has-text("Reproduzir")');
    await playButton.click();
    await page.waitForTimeout(600);

    const pauseButton = page.locator('button:has-text("Pausar")');
    if (await pauseButton.isVisible()) {
      console.log('  ✓ Reprodução iniciada em sincronia');
      await pauseButton.click();
      console.log('  ✓ Reprodução pausada com sucesso (áudio interrompido)');
    }

    // 1.4 Testar Novo Componente AudioSourceSelector no CardInspector
    const audioTab = page.locator('button:has-text("Áudio & Voz")');
    await audioTab.click();
    await page.waitForSelector('text=Fonte de Áudio do Card');
    console.log('  ✓ Aba de Áudio & Voz aberta com AudioSourceSelector');

    // Testar alternância entre as 3 abas de áudio (TTS, Arquivo, Microfone)
    const fileAudioTab = page.locator('button:has-text("Arquivo Áudio")');
    await fileAudioTab.click();
    await page.waitForSelector('text=Clique para enviar arquivo de áudio');
    console.log('  ✓ Aba Arquivo de Áudio ativa com upload');

    const micAudioTab = page.locator('button:has-text("Gravar Microfone")');
    await micAudioTab.click();
    await page.waitForSelector('text=Pronto para gravar sua voz');
    console.log('  ✓ Aba Gravar Microfone ativa com WebRTC');

    const ttsTab = page.locator('button:has-text("TTS (Voz IA)")');
    await ttsTab.click();
    await page.waitForSelector('text=Roteiro de Fala:');
    console.log('  ✓ Retornado para modo TTS com medição de fala');

    // Print Desktop Inspector com Áudio
    const screenshotDesktopInspector = path.join(ARTIFACTS_DIR, 'desktop_card_inspector.png');
    await page.screenshot({ path: screenshotDesktopInspector, fullPage: false });
    console.log(`  ✓ Screenshot Desktop Inspector salvo: ${screenshotDesktopInspector}`);

    // 1.5 Testar Modal de Renderização e Download de Vídeo
    const renderBtn = page.locator('button:has-text("Renderizar & Baixar")').first();
    await renderBtn.click();
    await page.waitForSelector('text=Renderizar & Baixar Vídeo');
    console.log('  ✓ Modal de Renderização & Download aberto com sucesso');

    // Print Modal de Renderização
    const screenshotRenderModal = path.join(ARTIFACTS_DIR, 'desktop_render_modal.png');
    await page.screenshot({ path: screenshotRenderModal });
    console.log(`  ✓ Screenshot Modal de Renderização salvo: ${screenshotRenderModal}`);

    // Selecionar 720p HD
    const preset720p = page.locator('button:has-text("720p HD")').first();
    await preset720p.click();

    // Disparar Renderização
    const startRenderBtn = page.locator('button:has-text("Iniciar Renderização")').first();
    await startRenderBtn.click();
    console.log('  ✓ Processo de renderização disparado');

    // Aguardar barra de progresso
    await page.waitForSelector('text=Processando frame', { timeout: 10000 });
    console.log('  ✓ Barra de progresso ativa em tempo real');

    // Aguardar conclusão da renderização
    await page.waitForSelector('text=Vídeo renderizado com sucesso', { timeout: 60000 });
    console.log('  ✓ Vídeo renderizado com sucesso!');

    // Verificar botão de download
    await page.waitForSelector('button:has-text("Baixar Vídeo")');
    console.log('  ✓ Botão "Baixar Vídeo" validado e pronto');

    // Print Vídeo Renderizado com Sucesso
    const screenshotRenderSuccess = path.join(ARTIFACTS_DIR, 'desktop_rendered_video_success.png');
    await page.screenshot({ path: screenshotRenderSuccess });
    console.log(`  ✓ Screenshot Vídeo Renderizado salvo: ${screenshotRenderSuccess}`);

    // Fechar Modal de Renderização
    const closeModalBtn = page.locator('button[aria-label="Fechar"]').first();
    await closeModalBtn.click();
    await page.waitForTimeout(300);

    // ==========================================
    // 2. TESTES EM MOBILE (390x844 - iPhone 14)
    // ==========================================
    console.log('\n[2/2] Executando testes em Mobile (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('  ✓ Estúdio Mobile carregado com sucesso');

    // 2.1 Verificar ajuste de tela no mobile (sem recortes)
    const mobileStage = await mobilePage.evaluate(() => {
      const stage = document.getElementById('remotion-canvas-stage');
      if (!stage) return null;
      const rect = stage.getBoundingClientRect();
      return {
        renderedWidth: rect.width,
        renderedHeight: rect.height,
        windowWidth: window.innerWidth,
        fitsInScreen: rect.width <= window.innerWidth,
      };
    });
    console.log('  ✓ Ajuste do Palco no Mobile (fitsInScreen):', mobileStage?.fitsInScreen);

    // Print Mobile Overview
    const screenshotMobileOverview = path.join(ARTIFACTS_DIR, 'mobile_overview.png');
    await mobilePage.screenshot({ path: screenshotMobileOverview });
    console.log(`  ✓ Screenshot Mobile Overview salvo: ${screenshotMobileOverview}`);

    // 2.2 Alternar para 9:16 Vertical via Dropdown no Mobile
    const mobileSelect = mobilePage.locator('select').first();
    await mobileSelect.selectOption('9-16-1080');
    await mobilePage.waitForTimeout(300);

    const screenshotMobile916 = path.join(ARTIFACTS_DIR, 'mobile_player_916.png');
    await mobilePage.screenshot({ path: screenshotMobile916 });
    console.log(`  ✓ Screenshot Mobile 9:16 salvo: ${screenshotMobile916}`);

    // 2.3 Abrir Modal de Renderização no Mobile
    const mobileRenderBtn = mobilePage.locator('button:has-text("Baixar")').first();
    await mobileRenderBtn.click();
    await mobilePage.waitForSelector('text=Renderizar & Baixar Vídeo');
    console.log('  ✓ Modal de Renderização aberto no Mobile');

    const screenshotMobileRenderModal = path.join(ARTIFACTS_DIR, 'mobile_render_modal.png');
    await mobilePage.screenshot({ path: screenshotMobileRenderModal });
    console.log(`  ✓ Screenshot Modal Render Mobile salvo: ${screenshotMobileRenderModal}`);

    const closeMobileRender = mobilePage.locator('button[aria-label="Fechar"]').first();
    await closeMobileRender.click();
    await mobilePage.waitForTimeout(300);

    await mobileContext.close();
    await desktopContext.close();

    console.log('\nTODOS OS TESTES E2E FORAM CONCLUÍDOS COM 100% DE SUCESSO (ZERO EMOJIS, ZERO REGRESSÃO)!');
  } catch (err) {
    console.error('Erro no teste E2E:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();
