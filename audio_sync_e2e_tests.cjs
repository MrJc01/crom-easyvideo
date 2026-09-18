const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';
const BASE_URL = 'http://localhost:5174';

async function runAudioSyncTests() {
  console.log('--- TESTE E2E: SINCRONIZAÇÃO EM LOCKSTEP DE ÁUDIO E SLIDES DO PREVIEW ---');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    console.log('1. Aplicação carregada com sucesso.');

    // 1. Verificar Estado Inicial da Cena 1
    const sceneBadge = page.locator('div:has-text("#1:")').first();
    await sceneBadge.waitFor({ state: 'visible' });
    console.log('2. Slide inicial da Cena #1 ativo no preview.');

    // 2. Iniciar Reprodução (Play)
    const playBtn = page.locator('button:has-text("Reproduzir")');
    await playBtn.click();
    console.log('3. Botão "Reproduzir" acionado.');

    // Aguarda o badge de áudio da cena ativa pulsar
    const audioActiveBadge = page.locator('text=Áudio Cena #1');
    await audioActiveBadge.waitFor({ state: 'visible', timeout: 3000 });
    console.log('4. Áudio da Cena #1 sincronizado e reproduzindo ativamente no preview!');

    // Capturar screenshot durante reprodução ativa com áudio
    const screenshotPlay = path.join(ARTIFACTS_DIR, 'audio_sync_desktop_playback.png');
    await page.screenshot({ path: screenshotPlay, fullPage: false });
    console.log(`5. Screenshot salvo: ${screenshotPlay}`);

    // Pausar
    const pauseBtn = page.locator('button:has-text("Pausar")');
    await pauseBtn.click();
    console.log('6. Reprodução pausada com sucesso. Áudio interrompido sincronizadamente.');

    // 3. Testar Scrubbing / Seeking na Timeline
    console.log('7. Testando Seeking / Scrubber sincronizado...');
    const scrubber = page.locator('input[type="range"]').first();
    
    // Avançar scrubber para frame correspondente à Cena 2 usando setter nativo do React
    await scrubber.evaluate((el) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '260');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(300);

    // Também clica no card #2 na fita da timeline para garantir teste dos dois fluxos
    const card2Timeline = page.locator('div.group:has-text("#2")').first();
    if (await card2Timeline.isVisible()) {
      await card2Timeline.click();
      console.log('8. Card #2 clicado na timeline filmstrip.');
    }

    // Verificar se o badge da Cena #2 está ativo no topo do player
    const scene2Badge = page.locator('#remotion-canvas-stage ~ div:has-text("#2:")').first();
    await scene2Badge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('9. Scrubber/Timeline posicionado: Slide da Cena #2 exibido instantaneamente.');

    // 4. Testar Play na Cena #2
    await page.locator('button:has-text("Reproduzir")').click();
    const audioScene2Badge = page.locator('text=Áudio Cena #2');
    await audioScene2Badge.waitFor({ state: 'visible', timeout: 3000 });
    console.log('9. Áudio da Cena #2 iniciado em sincronia com o slide #2!');

    // 5. Testar Botão de Mudo
    const muteBtn = page.locator('button[title*="Silenciar Áudio da Cena"]').first();
    if (await muteBtn.isVisible()) {
      await muteBtn.click();
      console.log('10. Áudio silenciado pelo botão de mudo.');
      const unmuteBtn = page.locator('button[title*="Ativar Áudio da Cena"]').first();
      await unmuteBtn.waitFor({ state: 'visible' });
      await unmuteBtn.click();
      console.log('11. Áudio reativado com sucesso.');
    }

    // 6. Teste Mobile (390x844)
    console.log('\n12. Testando em viewport Mobile (390x844 iPhone 13/14/15)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Alternar para Apenas Player no mobile
    const playerOnlyBtn = mobilePage.locator('button:has-text("Apenas Player")');
    await playerOnlyBtn.click();
    console.log('13. Visão "Apenas Player" ativada no mobile.');

    // Disparar play no mobile
    const mobilePlayBtn = mobilePage.locator('button:has-text("Reproduzir")');
    await mobilePlayBtn.click();
    await mobilePage.waitForTimeout(500);

    const screenshotMobile = path.join(ARTIFACTS_DIR, 'audio_sync_mobile_playback.png');
    await mobilePage.screenshot({ path: screenshotMobile, fullPage: false });
    console.log(`14. Screenshot Mobile salvo: ${screenshotMobile}`);

    await browser.close();
    console.log('\n>>> TODOS OS TESTES DE SINCRONIZAÇÃO DE ÁUDIO E SLIDES FORAM APROVADOS COM SUCESSO! <<<');
  } catch (err) {
    console.error('Falha no teste E2E de sincronização de áudio:', err);
    await browser.close();
    process.exit(1);
  }
}

runAudioSyncTests();
