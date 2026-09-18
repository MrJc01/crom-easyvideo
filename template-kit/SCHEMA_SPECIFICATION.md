# Especificação Completa do Schema de Templates (Schema Specification)

No Crom EasyVideo, o array `schema: TemplateFieldDef[]` define como os formulários de configuração são gerados automaticamente tanto no **Editor de Estúdio**, no **Editor em Cards** quanto no **Template Sandbox**.

---

## 1. Interface Base: `TemplateFieldDef`

A definição de cada campo em `src/core/types.ts`:

```typescript
export interface TemplateFieldDef {
  name: string;                                                         // Nome exato da chave no objeto de props
  label: string;                                                        // Título legível exibido no input
  type: 'text' | 'textarea' | 'color' | 'toggle' | 'number' | 'media' | 'array'; // Tipo do controle
  defaultValue: any;                                                    // Valor padrão
  options?: string[];                                                   // Para selects (quando aplicável)
  min?: number;                                                         // Para type === 'number'
  max?: number;                                                         // Para type === 'number'
  step?: number;                                                        // Para type === 'number'
  itemSchema?: Array<{                                                  // Para type === 'array' (itens aninhados)
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'color' | 'media' | 'number';
    defaultValue?: any;
  }>;
}
```

---

## 2. Tipos de Campos Detalhados

### 2.1. `text` (Texto Simples em Linha Única)
- **Uso**: Títulos curtos, badges, nomes, tags, cargos, URLs.
- **Componente de UI**: `<input type="text" />` com botão de preenchimento rápido de "Lorem Ipsum".
- **Exemplo**:
  ```typescript
  {
    name: 'badge',
    label: 'Texto do Badge',
    type: 'text',
    defaultValue: 'ARQUITETURA DE DADOS'
  }
  ```

### 2.2. `textarea` (Texto Multi-Linha)
- **Uso**: Subtítulos longos, parágrafos explicativos, citações, scripts, blocos de código.
- **Componente de UI**: `<textarea rows={3} />` estilizado.
- **Exemplo**:
  ```typescript
  {
    name: 'description',
    label: 'Descrição Detalhada',
    type: 'textarea',
    defaultValue: 'Explicação aprofundada dos blocos de atenção no Transformer.'
  }
  ```

### 2.3. `color` (Seletor de Cor Hexadecimal)
- **Uso**: Cores de destaque (`accentColor`), cores de brilho/glow (`glowColor`), gradientes.
- **Componente de UI**: Seletor `<input type="color" />` + badge com o código hex editável.
- **Exemplo**:
  ```typescript
  {
    name: 'accentColor',
    label: 'Cor de Destaque',
    type: 'color',
    defaultValue: '#6366f1'
  }
  ```

### 2.4. `toggle` (Chave Booleana Liga/Desliga)
- **Uso**: Ocultar/exibir elementos condicionais (`showBadge`, `showSubtitle`, `showGrid`, `isReversed`).
- **Componente de UI**: Switch toggle moderno.
- **Exemplo**:
  ```typescript
  {
    name: 'showBadge',
    label: 'Exibir Badge Superior',
    type: 'toggle',
    defaultValue: true
  }
  ```

### 2.5. `number` (Controle Numérico)
- **Uso**: Valores percentuais, contadores, número de colunas, opacidade.
- **Componente de UI**: Range slider + display numérico.
- **Exemplo**:
  ```typescript
  {
    name: 'targetValue',
    label: 'Valor Alvo da Métrica',
    type: 'number',
    defaultValue: 98.5,
    min: 0,
    max: 100,
    step: 0.5
  }
  ```

### 2.6. `media` (Seletor Universal de Vídeo e Imagem)
- **Uso**: Imagens de capa, capturas de tela, vídeos de demonstração, logotipos, mockups.
- **Componente de UI**: `MediaFieldEditor` (suporta drag-and-drop de arquivo local, URL remota, preview de miniatura e identificação de tipo).
- **Tratamento Seguro no Componente**:
  ```typescript
  // Sempre extraia a URL de forma segura (objeto ou string)
  const mediaSrc = typeof props.videoSrc === 'object' ? props.videoSrc?.url : props.videoSrc;
  ```
- **Exemplo no Schema**:
  ```typescript
  {
    name: 'mediaSrc',
    label: 'Mídia Principal (Vídeo / Imagem)',
    type: 'media',
    defaultValue: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'
  }
  ```

### 2.7. `array` (Lista Dinâmica de Itens Repetíveis com `itemSchema`)
- **Uso**: Listas de prós e contras, colunas de grade bento, etapas de fluxo, cartões comparativos.
- **Componente de UI**: `DynamicArrayField` (permite adicionar itens, remover itens, reordenar e editar campos de cada item individualmente).
- **Exemplo no Schema**:
  ```typescript
  {
    name: 'items',
    label: 'Cartões da Grade',
    type: 'array',
    defaultValue: [
      { title: 'Atenção Multi-Head', description: 'Calcula correlações paralelas.', color: '#6366f1' },
      { title: 'Embeddings Posicionais', description: 'Codifica a ordem temporal.', color: '#38bdf8' },
      { title: 'Feed-Forward Linear', description: 'Projeta ativações dimensionais.', color: '#10b981' }
    ],
    itemSchema: [
      { name: 'title', label: 'Título do Cartão', type: 'text', defaultValue: 'Novo Recurso' },
      { name: 'description', label: 'Descrição', type: 'textarea', defaultValue: 'Explicação...' },
      { name: 'color', label: 'Cor do Cartão', type: 'color', defaultValue: '#6366f1' }
    ]
  }
  ```

---

## 3. Regras de Compatibilidade e Boas Práticas

1. **Nomes em CamelCase**: Os identificadores `name` devem usar `camelCase` (ex: `accentColor`, `glowColor`, `showBadge`).
2. **Propriedade Primária de Texto**: Para que o Editor em Cards e a timeline exibam o resumo do texto da cena, utilize pelo menos um dos seguintes nomes reconhecidos:
   - `title`
   - `headline`
   - `text`
   - `architectureTitle`
   - `statement`
   - `question`
   - `quote`
3. **Valores Padrão Relevantes**: Nunca use strings vazias em `defaultProps` ou `defaultValue`. Forneça textos temáticos realistas de tecnologia ou design para que o template renderize com excelente visualização logo no primeiro instante.
