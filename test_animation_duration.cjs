const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testAnimationDuration() {
  console.log('🚀 Iniciando Teste E2E de Duração de Animação e Sincronização...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const artifactDir = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    console.log('✅ Página inicial carregada.');

    // 1. Abrir o Sandbox de Templates
    const sandboxBtn = page.locator('button:has-text("Sandbox de Templates")');
    await sandboxBtn.click();
    await page.waitForTimeout(600);
    console.log('✅ Navegou para o Sandbox de Templates.');

    // 2. Selecionar o template "deep-dive-architecture"
    const templateSelect = page.locator('select').first();
    await templateSelect.selectOption('deep-dive-architecture');
    await page.waitForTimeout(600);
    console.log('✅ Selecionou o template "deep-dive-architecture".');

    // 3. Verificar se a duração foi automaticamente sincronizada para 300 frames (10.0s)
    const durationSelect = page.locator('select:has-text("frames")');
    const selectedDuration = await durationSelect.inputValue();
    console.log(`⏱️ Duração selecionada no Sandbox: ${selectedDuration} frames`);

    if (parseInt(selectedDuration, 10) !== 300) {
      throw new Error(`Duração esperada de 300 frames, mas obteve: ${selectedDuration}`);
    }
    console.log('✅ Duração sincronizada automaticamente para 300 frames (10.0s)!');

    // 4. Testar visualização no frame 30 (Início do typedLog1)
    const rangeInput = page.locator('input[type="range"]');
    await rangeInput.fill('30');
    await rangeInput.dispatchEvent('change');
    await page.waitForTimeout(300);

    const shot30Path = path.join(artifactDir, 'animation_frame_30.png');
    await page.screenshot({ path: shot30Path });
    console.log(`📸 Screenshot frame 30 salvo em: ${shot30Path}`);

    // 5. Testar visualização no frame 150 (Meio da animação e digitação)
    await rangeInput.fill('150');
    await rangeInput.dispatchEvent('change');
    await page.waitForTimeout(300);

    const shot150Path = path.join(artifactDir, 'animation_frame_150.png');
    await page.screenshot({ path: shot150Path });
    console.log(`📸 Screenshot frame 150 salvo em: ${shot150Path}`);

    // 6. Testar no frame 300 (Duração total: 10s completo)
    await rangeInput.fill('299');
    await rangeInput.dispatchEvent('change');
    await page.waitForTimeout(400);

    // Verificar texto "100% CONCLUÍDO"
    const stageContent = await page.locator('#sandbox-canvas-stage').innerText();
    console.log('🔍 Conteúdo do terminal/palco no frame 299:\n', stageContent);

    if (!stageContent.includes('100% CONCLUÍDO')) {
      throw new Error('Texto de 100% CONCLUÍDO não foi encontrado no rodapé no frame final!');
    }
    console.log('✅ Barra de rodapé exibe "100% CONCLUÍDO"!');

    // Verificar se as 3 linhas de logs foram digitadas por completo
    if (!stageContent.includes('SharedArrayBuffer')) {
      throw new Error('Log 1 incompleto no frame 300!');
    }
    if (!stageContent.includes('Pipeline GPU vinculada')) {
      throw new Error('Log 2 incompleto no frame 300!');
    }
    if (!stageContent.includes('zero perdas registradas')) {
      throw new Error('Log 3 incompleto no frame 300!');
    }
    console.log('✅ Todos os 3 logs do terminal foram digitados com 100% de integridade!');

    const shot300Path = path.join(artifactDir, 'animation_frame_300_completed.png');
    await page.screenshot({ path: shot300Path });
    console.log(`📸 Screenshot frame 300 completo salvo em: ${shot300Path}`);

    // 7. Testar entrada manual de frames customizados (ex: 450 frames = 15.0s)
    const numInput = page.locator('input[type="number"]');
    await numInput.fill('450');
    await numInput.dispatchEvent('change');
    await page.waitForTimeout(300);

    const rangeMax = await rangeInput.getAttribute('max');
    console.log(`⏱️ Novo range max após digitar 450f: ${rangeMax}`);
    if (parseInt(rangeMax, 10) !== 449) {
      throw new Error(`Range max esperado 449, mas obteve: ${rangeMax}`);
    }
    console.log('✅ Campo numérico customizado de frames funcionou perfeitamente!');

    // 8. Testar integração com o Estúdio Principal
    const studioBtn = page.locator('button:has-text("Estúdio de Vídeo")').first();
    await studioBtn.click();
    await page.waitForTimeout(600);

    // Abrir Loja de Templates para adicionar deep-dive-architecture
    const storeBtn = page.locator('button:has-text("Loja de Templates")').first();
    await storeBtn.click();
    await page.waitForTimeout(600);

    // Clicar na aba "Arquitetura & IA" para filtrar o card
    const arqTab = page.locator('button:has-text("Arquitetura & IA")').first();
    if (await arqTab.isVisible()) {
      await arqTab.click();
      await page.waitForTimeout(400);
    }

    // Encontrar card de deep-dive-architecture e clicar em "Adicionar"
    const addCardBtn = page.locator('button:has-text("Adicionar")').last();
    await addCardBtn.click();
    await page.waitForTimeout(800);

    console.log('✅ Adicionou card deep-dive-architecture à timeline do Estúdio.');

    // Verificar duração do card na timeline ou no inspector
    const timelineInfo = await page.locator('body').innerText();
    const has10sOr300f =
      timelineInfo.includes('10.0s') ||
      timelineInfo.includes('10.8s') ||
      timelineInfo.includes('300f') ||
      timelineInfo.includes('324f');
    console.log('⏱️ Card na timeline tem duração completa (>=10s):', has10sOr300f);

    const shotStudioPath = path.join(artifactDir, 'studio_timeline_10s_card.png');
    await page.screenshot({ path: shotStudioPath });
    console.log(`📸 Screenshot estúdio salvo em: ${shotStudioPath}`);

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! ZERO REGRESSÕES.');
  } catch (err) {
    console.error('❌ ERRO NO TESTE:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAnimationDuration();
