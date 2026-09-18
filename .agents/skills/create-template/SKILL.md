---
name: create-template
description: Guia e fluxo automatizado para criar, customizar e registrar novos templates de cena no Crom EasyVideo com 1 comando.
---

# Skill: Criação Automatizada de Templates de Cena (Crom EasyVideo)

Use esta skill sempre que o usuário pedir para criar, desenvolver ou registrar um novo template de cena no Crom EasyVideo.

## 1. Fluxo de Execução com 1 Comando

Para criar e registrar um novo template sem erros manuais, execute o utilitário do `template-kit`:

```bash
npm run template:create -- --id "<template-id-kebab>" --name "<Nome Legível do Template>" --category "<Categoria>" --type <minimal|media|metrics|array|architecture>
```

### Parâmetros:
- `--id`: Identificador único em kebab-case minúsculo (ex: `deep-seek-reasoning`, `cloud-native-mesh`).
- `--name`: Nome exibido no estúdio, nos cards e no catálogo (ex: `DeepSeek Reasoning Flow`).
- `--category`: Uma das 5 categorias oficiais:
  - `"Abertura & Título"`
  - `"Mídia & Demonstração"`
  - `"Conceitos & Explicações"`
  - `"Arquitetura & IA"`
  - `"Dados, Métricas & Encerramento"`
- `--type`: Modelo base de partida:
  - `minimal`: Foco em título de impacto, badges dinâmicos e subtítulos.
  - `media`: Moldura para exibição de vídeo (`.mp4`, `.webm`) ou imagem.
  - `metrics`: Destaque de métricas gigantes (`99.4%`) com contadores animados.
  - `array`: Lista ou grade de cartões repetíveis com `itemSchema`.
  - `architecture`: Diagrama de nós e estágios de pipeline tecnológico.

---

## 2. Personalização do Template

Após a criação automática, o arquivo estará em `src/templates/categories/<pasta>/<id>.tsx`.
Abra o arquivo e ajuste:
1. `interface <Id>Props`: Tipagem TypeScript dos campos.
2. `defaultProps`: Valores iniciais representativos.
3. `schema`: Lista de campos para os formulários (`text`, `textarea`, `color`, `toggle`, `number`, `media`, `array`).
4. `Component`: Layout React com animações `spring`.

---

## 3. Validação Automatizada e Build

Sempre execute o validador após modificar o template:

```bash
# Validação do template criado
npm run template:validate -- src/templates/categories/<pasta>/<id>.tsx

# Build de produção para validação estrita do compilador
npm run build
```

---

## 4. Recursos Disponíveis no `template-kit/`

Consulte a pasta `template-kit/` para especificações detalhadas:
- [template-kit/README.md](file:///home/j/Documentos/GitHub/crom-easyvideo/template-kit/README.md)
- [template-kit/AGENT_INSTRUCTIONS.md](file:///home/j/Documentos/GitHub/crom-easyvideo/template-kit/AGENT_INSTRUCTIONS.md)
- [template-kit/SCHEMA_SPECIFICATION.md](file:///home/j/Documentos/GitHub/crom-easyvideo/template-kit/SCHEMA_SPECIFICATION.md)
- [template-kit/snippets/animations.ts](file:///home/j/Documentos/GitHub/crom-easyvideo/template-kit/snippets/animations.ts)
- [template-kit/snippets/design-tokens.ts](file:///home/j/Documentos/GitHub/crom-easyvideo/template-kit/snippets/design-tokens.ts)
