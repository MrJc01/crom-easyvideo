# Guia de Uso da CLI e Relatório de Testes Automatizados

Este documento fornece o manual completo de operação da Interface de Linha de Comando (**CLI**) do **Remotion Studio (Crom EasyVideo)**, bem como o relatório técnico da suíte de testes automatizados.

---

## 1. Visão Geral da CLI

A CLI permite que engenheiros de dados, desenvolvedores e pipelines de automação CI/CD inspecionem projetos de vídeo, listem o catálogo de templates e executem a compilação e renderização de timelines programáticas sem necessidade de interface gráfica aberta.

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

### A. Listagem de Templates: `templates`

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

### B. Inspeção de Workspace: `inspect`

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

### C. Compilação e Renderização: `render`

Executa o pipeline completo de pré-validação, síntese de faixas sonoras, cálculo de transições inter-cenas e geração do manifesto de vídeo renderizado:

```bash
npm run cli -- render --workspace <caminho> --output <arquivo_saida> [--fps <taxa>] [--target <plataforma>]
```

#### Parâmetros e Flags:
| Flag | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `-w, --workspace <path>` | Obrigatório | - | Pasta contendo `project.json` ou caminho direto do arquivo. |
| `-o, --output <file>` | Obrigatório | - | Caminho do arquivo de saída (`.webm`, `.mp4` ou manifesto `.json`). |
| `--fps <taxa>` | Opcional | `30` | Taxa de quadros por segundo da timeline. |
| `--target <plataforma>` | Opcional | `youtube` | Preset alvo (`youtube`, `tiktok`, `instagram`, `portrait`). |

#### Exemplo de Uso:
```bash
npm run cli -- render --workspace test_workspace --output test_workspace/video_final.json --fps 30 --target youtube
```

---

## 3. Relatório de Execução da Suíte de Testes Automatizados (`cli_tests.cjs`)

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
