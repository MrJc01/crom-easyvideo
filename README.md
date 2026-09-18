# Crom EasyVideo 🎬

> Motor e estúdio de criação de vídeos programáticos com cards modulares, animações fluidas via física de molas (Spring), síntese de voz neural local (CromyVoice) e renderização completa via CLI e Web.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Principais Recursos

- **30+ Templates de Cena Modulares**: Divididos em 5 categorias essenciais (Abertura, Mídia, Conceitos, Arquitetura & IA, Métricas & CTA).
- **Motor Neural CromyVoice Local**: Síntese de fala de alta fidelidade integrada via binário local (`bin/cromyvoice`), sem custos de API externa ou limites de requisição (14 vozes neurais em PT-BR, EN-US e ES-ES).
- **Linha de Comando Poderosa (CLI)**:
  - Inicialização de novos projetos de vídeo (`npm run cli -- init`)
  - Inspeção e cálculo milimétrico de timelines (`npm run cli -- inspect`)
  - Renderização de snapshots estáticos em alta definição (1080p PNG) ou clipes isolados (.mp4) por card (`npm run cli -- render-card`)
  - Renderização de vídeos finais completos com áudio sincronizado e transições (`npm run cli -- render`)
- **Presets Multiplataforma**: Widescreen 16:9 (1920×1080), Formato Vertical 9:16 para TikTok/Reels/Shorts (1080×1920) e Quadrado 1:1 (1080×1080).
- **Estúdio Web Interativo**: Interface completa com live preview proporcional, editor de cards em pilha, sandbox de templates com compilador ao vivo (Sucrase) e gravação de áudio polimórfica.

---

## 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/MrJc01/crom-easyvideo.git
cd crom-easyvideo

# Instalar as dependências
npm install
```

---

## 🛠️ Como Usar

### 1. Iniciar o Estúdio Web

```bash
npm run dev
```

Acesse `http://localhost:5173` ou a porta informada no terminal.

### 2. Comandos da CLI

```bash
# 1. Inicializar um novo projeto em uma pasta
npm run cli -- init meu-video --title "Meu Vídeo Incrível"

# 2. Inspecionar a timeline e duração de áudio/transições
npm run cli -- inspect -w meu-video

# 3. Renderizar apenas um card como imagem estática (PNG) ou clipe (MP4)
npm run cli -- render-card -w meu-video -c scene-1-intro -o output/card-1.png
npm run cli -- render-card -w meu-video -c scene-1-intro -o output/card-1.mp4

# 4. Renderizar o vídeo completo (1080p MP4)
npm run cli -- render -w meu-video -o output/video-final.mp4

# 5. Renderizar em formato vertical para TikTok / Reels (9:16)
npm run cli -- render -w meu-video --target tiktok -o output/video-vertical.mp4

# 6. Listar todas as 14 vozes neurais locais disponíveis
npm run cli -- voices

# 7. Listar todos os templates disponíveis ou ver schema de um template
npm run cli -- templates
npm run cli -- schema hero-title
```

---

## 🎙️ Vozes Neurais Suportadas (CromyVoice)

| Voice ID | Nome | Idioma | Gênero | Uso Recomendado |
| :--- | :--- | :--- | :--- | :--- |
| `pt-BR-AntonioNeural` | Antonio | pt-BR | Masculino | Tutoriais, narrativas técnicas (Padrão) |
| `pt-BR-FranciscaNeural` | Francisca | pt-BR | Feminino | Vídeos corporativos, apresentações |
| `pt-BR-BrendaNeural` | Brenda | pt-BR | Feminino | Shorts, reels, produtos dinâmicos |
| `pt-BR-DonatoNeural` | Donato | pt-BR | Masculino | Documentários, voz solene e profunda |
| `pt-BR-ElzaNeural` | Elza | pt-BR | Feminino | Didático, aulas e conceitos |
| `pt-BR-FabioNeural` | Fabio | pt-BR | Masculino | Redes sociais e vlogs |
| `pt-BR-NicolauNeural` | Nicolau | pt-BR | Masculino | Estilo clássico e ponderado |
| `pt-BR-ValerioNeural` | Valerio | pt-BR | Masculino | Firme e assertivo |
| `pt-BR-YaraNeural` | Yara | pt-BR | Feminino | Jovem, energética e brilhante |
| `en-US-GuyNeural` | Guy | en-US | Masculino | Inglês americano padrão |
| `en-US-JennyNeural` | Jenny | en-US | Feminino | Inglês americano natural |
| `en-US-AriaNeural` | Aria | en-US | Feminino | Inglês expressivo |
| `es-ES-AlvaroNeural` | Alvaro | es-ES | Masculino | Espanhol neutro |
| `es-ES-ElviraNeural` | Elvira | es-ES | Feminino | Espanhol europeu |

---

## 📄 Licença

Este projeto é licenciado sob os termos da licença [MIT](LICENSE).

Copyright (c) 2026 MrJc01.
