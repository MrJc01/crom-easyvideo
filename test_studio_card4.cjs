const { chromium } = require('playwright');
const path = require('path');

async function testCard4InStudio() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const artifactDir = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Abrir Loja de Templates e adicionar deep-dive-architecture
  await page.locator('button:has-text("Loja de Templates")').click();
  await page.waitForTimeout(500);

  const arqTab = page.locator('button:has-text("Arquitetura & IA")').first();
  if (await arqTab.isVisible()) {
    await arqTab.click();
    await page.waitForTimeout(300);
  }

  // Clica no card para selecionar e adiciona
  await page.locator('text=Arquitetura Completa de Sistema').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Adicionar Template")').click();
  await page.waitForTimeout(800);

  // Clica no último card da timeline (Cena 4)
  const lastCard = page.locator('div[draggable="true"]').last();
  await lastCard.click();
  await page.waitForTimeout(600);

  // Agora no inspector da direita, verificar cena ativa
  const inspectorText = await page.locator('body').innerText();
  console.log('Inspector text includes Arquitetura:', inspectorText.includes('Arquitetura Completa de Sistema'));

  // Clicar na aba "Duração" no Inspector para conferir os frames
  const durTab = page.locator('button:has-text("Duração")').first();
  if (await durTab.isVisible()) {
    await durTab.click();
    await page.waitForTimeout(300);
  }

  const shotPath = path.join(artifactDir, 'studio_deep_dive_card_inspector.png');
  await page.screenshot({ path: shotPath });
  console.log(`📸 Screenshot salvo em: ${shotPath}`);

  await browser.close();
}

testCard4InStudio();
