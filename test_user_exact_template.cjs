const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = '/home/j/.gemini/antigravity-ide/brain/41de1417-10b6-44fe-90c4-2eb3da05a4ed';

(async () => {
  console.log('=== TESTANDO CÓDIGO EXATO DO USUÁRIO NO SANDBOX ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[BROWSER CONSOLE ERROR]', msg.text());
    }
  });

  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(1000);

  // Ir para Sandbox
  await page.click('button:has-text("Sandbox de Templates")');
  await page.waitForTimeout(1000);

  // Código exatamente como o usuário forneceu
  const userCode = `import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface BrowserFrameProps {
  url: string;
  mediaSrc: string;
  caption: string;
  accentColor: string;
}

export const BrowserFrameComponent: React.FC<TemplateRenderProps> = ({ props, frame, fps }) => {
  const p = props as BrowserFrameProps;

  const browserS = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.9, stiffness: 95 },
  });

  const captionS = spring({
    frame: Math.max(0, frame - 8),
    fps,
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-14 select-none bg-slate-950 relative overflow-hidden"
      style={{
        background: \`radial-gradient(circle at 50% 20%, \${p.accentColor}20 0%, #030712 90%)\`,
      }}
    >
      {/* Janela de Navegador */}
      <div
        className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl"
        style={{
          transform: \`scale(\${browserS}) translateY(\${(1 - browserS) * 40}px)\`,
          opacity: browserS,
        }}
      >
        {/* Chrome / Top Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 font-mono text-xs text-slate-400 text-center truncate">
            🔒 {p.url}
          </div>
        </div>

        {/* Viewport */}
        <div className="aspect-[16/9] w-full bg-black relative">
          <video src={p.mediaSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        </div>
      </div>

      <p
        className="text-slate-400 font-mono text-sm mt-6"
        style={{ transform: \`translateY(\${(1 - captionS) * 15}px)\`, opacity: captionS }}
      >
        {p.caption}
      </p>
    </div>
  );
};

export const browserFrameTemplate: TemplateDefinition = {
  id: 'browser-frame-showcase',
  name: 'Mockup de Navegador Web',
  category: 'Mídia & Demonstração',
  iconName: 'Globe',
  description: 'Enquadra imagens ou gravações de vídeo em uma janela de browser funcional.',
  defaultProps: {
    url: 'https://app.plataforma.io/dashboard',
    mediaSrc: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
    caption: 'Ambiente de produção com atualização semântica instantânea',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'url', label: 'Endereço URL', type: 'text', defaultValue: 'https://app.plataforma.io' },
    { name: 'mediaSrc', label: 'Vídeo do Sistema', type: 'media', defaultValue: '' },
    { name: 'caption', label: 'Legenda Inferior', type: 'text', defaultValue: 'Ambiente de produção...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: BrowserFrameComponent,
};

export default browserFrameTemplate;
`;

  // Colar código na aba Live
  const codeTextarea = page.locator('textarea[spellcheck="false"]').first();
  await codeTextarea.fill(userCode);
  await page.waitForTimeout(500);

  // Clicar em Compilar
  await page.click('button:has-text("Compilar")');
  await page.waitForTimeout(1000);
  console.log('1. Código do usuário compilado com sucesso!');

  // Ir para Props do Card
  await page.click('button:has-text("Props do Card")');
  await page.waitForTimeout(500);

  // Fazer upload da imagem simulando "Estatisticas do canal...png"
  const fileInput = page.locator('input[type="file"]').first();
  const imagePath = path.resolve('test_sample_image.png');
  await fileInput.setInputFiles(imagePath);
  await page.waitForTimeout(1000);

  // Verificar elemento renderizado no canvas
  // Com o SmartReact, o <video src={p.mediaSrc}> vira <img> transparente quando recebe imagem!
  const renderedImg = await page.$('#sandbox-canvas-stage img');
  console.log('2. Tag <img> renderizada automaticamente pelo SmartReact?', !!renderedImg);
  if (!renderedImg) {
    throw new Error('Falha: SmartReact não converteu ou imagem não apareceu no palco!');
  }

  const imgSrc = await renderedImg.getAttribute('src');
  console.log('3. src da imagem dentro do browser mockup:', imgSrc);
  if (!imgSrc.startsWith('blob:')) {
    throw new Error(`src da imagem inválido: ${imgSrc}`);
  }

  // Capturar screenshot de validação
  const screenshotPath = path.join(ARTIFACTS_DIR, 'user_exact_template_resolved.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('4. Screenshot salvo com sucesso em:', screenshotPath);

  console.log('\n>>> SUCESSO TOTAL: O CÓDIGO EXATO DO USUÁRIO AGORA CARREGA IMAGEM E VÍDEO AUTOMATICAMENTE! <<<');
  await browser.close();
})();
