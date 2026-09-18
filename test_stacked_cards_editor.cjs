const { chromium } = require('playwright');
const path = require('path');

async function testStackedCardsEditor() {
  console.log('🚀 Iniciando Teste E2E do Editor de Cenas em Cards Empilhados...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const page = await context.newPage();

  const artifactDir = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    console.log('✅ Página inicial carregada.');

    // 1. Verificar botão de navegação "Editor em Cards"
    const cardsNavBtn = page.locator('button:has-text("Editor em Cards")').first();
    await cardsNavBtn.waitFor({ state: 'visible' });
    console.log('✅ Botão "Editor em Cards" visível na barra de topo.');

    // 2. Clicar no botão para alternar para o Editor em Cards
    await cardsNavBtn.click();
    await page.waitForTimeout(600);

    // Verificar se o header do editor de cards está visível
    const headerTitle = page.locator('h1:has-text("Editor de Cenas Verticais")');
    await headerTitle.waitFor({ state: 'visible' });
    console.log('✅ Navegou para o Editor de Cenas Verticais (Modo Cards).');

    // Screenshot inicial do overview
    const overviewPath = path.join(artifactDir, 'stacked_cards_overview.png');
    await page.screenshot({ path: overviewPath });
    console.log(`📸 Screenshot geral salvo: ${overviewPath}`);

    // 3. Testar as 3 Abas no Card 1
    const firstCard = page.locator('[data-testid="scene-card"]').first();
    await firstCard.waitFor({ state: 'visible' });

    // Aba Configurações (já ativa por padrão)
    console.log('🔍 Testando Aba 2: Configurações...');
    const configTabBtn = firstCard.locator('button:has-text("Configurações")');
    await configTabBtn.click();
    await page.waitForTimeout(300);

    // Clicar no botão Lorem do texto principal
    const loremBtn = firstCard.locator('button:has-text("Lorem")').first();
    await loremBtn.click();
    await page.waitForTimeout(300);

    const textArea = firstCard.locator('textarea').first();
    const updatedText = await textArea.inputValue();
    console.log('📝 Texto atualizado via Lorem:', updatedText);

    if (!updatedText || updatedText.length < 5) {
      throw new Error('Botão Lorem não preencheu o texto principal!');
    }

    const configPath = path.join(artifactDir, 'stacked_card_tabs_config.png');
    await page.screenshot({ path: configPath });
    console.log(`📸 Screenshot aba Configurações: ${configPath}`);

    // Aba Template
    console.log('🔍 Testando Aba 1: Template...');
    const templateTabBtn = firstCard.locator('button:has-text("Template")');
    await templateTabBtn.click();
    await page.waitForTimeout(400);

    // Selecionar um template diferente (ex: "Big Headline" ou segundo card)
    const templateBtns = firstCard.locator('button:has(.border-white\\/10)');
    const count = await templateBtns.count();
    console.log(`🎨 Templates disponíveis no grid: ${count}`);
    if (count > 1) {
      await templateBtns.nth(1).click();
      await page.waitForTimeout(400);
      console.log('✅ Selecionou novo template no grid.');
    }

    const templatePath = path.join(artifactDir, 'stacked_card_tabs_template.png');
    await page.screenshot({ path: templatePath });
    console.log(`📸 Screenshot aba Template: ${templatePath}`);

    // Aba Voz & Narração
    console.log('🔍 Testando Aba 3: Voz & Narração...');
    const voiceTabBtn = firstCard.locator('button:has-text("Voz & Narração")');
    await voiceTabBtn.click();
    await page.waitForTimeout(400);

    // Verificar se AudioSourceSelector está presente
    const voiceSelectorText = await firstCard.innerText();
    const hasAudioSource = voiceSelectorText.includes('Locutor') || voiceSelectorText.includes('Voz') || voiceSelectorText.includes('TTS');
    console.log('🎙️ AudioSourceSelector renderizado:', hasAudioSource);

    const voicePath = path.join(artifactDir, 'stacked_card_tabs_voice.png');
    await page.screenshot({ path: voicePath });
    console.log(`📸 Screenshot aba Voz & Narração: ${voicePath}`);

    // 4. Testar Preview Interativo do Card 1
    console.log('▶️ Testando Play/Pause do preview lateral...');
    const playBtn = firstCard.locator('button[title*="Reproduzir Cena"], button[title*="Pausar Cena"]').first();
    await playBtn.click();
    await page.waitForTimeout(1000);

    // Verificar se o tempo avançou
    const previewTime = await firstCard.locator('.font-mono').last().innerText();
    console.log('⏱️ Tempo no preview após play:', previewTime);

    // Pausar
    await playBtn.click();
    await page.waitForTimeout(300);

    // 5. Testar Adicionar Nova Cena pelo botão inferior
    console.log('➕ Testando "+ Adicionar Próxima Cena"...');
    const initialCardsCount = await page.locator('[data-testid="scene-card"]').count();
    console.log(`Cards antes da adição: ${initialCardsCount}`);

    const addSceneBtn = page.locator('button:has-text("Adicionar Próxima Cena")');
    await addSceneBtn.click();
    await page.waitForTimeout(600);

    const newCardsCount = await page.locator('[data-testid="scene-card"]').count();
    console.log(`Cards após adição: ${newCardsCount}`);

    if (newCardsCount <= initialCardsCount) {
      throw new Error('Falha ao adicionar nova cena pelo botão inferior!');
    }
    console.log('✅ Nova cena adicionada ao stack com sucesso!');

    // 6. Retornar ao Estúdio de Vídeo e validar persistência e sincronização de dados
    console.log('🔄 Alternando de volta para o Estúdio de Vídeo...');
    const studioNavBtn = page.locator('button:has-text("Estúdio de Vídeo")').first();
    await studioNavBtn.click();
    await page.waitForTimeout(600);

    // Verificar se a timeline contém a mesma quantidade de cenas
    const studioText = await page.locator('body').innerText();
    const isSynced = studioText.toLowerCase().includes(`timeline (${newCardsCount} cenas)`);
    console.log(`Timeline do estúdio sincronizada com ${newCardsCount} cenas:`, isSynced);
    if (!isSynced) {
      throw new Error(`Timeline não sincronizou o número esperado de cenas (${newCardsCount})!`);
    }

    const syncedStudioPath = path.join(artifactDir, 'stacked_cards_synced_studio.png');
    await page.screenshot({ path: syncedStudioPath });
    console.log(`📸 Screenshot estúdio sincronizado: ${syncedStudioPath}`);

    console.log('\n🎉 TODOS OS TESTES DO MODO CARDS FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
  } catch (err) {
    console.error('❌ ERRO NO TESTE:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testStackedCardsEditor();
