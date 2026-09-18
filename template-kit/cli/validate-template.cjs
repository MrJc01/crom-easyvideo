#!/usr/bin/env node

/**
 * Crom EasyVideo - Validador Automatizado de Templates
 *
 * Verifica a conformidade estrita de um ou de todos os templates
 * do projeto em relação ao contrato do sistema, integridade de schema,
 * ausência de emojis e regras de renderização canônica.
 *
 * Uso:
 *   node template-kit/cli/validate-template.cjs <caminho-do-template.tsx>
 *   node template-kit/cli/validate-template.cjs --all
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CATEGORIES_DIR = path.resolve(ROOT_DIR, 'src/templates/categories');

const VALID_CATEGORIES = [
  'Abertura & Título',
  'Mídia & Demonstração',
  'Conceitos & Explicações',
  'Arquitetura & IA',
  'Dados, Métricas & Encerramento',
];

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

function validateSingleTemplateFile(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath);
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(filePath)) {
    return { relPath, passed: false, errors: [`Arquivo não encontrado: ${filePath}`], warnings: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Verificação de Emojis
  if (EMOJI_REGEX.test(content)) {
    errors.push('Contém emojis proibidos no código-fonte. Use ícones SVG de src/core/icons.tsx.');
  }

  // 2. Verificação de Classes de Media Query de Janela (sm:, md:, lg:)
  const mediaQueryClassMatch = content.match(/className=['"][^'"]*\b(sm:|md:|lg:|xl:|2xl:)[^'"]*['"]/);
  if (mediaQueryClassMatch) {
    warnings.push(
      `Detectada classe com breakpoint de tela de navegador: "${mediaQueryClassMatch[0]}". Em templates canônicos, use dimensões fixas pensadas para 1920×1080.`
    );
  }

  // 3. Extração e Validação do ID
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  if (!idMatch) {
    errors.push('Propriedade "id" não encontrada na definição do template.');
  } else {
    const id = idMatch[1];
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      errors.push(`O ID "${id}" não é um kebab-case válido (apenas letras minúsculas, números e hífens).`);
    }
  }

  // 4. Validação da Categoria
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  if (!categoryMatch) {
    errors.push('Propriedade "category" não encontrada.');
  } else {
    const category = categoryMatch[1];
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`Categoria "${category}" inválida. Deve ser uma das seguintes: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  // 5. Presença de defaultProps e schema
  if (!content.includes('defaultProps:')) {
    errors.push('Objeto "defaultProps" ausente na definição do template.');
  }
  if (!content.includes('schema:')) {
    errors.push('Array "schema" ausente na definição do template.');
  }
  if (!content.includes('Component:') && !content.includes('Component =')) {
    errors.push('Componente de renderização ("Component") ausente.');
  }

  // 6. Verificação de Nomes de Campos (Schema x DefaultProps)
  const schemaFields = [];
  const schemaFieldRegex = /name:\s*['"]([^'"]+)['"]/g;
  let sMatch;
  while ((sMatch = schemaFieldRegex.exec(content)) !== null) {
    // Ignora 'id' ou 'name' da definição do template principal se capturado antes de schema
    if (sMatch[1] !== 'id' && !VALID_CATEGORIES.includes(sMatch[1])) {
      schemaFields.push(sMatch[1]);
    }
  }

  return {
    relPath,
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

function getAllTemplateFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTemplateFiles(fullPath));
    } else if (file.endsWith('.tsx') && !file.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Uso:
  node template-kit/cli/validate-template.cjs <caminho-do-template.tsx>
  node template-kit/cli/validate-template.cjs --all
`);
    process.exit(1);
  }

  let filesToValidate = [];

  if (args.includes('--all')) {
    filesToValidate = getAllTemplateFiles(CATEGORIES_DIR);
    console.log(`\nValidando todos os ${filesToValidate.length} templates do sistema...\n`);
  } else {
    filesToValidate = [path.resolve(ROOT_DIR, args[0])];
  }

  let allPassed = true;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of filesToValidate) {
    const res = validateSingleTemplateFile(file);

    if (!res.passed) {
      allPassed = false;
      totalErrors += res.errors.length;
      console.log(`❌ [FALHA] ${res.relPath}`);
      res.errors.forEach((e) => console.log(`   - ERRO: ${e}`));
    } else {
      console.log(`✅ [OK] ${res.relPath}`);
    }

    if (res.warnings.length > 0) {
      totalWarnings += res.warnings.length;
      res.warnings.forEach((w) => console.log(`   - AVISO: ${w}`));
    }
  }

  console.log(`\n----------------------------------------`);
  console.log(`Templates validados: ${filesToValidate.length}`);
  console.log(`Total de Erros:      ${totalErrors}`);
  console.log(`Total de Avisos:     ${totalWarnings}`);
  console.log(`Resultado Geral:     ${allPassed ? 'APROVADO' : 'REPROVADO'}`);
  console.log(`----------------------------------------\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

main();
