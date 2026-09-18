import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

function chunkText(text: string, maxLen = 140): string[] {
  if (text.length <= maxLen) return [text];
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxLen) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) chunks.push(current);
      current = w;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function fetchGoogleTtsChunk(text: string, lang = 'pt-BR'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encoded}`;

    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Status ${res.statusCode}`));
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        }
      )
      .on('error', reject);
  });
}

function generateBeepWav(durationSeconds = 1.0, frequency = 440): Buffer {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin((Math.PI * i) / numSamples);
    const sample = Math.floor(Math.sin(2 * Math.PI * frequency * t) * 0.4 * env * 32767);
    buffer.writeInt16LE(sample, 44 + i * 2);
  }
  return buffer;
}

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';

function normalizeEdgeVoice(voice = 'pt-BR-AntonioNeural'): string {
  if (!voice) return 'pt-BR-AntonioNeural';
  if (voice.endsWith('Neural')) return voice;
  return `${voice}Neural`;
}

function synthesizeWithCromyvoice(text: string, voice = 'pt-BR-AntonioNeural'): Buffer | null {
  const cromyBin = path.resolve(process.cwd(), 'bin/cromyvoice');
  if (!fs.existsSync(cromyBin)) {
    console.warn('[CromyVoice] Binário bin/cromyvoice não encontrado em', cromyBin);
    return null;
  }

  const normVoice = normalizeEdgeVoice(voice);
  const tempOut = path.join(os.tmpdir(), `cv_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
  try {
    console.log(`[Crom TTS] Chamando CromyVoice local | Voz: "${normVoice}" | Texto: "${text.slice(0, 45)}..."`);
    execFileSync(cromyBin, ['-text', text, '-voice', normVoice, '-out', tempOut], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10000,
    });
    if (fs.existsSync(tempOut)) {
      const buf = fs.readFileSync(tempOut);
      fs.unlinkSync(tempOut);
      console.log(`[Crom TTS] ✅ Sucesso CromyVoice (${buf.length} bytes gerados)`);
      return buf;
    }
  } catch (err: any) {
    console.error(`[Crom TTS] ❌ Erro ao executar binário CromyVoice:`, err?.message || err);
    if (fs.existsSync(tempOut)) {
      try {
        fs.unlinkSync(tempOut);
      } catch {}
    }
  }
  return null;
}

const ttsCache = new Map<string, Buffer>();

function ttsApiPlugin(): Plugin {
  return {
    name: 'crom-tts-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/tts')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost');
            const text = urlObj.searchParams.get('text') || '';
            const lang = urlObj.searchParams.get('lang') || 'pt-BR';
            const voice = urlObj.searchParams.get('voice') || urlObj.searchParams.get('voiceId') || 'pt-BR-AntonioNeural';

            if (!text.trim()) {
              res.statusCode = 400;
              res.end('Missing text parameter');
              return;
            }

            const cacheKey = `${voice}:${lang}:${text}`;
            if (ttsCache.has(cacheKey)) {
              const cached = ttsCache.get(cacheKey)!;
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Content-Length', cached.length);
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.end(cached);
              return;
            }

            // 1. Prioridade: Binário Local CromyVoice (Edge-TTS Neural)
            const cromyBuffer = synthesizeWithCromyvoice(text.trim(), voice);
            if (cromyBuffer && cromyBuffer.length > 0) {
              ttsCache.set(cacheKey, cromyBuffer);
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Content-Length', cromyBuffer.length);
              res.setHeader('Cache-Control', 'public, max-age=86400');
              res.end(cromyBuffer);
              return;
            }

            // 2. Fallback: Google TTS
            const chunks = chunkText(text.trim(), 140);
            const buffers: Buffer[] = [];

            for (const c of chunks) {
              if (!c.trim()) continue;
              try {
                const buf = await fetchGoogleTtsChunk(c.trim(), lang);
                buffers.push(buf);
              } catch {
                const estSec = Math.max(0.4, c.trim().split(/\s+/).length * 0.3);
                buffers.push(generateBeepWav(estSec, 440));
              }
            }

            const finalBuffer = Buffer.concat(buffers);
            ttsCache.set(cacheKey, finalBuffer);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', finalBuffer.length);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(finalBuffer);
          } catch (err: any) {
            res.statusCode = 500;
            res.end(err.message || 'TTS synthesis failed');
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsApiPlugin()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});

