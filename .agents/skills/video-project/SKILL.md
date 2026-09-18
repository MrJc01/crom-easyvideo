---
name: video-project
description: Instruções completas para criar, inspecionar, selecionar vozes, renderizar cards individuais e renderizar vídeos completos via CLI no Crom EasyVideo.
---

# Skill: Gerenciamento e Renderização de Vídeo via CLI (Crom EasyVideo)

Use esta skill para criar ou operar projetos de vídeo via terminal/CLI sem depender da interface Web.

## 1. Comandos Operacionais da CLI

A CLI é invocada via `npm run cli -- <comando>`:

```bash
# 1. Inicializar um novo projeto de vídeo em uma pasta
npm run cli -- init meu-video --title "Título do Vídeo"

# 2. Inspecionar timeline, cálculo de duração e vozes
npm run cli -- inspect -w meu-video

# 3. Renderizar apenas 1 card (imagem snapshot PNG em alta definição 1080p):
npm run cli -- render-card -w meu-video -c scene-1-intro -o meu-video/output/card-1.png

# 4. Renderizar clipe de vídeo isolado de 1 card (.mp4):
npm run cli -- render-card -w meu-video -c scene-1-intro -o meu-video/output/card-1.mp4

# 5. Renderizar o VÍDEO FINAL COMPLETO (.mp4 / 1080p):
npm run cli -- render -w meu-video -o meu-video/output/final-video.mp4

# 6. Renderizar formato vertical para TikTok / Reels (9:16):
npm run cli -- render -w meu-video --target tiktok -o meu-video/output/final-video-vertical.mp4

# 7. Listar todas as vozes de narração (TTS) disponíveis
npm run cli -- voices

# 8. Consultar o schema de propriedades de um template
npm run cli -- schema hero-title
```


## 2. Como Preencher o `project.json`

O arquivo `project.json` define a lista de cenas no array `cards`:

```json
{
  "meta": {
    "title": "Meu Vídeo",
    "fps": 30,
    "width": 1920,
    "height": 1080
  },
  "cards": [
    {
      "id": "cena-1",
      "order": 0,
      "templateId": "hero-title",
      "durationMode": "auto",
      "audio": {
        "mode": "tts",
        "script": "Texto que a voz neural irá narrar.",
        "voiceId": "pt-BR-AntonioNeural",
        "provider": "cromyvoice",
        "speed": 1.0
      },
      "transition": {
        "type": "fade",
        "durationInFrames": 15
      },
      "props": {
        "showBadge": true,
        "badge": "NOVO VÍDEO",
        "title": "Título da Cena",
        "showSubtitle": true,
        "subtitle": "Subtítulo explicativo.",
        "accentColor": "#6366f1"
      }
    }
  ]
}
```

## 3. Seleção de Vozes TTS (Motor CromyVoice Integrado)
Execute `npm run cli -- voices` para ver a lista completa.
- `pt-BR-AntonioNeural`: Masculino natural / padrão
- `pt-BR-FranciscaNeural`: Feminino corporativo
- `pt-BR-BrendaNeural`: Feminino ágil / shorts
- `pt-BR-DonatoNeural`: Masculino grave / documentário
- `pt-BR-ElzaNeural`: Feminino suave / didático
- `pt-BR-FabioNeural`: Masculino dinâmico / reels
- `pt-BR-NicolauNeural`: Masculino clássico
- `pt-BR-ValerioNeural`: Masculino assertivo
- `pt-BR-YaraNeural`: Feminino brilhante
- `en-US-GuyNeural`, `en-US-JennyNeural`, `en-US-AriaNeural`: Inglês
- `es-ES-AlvaroNeural`, `es-ES-ElviraNeural`: Espanhol

