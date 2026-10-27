import type { RoutineInput } from "@/lib/types";

// Converte hora e minuto em minutos desde a meia-noite (09:20 -> 560)
const at = (hours: number, minutes = 0) => hours * 60 + minutes;

// Dias da semana: 0 = domingo, 1 = segunda ... 6 = sábado
export const starterRoutines: RoutineInput[] = [
  {
    title: "Verificar pedidos e prazos de expedição",
    description:
      "Atividade operacional prioritária.\n- Listar pedidos novos e pendentes\n- Identificar prazos de envio que vencem hoje\n- Definir a ordem de separação\nConcluída quando: todos os pedidos do dia estiverem identificados e ordenados por prazo.",
    frequency: "DAILY",
    weekdays: [],
    preferredStartMin: at(9, 0),
    estimatedMinutes: 20,
    priority: "HIGH",
    active: true,
  },
  {
    title: "Responder perguntas e mensagens pendentes",
    description:
      "Manter a rotina de atendimento em dia.\n- Responder perguntas de compradores\n- Responder mensagens e chats\n- Registrar casos que dependem de outra pessoa\nConcluída quando: não houver pergunta ou mensagem sem resposta.",
    frequency: "DAILY",
    weekdays: [],
    preferredStartMin: at(9, 20),
    estimatedMinutes: 30,
    priority: "HIGH",
    active: true,
  },
  {
    title: "Separar, conferir e embalar os pedidos",
    description:
      "Concluir a preparação dos pedidos do dia.\n- Separar os produtos de cada pedido\n- Conferir item, quantidade e variação\n- Embalar e etiquetar\nConcluída quando: todos os pedidos com prazo para hoje estiverem prontos para coleta ou postagem.",
    frequency: "DAILY",
    weekdays: [],
    preferredStartMin: at(10, 0),
    estimatedMinutes: 45,
    priority: "HIGH",
    active: true,
  },
  {
    title: "Revisar e melhorar dois anúncios",
    description:
      "Atividade de melhoria programada.\n- Escolher dois anúncios com baixo desempenho\n- Revisar título, fotos, descrição e preço\n- Anotar o que foi alterado\nConcluída quando: dois anúncios tiverem sido revisados e atualizados.",
    frequency: "WEEKLY",
    weekdays: [1, 3],
    preferredStartMin: at(11, 0),
    estimatedMinutes: 40,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Criar novos anúncios",
    description:
      "Ampliar o catálogo.\n- Selecionar produtos ainda sem anúncio\n- Preparar fotos, título e descrição\n- Publicar e conferir a exibição\nConcluída quando: os anúncios planejados estiverem publicados.",
    frequency: "WEEKLY",
    weekdays: [4],
    preferredStartMin: at(11, 0),
    estimatedMinutes: 60,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Responder mensagens da tarde",
    description:
      "Segunda passada no atendimento do dia.\nConcluída quando: não houver mensagem nova sem resposta.",
    frequency: "DAILY",
    weekdays: [],
    preferredStartMin: at(13, 30),
    estimatedMinutes: 20,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Pesquisar novos produtos e fornecedores",
    description:
      "Bloco semanal de desenvolvimento comercial.\n- Pesquisar produtos com boa procura\n- Comparar preços e condições de fornecedores\n- Registrar candidatos para teste\nConcluída quando: ao menos um produto ou fornecedor tiver sido avaliado e anotado.",
    frequency: "WEEKLY",
    weekdays: [1],
    preferredStartMin: at(14, 0),
    estimatedMinutes: 45,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Analisar concorrentes",
    description:
      "Acompanhar o mercado.\n- Verificar preços e promoções dos principais concorrentes\n- Observar anúncios que se destacam\n- Anotar ideias de melhoria\nConcluída quando: as observações da semana estiverem registradas.",
    frequency: "WEEKLY",
    weekdays: [2],
    preferredStartMin: at(14, 0),
    estimatedMinutes: 30,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Melhorar e revisar checklists",
    description:
      "Manter os processos atualizados.\n- Revisar os checklists de atendimento, embalagem e anúncios\n- Corrigir etapas que não funcionam mais\nConcluída quando: os checklists estiverem revisados.",
    frequency: "BIWEEKLY",
    weekdays: [5],
    preferredStartMin: at(15, 0),
    estimatedMinutes: 30,
    priority: "LOW",
    active: true,
  },
  {
    title: "Gestão financeira da semana",
    description:
      "Reservar um período para as finanças.\n- Conferir vendas e repasses\n- Registrar custos e despesas\n- Verificar pendências de pagamento\nConcluída quando: os lançamentos da semana estiverem em dia.",
    frequency: "WEEKLY",
    weekdays: [5],
    preferredStartMin: at(16, 0),
    estimatedMinutes: 45,
    priority: "MEDIUM",
    active: true,
  },
  {
    title: "Revisar a rotina e planejar a próxima semana",
    description:
      "Fechar o ciclo semanal.\n- Olhar o que foi concluído, adiado e atrasado\n- Definir os objetivos da próxima semana\nConcluída quando: a revisão semanal estiver registrada.",
    frequency: "WEEKLY",
    weekdays: [5],
    preferredStartMin: at(17, 0),
    estimatedMinutes: 30,
    priority: "MEDIUM",
    active: true,
  },
];

// Expediente padrão: segunda a sexta, 09:00 às 18:00
export const starterWorkdays = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  enabled: weekday >= 1 && weekday <= 5,
  startMinutes: at(9, 0),
  endMinutes: at(18, 0),
}));