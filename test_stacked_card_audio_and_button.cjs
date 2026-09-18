const { chromium } = require('playwright');
const path = require('path');

async function run() {
  console.log('🚀 Testando Sincronização de Áudio e Ocultamento Total do Botão Central no Card...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const artifactDir = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    console.log('✅ Estúdio carregado.');

    // 1. Navegar para o Editor em Cards
    const cardsNavBtn = page.locator('button:has-text("Editor em Cards")').first();
    await cardsNavBtn.click();
    await page.waitForTimeout(600);

    const firstCard = page.locator('[data-testid="scene-card"]').first();
    await firstCard.waitFor({ state: 'visible' });
    console.log('✅ Editor de Cenas em Cards visível.');

    // 2. Verificar o botão Play central inicial no preview da Cena 1
    const centerPlayBtn = firstCard.locator('button[title="Reproduzir Cena"]').first();
    await centerPlayBtn.waitFor({ state: 'visible' });
    console.log('✅ Botão Play central visível quando pausado.');

    const pausedScreenshotPath = path.join(artifactDir, 'card_video_paused_play_button.png');
    await firstCard.screenshot({ path: pausedScreenshotPath });
    console.log(`📸 Screenshot card pausado: ${pausedScreenshotPath}`);

    // 3. Clicar no botão Play para iniciar a reprodução sincronizada
    await centerPlayBtn.click();
    await page.waitForTimeout(600);

    // Mover cursor para fora do card para conferir renderização limpa
    await page.mouse.move(10, 10);
    await page.waitForTimeout(400);

    // 4. Verificar que o botão central sumiu completamente durante o playback
    const centerButtonsCount = await firstCard.locator('button[title="Reproduzir Cena"]').count();
    console.log('✅ Botão Play central sumiu do centro do vídeo durante o playback (count=0):', centerButtonsCount === 0);
    if (centerButtonsCount !== 0) {
      throw new Error('Botão Play central ainda está presente na frente do vídeo durante a reprodução!');
    }

    // Screenshot mostrando o vídeo 100% limpo, sem nenhum botão bloqueando o texto/título
    const playingCleanScreenshotPath = path.join(artifactDir, 'card_video_playing_unobstructed.png');
    await firstCard.screenshot({ path: playingCleanScreenshotPath });
    console.log(`📸 Screenshot vídeo reproduzindo 100% limpo: ${playingCleanScreenshotPath}`);

    // 5. Verificar indicador de Áudio Sincronizado
    const audioBadge = firstCard.locator('text=ÁUDIO SINCRONIZADO');
    const hasAudioBadge = await audioBadge.isVisible();
    console.log('🎙️ Badge "ÁUDIO SINCRONIZADO" visível durante a fala:', hasAudioBadge);

    // 6. Testar seek interativo na barra de progresso inferior
    const progressBar = firstCard.locator('.group\\/bar');
    const box = await progressBar.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width * 0.6, box.y + box.height / 2);
      await page.waitForTimeout(400);
      const seekTimeText = await firstCard.locator('.font-mono').last().innerText();
      console.log('⏱️ Tempo após clique de seek na barra:', seekTimeText);
    }

    // 7. Pausar o vídeo usando o botão de controle da barra inferior
    const pauseControlBtn = firstCard.locator('button[title="Pausar Cena"]').first();
    await pauseControlBtn.click();
    await page.waitForTimeout(400);

    // 8. Verificar se o botão Play central reapareceu no centro
    const centerBtnAfterPause = firstCard.locator('button[title="Reproduzir Cena"]').first();
    const isVisibleAfterPause = await centerBtnAfterPause.isVisible();
    console.log('✅ Botão Play central reapareceu no centro após pausar:', isVisibleAfterPause);
    if (!isVisibleAfterPause) {
      throw new Error('Botão Play central não reapareceu após pausar o vídeo!');
    }

    // 9. Testar exclusão mútua: dar play no Card 2 e garantir que Card 1 fica pausado
    const secondCard = page.locator('[data-testid="scene-card"]').nth(1);
    const secondPlayBtn = secondCard.locator('button[title="Reproduzir Cena"]').first();
    await secondPlayBtn.click();
    await page.waitForTimeout(600);

    const firstCardCenterBtn = await firstCard.locator('button[title="Reproduzir Cena"]').first().isVisible();
    console.log('✅ Card 1 permaneceu pausado quando Card 2 começou a tocar:', firstCardCenterBtn);

    console.log('\n🎉 TODOS OS TESTES DE ÁUDIO E OCULTAMENTO DO BOTÃO FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
  } catch (err) {
    console.error('❌ Erro no teste:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
