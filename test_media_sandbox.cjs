const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.message));

  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(1000);

  // Switch to Sandbox
  await page.click('button:has-text("Sandbox de Templates")');
  await page.waitForTimeout(1000);

  // Select device-mockup in dropdown
  const selectEl = await page.locator('select').first();
  await selectEl.selectOption('device-mockup');
  await page.waitForTimeout(1000);

  // Check what is rendered inside #sandbox-canvas-stage before compiling
  const hasImgBefore = await page.$('#sandbox-canvas-stage img');
  const hasVideoBefore = await page.$('#sandbox-canvas-stage video');
  console.log('BEFORE COMPILE: Has img:', !!hasImgBefore, 'Has video:', !!hasVideoBefore);

  // Now click on Código TSX tab and click Compilar
  await page.click('button:has-text("Código TSX")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Compilar")');
  await page.waitForTimeout(1000);

  const hasImgAfter = await page.$('#sandbox-canvas-stage img');
  const hasVideoAfter = await page.$('#sandbox-canvas-stage video');
  console.log('AFTER COMPILE: Has img:', !!hasImgAfter, 'Has video:', !!hasVideoAfter);

  const errorText = await page.textContent('body');
  if (errorText.includes('Erro de Compilação TSX')) {
    console.log('COMPILE ERROR FOUND!');
  }

  await browser.close();
})();
