const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================================================');
console.log('SUÍTE DE TESTES AUTOMATIZADOS DA CLI - CROM EASYVIDEO');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] Teste #${totalTests}: ${testName}`);
  } catch (err) {
    console.error(`[FAIL] Teste #${totalTests}: ${testName}`);
    console.error(`  Detalhes do erro: ${err.message}`);
    process.exit(1);
  }
}

// 1. Teste de Ajuda (--help)
runTest('Execução do comando --help', () => {
  const output = execSync('npx tsx src/cli/index.ts --help', { encoding: 'utf-8' });
  if (!output.includes('Usage: crom-cli') || !output.includes('templates') || !output.includes('inspect')) {
    throw new Error('Saída de ajuda incompleta ou ausente.');
  }
});

// 2. Teste de Listagem de Templates
runTest('Listagem de todos os 30 templates do catálogo', () => {
  const output = execSync('npx tsx src/cli/index.ts templates', { encoding: 'utf-8' });
  if (!output.includes('Total de templates listados: 30')) {
    throw new Error('A lista de templates não contém os 30 templates esperados.');
  }
  if (!output.includes('hero-title') || !output.includes('media-split-showcase')) {
    throw new Error('Templates fundamentais ausentes na listagem.');
  }
});

// 3. Teste de Filtro de Categoria em Templates
runTest('Filtro de categoria na listagem de templates', () => {
  const output = execSync('npx tsx src/cli/index.ts templates --category "Arquitetura"', { encoding: 'utf-8' });
  if (!output.includes('tokens-embeddings') || !output.includes('attention-transformer')) {
    throw new Error('Filtro de categoria não retornou os templates de arquitetura.');
  }
});

// 4. Teste de Inspeção de Workspace Válido
runTest('Inspeção de workspace válido (test_workspace)', () => {
  const output = execSync('npx tsx src/cli/index.ts inspect --workspace test_workspace', { encoding: 'utf-8' });
  if (!output.includes('STATUS: ✓ Workspace íntegro e pronto para renderização.')) {
    throw new Error('A inspeção do workspace falhou ou não retornou status de integridade.');
  }
  if (!output.includes('Total de Cenas: 2') || !output.includes('scene-intro')) {
    throw new Error('Dados do workspace incorretos na saída de inspeção.');
  }
});

// 5. Teste de Renderização via CLI
runTest('Renderização e compilação de projeto via CLI', () => {
  const outFile = 'test_workspace/cli_e2e_render.json';
  if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile);
  }

  const output = execSync(`npx tsx src/cli/index.ts render --workspace test_workspace --output ${outFile} --fps 30`, { encoding: 'utf-8' });
  if (!output.includes('STATUS: ✓ Renderização concluída com 100% de sucesso.')) {
    throw new Error('A compilação via CLI não concluiu com sucesso.');
  }

  if (!fs.existsSync(outFile)) {
    throw new Error(`Arquivo de saída ${outFile} não foi criado.`);
  }

  const generated = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
  if (generated.status !== 'completed' || generated.scenesCount !== 2) {
    throw new Error('Manifesto de renderização gerado com metadados inválidos.');
  }
});

// 6. Teste de Tratamento de Erro (Argumentos e Pastas Inválidas)
runTest('Tratamento de erro e código de saída 1 para workspace inexistente', () => {
  let threw = false;
  try {
    execSync('npx tsx src/cli/index.ts inspect --workspace pasta_fantasma_404', { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err) {
    threw = true;
    if (err.status !== 1) {
      throw new Error(`Esperado status code 1, recebido: ${err.status}`);
    }
  }

  if (!threw) {
    throw new Error('O comando deveria ter falhado com código de saída 1 para pasta inexistente.');
  }
});

console.log('\n========================================================================');
console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} TESTES DA CLI APROVADOS COM SUCESSO!`);
console.log('========================================================================\n');
