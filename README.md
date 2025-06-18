Todos os direitos reservados a https://glorium.chat

# v3 Abril de 2025
- Demonstrativo de 15 dias
- Alterado para Glorium.Chat
- API desativadas
- Correção Mui "^" package.json (frontend)
- Correção uso da lib Baileys no package.json (backend)

Correções Identificadas na versão anterior
- Permitir usuário alterar dados somente dentro domesmo company ID
- Permitir admin alterar dados de usuários
- Normalização de e-mail lowercase
- Filas: Organizado a ordem de modo correto
- Remover formatação do telefone antes de enviar ao backend

Correções Identificadas na versão anterior
- SMTP
- Template SMTP

# v3 Abril 2025 - Correções Upload 0001
- TypeBot Corrigido

# v3 Abril 2025 - Correções e Melhorias 0002
- Correção título da index para Glorium.Chat
- Login: 15 dias
- Ticket Aspas Duplas

# v3 Abril 2025 - Correções e Melhorias 0003
- Plano: External API false
- Toast Erro: Descomentado

- Chat Interno:
- Ajustado cores melhores
- Evitar chat duplicado

- Login: Voltado ao i18n

# v3 Abril 2025 - Correções e Melhorias 0004
- Menu de Navegação Filas:
- Exibir # Menu inicial
- Exibir nome da fila dentro da subfila

# v3 Abril 2025 - Correções e Melhorias 0005
- Nova estrutura de arquivos mp3, xls, webp
- Novas logos
- Correção do bug de banco de dados das barras

# v3 Abril 2025 - Correções e Melhorias 0006
- Correção de Rota de Login | Correção 0007

# v3 Abril 2025 - Correções e Melhorias 0007
- Call Message - Administrar mensagem | Correção 008 Bug Número WhatsApp

# v3 Abril 2025 - Correções e Melhorias 0008
- MainMenu
- Ticket: Force Closed
- Conexâo: Número de WhatsApp
- Reassociar fila do WhatsApp
- Força criar pasta public se não existir
- Logo do Menu com link para home
- Topbar mostra se a conexão está desconectada

# v3 Abril 2025 - Correções e Melhorias 0009
- Encaminhamento de mensagens com quote/citação

# v3 Abril 2025 - Correções e Melhorias 0010
- Traduções
- Debounce para envio de mensagens 1.5s
- Ajuste menu financeiro
- Correção de mensagem de encaminhamento no frontend

# v3 Abril 2025 - Correções e Melhorias 0011
- Adicionado mensagens editadas | Falta correção windows
- Correção de encaminhar mensagem editada
- Correção mensagem editada com imagem | Correção 0012
- Implementação vCard | Correção 0013

# v3 Abril 2025 - Correções e Melhorias 0012
- Melhoria no menu principal
- Envio e recebimento de PDF com texto

# v3 Abril 2025 - Correções e Melhorias 0013

- Configurações: Divisão das integrações
- Mensagem com imagem editada e encaminhada
- Correção Página Financeiro
- Mensagem editada Windows
- vCard resolvido?

# v3 Abril 2025 - Correções e Melhorias 0014
- Quando um ticket está aberto e é transferido para fila de outro chip, o sistema não detecta que já está em uma fila e fica mandando mensagens repetidas. Wbot Correção.

# v3 Maio 2025 - Implementação
- Image Crop

# v3 Maio - 2025 - Refatoração
- Refatoração wbotMessageListener 
- Melhoria do bloco "Chamada de voz/vídeo perdida"
- Ajustes de Copyright em login
- Ajustes de ícones no menu de mensagens / encaminhar


- Avaliação
- Melhoria no texto de avaliação, evitando espaço em branco caso não haja mensagem de avaliação no admin.
- Correção da Avaliação não processar a fila na sequência.
- Correção de Navegação na fila / subfila com avaliação.
- Correção da nota de avaliação e fechamento do ticket.

- Correção de mensagem de saudação e filas que estava encaminhando # Menu e em branco.
- Correção ao fechar ticket fora do horário de expediente.

- Quando um ticket for fechado forçadamente (forceClose: true), o sistema não tentará enviar mensagens de avaliação ou conclusão, evitando assim o erro quando a conexão não está ativa.
- Se estiver em um atendimento fora do horário do expediente, não envia mensagem fora do horário de expediente.

- Ajuste da ordem de mensagens
- Resolvido problema de transferência de tickets em conexões diferentes.

# v3 Maio - 2025 - Melhorias
- Corrigido link de ajuda

# v3 Maio - Aba Filas
- Adicionado abas integrações, Opções da Fila.
- Melhorado layout 6 3 3 para Nome da Fila, Cor e Ordem da Fila.
- Traduções i18n
- Melhorias nos textos dos campos

# v3 Maio - Aba Conexão
- Divisão em abas

# v3 Maio - Novos campos em Contato
- CPF, CNPJ, Data de Nascimento, Sexo, Automação, Fila, Código Interno.

# v3 Maio - Novos campos em Filas
- Fila Invisível
- Palavra Chave
- Sem automação

- Refresh infinito authy
- Mensagem de erro "An error occurrred"

Em validação:
# v3 Maio - 2025 - 14 - Melhorias
- Funcionamento de Fila Invisível - Está funcionando (menu em comunicação)
- Funcionamento da Palavra Chave - Está funcionando
- Funcionamento da Automação para Contatos - Está funcionando

# v3 Maio - 2025 - 18 - Melhorias
- Select de filas mostrando quais as visíveis ou invisíveis, Filtros, Transferências, Novo Ticket, Contatos
- Na exportação implementado os dados de contato adicional, data de nascimento, código interno, cpf, cnpj, sexo, fila, automação
- Adicionado novos campos na tabela de contatos
- Contatos, adicionado Extra Fields com tradução
- Abas em Contato
- Correção do Horário de Atendimento de Filas que não desabilitava mesmo estando desabilitado
- Correção de efeito de pré-carregamento dos campos da tabela
- Trazer dados atualizados do drawer do contato
- Correção das permissões das abas integrações
- Alterado local do olho / espiar nos tickets
- Colocado horário no cabeçalho
- Arrastar e soltar arquivos
- Correção do nome do contato sendo substituido pelo telefone
- Novo componente de Horário de funcionamento em filas
- Horário de Funcionamento com as mensagens para filas e para empresa
- Versão
- Horário de expediente de empresa, a mensagem é salva e informado que está fora do expediente.
- Ajustado novamente a chamada de áudio e voz perdida.
- Correção do clip anexo para enviar arquivos pela modal
- Close emojis
- Permitir ctrl+v para múltiplos arquivos no campo input custom de mensagens - Correção v2
- Correção do botão cancelar para fechar modal
- Correção para upload usando ctrl+v que não passava arquivos para a modal
- Opção de edição / crop para imagens na modal / editar múltiplas
- Modal full, reorganizar, editar
- Correção dos campos de versão
- Correção da ordem dos envios dos arquivos
- Inclusão de descrição nos arquivos
- Correção da ordem da descrição
- Correção de tradução da descrição
- Correção do bug de upload / individual no backend - Correção descrição bug mustache?
- Correção ordem do envio, descrição dos arquivos.

- Resolvido descrição dos arquivos - v2
- Melhoria de design modal - descrição - v2
- Barra de Upload
- Multir CTRL+V - Correção - v10
- Otimização Básica
- Se não houver filas, manda somente a saudação ou nada se não houver nada
- Correção do menu se estiver sem fila
- Contact Drawer - Automação / ícone / cor
- Conexão de Origem
- Tranferência de conversa para Chip Diferente
- Correção da data em contato, estava voltando um dia
- Desabilita avaliação se o contato estiver com automação desabilitada. Correção
- Correção do nome do contato estar sendo alterado para número quando se envia uma mensagem - v2
- Quando automação desabilitada é obrigatória seleção de fila
- Melhoria na topbar, tooltips, menus, icons.
- Correção do salvar contato.
- Correção toast erros.
- Correção de Origem em contact drawer.
- Tipos de uploads
- Redimensionamento de tela, erro de ticket, exibição do menu lateral.
- Limite de caracteres na saudação de filas.
- Evitar cadastro de atalhos repetidos.
- Mensagem de tradução ao excluir atalho.
- Correção ao salvar um usuário. Removido {name}.
- User: Sem Fila "Nenhum", Conexão Padrão "Nenhum".
- Ver tickets de outros usuários (sem fila).
- Respostas rápidas com opção de cadastrar para todos ou somente para mim.
- Correção da rota para acesso ao dashboard somente para admin.
- Coluna de exibição de mensagens rápidas.
- Correção de redirecionamento de dashboard.
- Modal resposta rápida com anexo. Correção.
- Novo botão de mensagens rápidas.
- Loading durante mensagens rápidas e traduções.
- Loading save, upload, tootltips.
- Remove arquivos ao deletar em mensagens rápidas.
- Correções da dialog, e texto do vídeo nas mensagens rápidas.

- Tema Dark
- Salvar origem do contato
- Ver tickets sem fila
- Status do usuário online / offline
- Exibir quantidade de filas em conexão
- Correção agendamento de mensagens que não era salva no ticket do contato.
- Melhoria no tamanho da modal de agendamento.
- Correção para salvar a mensagem de conclusão no ticket.
- Mensagem de conclusão.
- Mensagem agendada, marcação de leitura.
- Agendamento funcionando, registrando, modal para ver detalhes.
- Correção da ordem de envio da mensagem de encerramento por inatividade.
- Remoção do espaço em inicio de frase de inatividade.
- Filas alterado para Departamentos.
- Faz atualização correta ao criar um novo ticket.
- Mensagem rápida com vídeo e texto.
- Correção ao transferir ticket, ao fechar, ao abrir.
- Fechamento automático de atendimentos
- Mensagem editada + Notificações
- Tradução das mensagens na tela de cadastro
- Correção de exibição de versão no pré-load
------------
Agendamento Chip de Origem | OK
Agendamento com anexos | OK
Agendamento Título | OK
Company-$- (schedule controler) | OK
Fechamento automático do ticket | OK
Apagar mensagem | OK
Alterar mensagem | OK
Tema Dark | OK
Input Desabilitado | OK
Transferencia automatica atualizando automaticamente | OK 
Evita criar um novo ticket para usuário que já tem ticket aberto | OK
Loop Infinito página queues devido a company ID | OK
Navegação em filas/departamentos | OK
Correção do horário de expediente | OK
------------

Correções a fazer.

- Mensagem completa de sem permissão em fila.

- Atualização do ticket em múlti canais
- Mostrar os tickets para (para todos)

- Fecha automaticamente a avaliação 3 mensagens ignoradas. / Rating Index
- Envio de midia usando API Externa + Registro no chat

---------------------------------------------------------------------------------
- Vcard
- Reagir
- Grupos
- Sistema de pastas
- Usuários dos Grupos
- Encaminhar múltiplas mensagens
- Foto maior
- Tela de configurações avançada
- Sistema de aniversário
- Dados de Endereço
- Feedback
- Remoção de logs
- Traduções
- Admin ver todos os dados

- Automação na fila VIP
- Permissão de integração nas abas
- Criar ticket sem conexão
- Mensagem Editada