#!/usr/bin/env node

/**
 * Crom EasyVideo - Gerador Automatizado de Templates
 *
 * Cria novos templates a partir de boilerplates oficiais e os registra
 * automaticamente em src/templates/registry.ts sem intervenção manual.
 *
 * Uso:
 *   node template-kit/cli/create-template.cjs --id "meu-template" --name "Meu Template Incrível" --category "Arquitetura & IA" --type minimal
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const STARTERS_DIR = path.resolve(__dirname, '../starters');
const REGISTRY_FILE = path.resolve(ROOT_DIR, 'src/templates/registry.ts');

const CATEGORY_MAP = {
  'Abertura & Título': { dir: 'abertura', label: 'Abertura & Título' },
  'Mídia & Demonstração': { dir: 'midia', label: 'Mídia & Demonstração' },
  'Conceitos & Explicações': { dir: 'conceitos', label: 'Conceitos & Explicações' },
  'Arquitetura & IA': { dir: 'arquitetura', label: 'Arquitetura & IA' },
  'Dados, Métricas & Encerramento': { dir: 'metricas', label: 'Dados, Métricas & Encerramento' },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      parsed[key] = val;
    }
  }
  return parsed;
}

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^([A-Z])/, (chr) => chr.toLowerCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

async function main() {
  const args = parseArgs();

  const id = args.id;
  const name = args.name;
  const categoryInput = args.category;
  const type = args.type || 'minimal';

  if (!id || !name || !categoryInput) {
    console.error('\nErro: Parâmetros obrigatórios ausentes.');
    console.log(`
Uso correto:
  node template-kit/cli/create-template.cjs --id <id-kebab> --name "<Nome Legível>" --category "<Categoria>" [--type <tipo>]

Opções de Categoria:
  - "Abertura & Título"
  - "Mídia & Demonstração"
  - "Conceitos & Explicações"
  - "Arquitetura & IA"
  - "Dados, Métricas & Encerramento"

Opções de Tipo (--type):
  - minimal       (Abertura / Texto / Badge)
  - media         (Split com Vídeo / Imagem)
  - metrics       (Métrica gigante e estatísticas)
  - array         (Grade / Lista dinâmica de cartões)
  - architecture  (Diagrama de fluxo e nós técnicos)
`);
    process.exit(1);
  }

  // 1. Validar ID
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    console.error(`\nErro: O id "${id}" deve estar em formato kebab-case minúsculo (ex: "tech-deep-dive").`);
    process.exit(1);
  }

  // 2. Validar Categoria
  const catConfig = CATEGORY_MAP[categoryInput];
  if (!catConfig) {
    console.error(`\nErro: Categoria inválida: "${categoryInput}".`);
    console.log('Categorias permitidas:\n  ' + Object.keys(CATEGORY_MAP).join('\n  '));
    process.exit(1);
  }

  // 3. Escolher Starter Boilerplate
  const starterFile = path.join(STARTERS_DIR, `starter-${type}.tsx`);
  if (!fs.existsSync(starterFile)) {
    console.error(`\nErro: Starter "${type}" não encontrado em ${starterFile}.`);
    console.log('Starters disponíveis: minimal, media, metrics, array, architecture');
    process.exit(1);
  }

  // 4. Verificar se o template já existe
  const targetDir = path.resolve(ROOT_DIR, `src/templates/categories/${catConfig.dir}`);
  const targetFile = path.join(targetDir, `${id}.tsx`);
  if (fs.existsSync(targetFile)) {
    console.error(`\nErro: O arquivo de template já existe: ${targetFile}`);
    process.exit(1);
  }

  const exportVarName = `${toCamelCase(id)}Template`;
  const propsInterfaceName = `${toPascalCase(id)}Props`;

  console.log(`\n========================================`);
  console.log(`Crom EasyVideo - Criação de Template`);
  console.log(`ID:           ${id}`);
  console.log(`Nome:         ${name}`);
  console.log(`Categoria:    ${categoryInput} (${catConfig.dir})`);
  console.log(`Tipo Starter: ${type}`);
  console.log(`Variável:     ${exportVarName}`);
  console.log(`========================================\n`);

  // 5. Ler e Transformar Starter
  let starterContent = fs.readFileSync(starterFile, 'utf8');

  // Ajusta caminhos relativos de import
  starterContent = starterContent
    .replace(/\.\.\/\.\.\/src\/core\/types/g, '../../../core/types')
    .replace(/\.\.\/\.\.\/src\/core\/animations/g, '../../../core/animations');

  // Substitui IDs, nomes e variáveis
  starterContent = starterContent
    .replace(/id:\s*['"][^'"]+['"]/g, `id: '${id}'`)
    .replace(/name:\s*['"][^'"]+['"]/g, `name: '${name}'`)
    .replace(/category:\s*['"][^'"]+['"]/g, `category: '${categoryInput}'`)
    .replace(/export interface Starter\w+Props/g, `export interface ${propsInterfaceName}`)
    .replace(/export const starter\w+Template/g, `export const ${exportVarName}`)
    .replace(/export default starter\w+Template;/g, `export default ${exportVarName};`);

  // 6. Escrever o novo arquivo de template
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetFile, starterContent, 'utf8');
  console.log(`[1/3] Arquivo criado com sucesso: ${targetFile}`);

  // 7. Auto-registrar em src/templates/registry.ts
  let registryContent = fs.readFileSync(REGISTRY_FILE, 'utf8');

  // Verifica se já está registrado
  if (registryContent.includes(`'${id}'`) || registryContent.includes(exportVarName)) {
    console.log(`[2/3] Aviso: Template já referenciado em registry.ts.`);
  } else {
    // 7.1. Inserir importação
    const importStatement = `import { ${exportVarName} } from './categories/${catConfig.dir}/${id}';\n`;

    // Localiza a seção de comentários da categoria para injetar o import
    const categorySearchPattern = new RegExp(`// Categoria.*${catConfig.label.replace('&', '\\&')}`, 'i');
    const matchCat = registryContent.match(categorySearchPattern);

    if (matchCat) {
      const idx = registryContent.indexOf(matchCat[0]);
      const nextLineIdx = registryContent.indexOf('\n', idx);
      registryContent =
        registryContent.slice(0, nextLineIdx + 1) +
        importStatement +
        registryContent.slice(nextLineIdx + 1);
    } else {
      // Fallback: insere logo antes de CARD_REGISTRY
      const regIdx = registryContent.indexOf('export const CARD_REGISTRY');
      registryContent =
        registryContent.slice(0, regIdx) +
        importStatement + '\n' +
        registryContent.slice(regIdx);
    }

    // 7.2. Inserir na lista ALL_TEMPLATES
    const allTemplatesPattern = /const ALL_TEMPLATES:\s*TemplateDefinition\[\]\s*=\s*\[/;
    const matchAll = registryContent.match(allTemplatesPattern);

    if (matchAll) {
      const insertIdx = registryContent.indexOf(matchAll[0]) + matchAll[0].length;
      registryContent =
        registryContent.slice(0, insertIdx) +
        `\n  ${exportVarName},` +
        registryContent.slice(insertIdx);
    } else {
      console.warn('Aviso: Não foi possível localizar ALL_TEMPLATES para injeção automática.');
    }

    fs.writeFileSync(REGISTRY_FILE, registryContent, 'utf8');
    console.log(`[2/3] Template auto-registrado em src/templates/registry.ts!`);
  }

  console.log(`[3/3] Template criado e pronto para uso!`);
  console.log(`\nPróximo passo: execute a validação:`);
  console.log(`  node template-kit/cli/validate-template.cjs ${targetFile}\n`);
}

main().catch((err) => {
  console.error('Falha na criação do template:', err);
  process.exit(1);
});
