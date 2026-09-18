const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

(async () => {
  console.log('=== INICIANDO TESTES E2E: CARREGAMENTO DE IMAGENS E VÍDEOS ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('[BROWSER UNCAUGHT PAGE ERROR]', err.message);
  });

  // 1. Abrir aplicação
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(1000);
  console.log('[1/5] Aplicação carregada no estúdio.');

  // 2. Ir para Sandbox de Templates
  await page.click('button:has-text("Sandbox de Templates")');
  await page.waitForTimeout(1000);
  console.log('[2/5] Aba Sandbox de Templates aberta.');

  // 3. Testar template nativo com mídia (Device Mockup)
  const templateSelect = page.locator('select').first();
  await templateSelect.selectOption('device-mockup');
  await page.waitForTimeout(1000);

  const initialImg = await page.$('#sandbox-canvas-stage img');
  console.log('  -> Verificação Inicial Device Mockup: Imagem presente?', !!initialImg);
  if (!initialImg) {
    throw new Error('Falha: Imagem inicial de device-mockup não foi renderizada no canvas!');
  }

  // 4. Testar Upload de Imagem no Device Mockup
  await page.click('button:has-text("Props do Card")');
  await page.waitForTimeout(500);

  const fileInput = page.locator('input[type="file"]').first();
  const testImagePath = path.resolve('test_sample_image.png');
  await fileInput.setInputFiles(testImagePath);
  await page.waitForTimeout(1000);

  const uploadedImgSrc = await page.$eval('#sandbox-canvas-stage img', (el) => el.src);
  console.log('  -> Upload de imagem concluído. src da imagem no canvas:', uploadedImgSrc);
  if (!uploadedImgSrc.startsWith('blob:')) {
    throw new Error(`Falha: src da imagem não é blob URL válida! Recebido: ${uploadedImgSrc}`);
  }

  // 5. Testar Custom Template SaaS Mockup (Similar ao do usuário com URL bar e Video do Sistema)
  console.log('\n[3/5] Testando Template Customizado de SaaS Dashboard com Browser Window...');
  await page.click('button:has-text("Código TSX")');
  await page.waitForTimeout(500);

  const saasTemplateCode = `import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const saasDashboardMockupTemplate: TemplateDefinition = {
  id: 'saas-dashboard-mockup',
  name: 'SaaS Dashboard Mockup',
  category: 'Mídia & Demonstração',
  description: 'Simulador de navegador com gravação ou imagem de sistema e legenda inferior.',
  iconName: 'video',
  defaultProps: {
    url: 'https://app.plataforma.io/dashboard',
    video: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      objectFit: 'cover',
    },
    caption: 'Ambiente de produção com atualização semântica instantânea',
    accentColor: '#7D7D7D',
  },
  schema: [
    { name: 'url', label: 'Endereço URL', type: 'text', defaultValue: 'https://app.plataforma.io/dashboard' },
    { name: 'video', label: 'Video do Sistema', type: 'media', defaultValue: null },
    { name: 'caption', label: 'Legenda Inferior', type: 'text', defaultValue: 'Ambiente de produção...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#7D7D7D' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 select-none">
        <div
          className="w-full max-w-4xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ transform: \`scale(\${s})\`, opacity: s }}
        >
          {/* Top bar com green dot e URL */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 max-w-md bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-slate-300 truncate">
              {props.url}
            </div>
          </div>
          {/* Conteúdo da janela: Mídia do Sistema */}
          <div className="w-full h-[480px] relative bg-black">
            <MediaRenderer media={props.video} frame={frame} fps={fps} />
          </div>
        </div>
        {props.caption && (
          <p className="text-sm text-slate-400 mt-5 font-normal tracking-wide text-center">
            {props.caption}
          </p>
        )}
      </div>
    );
  },
};

export default saasDashboardMockupTemplate;
`;

  // Preencher código na textarea
  const codeTextarea = page.locator('textarea[spellcheck="false"]').first();
  await codeTextarea.fill(saasTemplateCode);
  await page.waitForTimeout(600);

  // Clicar em Compilar
  await page.click('button:has-text("Compilar")');
  await page.waitForTimeout(1000);

  const compileError = await page.$('.bg-rose-950');
  if (compileError) {
    const errText = await compileError.innerText();
    throw new Error(`Erro na compilação do template customizado: ${errText}`);
  }
  console.log('  -> Template customizado compilado com sucesso.');

  // Alternar para Props do Card
  await page.click('button:has-text("Props do Card")');
  await page.waitForTimeout(500);

  // Fazer upload de imagem na prop "Video do Sistema"
  const saasFileInput = page.locator('input[type="file"]').first();
  await saasFileInput.setInputFiles(testImagePath);
  await page.waitForTimeout(1000);

  // Verificar que a imagem foi renderizada DENTRO da janela do navegador
  const saasRenderedImg = await page.$('#sandbox-canvas-stage img');
  if (!saasRenderedImg) {
    throw new Error('Falha: Imagem não renderizou dentro do mockup do browser!');
  }
  const saasImgSrc = await saasRenderedImg.getAttribute('src');
  console.log('  -> Imagem carregada e renderizada dentro da janela do browser! src:', saasImgSrc);

  // Capturar screenshot do Template Sandbox com a imagem carregada dentro do mockup
  const screenshot1 = path.join(ARTIFACTS_DIR, 'sandbox_media_image_loaded.png');
  await page.screenshot({ path: screenshot1, fullPage: false });
  console.log('  -> Screenshot salvo:', screenshot1);

  // 6. Testar Vídeo em Vídeo Hero Bg
  console.log('\n[4/5] Testando renderização de vídeo nativo (Video Hero Background)...');
  await templateSelect.selectOption('video-hero-bg');
  await page.waitForTimeout(1000);

  const videoTag = await page.$('#sandbox-canvas-stage video');
  console.log('  -> Vídeo presente no palco canvas?', !!videoTag);
  if (!videoTag) {
    throw new Error('Falha: Elemento <video> não foi renderizado em video-hero-bg!');
  }
  const videoSrc = await videoTag.getAttribute('src');
  console.log('  -> src do vídeo:', videoSrc);

  // 7. Testar no Estúdio Principal (Timeline & Player)
  console.log('\n[5/5] Testando renderização de mídia no Estúdio Principal...');
  await page.click('button:has-text("Estúdio de Vídeo")');
  await page.waitForTimeout(1000);

  // Abrir Loja de Templates e adicionar Device Mockup
  await page.click('button:has-text("Loja de Templates")');
  await page.waitForTimeout(800);

  // Selecionar categoria Mídia & Demonstração
  await page.click('button:has-text("Mídia & Demonstração")');
  await page.waitForTimeout(500);

  // Adicionar Device Mockup no modal
  const modalAddButton = page.locator('.fixed.inset-0 button:has-text("Adicionar")').first();
  await modalAddButton.click({ force: true });
  await page.waitForTimeout(1000);

  // Garantir que modal fechou (pressiona Escape se ainda estiver aberto)
  const modalIsOpen = await page.$('.fixed.inset-0');
  if (modalIsOpen) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // Clicar no último card adicionado na timeline para posicionar o playhead
  const cardsInStrip = page.locator('div[draggable="true"]');
  const stripCount = await cardsInStrip.count();
  console.log(`  -> Cards na timeline: ${stripCount}`);
  if (stripCount > 0) {
    await cardsInStrip.last().click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Verificar se o card foi adicionado e a mídia é renderizada no player
  const playerMedia = await page.waitForSelector(
    '#remotion-canvas-stage img, #remotion-canvas-stage video',
    { timeout: 8000 }
  );
  console.log('  -> Elemento de mídia renderizado no player do estúdio?', !!playerMedia);
  if (!playerMedia) {
    throw new Error('Falha: Mídia não foi renderizada no player principal do estúdio!');
  }

  const screenshot2 = path.join(ARTIFACTS_DIR, 'studio_media_player_rendered.png');
  await page.screenshot({ path: screenshot2, fullPage: false });
  console.log('  -> Screenshot do estúdio salvo:', screenshot2);

  console.log('\n=== TODOS OS 5 TESTES E2E DE MÍDIA PASSARAM COM 100% DE SUCESSO! ===');
  await browser.close();
})();
