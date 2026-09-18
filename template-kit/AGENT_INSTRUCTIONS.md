# Guia de Instruções para Agentes de IA (Agent Playbook)

> **Público-Alvo**: Agentes Autônomos de Codificação (Antigravity, Claude, GPT, Cursor, etc.).  
> **Objetivo**: Fornecer regras determinísticas, contratos de tipos e procedimentos para gerar templates 100% funcionais, consistentes e sem regressões no Crom EasyVideo.

---

## 1. Contrato Técnico de um Template

Todo template no Crom EasyVideo é um objeto TypeScript que implementa a interface `TemplateDefinition` (`src/core/types.ts`):

```typescript
import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface MyTemplateProps {
  badge: string;
  title: string;
  subtitle: string;
  accentColor: string;
}

export const myTemplate: TemplateDefinition = {
  id: 'meu-template-id',             // kebab-case único (ex: 'deep-dive-transformer')
  name: 'Meu Template Nome',         // Nome legível exibido no estúdio e na loja
  category: 'Arquitetura & IA',      // Estritamente uma das 5 categorias oficiais
  description: 'Breve descrição de 1 a 2 frases do propósito visual do template.',
  iconName: 'sparkles',              // Nome do ícone (hero, split, code, chart, sparkles, etc.)
  defaultProps: { ... },             // Valores iniciais e tipados de todas as props
  schema: [ ... ],                   // Definições para geração automática dos formulários
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    // Componente React Puro de Renderização Canônica
    return ( ... );
  }
};

export default myTemplate;
```

---

## 2. Checklist Obrigatório Antes de Escrever Código

Quando solicitado a criar ou editar um template, verifique este checklist:

- [ ] **ID Kebab-Case Único**: Certifique-se de que o `id` não colide com templates existentes em `src/templates/registry.ts`.
- [ ] **Categoria Válida**: Escolha uma das 5:
  1. `'Abertura & Título'` -> pasta `src/templates/categories/abertura/`
  2. `'Mídia & Demonstração'` -> pasta `src/templates/categories/midia/`
  3. `'Conceitos & Explicações'` -> pasta `src/templates/categories/conceitos/`
  4. `'Arquitetura & IA'` -> pasta `src/templates/categories/arquitetura/`
  5. `'Dados, Métricas & Encerramento'` -> pasta `src/templates/categories/metricas/`
- [ ] **Mapeamento 1:1 entre `schema` e `defaultProps`**:
  - Toda propriedade em `defaultProps` DEVE ter um item correspondente em `schema` com o mesmo `name`.
  - O `defaultValue` no `schema` deve ser igual ou equivalente ao valor em `defaultProps`.
- [ ] **Sem Emojis**: NUNCA use emojis em labels, placeholders, textos default ou JSX. Utilize os SVGs de `src/core/icons.tsx`.
- [ ] **Espaço Canônico (1920×1080)**: O canvas é dimensionado proporcionalmente pelo Remotion e pelo player.
  - **PROIBIDO**: Classes Tailwind de media query de janela como `sm:text-lg`, `md:flex`, `lg:p-8`.
  - **CORRETO**: Tamanhos fixos pensados para 1920×1080 (ex: `text-6xl`, `text-2xl`, `p-16`, `max-w-5xl`).
- [ ] **Interoperabilidade de Mídia**: Campos de mídia (`type: 'media'`) devem tratar tanto string pura quanto objeto:
  ```typescript
  const mediaUrl = typeof p.videoSrc === 'object' ? p.videoSrc?.url : p.videoSrc;
  ```

---

## 3. Fluxo de Execução Recomendado para o Agente

### Passo 1: Executar o Gerador Automático (CLI)
Em vez de criar arquivos manualmente do zero, use a ferramenta do kit:

```bash
node template-kit/cli/create-template.cjs --id "<template-id>" --name "<Nome do Template>" --category "<Categoria>" --type <minimal|media|metrics|array|architecture>
```

Isso gera o arquivo base e já injeta a importação e o registro em `src/templates/registry.ts`.

### Passo 2: Personalizar o Arquivo TSX Criado
Abra o arquivo gerado em `src/templates/categories/<pasta>/<template-id>.tsx` e:
1. Ajuste a interface de props (`interface MyCustomProps`).
2. Defina os campos necessários no `schema` e `defaultProps`.
3. Crie a composição visual no `Component`, aplicando as animações `spring`.

### Passo 3: Executar o Validador
Execute a validação estrita para garantir zero defeitos:

```bash
node template-kit/cli/validate-template.cjs src/templates/categories/<pasta>/<template-id>.tsx
```

### Passo 4: Rodar o Build do Projeto
Valide se o TypeScript compila sem erros:

```bash
npm run build
```

---

## 4. Padrões de Animação com `spring`

O Crom EasyVideo disponibiliza a função `spring({ frame, fps, config })` de `src/core/animations`.

### Exemplo de Entradas Escalonadas (Staggered Animation):
```typescript
const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.8 } });
const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 16, mass: 1 } });
const subtitleSpring = spring({ frame: frame - 16, fps, config: { damping: 18, mass: 1 } });
```

### Exemplo de Interpolação Segura (0 a 1):
```typescript
// Translação vertical suave com opacidade
style={{
  transform: `translateY(${(1 - titleSpring) * 40}px)`,
  opacity: Math.max(0, Math.min(1, titleSpring))
}}
```

---

## 5. Dicionário de Tipos de Schema Suportados

| Tipo (`type`) | Formato de Dado | Renderização no Editor | Exemplo |
| :--- | :--- | :--- | :--- |
| `'text'` | `string` | Input de linha única | Título, badge, autor, URL |
| `'textarea'` | `string` | Textarea multi-linha | Subtítulo, citação, código, resumo |
| `'color'` | `string` (hex `#RRGGBB`) | Color picker nativo + hex | `#6366f1`, `#38bdf8`, `#10b981` |
| `'toggle'` | `boolean` | Switch On/Off | `showBadge: true`, `showGrid: false` |
| `'number'` | `number` | Slider / input numérico | `columns: 3`, `glowIntensity: 80` |
| `'media'` | `string` ou `{ url, type }` | Seletor de arquivo + URL + preview | Imagem de capa, vídeo demonstrativo |
| `'array'` | `any[]` | Gerenciador de itens (adicionar/remover) | Lista de tópicos, colunas bento, passos |

Consulte `template-kit/SCHEMA_SPECIFICATION.md` para detalhes aprofundados sobre campos do tipo `'array'` com `itemSchema`.
