# Workspace de Projeto de Vídeo (Crom EasyVideo)

Este diretório é o **Workspace Modelo de Projeto de Vídeo**. Ele foi desenhado para permitir que **Agentes de IA e desenvolvedores** criem, customizem, testem e renderizem vídeos completos via comandos de terminal (**CLI**), sem depender da interface gráfica Web.

---

## 📁 Estrutura do Workspace

```text
video-project-template/
├── README.md               # Este manual operacional
├── project.json            # Manifesto principal da timeline do vídeo
├── schema-reference.json   # Dicionário JSON com schemas e defaultProps de todos os templates
├── assets/                 # Mídias locais (imagens, vídeos, gravações de áudio)
└── output/                 # Destino de renderizações e snapshots
```

---

## 🤖 Como um Agente de IA Opera Este Workspace

O fluxo operacional para montar um vídeo programaticamente consiste em 4 passos:

### Passo 1: Descobrir Templates e Schemas
O agente pode consultar o catálogo de templates para saber quais usar e quais propriedades preencher:

```bash
# Listar todos os templates disponíveis agrupados por categoria
npm run cli -- templates

# Ver as propriedades e o schema exato de um template
npm run cli -- schema hero-title
npm run cli -- schema big-stat
npm run cli -- schema media-split-showcase
```

Também pode ler diretamente o arquivo [`schema-reference.json`](./schema-reference.json) para consulta programática instantânea.

---

### Passo 2: Selecionar Vozes para os Cards
O agente lista as vozes neurais suportadas para escolher o narrador ideal de cada cena:

```bash
# Listar vozes disponíveis e ver snippets JSON
npm run cli -- voices
```

**Vozes Neurais Nativas (Motor CromyVoice Integrado):**
- `pt-BR-AntonioNeural`: Masculina, natural e calorosa (tutoriais, explicações técnicas).
- `pt-BR-FranciscaNeural`: Feminina, formal e polida (institucional, negócios).
- `pt-BR-BrendaNeural`: Feminina, ágil e jovem (shorts, reels, produtos).
- `pt-BR-DonatoNeural`: Masculina, grave e cinematográfica (documentários).
- `pt-BR-ElzaNeural`: Feminina, suave e explicativa (aulas, conceitos).
- `pt-BR-FabioNeural`: Masculina, jovem e dinâmica (redes sociais).
- `pt-BR-NicolauNeural`: Masculina clássica e ponderada.
- `pt-BR-ValerioNeural`: Masculina firme e assertiva.
- `pt-BR-YaraNeural`: Feminina brilhante e energética.
- `en-US-GuyNeural`, `en-US-JennyNeural`, `en-US-AriaNeural`: Inglês americano.
- `es-ES-AlvaroNeural`, `es-ES-ElviraNeural`: Espanhol.

---


### Passo 3: Preencher ou Modificar o `project.json`
O agente edita o arquivo [`project.json`](./project.json) definindo o array `cards`:

```json
{
  "meta": {
    "title": "Título do Meu Vídeo",
    "fps": 30,
    "width": 1920,
    "height": 1080
  },
  "cards": [
    {
      "id": "scene-1",
      "order": 0,
      "templateId": "hero-title",
      "durationMode": "auto",
      "audio": {
        "mode": "tts",
        "script": "Texto exato que a voz irá narrar nesta cena.",
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
        "badge": "ARQUITETURA DE IA",
        "title": "Como Funcionam os Modelos Modernos",
        "showSubtitle": true,
        "subtitle": "Guia prático de engenharia.",
        "accentColor": "#6366f1"
      }
    }
  ]
}
```

---

### Passo 4: Validar e Renderizar via CLI

#### 4.1. Inspecionar a Timeline
Calcula a duração milimétrica de cada cena em segundos e frames, alinhamento de áudio e transições:

```bash
npm run cli -- inspect -w video-project-template
```

---

#### 4.2. Renderizar Cada Card Individualmente

Você pode renderizar qualquer card isoladamente como **imagem (PNG)** ou como **clipe de vídeo (MP4)**:

```bash
# A) Renderizar snapshot estático do Card em alta resolução (1920×1080 PNG):
npm run cli -- render-card -w video-project-template -c scene-1-intro -o output/card-1.png

# B) Renderizar clipe de vídeo animado apenas desse Card (.mp4):
npm run cli -- render-card -w video-project-template -c scene-1-intro -o output/card-1.mp4

# C) Inspecionar propriedades e dados do Card no terminal:
npm run cli -- render-card -w video-project-template -c scene-1-intro
```

> **Dica**: No parâmetro `-c`, você pode passar o ID do card (ex: `scene-1-intro`) ou o número do índice (ex: `1`, `2`, `3`).

---

#### 4.3. Renderizar o Vídeo Final Completo

Renderiza todo o projeto compilando todas as cenas, transições e faixas de áudio:

```bash
# A) Renderizar VÍDEO FINAL REAL (.mp4 em H.264 / 1080p):
npm run cli -- render -w video-project-template -o output/final-video.mp4

# B) Renderizar em WebM:
npm run cli -- render -w video-project-template -o output/final-video.webm

# C) Renderizar formato vertical para TikTok / Reels / Shorts (9:16):
npm run cli -- render -w video-project-template --target tiktok -o output/final-video-vertical.mp4

# D) Gerar manifesto técnico em JSON:
npm run cli -- render -w video-project-template -o output/final-video.json
```

---

## ⚡ Criando Novos Workspaces Facilmente
Para iniciar um novo projeto de vídeo em outra pasta com 1 comando:

```bash
npm run cli -- init meu-novo-video --title "Lançamento de Produto 2026"
```

