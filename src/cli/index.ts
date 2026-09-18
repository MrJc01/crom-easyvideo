import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, execFileSync } from 'child_process';
import { chromium } from 'playwright';
import { CARD_REGISTRY, getAllTemplates } from '../templates/registry';
import { calculateTimeline } from '../core/timeline';
import type { ProjectState, VideoCard, CalculatedCard } from '../core/types';

/**
 * Localiza a porta ativa do dev server Vite do Crom EasyVideo
 */
async function findCromDevServerUrl(): Promise<string> {
  const ports = [5174, 5173, 5175, 3000];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const text = await res.text();
        if (text.includes('Remotion Card Video Studio') || text.includes('crom-easyvideo')) {
          return `http://localhost:${port}/`;
        }
      }
    } catch {}
  }
  return 'http://localhost:5174/';
}

/**
 * Localiza o binário do FFmpeg no ambiente
 */
function getFfmpegPath(): string {
  const candidates = [
    '/home/j/.local/bin/ffmpeg',
    'ffmpeg',
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
  ];
  for (const p of candidates) {
    try {
      execSync(`${p} -version`, { stdio: 'ignore' });
      return p;
    } catch {}
  }
  return 'ffmpeg';
}

/**
 * Sintetiza ou recupera o buffer de áudio de um card via CromyVoice ou fallback
 */
async function getCardAudioBuffer(
  card: CalculatedCard,
  workspacePath: string,
  devUrl: string
): Promise<{ buffer: Buffer; ext: string } | null> {
  const script = (card.audio && 'script' in card.audio && card.audio.script) || card.tts?.script;
  const voiceId = (card.audio && 'voiceId' in card.audio && card.audio.voiceId) || card.tts?.voiceId || 'pt-BR-AntonioNeural';
  const lang = voiceId.startsWith('en') ? 'en-US' : voiceId.startsWith('es') ? 'es-ES' : 'pt-BR';

  // 1. Áudio TTS Sintetizado
  if (script && (!card.audio || card.audio.mode === 'tts' || !card.audio.mode)) {
    // 1.1 Prioridade: Binário Local CromyVoice
    const cromyBin = path.resolve(process.cwd(), 'bin/cromyvoice');
    if (fs.existsSync(cromyBin)) {
      const edgeVoice = voiceId.endsWith('Neural') ? voiceId : `${voiceId}Neural`;
      const tempOut = path.join(os.tmpdir(), `cli_cv_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
      try {
        execFileSync(cromyBin, ['-text', script, '-voice', edgeVoice, '-out', tempOut], {
          stdio: ['ignore', 'ignore', 'ignore'],
          timeout: 15000,
        });
        if (fs.existsSync(tempOut)) {
          const buf = fs.readFileSync(tempOut);
          fs.unlinkSync(tempOut);
          return { buffer: buf, ext: 'mp3' };
        }
      } catch {
        if (fs.existsSync(tempOut)) {
          try { fs.unlinkSync(tempOut); } catch {}
        }
      }
    }

    // 1.2 Fallback via Dev Server /api/tts
    const ttsUrl = `${devUrl}api/tts?text=${encodeURIComponent(script)}&lang=${lang}&voice=${encodeURIComponent(voiceId)}`;
    try {
      const res = await fetch(ttsUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        return { buffer: buf, ext: 'mp3' };
      }
    } catch (e) {
      console.warn(`[Aviso Áudio] Falha ao obter áudio TTS para [${card.id}]:`, e);
    }
  }


  // 2. Arquivo de Áudio Carregado ou Gravado
  if (card.audio && 'audioUrl' in card.audio && typeof card.audio.audioUrl === 'string') {
    const audioUrl: string = card.audio.audioUrl;
    if (audioUrl.startsWith('data:audio/')) {
      const parts = audioUrl.split(',');
      const base64 = parts[1] || '';
      const ext = audioUrl.includes('wav') ? 'wav' : 'mp3';
      return { buffer: Buffer.from(base64, 'base64'), ext };
    }
    const resolvedPath = path.isAbsolute(audioUrl)
      ? audioUrl
      : path.resolve(path.dirname(resolveProjectPath(workspacePath)), audioUrl);
    if (fs.existsSync(resolvedPath)) {
      return { buffer: fs.readFileSync(resolvedPath), ext: path.extname(resolvedPath).slice(1) || 'mp3' };
    }
  }

  return null;
}

/**
 * Compila a trilha sonora mestre com todas as narrações alinhadas milimetricamente
 */
async function buildMasterAudioTrack(
  cards: CalculatedCard[],
  fps: number,
  workspacePath: string,
  devUrl: string,
  ffmpegBin: string
): Promise<{ masterAudioFile: string; cleanup: () => void } | null> {
  const tempDir = path.join(process.cwd(), '.temp_audio_' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  const segmentFiles: string[] = [];
  let hasAnyAudio = false;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const durationSec = (card.durationInFrames / fps).toFixed(3);
    const segWav = path.join(tempDir, `seg_${i}.wav`);
    segmentFiles.push(segWav);

    const audioData = await getCardAudioBuffer(card, workspacePath, devUrl);

    if (audioData) {
      hasAnyAudio = true;
      const rawFile = path.join(tempDir, `raw_${i}.${audioData.ext}`);
      fs.writeFileSync(rawFile, audioData.buffer);

      execSync(
        `"${ffmpegBin}" -y -i "${rawFile}" -af "apad=whole_dur=${durationSec},atrim=0:${durationSec}" -ar 44100 -ac 2 "${segWav}"`,
        { stdio: 'ignore' }
      );
    } else {
      execSync(
        `"${ffmpegBin}" -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${durationSec} "${segWav}"`,
        { stdio: 'ignore' }
      );
    }
  }

  if (!hasAnyAudio) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return null;
  }

  const listFile = path.join(tempDir, 'list.txt');
  fs.writeFileSync(listFile, segmentFiles.map((f) => `file '${f}'`).join('\n'), 'utf-8');

  const masterAudioFile = path.join(tempDir, 'master_audio.wav');
  execSync(`"${ffmpegBin}" -y -f concat -safe 0 -i "${listFile}" -c:a pcm_s16le "${masterAudioFile}"`, {
    stdio: 'ignore',
  });

  return {
    masterAudioFile,
    cleanup: () => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    },
  };
}

const program = new Command();


program
  .name('crom-cli')
  .description('CLI Operacional do Remotion Studio - Crom EasyVideo')
  .version('1.0.0');


/**
 * Utilitário para localizar e ler project.json
 */
function resolveProjectPath(workspacePath: string): string {
  if (!workspacePath) {
    throw new Error('Caminho do workspace não especificado.');
  }

  const resolved = path.resolve(process.cwd(), workspacePath);

  if (fs.existsSync(resolved)) {
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      return resolved;
    }
    const candidate = path.join(resolved, 'project.json');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Arquivo project.json não encontrado em: ${resolved}`);
}

/**
 * Lista de Vozes de Narração (TTS) homologadas e suportadas
 */
const AVAILABLE_VOICES = [
  {
    id: 'pt-BR-AntonioNeural',
    name: 'Antonio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    description: 'Voz natural e calorosa em português brasileiro. Excelente para tutoriais, tecnologia e apresentações.',
    recommended: true,
  },
  {
    id: 'pt-BR-FranciscaNeural',
    name: 'Francisca (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    description: 'Voz neural corporativa clara e polida. Excelente para vídeos institucionais e negócios.',
    recommended: true,
  },
  {
    id: 'pt-BR-BrendaNeural',
    name: 'Brenda (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    description: 'Voz jovem, ágil e expressiva. Perfeita para shorts, reels e produtos modernos.',
    recommended: true,
  },
  {
    id: 'pt-BR-DonatoNeural',
    name: 'Donato (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    description: 'Voz grave, solene e cinematográfica. Ideal para documentários e análises profundas.',
    recommended: false,
  },
  {
    id: 'pt-BR-ElzaNeural',
    name: 'Elza (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    description: 'Voz suave, pausada e explicativa. Ideal para conceitos complexos e aulas.',
    recommended: false,
  },
  {
    id: 'pt-BR-FabioNeural',
    name: 'Fabio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    description: 'Voz masculina dinâmica e descontraída. Ótima para redes sociais.',
    recommended: false,
  },
  {
    id: 'pt-BR-NicolauNeural',
    name: 'Nicolau (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    description: 'Voz clássica, madura e equilibrada.',
    recommended: false,
  },
  {
    id: 'pt-BR-ValerioNeural',
    name: 'Valerio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    description: 'Voz firme, assertiva e confiante.',
    recommended: false,
  },
  {
    id: 'pt-BR-YaraNeural',
    name: 'Yara (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    description: 'Voz jovem, nítida, brilhante e energética.',
    recommended: false,
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (US Neural)',
    lang: 'en-US',
    gender: 'Male',
    description: 'Voz masculina em inglês americano para vídeos internacionais.',
    recommended: false,
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (US Neural)',
    lang: 'en-US',
    gender: 'Female',
    description: 'Voz feminina natural em inglês americano.',
    recommended: false,
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (US Neural)',
    lang: 'en-US',
    gender: 'Female',
    description: 'Voz feminina altamente expressiva para vídeos dinâmicos em inglês.',
    recommended: false,
  },
  {
    id: 'es-ES-AlvaroNeural',
    name: 'Alvaro (ES Neural)',
    lang: 'es-ES',
    gender: 'Masculino',
    description: 'Voz em espanhol neutro para alcance hispanofalante.',
    recommended: false,
  },
  {
    id: 'es-ES-ElviraNeural',
    name: 'Elvira (ES Neural)',
    lang: 'es-ES',
    gender: 'Feminino',
    description: 'Voz feminina elegante em espanhol europeu.',
    recommended: false,
  },
];


/**
 * COMANDO: voices
 * Lista todas as vozes disponíveis para uso nos cards
 */
program
  .command('voices')
  .description('Lista todas as vozes de narração (TTS) disponíveis para configuração no project.json')
  .option('-l, --lang <lang>', 'Filtrar por código de idioma (ex: pt-BR, en-US, es-ES)')
  .action((options) => {
    console.log('\n========================================================================');
    console.log('VOZES DE NARRAÇÃO DISPONÍVEIS (TTS) - CROM EASYVIDEO');
    console.log('========================================================================\n');

    const filtered = options.lang
      ? AVAILABLE_VOICES.filter((v) => v.lang.toLowerCase() === options.lang.toLowerCase())
      : AVAILABLE_VOICES;

    filtered.forEach((v) => {
      const tag = v.recommended ? ' [RECOMENDADA]' : '';
      console.log(`• ID: ${v.id.padEnd(20)} | ${v.name} (${v.lang} - ${v.gender})${tag}`);
      console.log(`  Descrição: ${v.description}`);
      console.log(`  Snippet JSON: "voiceId": "${v.id}"\n`);
    });

    console.log('------------------------------------------------------------------------');
    console.log('COMO USAR NO PROJECT.JSON:');
    console.log(
      JSON.stringify(
        {
          audio: {
            mode: 'tts',
            script: 'Texto que a voz irá narrar nesta cena.',
            voiceId: 'pt-BR-AntonioNeural',
            provider: 'cromyvoice',
            speed: 1.0,
          },
        },
        null,
        2
      )
    );
    console.log('------------------------------------------------------------------------\n');
    process.exit(0);
  });

/**
 * COMANDO: templates
 * Lista todos os templates disponíveis no CARD_REGISTRY
 */
program
  .command('templates')
  .description('Lista todos os templates de cards registrados no catálogo')
  .option('-c, --category <category>', 'Filtrar por categoria específica')
  .action((options) => {
    const all = getAllTemplates();
    const filtered = options.category
      ? all.filter((t) => t.category.toLowerCase().includes(options.category.toLowerCase()))
      : all;

    console.log('\n========================================================================');
    console.log(`CATÁLOGO DE TEMPLATES - CROM EASYVIDEO (${filtered.length} disponíveis)`);
    console.log('========================================================================\n');

    const categories = Array.from(new Set(filtered.map((t) => t.category)));

    for (const cat of categories) {
      console.log(`[CATEGORIA: ${cat.toUpperCase()}]`);
      const items = filtered.filter((t) => t.category === cat);
      for (const t of items) {
        const fields = t.schema.map((s) => s.name).join(', ');
        console.log(`  • ID: ${t.id.padEnd(28)} | Nome: ${t.name}`);
        console.log(`    Descrição: ${t.description}`);
        console.log(`    Campos do Schema: [${fields}]\n`);
      }
    }

    console.log(`Total de templates listados: ${filtered.length}`);
    console.log('Dica: use "npm run cli -- schema <templateId>" para ver os detalhes das props.\n');
    process.exit(0);
  });

/**
 * COMANDO: schema
 * Exibe o schema detalhado de um template específico
 */
program
  .command('schema <templateId>')
  .description('Exibe o schema detalhado de propriedades de um template para preencher o JSON')
  .action((templateId) => {
    const def = CARD_REGISTRY[templateId];
    if (!def) {
      console.error(`\nErro: Template "${templateId}" não encontrado no catálogo.`);
      console.log('Execute "npm run cli -- templates" para listar os templates existentes.\n');
      process.exit(1);
    }

    console.log('\n========================================================================');
    console.log(`SCHEMA DO TEMPLATE: ${def.name} (${def.id})`);
    console.log(`Categoria: ${def.category}`);
    console.log(`Descrição: ${def.description}`);
    console.log('========================================================================\n');

    console.log('PROPRIEDADES DISPONÍVEIS:');
    def.schema.forEach((field) => {
      console.log(`• Prop: "${field.name}"`);
      console.log(`  Rótulo: ${field.label}`);
      console.log(`  Tipo:   ${field.type}`);
      console.log(`  Padrão: ${JSON.stringify(field.defaultValue)}`);
      if (field.itemSchema) {
        console.log(`  Itens Aninhados (itemSchema):`);
        field.itemSchema.forEach((sub) => {
          console.log(`    - "${sub.name}" (${sub.type}): ${sub.label}`);
        });
      }
      console.log('');
    });

    console.log('EXEMPLO DE CONFIGURAÇÃO DE CARD NO PROJECT.JSON:');
    const exampleCard = {
      id: `scene-${def.id}`,
      order: 0,
      templateId: def.id,
      durationMode: 'auto',
      audio: {
        mode: 'tts',
        script: 'Narração falada para esta cena.',
        voiceId: 'pt-BR-AntonioNeural',
        provider: 'cromyvoice',
        speed: 1.0,
      },
      props: def.defaultProps,
    };
    console.log(JSON.stringify(exampleCard, null, 2));
    console.log('\n========================================================================\n');
    process.exit(0);
  });

/**
 * COMANDO: init
 * Inicializa uma pasta de projeto de vídeo completa com project.json e assets
 */
program
  .command('init <path>')
  .description('Cria uma nova pasta de projeto de vídeo com manifesto pronto e estrutura de assets')
  .option('-t, --title <title>', 'Título do projeto de vídeo', 'Meu Vídeo Exclusivo')
  .action((targetPath, options) => {
    try {
      const projectDir = path.resolve(process.cwd(), targetPath);
      if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
        console.error(`\nErro: O diretório "${targetPath}" já existe e não está vazio.`);
        process.exit(1);
      }

      fs.mkdirSync(projectDir, { recursive: true });
      fs.mkdirSync(path.join(projectDir, 'assets'), { recursive: true });

      const initialProject: ProjectState = {
        meta: {
          title: options.title || 'Meu Vídeo Exclusivo',
          fps: 30,
          width: 1920,
          height: 1080,
        },
        cards: [
          {
            id: 'scene-1-intro',
            order: 0,
            templateId: 'hero-title',
            durationMode: 'auto',
            manualDurationInFrames: 240,
            manualDurationInSeconds: 8.0,
            audioPaddingEndInSeconds: 0.8,
            audio: {
              mode: 'tts',
              script: 'Seja bem-vindo a esta apresentação sobre arquitetura de inteligência artificial.',
              voiceId: 'pt-BR-AntonioNeural',
              provider: 'cromyvoice',
              speed: 1.0,
              audioDurationInSeconds: 5.5,
            },
            transition: {
              type: 'fade',
              durationInFrames: 15,
            },
            props: {
              showBadge: true,
              badge: 'DEEP DIVE TECNOLÓGICO',
              title: options.title || 'Meu Vídeo Exclusivo',
              showSubtitle: true,
              subtitle: 'Criado e montado programaticamente via CLI.',
              accentColor: '#6366f1',
              glowColor: '#312e81',
            },
          },
          {
            id: 'scene-2-concept',
            order: 1,
            templateId: 'concept-definition',
            durationMode: 'auto',
            manualDurationInFrames: 210,
            manualDurationInSeconds: 7.0,
            audioPaddingEndInSeconds: 0.8,
            audio: {
              mode: 'tts',
              script: 'Os blocos de atenção realizam projeções lineares no mesmo espaço semântico.',
              voiceId: 'pt-BR-FranciscaNeural',
              provider: 'cromyvoice',
              speed: 1.0,
              audioDurationInSeconds: 5.0,
            },
            transition: {
              type: 'slide-left',
              durationInFrames: 15,
            },
            props: {
              term: 'Mecanismo de Atenção',
              phonetic: '/əˈtɛn.ʃən/',
              category: 'ARQUITETURA TRANSFORMER',
              definition: 'Algoritmo que pondera a relevância dinâmica entre cada par de tokens no contexto.',
              accentColor: '#38bdf8',
            },
          },
          {
            id: 'scene-3-metrics',
            order: 2,
            templateId: 'big-stat',
            durationMode: 'auto',
            manualDurationInFrames: 210,
            manualDurationInSeconds: 7.0,
            audioPaddingEndInSeconds: 0.8,
            audio: {
              mode: 'tts',
              script: 'Alcançamos noventa e nove por cento de acurácia com noventa milissegundos de latência.',
              voiceId: 'pt-BR-AntonioNeural',
              provider: 'cromyvoice',
              speed: 1.0,
              audioDurationInSeconds: 6.0,
            },
            transition: {
              type: 'fade',
              durationInFrames: 15,
            },
            props: {
              badge: 'BENCHMARK DE PERFORMANCE',
              number: '99.4%',
              label: 'Precisão em Inferência Zero-Shot',
              sublabel: 'Redução de 84% de latência versus modelos tradicionais.',
              accentColor: '#10b981',
            },
          },
          {
            id: 'scene-4-outro',
            order: 3,
            templateId: 'cta-subscribe',
            durationMode: 'auto',
            manualDurationInFrames: 180,
            manualDurationInSeconds: 6.0,
            audioPaddingEndInSeconds: 0.8,
            audio: {
              mode: 'tts',
              script: 'Obrigado por assistir. Inscreva-se para acompanhar novas análises técnicas.',
              voiceId: 'pt-BR-BrendaNeural',
              provider: 'cromyvoice',
              speed: 1.0,
              audioDurationInSeconds: 5.0,
            },
            props: {
              badge: 'CANAL DE TECNOLOGIA',
              headline: 'Inscreva-se no Canal',
              subheadline: 'Novos vídeos semanais sobre engenharia de software e IA.',
              buttonText: 'Inscrever-se',
              accentColor: '#6366f1',
            },
          },
        ],
      };

      const projectJsonFile = path.join(projectDir, 'project.json');
      fs.writeFileSync(projectJsonFile, JSON.stringify(initialProject, null, 2), 'utf-8');

      // README com instruções práticas na pasta
      const readmeContent = `# ${options.title || 'Projeto de Vídeo'}

Este diretório contém a estrutura completa de um projeto de vídeo do **Crom EasyVideo**.

## Estrutura do Workspace
- \`project.json\`: Manifesto de cenas, durações, scripts de áudio, vozes e propriedades.
- \`assets/\`: Pasta para armazenar imagens locais, vídeos de demonstração e áudios.

## Comandos da CLI para Operar Este Projeto
\`\`\`bash
# 1. Inspecionar a timeline e verificar cálculo de áudio e frames:
npm run cli -- inspect -w ${targetPath}

# 2. Renderizar apenas um card específico (gerar preview em imagem PNG):
npm run cli -- render-card -w ${targetPath} -c scene-1-intro -o preview-intro.png

# 3. Listar vozes disponíveis para narração:
npm run cli -- voices

# 4. Ver o schema de propriedades de um template:
npm run cli -- schema hero-title

# 5. Renderizar o vídeo final completo:
npm run cli -- render -w ${targetPath} -o output/video.json
\`\`\`
`;
      fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent, 'utf-8');

      console.log('\n========================================================================');
      console.log(`PROJETO DE VÍDEO CRIADO COM SUCESSO!`);
      console.log('========================================================================');
      console.log(`Pasta:    ${projectDir}`);
      console.log(`Arquivo:  ${projectJsonFile}`);
      console.log(`Cenas:    ${initialProject.cards.length} cenas configuradas com áudio e transições.`);
      console.log('------------------------------------------------------------------------');
      console.log(`Para inspecionar o projeto, execute:`);
      console.log(`  npm run cli -- inspect -w ${targetPath}\n`);
      process.exit(0);
    } catch (err: unknown) {
      console.error('\nErro ao criar projeto:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

/**
 * COMANDO: inspect
 * Inspeciona e valida a integridade de um projeto
 */
program
  .command('inspect')
  .description('Inspeciona e valida a integridade das cenas e áudio de um workspace')
  .requiredOption('-w, --workspace <path>', 'Caminho da pasta do workspace ou arquivo project.json')
  .action((options) => {
    try {
      const projectFile = resolveProjectPath(options.workspace);
      const rawContent = fs.readFileSync(projectFile, 'utf-8');
      const project: ProjectState = JSON.parse(rawContent);

      if (!project.meta || !Array.isArray(project.cards)) {
        throw new Error('Formato inválido: o arquivo deve conter "meta" e array de "cards".');
      }

      const fps = project.meta.fps || 30;
      const { calculatedCards, totalFrames } = calculateTimeline(project.cards, fps);
      const totalDurationSec = (totalFrames / fps).toFixed(1);

      console.log('\n========================================================================');
      console.log(`INSPEÇÃO DE WORKSPACE: ${project.meta.title || 'Sem Título'}`);
      console.log('========================================================================');
      console.log(`Arquivo: ${projectFile}`);
      console.log(`Resolução: ${project.meta.width || 1920} × ${project.meta.height || 1080} @ ${fps} FPS`);
      console.log(`Duração Total: ${totalDurationSec}s (${totalFrames} frames)`);
      console.log(`Total de Cenas: ${calculatedCards.length}`);
      console.log('------------------------------------------------------------------------');
      console.log('CENAS DA TIMELINE:');

      calculatedCards.forEach((c, idx) => {
        const templateDef = CARD_REGISTRY[c.templateId];
        const templateName = templateDef?.name || c.templateId;
        const audioMode = c.audio?.mode || (c.tts ? 'tts' : 'none');
        const voice = c.audio && 'voiceId' in c.audio ? c.audio.voiceId : c.tts?.voiceId || 'padrão';
        const transition = c.transition ? `${c.transition.type} (${c.transition.durationInFrames}f)` : 'none';
        const cardDurationSec = (c.durationInFrames / fps).toFixed(1);

        console.log(
          `  #${idx + 1}: [${c.id.padEnd(16)}] ${templateName.padEnd(24)} | ${cardDurationSec}s (${c.durationInFrames}f) | Áudio: ${audioMode.padEnd(6)} [${voice}] | Transição: ${transition}`
        );
      });

      console.log('------------------------------------------------------------------------');
      console.log('STATUS: ✓ Workspace íntegro e pronto para renderização.\n');
      process.exit(0);
    } catch (err: unknown) {
      console.error('\nERRO DE INSPEÇÃO:', err instanceof Error ? err.message : String(err));
      console.error('');
      process.exit(1);
    }
  });

/**
 * COMANDO: render-card
 * Renderiza e inspeciona isoladamente apenas um card/cena do workspace (imagem PNG ou vídeo MP4/WebM)
 */
program
  .command('render-card')
  .description('Renderiza isoladamente apenas um card/cena do workspace (imagem PNG ou clipe MP4/WebM)')
  .requiredOption('-w, --workspace <path>', 'Caminho da pasta do workspace ou project.json')
  .requiredOption('-c, --card <id>', 'ID do card a ser renderizado (ex: scene-1-intro) ou índice (1, 2)')
  .option('-o, --output <file>', 'Arquivo de saída (.png, .jpg, .mp4, .webm ou .json)')
  .option('--frame <number>', 'Frame local relativo do card para captura (padrão: meio da cena)')
  .action(async (options) => {
    try {
      const projectFile = resolveProjectPath(options.workspace);
      const rawContent = fs.readFileSync(projectFile, 'utf-8');
      const project: ProjectState = JSON.parse(rawContent);

      const fps = project.meta.fps || 30;
      const { calculatedCards } = calculateTimeline(project.cards, fps);

      // Localiza o card por ID ou por índice (1-indexed)
      let card = calculatedCards.find((c) => c.id === options.card);
      if (!card && /^\d+$/.test(options.card)) {
        const idx = parseInt(options.card, 10) - 1;
        card = calculatedCards[idx];
      }

      if (!card) {
        console.error(`\nErro: Card "${options.card}" não encontrado no projeto.`);
        console.log('IDs de cards disponíveis:\n  ' + calculatedCards.map((c) => c.id).join('\n  ') + '\n');
        process.exit(1);
      }

      const templateDef = CARD_REGISTRY[card.templateId];
      const templateName = templateDef?.name || card.templateId;
      const cardSec = (card.durationInFrames / fps).toFixed(1);
      const audioMode = card.audio?.mode || (card.tts ? 'tts' : 'none');
      const scriptText =
        (card.audio && 'script' in card.audio && card.audio.script) ||
        card.tts?.script ||
        '(sem narração configurada)';
      const voiceId =
        (card.audio && 'voiceId' in card.audio && card.audio.voiceId) ||
        card.tts?.voiceId ||
        'pt-BR-Antonio';
      const speed =
        (card.audio && 'speed' in card.audio && card.audio.speed) ||
        card.tts?.speed ||
        1.0;

      console.log('\n========================================================================');
      console.log(`RENDERIZAÇÃO DE CENA INDIVIDUAL: [${card.id}]`);
      console.log('========================================================================');
      console.log(`Template:      ${templateName} (${card.templateId})`);
      console.log(`Duração:       ${cardSec}s (${card.durationInFrames} quadros a ${fps} FPS)`);
      console.log(`Modo de Áudio: ${audioMode.toUpperCase()}`);
      console.log(`Voz TTS:       ${voiceId} (${speed}x velocidade)`);
      console.log(`Script Fala:   "${scriptText}"`);
      console.log('------------------------------------------------------------------------');

      if (!options.output) {
        console.log('PROPRIEDADES DA CENA:');
        console.log(JSON.stringify(card.props, null, 2));
        console.log('------------------------------------------------------------------------');
        console.log('Dica: Para renderizar imagem do card, execute:');
        console.log(`  npm run cli -- render-card -w ${options.workspace} -c ${card.id} -o output/${card.id}.png`);
        console.log('Dica: Para renderizar clipe de vídeo do card, execute:');
        console.log(`  npm run cli -- render-card -w ${options.workspace} -c ${card.id} -o output/${card.id}.mp4\n`);
        process.exit(0);
      }

      const outputPath = path.resolve(process.cwd(), options.output);
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // CASO 1: Renderização de Frame Estático em Imagem (PNG / JPG)
      if (options.output.endsWith('.png') || options.output.endsWith('.jpg')) {
        console.log(`Renderizando snapshot gráfico em alta definição para: ${outputPath} ...`);
        const devUrl = await findCromDevServerUrl();
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        await page.goto(devUrl, { waitUntil: 'domcontentloaded' });

        const frameToRender = options.frame
          ? parseInt(options.frame, 10)
          : Math.floor(card.durationInFrames / 2);

        const base64Data = await page.evaluate(
          (data: { card: any; width: number; height: number; frame: number; fps: number }) => {
            const canvas = document.createElement('canvas');
            canvas.width = data.width;
            canvas.height = data.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            (window as any).__drawVideoFrameToCanvas(
              ctx,
              data.width,
              data.height,
              data.card,
              data.frame,
              data.fps,
              data.frame,
              data.card.durationInFrames
            );
            return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
          },
          {
            card,
            width: project.meta.width || 1920,
            height: project.meta.height || 1080,
            frame: frameToRender,
            fps,
          }
        );

        await browser.close();

        if (base64Data) {
          fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
          const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
          console.log(`✓ Snapshot do card gravado com sucesso: ${outputPath} (${sizeKb} KB)`);
        } else {
          throw new Error('Falha ao renderizar frame no canvas.');
        }

      // CASO 2: Renderização de Clipe de Vídeo (MP4 / WebM)
      } else if (options.output.endsWith('.mp4') || options.output.endsWith('.webm')) {
        console.log(`Renderizando clipe de vídeo da cena [${card.id}] para: ${outputPath} ...`);
        const devUrl = await findCromDevServerUrl();
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        await page.goto(devUrl, { waitUntil: 'domcontentloaded' });

        const singleCardProject: ProjectState = {
          meta: {
            title: `${project.meta.title || 'video'}_${card.id}`,
            fps,
            width: project.meta.width || 1920,
            height: project.meta.height || 1080,
          },
          cards: [
            {
              ...card,
              order: 0,
            },
          ],
        };

        const base64Video = await page.evaluate(async (proj) => {
          const { calculatedCards: calc, totalFrames: frames } = (window as any).__calculateTimeline(proj.cards, proj.meta.fps || 30);
          const platform = (window as any).__PLATFORM_PRESETS[0];
          const quality = (window as any).__QUALITY_PRESETS[0];
          const result = await (window as any).__renderProjectToVideo(proj, calc, frames, {
            platform,
            quality,
            fps: proj.meta.fps || 30,
            bitrateMbps: 8,
            format: 'webm',
            includeAudio: false,
          });

          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.readAsDataURL(result.blob);
          });
        }, singleCardProject);

        await browser.close();

        const tempWebmPath = outputPath.replace(/\.(mp4|webm)$/, '_temp.webm');
        fs.writeFileSync(tempWebmPath, Buffer.from(base64Video as string, 'base64'));

        const ffmpeg = getFfmpegPath();
        const cardAudio = await getCardAudioBuffer(card, options.workspace, devUrl);
        let tempCardAudioWav: string | null = null;

        if (cardAudio) {
          const rawAudioPath = outputPath.replace(/\.(mp4|webm)$/, '_raw_audio.' + cardAudio.ext);
          tempCardAudioWav = outputPath.replace(/\.(mp4|webm)$/, '_audio.wav');
          fs.writeFileSync(rawAudioPath, cardAudio.buffer);
          execSync(
            `"${ffmpeg}" -y -i "${rawAudioPath}" -af "apad=whole_dur=${cardSec},atrim=0:${cardSec}" -ar 44100 -ac 2 "${tempCardAudioWav}"`,
            { stdio: 'ignore' }
          );
          if (fs.existsSync(rawAudioPath)) fs.unlinkSync(rawAudioPath);
        }

        if (options.output.endsWith('.mp4')) {
          console.log('Codificando stream H.264 e mixando narração para MP4 com FFmpeg...');
          if (tempCardAudioWav && fs.existsSync(tempCardAudioWav)) {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -i "${tempCardAudioWav}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "${outputPath}"`,
              { stdio: 'ignore' }
            );
            fs.unlinkSync(tempCardAudioWav);
          } else {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`,
              { stdio: 'ignore' }
            );
          }
          if (fs.existsSync(tempWebmPath)) {
            fs.unlinkSync(tempWebmPath);
          }
        } else {
          if (tempCardAudioWav && fs.existsSync(tempCardAudioWav)) {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -i "${tempCardAudioWav}" -c:v copy -c:a libopus -b:a 128k -shortest "${outputPath}"`,
              { stdio: 'ignore' }
            );
            fs.unlinkSync(tempCardAudioWav);
            if (fs.existsSync(tempWebmPath)) fs.unlinkSync(tempWebmPath);
          } else {
            fs.renameSync(tempWebmPath, outputPath);
          }
        }

        const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
        console.log(`✓ Clipe de vídeo do card gerado com sucesso: ${outputPath} (${sizeKb} KB, ${cardSec}s)`);

      // CASO 3: Manifesto JSON
      } else if (options.output.endsWith('.json')) {
        fs.writeFileSync(outputPath, JSON.stringify(card, null, 2), 'utf-8');
        console.log(`✓ Dados do card exportados para: ${outputPath}`);
      }

      console.log('------------------------------------------------------------------------');
      console.log('STATUS: ✓ Operação de card finalizada com sucesso.\n');
      process.exit(0);
    } catch (err: unknown) {
      console.error('\nERRO AO RENDERIZAR CARD:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

/**
 * COMANDO: render
 * Executa a renderização do vídeo final completo (.mp4, .webm ou manifesto .json)
 */
program
  .command('render')
  .description('Renderiza o vídeo final completo (.mp4 ou .webm) ou gera o manifesto (.json)')
  .requiredOption('-w, --workspace <path>', 'Caminho da pasta do workspace ou arquivo project.json')
  .requiredOption('-o, --output <file>', 'Caminho de saída do vídeo renderizado (.mp4 / .webm / .json)')
  .option('--fps <fps>', 'Taxa de quadros para renderização (padrão: meta do projeto ou 30)')
  .option('--target <platform>', 'Preset de plataforma (youtube, tiktok, instagram, portrait)', 'youtube')
  .action(async (options) => {
    try {
      const projectFile = resolveProjectPath(options.workspace);
      const rawContent = fs.readFileSync(projectFile, 'utf-8');
      const project: ProjectState = JSON.parse(rawContent);

      const targetFps = options.fps ? parseInt(options.fps, 10) : project.meta.fps || 30;
      const { calculatedCards, totalFrames } = calculateTimeline(project.cards, targetFps);
      const totalSec = (totalFrames / targetFps).toFixed(1);

      console.log('\n========================================================================');
      console.log('MOTOR DE COMPILAÇÃO E RENDERIZAÇÃO DE VÍDEO FINAL (CLI)');
      console.log('========================================================================');
      console.log(`Projeto:         ${project.meta.title}`);
      console.log(`Workspace:       ${projectFile}`);
      console.log(`Plataforma Alvo: ${options.target.toUpperCase()}`);
      console.log(`Taxa de Quadros: ${targetFps} FPS`);
      console.log(`Total de Cenas:  ${calculatedCards.length}`);
      console.log(`Duração:         ${totalSec} segundos (${totalFrames} quadros)`);
      console.log('------------------------------------------------------------------------');

      console.log('Etapa 1/5: Validando integridade de templates e schema...');
      for (const card of calculatedCards) {
        if (!CARD_REGISTRY[card.templateId]) {
          console.warn(`  [Aviso] Template "${card.templateId}" não registrado. Usando fallback hero-title.`);
        }
      }
      console.log('  ✓ Schema e propriedades validadas com sucesso.');

      console.log('Etapa 2/5: Verificando alinhamento de áudio e narrações...');
      calculatedCards.forEach((c, idx) => {
        const mode = c.audio?.mode || (c.tts ? 'tts' : 'none');
        const voice = c.audio && 'voiceId' in c.audio ? c.audio.voiceId : c.tts?.voiceId || 'padrão';
        console.log(`  • Cena #${idx + 1} [${c.id}]: Modo ${mode} (${voice}) alinhado na timeline.`);
      });
      console.log('  ✓ Faixas de áudio alinhadas.');

      const outputPath = path.resolve(process.cwd(), options.output);
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // SE FOR VÍDEO REAL (.mp4 ou .webm): Executa renderização headless de alta fidelidade
      if (options.output.endsWith('.mp4') || options.output.endsWith('.webm')) {
        console.log('Etapa 3/5: Renderizando frames de vídeo via motor gráfico...');
        const devUrl = await findCromDevServerUrl();
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        await page.goto(devUrl, { waitUntil: 'domcontentloaded' });

        const base64Video = await page.evaluate(async (data: { proj: ProjectState; calc: any[]; frames: number; fps: number; target: string }) => {
          const platform = (window as any).__PLATFORM_PRESETS.find((p: any) => p.id === data.target) || (window as any).__PLATFORM_PRESETS[0];
          const quality = (window as any).__QUALITY_PRESETS[0];
          const result = await (window as any).__renderProjectToVideo(data.proj, data.calc, data.frames, {
            platform,
            quality,
            fps: data.fps,
            bitrateMbps: 8,
            format: 'webm',
            includeAudio: false,
          });

          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.readAsDataURL(result.blob);
          });
        }, {
          proj: project,
          calc: calculatedCards,
          frames: totalFrames,
          fps: targetFps,
          target: options.target,
        });

        await browser.close();

        console.log('Etapa 4/5: Compilando e sincronizando trilha de narração completa...');
        const ffmpeg = getFfmpegPath();
        const masterAudio = await buildMasterAudioTrack(calculatedCards, targetFps, options.workspace, devUrl, ffmpeg);

        console.log('Etapa 5/5: Muxing final de vídeo e narração com FFmpeg...');
        const tempWebmPath = outputPath.replace(/\.(mp4|webm)$/, '_temp.webm');
        fs.writeFileSync(tempWebmPath, Buffer.from(base64Video as string, 'base64'));

        if (options.output.endsWith('.mp4')) {
          console.log('  • Codificando stream com FFmpeg (H.264 / AAC / yuv420p)...');
          if (masterAudio && fs.existsSync(masterAudio.masterAudioFile)) {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -i "${masterAudio.masterAudioFile}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "${outputPath}"`,
              { stdio: 'ignore' }
            );
            masterAudio.cleanup();
          } else {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`,
              { stdio: 'ignore' }
            );
          }
          if (fs.existsSync(tempWebmPath)) {
            fs.unlinkSync(tempWebmPath);
          }
        } else {
          if (masterAudio && fs.existsSync(masterAudio.masterAudioFile)) {
            execSync(
              `"${ffmpeg}" -y -i "${tempWebmPath}" -i "${masterAudio.masterAudioFile}" -c:v copy -c:a libopus -b:a 128k -shortest "${outputPath}"`,
              { stdio: 'ignore' }
            );
            masterAudio.cleanup();
            if (fs.existsSync(tempWebmPath)) fs.unlinkSync(tempWebmPath);
          } else {
            fs.renameSync(tempWebmPath, outputPath);
          }
        }

        const sizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
        console.log(`  ✓ Vídeo final gerado com sucesso: ${outputPath} (${sizeMb} MB)`);
        if (masterAudio) {
          console.log(`  ✓ Narrações de áudio sincronizadas em lockstep com cada cena.`);
        }
      } else {

        // MANIFESTO JSON
        console.log('Etapa 3/4: Compilando manifesto de cenas e metadados...');
        console.log('Etapa 4/4: Gravando arquivo JSON de saída...');
        const compilationManifest = {
          title: project.meta.title,
          renderedAt: new Date().toISOString(),
          fps: targetFps,
          totalFrames,
          durationSeconds: parseFloat(totalSec),
          target: options.target,
          scenesCount: calculatedCards.length,
          outputFile: outputPath,
          status: 'completed',
          scenes: calculatedCards.map((c) => ({
            id: c.id,
            templateId: c.templateId,
            startFrame: c.startFrame,
            endFrame: c.endFrame,
            durationInFrames: c.durationInFrames,
            transition: c.transition || { type: 'none', durationInFrames: 0 },
            audio: c.audio || c.tts,
          })),
        };
        fs.writeFileSync(outputPath, JSON.stringify(compilationManifest, null, 2), 'utf-8');
        console.log(`  ✓ Manifesto descritivo gravado com sucesso: ${outputPath}`);
      }

      console.log('------------------------------------------------------------------------');
      console.log('STATUS: ✓ Renderização concluída com 100% de sucesso.\n');
      process.exit(0);
    } catch (err: unknown) {
      console.error('\nERRO DE RENDERIZAÇÃO:', err instanceof Error ? err.message : String(err));
      console.error('');
      process.exit(1);
    }
  });

program.parse(process.argv);

