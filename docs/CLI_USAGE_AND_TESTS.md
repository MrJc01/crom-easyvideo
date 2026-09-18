# Guia de Uso da CLI e Relatório de Testes Automatizados

Este documento fornece o manual completo de operação da Interface de Linha de Comando (**CLI**) do **Remotion Studio (Crom EasyVideo)**, bem como o relatório técnico da suíte de testes automatizados.

---

## 1. Visão Geral da CLI

A CLI permite que engenheiros de dados, desenvolvedores e pipelines de automação CI/CD inspecionem projetos de vídeo, listem o catálogo de templates e executem a compilação e renderização de timelines programáticas sem necessidade de interface gráfica aberta.

### Motor de Voz: CromyVoice (Neural)

Toda a síntese de voz usa o motor **CromyVoice** (`bin/cromyvoice`) integrado localmente. São 14 vozes neurais (PT-BR, EN-US, ES-ES) sem custo ou limite de API. O campo `provider: "cromyvoice"` deve estar presente em todos os cards do `project.json`.

### Invocação

A partir da raiz do repositório, os comandos podem ser invocados de duas formas:
```bash
# Via script NPM:
npm run cli -- <comando> [opções]

# Diretamente via TSX:
npx tsx src/cli/index.ts <comando> [opções]
```

---

## 2. Comandos Disponíveis

### A. Inicializar Projeto: `init`

Cria um novo workspace de projeto de vídeo com estrutura completa:

```bash
npm run cli -- init meu-video --title "Título do Vídeo"
```

Isto gera a pasta `meu-video/` contendo:
- `project.json` com 3 cards de exemplo (hero-title, concept-definition, cta-subscribe)
- `assets/` para mídias locais
- `output/` para renderizações

---

### B. Listagem de Templates: `templates`

Lista todos os 30 templates registrados no `CARD_REGISTRY`, agrupados por suas 5 categorias oficiais, com descrição detalhada e campos do schema de entrada:

```bash
# Listar todos os templates:
npm run cli -- templates

# Filtrar por categoria específica (ex: Arquitetura, Mídia, Conceitos):
npm run cli -- templates --category "Arquitetura"
```

#### Exemplo de Saída:
```text
========================================================================
CATÁLOGO DE TEMPLATES - CROM EASYVIDEO (30 disponíveis)
========================================================================

[CATEGORIA: ABERTURA & TÍTULO]
  • ID: hero-title                   | Nome: Hero Title Tech
    Descrição: Abertura de impacto cinematográfico com badge dinâmico e visibilidade modular.
    Campos do Schema: [showBadge, badge, title, showSubtitle, subtitle, accentColor, glowColor]

  • ID: big-headline                 | Nome: Headline Impactante
    Descrição: Frase de alto impacto com tipografia superdimensionada e barra decorativa.
    Campos do Schema: [showKicker, kicker, headline, showAccentBar, accent]
...
Total de templates listados: 30
```

---

### C. Schema de Template: `schema`

Exibe os campos, tipos e valores padrão (`defaultProps`) de um template específico:

```bash
npm run cli -- schema hero-title
npm run cli -- schema big-stat
npm run cli -- schema media-split-showcase
```

Útil para agentes de IA saberem exatamente quais `props` preencher ao montar um card.

---

### D. Vozes Disponíveis: `voices`

Lista todas as vozes neurais do motor CromyVoice com ID, idioma, gênero e descrição:

```bash
npm run cli -- voices
```

#### Vozes Neurais Disponíveis (Motor CromyVoice):
| Voice ID | Nome | Idioma | Gênero | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `pt-BR-AntonioNeural` | Antonio | pt-BR | Masculino | Natural e caloroso (padrão) |
| `pt-BR-FranciscaNeural` | Francisca | pt-BR | Feminino | Corporativa e polida |
| `pt-BR-BrendaNeural` | Brenda | pt-BR | Feminino | Ágil e jovem (shorts/reels) |
| `pt-BR-DonatoNeural` | Donato | pt-BR | Masculino | Grave e cinematográfico |
| `pt-BR-ElzaNeural` | Elza | pt-BR | Feminino | Suave e didática |
| `pt-BR-FabioNeural` | Fabio | pt-BR | Masculino | Dinâmico e jovem |
| `pt-BR-NicolauNeural` | Nicolau | pt-BR | Masculino | Clássico e ponderado |
| `pt-BR-ValerioNeural` | Valerio | pt-BR | Masculino | Firme e assertivo |
| `pt-BR-YaraNeural` | Yara | pt-BR | Feminino | Brilhante e energética |
| `en-US-GuyNeural` | Guy | en-US | Male | Inglês americano |
| `en-US-JennyNeural` | Jenny | en-US | Female | Inglês americano |
| `en-US-AriaNeural` | Aria | en-US | Female | Inglês expressivo |
| `es-ES-AlvaroNeural` | Alvaro | es-ES | Masculino | Espanhol neutro |
| `es-ES-ElviraNeural` | Elvira | es-ES | Feminino | Espanhol europeu |

---

### E. Inspeção de Workspace: `inspect`

Valida a integridade estrutural do `project.json`, calcula a timeline com o motor matemático de frames, exibe a duração milimétrica de cada cena, modo de áudio e configuração de transições:

```bash
npm run cli -- inspect --workspace <caminho_da_pasta_ou_arquivo>
```

#### Exemplo de Uso:
```bash
npm run cli -- inspect --workspace test_workspace
```

#### Exemplo de Saída:
```text
========================================================================
INSPEÇÃO DE WORKSPACE: Projeto de Demonstração CLI
========================================================================
Arquivo: /home/j/Documentos/GitHub/crom-easyvideo/test_workspace/project.json
Resolução: 1920 × 1080 @ 30 FPS
Duração Total: 10.1s (303 frames)
Total de Cenas: 2
------------------------------------------------------------------------
CENAS DA TIMELINE:
  #1: [scene-intro] Hero Title Tech            | 5.3s (159f) | Áudio: tts    | Transição: fade (15f)
  #2: [scene-code] Código PyTorch / API       | 4.8s (144f) | Áudio: tts    | Transição: slide-left (15f)
------------------------------------------------------------------------
STATUS: ✓ Workspace íntegro e pronto para renderização.
```

---

### F. Renderizar Card Individual: `render-card`

Renderiza qualquer card isoladamente como **imagem (PNG)** ou **clipe de vídeo (MP4)**:

```bash
# Snapshot estático em alta resolução (1920×1080 PNG):
npm run cli -- render-card -w video-project-template -c scene-1-intro -o output/card-1.png

# Clipe de vídeo animado (.mp4):
npm run cli -- render-card -w video-project-template -c scene-1-intro -o output/card-1.mp4

# Inspecionar dados do card no terminal (sem renderizar):
npm run cli -- render-card -w video-project-template -c scene-1-intro
```

> **Dica**: No parâmetro `-c`, você pode passar o ID do card (ex: `scene-1-intro`) ou o número do índice (ex: `1`, `2`, `3`).

---

### G. Renderização Completa: `render`

Executa o pipeline completo de pré-validação, síntese de faixas sonoras via CromyVoice, cálculo de transições inter-cenas e geração do vídeo renderizado:

```bash
# Vídeo final MP4 (H.264 / 1080p):
npm run cli -- render -w video-project-template -o output/final-video.mp4

# WebM:
npm run cli -- render -w video-project-template -o output/final-video.webm

# Formato vertical TikTok / Reels / Shorts (9:16):
npm run cli -- render -w video-project-template --target tiktok -o output/final-video-vertical.mp4

# Manifesto técnico JSON:
npm run cli -- render -w video-project-template -o output/final-video.json
```

#### Parâmetros e Flags:
| Flag | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `-w, --workspace <path>` | Obrigatório | - | Pasta contendo `project.json` ou caminho direto do arquivo. |
| `-o, --output <file>` | Obrigatório | - | Caminho do arquivo de saída (`.webm`, `.mp4` ou manifesto `.json`). |
| `--fps <taxa>` | Opcional | `30` | Taxa de quadros por segundo da timeline. |
| `--target <plataforma>` | Opcional | `youtube` | Preset alvo (`youtube`, `tiktok`, `instagram`, `portrait`). |

---

## 3. Estrutura do `project.json`

Cada card no array `cards` **deve** incluir o campo `provider: "cromyvoice"` e usar voiceIds com sufixo `Neural`:

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
        "script": "Texto narrado nesta cena.",
        "voiceId": "pt-BR-AntonioNeural",
        "provider": "cromyvoice",
        "speed": 1.0
      },
      "transition": { "type": "fade", "durationInFrames": 15 },
      "props": {
        "showBadge": true,
        "badge": "TECNOLOGIA",
        "title": "Título da Cena"
      }
    }
  ]
}
```

---

## 4. Relatório de Execução da Suíte de Testes Automatizados (`cli_tests.cjs`)

A suíte automatizada `cli_tests.cjs` foi executada diretamente contra o motor da CLI:

```text
========================================================================
SUÍTE DE TESTES AUTOMATIZADOS DA CLI - CROM EASYVIDEO
========================================================================

[PASS] Teste #1: Execução do comando --help
[PASS] Teste #2: Listagem de todos os 30 templates do catálogo
[PASS] Teste #3: Filtro de categoria na listagem de templates
[PASS] Teste #4: Inspeção de workspace válido (test_workspace)
[PASS] Teste #5: Renderização e compilação de projeto via CLI
[PASS] Teste #6: Tratamento de erro e código de saída 1 para workspace inexistente

========================================================================
RESULTADO FINAL: 6/6 TESTES DA CLI APROVADOS COM SUCESSO!
========================================================================
```

### Validações Específicas Concluídas:
- **Resolução de Módulos TypeScript**: Compatibilidade total com ESM via `tsx`.
- **Validação de Erros de Entrada**: Em caso de caminho inexistente ou JSON corrompido, a CLI emite mensagem descritiva no `stderr` e encerra com código de saída `1`.
- **Cálculo Fidedigno da Timeline**: O comando `inspect` reutiliza a função pura `calculateTimeline` do núcleo da aplicação, garantindo paridade total com o player web.
- **Motor CromyVoice**: Toda síntese de voz usa o binário local `bin/cromyvoice` (14 vozes neurais PT-BR/EN-US/ES-ES).
