# Crom EasyVideo - Template Development Kit (TDK)

Bem-vindo ao **Template Development Kit (TDK)** do Crom EasyVideo.
Esta pasta contém todos os recursos, especificações de schema, boilerplates, utilitários de animação e ferramentas de linha de comando necessários para que **desenvolvedores e agentes de IA** criem, testem, validem e registrem templates de vídeo modulares com um único comando.

---

## Estrutura do Kit

```text
template-kit/
├── README.md                     # Visão geral e documentação do kit
├── AGENT_INSTRUCTIONS.md         # Guia passo a passo obrigatório para Agentes de IA
├── SCHEMA_SPECIFICATION.md       # Especificação técnica completa de todos os tipos de campos
├── cli/
│   ├── create-template.cjs       # Ferramenta CLI para gerar e auto-registrar templates
│   └── validate-template.cjs     # Validador automatizado de integridade e conformidade
├── starters/                     # Modelos prontos para clonar e customizar
│   ├── starter-minimal.tsx       # Abertura/Minimalista com Badge e Títulos
│   ├── starter-split-media.tsx   # Split com Vídeo/Imagem responsivo
│   ├── starter-metrics.tsx       # Estatísticas e Métricas com contadores animados
│   ├── starter-dynamic-array.tsx # Grade/Lista com itens repetíveis (itemSchema)
│   └── starter-architecture.tsx  # Diagrama de Arquitetura e Fluxo Tecnológico
└── snippets/
    ├── animations.ts             # Fórmulas de animação (spring, stagger, loop, counter)
    └── design-tokens.ts          # Paleta de cores, tipografia e backgrounds recomendados
```

---

## Comandos Rápidos

### 1. Criar um Novo Template com 1 Comando
Para criar um template e registrá-lo automaticamente no sistema:

```bash
# Exemplo 1: Template Minimalista
npm run template:create -- --id "tech-headline" --name "Tech Headline Impact" --category "Abertura & Título" --type minimal

# Exemplo 2: Template com Mídia (Vídeo / Imagem)
npm run template:create -- --id "product-demo" --name "Demonstração de Produto" --category "Mídia & Demonstração" --type media

# Exemplo 3: Template com Grade Dinâmica de Itens
npm run template:create -- --id "feature-matrix" --name "Matriz de Recursos" --category "Arquitetura & IA" --type array

# Exemplo 4: Template de Métricas e Números
npm run template:create -- --id "growth-stats" --name "Estatísticas de Crescimento" --category "Dados, Métricas & Encerramento" --type metrics
```

O comando CLI executa automaticamente:
1. Valida o `id` e a categoria informada.
2. Copia o boilerplate correspondente para `src/templates/categories/<categoria>/<id>.tsx`.
3. Injeta a importação e o registro em `src/templates/registry.ts`.
4. Executa a validação de integridade.

---

### 2. Validar um Template Existente
Para garantir que o template não possui erros de tipagem, schema ou quebras de renderização:

```bash
# Validar um template específico
npm run template:validate -- src/templates/categories/abertura/hero-title.tsx

# Validar TODOS os templates do projeto
npm run template:validate -- --all
```

---

## Categorias Oficiais do Sistema

Ao criar um template, selecione estritamente uma das seguintes categorias registradas em `src/templates/registry.ts`:

1. `Abertura & Título` (abertura)
2. `Mídia & Demonstração` (midia)
3. `Conceitos & Explicações` (conceitos)
4. `Arquitetura & IA` (arquitetura)
5. `Dados, Métricas & Encerramento` (metricas)

---

## As 5 Regras de Ouro de um Template

1. **Espaço Canônico Universal (1920×1080)**: O palco de vídeo é lógico e fixo em `1920px × 1080px`. Nunca use media queries de tela de navegador (`sm:`, `md:`, `lg:`) dentro do JSX do template, pois o vídeo é renderizado via scale transform proporcional.
2. **Consistência de Schema**: Todo campo declarado em `defaultProps` DEVE ter sua definição correspondente no array `schema: [...]` com o mesmo `name`.
3. **Resiliência de Mídia**: Campos de mídia podem receber URLs em string (`"https://..."`) ou objetos `{ url: "...", type: "video" }`. Sempre use o utilitário seguro de extração `item?.url || item` ao manipular fontes de mídia.
4. **Sem Emojis**: Utilize exclusivamente ícones SVG monocromáticos de `src/core/icons.tsx` ou SVGs puros inline.
5. **Animações Fluidas via `spring`**: Use sempre o utilitário `spring({ frame: frame - delay, fps, config })` de `src/core/animations` com atrasos escalonados (stagger) para entradas refinadas e cinematográficas.
