/**
 * Utilitário de Geração de Textos Rápidos (Lorem Ipsum Contextual)
 * Usado para preenchimento rápido e verificação de layout de templates.
 */

export function getShortLoremForField(fieldName: string, fieldType: string): string {
  const lower = fieldName.toLowerCase();

  // Badges, Kickers e Tags
  if (lower.includes('badge') || lower.includes('tag') || lower.includes('kicker') || lower.includes('category')) {
    const badges = [
      'DEEP DIVE TECNOLÓGICO',
      'INSIGHT EXCLUSIVO',
      'ALTA PERFORMANCE',
      'DESTAQUE VIP',
      'ANÁLISE ESTRUTURAL',
      'INTELIGÊNCIA ARTIFICIAL',
    ];
    return badges[Math.floor(Math.random() * badges.length)];
  }

  // Métricas, Estatísticas e Números
  if (
    lower.includes('stat') ||
    lower.includes('metric') ||
    lower.includes('number') ||
    lower.includes('percent') ||
    lower.includes('value') ||
    lower.includes('kpi')
  ) {
    const stats = ['+94.8%', '10x Mais Rápido', '4.2M Usuários', '99.9% Uptime', 'R$ 1.5M', '3.8x ROI'];
    return stats[Math.floor(Math.random() * stats.length)];
  }

  // Títulos e Headlines
  if (lower.includes('title') || lower.includes('heading') || lower.includes('headline')) {
    const titles = [
      'Como Funcionam os Modelos de Linguagem',
      'Arquitetura Escalável de Vídeo em Tempo Real',
      'Engenharia de Software e Sistemas Modernos',
      'A Revolução da Computação de Alta Fidelidade',
      'Estratégias Avançadas de Crescimento e Impacto',
      'O Futuro do Processamento Distribuído',
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  // Autores, Palestrantes e Pessoas
  if (lower.includes('author') || lower.includes('speaker') || lower.includes('person') || lower.includes('name')) {
    const authors = ['Dra. Helena Vance', 'Carlos Albuquerque', 'Mariana Siqueira', 'Prof. Roberto Mendes'];
    return authors[Math.floor(Math.random() * authors.length)];
  }

  // Cargos e Profissões
  if (lower.includes('role') || lower.includes('job') || lower.includes('position')) {
    const roles = ['Head de Inteligência Artificial', 'Tech Lead & Arquiteto', 'Cientista de Dados Sênior', 'Diretor de Engenharia'];
    return roles[Math.floor(Math.random() * roles.length)];
  }

  // Áreas de texto, Subtítulos, Declarações e Descrições
  if (
    fieldType === 'textarea' ||
    lower.includes('subtitle') ||
    lower.includes('desc') ||
    lower.includes('statement') ||
    lower.includes('explanation') ||
    lower.includes('quote')
  ) {
    const texts = [
      'Da matemática dos vetores densos à revolução das atenções paralelas em tempo real.',
      'Uma análise completa dos padrões estruturais que impulsionam sistemas de alta disponibilidade.',
      'Descubra como otimizar seus pipelines reduzindo latência e maximizando a precisão dos resultados.',
      'Princípios essenciais para desenvolvedores que buscam excelência técnica e impacto direto.',
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  // Itens de listas ou genéricos
  if (lower.includes('item') || lower.includes('step') || lower.includes('point') || lower.includes('topic')) {
    const items = [
      'Arquitetura orientada a eventos com baixa latência',
      'Treinamento distribuído em clusters paralelos',
      'Monitoramento contínuo com observabilidade em tempo real',
      'Otimização de custos e eficiência energética',
    ];
    return items[Math.floor(Math.random() * items.length)];
  }

  return 'Lorem ipsum dolor sit amet';
}
