-- 1. Deletar todas as perguntas existentes
DELETE FROM questions;

-- 2. Resetar a sequência de IDs (opcional, para começar do 1)
ALTER SEQUENCE questions_id_seq RESTART WITH 1;

-- 3. Inserir as 10 perguntas de IRAS
INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_index, justification, category, video_id) VALUES
(
  'A principal medida para prevenção das IRAS é:',
  'Uso contínuo de antibióticos',
  'Restrição de acompanhantes',
  'Higienização adequada das mãos',
  'Uso de luvas em todos os momentos',
  2,
  'A higienização das mãos é a medida mais eficaz para prevenir IRAS, interrompendo a transmissão de microrganismos.',
  'IRAS',
  1
),
(
  'As Precauções Padrão devem ser aplicadas:',
  'Apenas em pacientes com infecção confirmada',
  'Em todos os pacientes',
  'Somente em ambiente de UTI',
  'Apenas durante procedimentos invasivos',
  1,
  'As Precauções Padrão se aplicam a todos os pacientes independentemente do diagnóstico, pois qualquer paciente pode ser fonte de infecção.',
  'IRAS',
  1
),
(
  'O uso de luvas substitui a higienização das mãos?',
  'Sim, sempre',
  'Apenas em pacientes isolados',
  'Não, a higienização das mãos continua obrigatória',
  'Apenas durante aspiração',
  2,
  'As luvas não substituem a higienização das mãos. As mãos devem ser higienizadas antes de calçar e após retirar as luvas.',
  'IRAS',
  1
),
(
  'Na Precaução de Contato, é recomendado:',
  'Entrar no quarto sem capote',
  'Compartilhar equipamentos sem limpeza',
  'Utilizar luvas e capote ao entrar em contato com paciente ou ambiente próximo ao paciente',
  'Higienizar as mãos apenas ao final do plantão',
  2,
  'Na Precaução de Contato, luvas e capote são obrigatórios para evitar transmissão por contato direto ou indireto com o paciente.',
  'IRAS',
  1
),
(
  'Pacientes em Precaução Respiratória exigem:',
  'Compartilhamento livre de equipamentos',
  'Suspensão da higiene das mãos',
  'Uso adequado de máscara',
  'Circulação sem restrições',
  2,
  'A máscara é o EPI essencial na precaução respiratória para bloquear a transmissão por gotículas ou aerossóis.',
  'IRAS',
  1
),
(
  'A higienização das mãos deve ser realizada:',
  'Somente no início do plantão',
  'Antes e após contato com o paciente',
  'Apenas após procedimentos invasivos',
  'Somente quando houver sujeira visível',
  1,
  'A higienização deve ocorrer nos 5 momentos preconizados pela OMS, sendo antes e após o contato com o paciente os mais fundamentais.',
  'IRAS',
  1
),
(
  'Qual EPI é indicado para contato com secreções?',
  'Apenas Touca',
  'Apenas Propé',
  'Luvas, Máscara, Avental e Óculos',
  'Óculos apenas',
  2,
  'O conjunto completo de EPI (luvas, máscara, avental e óculos) é necessário para proteger todas as mucosas e pele do profissional.',
  'IRAS',
  1
),
(
  'As Precauções Padrão incluem:',
  'Suspensão de contato familiar',
  'Uso adequado de EPIs e higiene das mãos',
  'Isolamento respiratório universal',
  'Uso obrigatório de N95 para todos',
  1,
  'As Precauções Padrão englobam higiene das mãos, uso de EPIs adequados, descarte seguro de materiais e manuseio correto de artigos.',
  'IRAS',
  1
),
(
  'Tocar superfícies sem higienizar as mãos pode causar:',
  'Maior segurança',
  'Redução de infecção',
  'Contaminação cruzada',
  'Economia de materiais',
  2,
  'Superfícies contaminadas são reservatórios de microrganismos; tocar sem higienizar as mãos propaga a contaminação cruzada entre pacientes.',
  'IRAS',
  1
),
(
  'A prevenção das infecções relacionadas à assistência é responsabilidade:',
  'Apenas da CCIH',
  'Apenas da Enfermagem e da Fisioterapia',
  'Apenas da equipe médica',
  'De todos os profissionais da assistência',
  3,
  'A prevenção de IRAS é responsabilidade coletiva de toda a equipe multidisciplinar, não apenas de um grupo específico.',
  'IRAS',
  1
);
