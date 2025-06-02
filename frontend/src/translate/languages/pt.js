const messages = {
	pt: {
		common: {
			yes: "Sim",
			no: "Não"
		},
		errors: {
			generic: "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente."
		},
		translations: {
			signup: {
				title: "Cadastre-se",
				toasts: {
					success: "Usuário criado com sucesso, faça seu login.",
					fail: "Erro ao criar usuário. Verifique os dados informados.",
				},
				form: {
					name: "Nome",
					email: "Email",
					password: "Senha",
				},
				buttons: {
					submit: "Cadastrar",
					login: "Já tenho uma conta",
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Senha",
				},
				buttons: {
					submit: "Entrar",
					register: "Registre-se agora!",
				},
			},
			plans: {
				form: {
					name: "Nome",
					users: "Usuários",
					connections: "Conexões",
					campaigns: "Campanhas",
					schedules: "Agendamentos",
					enabled: "Habilitadas",
					disabled: "Desabilitadas",
					clear: "Cancelar",
					delete: "Excluir",
					save: "Salvar",
					yes: "Sim",
					no: "Não",
					money: "R$",
				},
			},
			companies: {
				title: "Cadastrar Empresa",
				form: {
					name: "Nome da Empresa",
					plan: "Plano",
					token: "Token",
					submit: "Cadastrar",
					success: "Empresa cadastrada com sucesso!",
				},
			},
			auth: {
				toasts: {
					success: "Login efetuado com sucesso!",
				},
				token: "Token",
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Atendimentos hoje: ",
					},
				},
			},
			connections: {
				title: "Conexões",
				toasts: {
					deleted: "Conexão com o WhatsApp excluída com sucesso!",
				},
				confirmationModal: {
					deleteTitle: "Deletar",
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
					disconnectTitle: "Desconectar",
					disconnectMessage: "Tem certeza? Você precisará ler o QR Code novamente.",
				},
				buttons: {
					add: "Adicionar WhatsApp",
					disconnect: "Desconectar",
					tryAgain: "Tentar novamente",
					qrcode: "QR CODE",
					newQr: "Novo QR CODE",
					connecting: "Conectando",
				},
				toolTips: {
					disconnected: {
						title: "Falha ao iniciar sessão do WhatsApp",
						content: "Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code",
					},
					qrcode: {
						title: "Esperando leitura do QR Code",
						content: "Clique no botão 'QR Code' e leia o QR Code com o seu celular para iniciar a sessão",
					},
					connected: {
						title: "Conexão estabelecida!",
					},
					timeout: {
						title: "A conexão com o celular foi perdida",
						content: "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
					},
				},
				table: {
					name: "Nome",
					status: "Status",
					lastUpdate: "Última atualização",
					default: "Padrão",
					actions: "Ações",
					session: "Sessão",
					number: "Número",
				},
			},
			whatsappModal: {
				title: {
					add: "Adicionar WhatsApp",
					edit: "Editar WhatsApp"
				},
				tabs: {
					general: "Conexão",
					queues: "Filas",
					calls: "Chamadas",
					rating: "Avaliações",
					integration: "Integração",
					schedules: "Horários"
				},
				form: {
					name: "Nome",
					default: "Padrão",
					callMessage: "Mensagem para chamadas",
					prompt: "Selecionar Prompt",
					queue: "Fila",
					queueRedirection: "Redirecionamento de fila",
					queueRedirectionDesc: "Selecione uma fila para redirecionar contatos que não têm fila",
					expiresTicket: "Fechar chats abertos após X minutos",
					expiresInactiveMessage: "Mensagem de fechamento por inatividade",
					greetingMessage: "Mensagem de saudação",
					complationMessage: "Mensagem de conclusão",
					ratingMessage: "Mensagem de avaliação",
					token: "Token",
					timeUseBotQueues: "Intervalo em minutos entre mensagens do bot",
					maxUseBotQueues: "Enviar bot X vezes",
					useOpenAi: "Usar OpenAI"
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar"
				},
				success: "WhatsApp salvo com sucesso."
			},
			qrCode: {
				message: "Leia o QR Code para iniciar a sessão",
			},
			contacts: {
				title: "Contatos",
				toasts: {
					deleted: "Contato excluído com sucesso!",
					deletedAll: "Todos contatos excluídos com sucesso!",
				},
				searchPlaceholder: "Pesquisar...",
				confirmationModal: {
					deleteTitle: "Deletar ",
					deleteAllTitle: "Deletar todos",
					importTitle: "Importar contatos",
					deleteMessage: "Tem certeza que deseja deletar este contato? Todos os tickets relacionados serão perdidos.",
					deleteAllMessage: "Tem certeza que deseja deletar todos os contatos? Todos os tickets relacionados serão perdidos.",
					importMessage: "Deseja importar todos os contatos do telefone?",
				},
				buttons: {
					import: "Importar Contatos",
					add: "Adicionar Contato",
					export: "Exportar Contatos",
					delete: "Excluir Todos Contatos"
				},
				table: {
					name: "Nome",
					whatsapp: "WhatsApp",
					email: "Email",
					internalCode: "Código Interno",
					birthDate: "Data de Nascimento",
					automation: "Automação",
					queue: "Fila",
					actions: "Ações",
				},
			},
			queueIntegrationModal: {
				title: {
					add: "Adicionar integração",
					edit: "Editar integração",
				},
				form: {
					id: "ID",
					type: "Tipo",
					name: "Nome",
					projectName: "Nome da integração",
					language: "Linguagem",
					jsonContent: "JsonContent",
					urlN8N: "URL",
					typebotSlug: "Typebot - Slug",
					typebotExpires: "Tempo em minutos para expirar uma conversa",
					typebotKeywordFinish: "Palavra para finalizar o ticket",
					typebotKeywordRestart: "Palavra para reiniciar o fluxo",
					typebotRestartMessage: "Mensagem ao reiniciar a conversa",
					typebotUnknownMessage: "Mensagem de opção inválida",
					typebotDelayMessage: "Intervalo (ms) entre mensagens",   
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
					test: "Testar Bot",
				},
				messages: {
					testSuccess: "Integração testada com sucesso!",
					addSuccess: "Integração adicionada com sucesso.",
					editSuccess: "Integração editada com sucesso.",
				},
			},
			sideMenu: {
				name: "Menu Lateral Inicial",
				note: "Se habilitado, o menu lateral irá iniciar fechado",
				options: {
					enabled: "Aberto",
					disabled: "Fechado",
				},
			},
			promptModal: {
				form: {
					name: "Nome",
					prompt: "Prompt",
					voice: "Voz",
					max_tokens: "Máximo de Tokens na resposta",
					temperature: "Temperatura",
					apikey: "API Key",
					max_messages: "Máximo de mensagens no Histórico",
					voiceKey: "Chave da API de Voz",
					voiceRegion: "Região de Voz",
				},
				success: "Prompt salvo com sucesso!",
				title: {
					add: "Adicionar Prompt",
					edit: "Editar Prompt",
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
			},
			prompts: {
				title: "Prompts",
				table: {
					name: "Nome",
					queue: "Setor/Fila",
					max_tokens: "Máximo Tokens Resposta",
					actions: "Ações",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida!",
				},
				buttons: {
					add: "Adicionar Prompt",
				},
			},
			contactModal: {
				title: {
					add: "Adicionar Contato",
					edit: "Editar Contato"
				},
				form: {
					name: "Nome",
					number: "Número do Whatsapp",
					numberPlaceholder: "Ex: 5541999999999",
					email: "Email",
					emailPlaceholder: "Endereço de email",
					connection: "Conexão Origem",
					select: "Selecione",
					cpf: "CPF",
					cnpj: "CNPJ",
					birthDate: "Data de Nascimento",
					birthDatePlaceholder: "Selecione a data",
					gender: "Sexo",
					male: "Masculino",
					female: "Feminino",
					automation: "Automação",
					automationStatus: {
						enabled: "Ativada",
						disabled: "Desativada"
					},
					visibility: {
						visible: "Visível",
						hidden: "Oculto"
					},
					yes: "Sim",
					no: "Não",
					queue: "Fila",
					internalCode: "Código Interno",
					extraInfo: "Informações Adicionais",
					extraName: "Nome do Campo",
					extraValue: "Valor do Campo",
					origin: "Origem",
				},
				validation: {
					queueRequired: "A fila é obrigatória quando a automação está desabilitada"
				},
				buttons: {
					cancel: "Cancelar",
					add: "Adicionar",
					edit: "Salvar",
					okAdd: "Adicionar",
					okEdit: "Salvar",
					addExtraInfo: "Adicionar Campo"
				},
				success: "Contato salvo com sucesso.",
				saving: "Salvando contato...",
				tabs: {
					contactData: "Dados do Contato",
					advanced: "Avançado",
					customFields: "Campos Personalizados"
				},
			},
			queueModal: {
				title: {
					add: "Adicionar Fila",
					edit: "Editar Fila",
				},
				form: {
					name: "Nome da Fila",
					color: "Cor",
					greetingMessage: "Mensagem de Boas-vindas",
					outOfHoursMessage: "Mensagem para Fora do Horário de Atendimento",
					orderQueue: "Ordem da Fila",
					integrationId: "Selecionar Integração",
					isInvisible: "Fila Invisível",
					keyword: "Palavra-chave da Fila",
					automation: "Automação",
					automationStatus: {
						enabled: "Ativada",
						disabled: "Desativada"
					},
					visibility: {
						visible: "Visível",
						hidden: "Invisível"
					},
					schedules: {
						title: "Expediente",
						to: "até",
						weekdays: {
							monday: "Segunda-feira",
							tuesday: "Terça-feira",
							wednesday: "Quarta-feira",
							thursday: "Quinta-feira",
							friday: "Sexta-feira",
							saturday: "Sábado",
							sunday: "Domingo"
						}
					}
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				tabs: {
					data: "Dados da Fila",
					schedules: "Expediente",
					options: "Opções da Fila",
					integrations: "Integrações",
					advanced: "Avançado"
				},
				success: "Fila salva com sucesso.",
			},
			userModal: {
				title: {
					add: "Adicionar usuário",
					edit: "Editar usuário",
				},
				form: {
					name: "Nome",
					email: "Email",
					password: "Senha",
					profile: "Perfil",
					profileOptions: {
						admin: "Administrador",
						user: "Usuário"
					},
					whatsapp: "Conexão Padrão",

					allTicket: "Ticket Sem Fila [Invisível]",
					allTicketEnabled: "Habilitado",
					allTicketDesabled: "Desabilitado",
					nameRequired: "Nome é obrigatório",
					nameTooShort: "Nome muito curto",
					nameTooLong: "Nome muito longo",
					passwordTooShort: "Senha muito curta",
					passwordTooLong: "Senha muito longa",
					passwordRequired: "Senha é obrigatória",
					emailRequired: "E-mail é obrigatório",
					emailInvalid: "E-mail inválido",
					permissions: "Liberações"
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Usuário {name} salvo com sucesso.",
			},
			scheduleModal: {
				title: {
					add: "Novo agendamento",
					edit: "Editar agendamento",
				},
				form: {
					body: "Mensagem",
					contact: "Contato",
					sendAt: "Data de agendamento",
					sentAt: "Data de envio",
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Agendamento salvo com sucesso.",
			},
			tagModal: {
				title: {
					add: "Nova Tag",
					edit: "Editar Tag",
				},
				form: {
					name: "Nome",
					color: "Cor",
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Tag salvo com sucesso.",
			},
			chat: {
				noTicketMessage: "Selecione um ticket para começar a conversar.",
			},
			uploads: {
				titles: {
					titleUploadMsgDragDrop: "ARRASTE E SOLTE ARQUIVOS NO CAMPO ABAIXO",
					titleFileList: "Lista de arquivo(s)"
				},
			},
			ticketsManager: {
				buttons: {
					newTicket: "Novo",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Filas",
			},
			tickets: {
				toasts: {
					deleted: "O atendimento que você estava foi deletado.",
				},
				notification: {
					message: "Mensagem de",
				},
				tabs: {
					open: { title: "Abertas" },
					closed: { title: "Resolvidos" },
					search: { title: "Busca" },
				},
				search: {
					placeholder: "Buscar atendimento e mensagens",
				},
				buttons: {
					showAll: "Todos",
				},
			},
			transferTicketModal: {
				title: "Transferir Ticket",
				fieldLabel: "Digite para buscar usuários",
				fieldQueueLabel: "Transferir para fila",
				fieldQueuePlaceholder: "Selecione uma fila",
				noOptions: "Nenhum usuário encontrado com esse nome",
				buttons: {
					ok: "Transferir",
					cancel: "Cancelar",
				},
			},
			ticketsList: {
				pendingHeader: "Aguardando",
				assignedHeader: "Atendendo",
				noTicketsTitle: "Nada aqui!",
				noTicketsMessage: "Nenhum atendimento encontrado com esse status ou termo pesquisado",
				buttons: {
					accept: "Aceitar",
					closed: "Finalizar",
					reopen: "Reabrir"
				},
			},
			forceCloseTicketModal: {
				title: "Fechamento Forçado",
				message: "Não foi possível enviar a mensagem de encerramento devido a problemas de conexão. Deseja fechar o ticket mesmo assim?",
				buttons: {
					cancel: "Cancelar",
					confirm: "Fechar Forçadamente"
				}
			},
			newTicketModal: {
				title: "Criar Ticket",
				fieldLabel: "Digite para pesquisar o contato",
				add: "Adicionar",
				buttons: {
					ok: "Salvar",
					cancel: "Cancelar",
				},
			},
			mainDrawer: {
				listItems: {
					main: "Principal",
					communication: "Comunicação",
					organization: "Organização",
					management: "Administração",
					dashboard: "Dashboard",
					connections: "Conexões",
					tickets: "Atendimentos",
					quickMessages: "Respostas Rápidas",
					contacts: "Contatos",
					queues: "Filas & Chatbot",
					tags: "Tags",
					tasks: "Tarefas",
					administration: "Administração",
					users: "Usuários",
					settings: "Configurações",
					help: "Ajuda",
					messagesAPI: "API",
					schedules: "Agendamentos",
					campaigns: "Campanhas",
					annoucements: "Informativos",
					chats: "Chat Interno",
					financial: "Financeiro",
					files: "Arquivos",
					prompts: "Open.Ai",
					queueIntegration: "Integrações",
					contactLists: "Listas de Contatos",
					campaignsConfig: "Configurações de Campanhas",
					kanban: "Kanban"
				},
				appBar: {
					notRegister:"Sem notificações",
					user: {
						profile: "Perfil",
						logout: "Sair",
					},
				},
			},
			queueIntegration: {
				title: "Integrações",
				table: {
					id: "ID",
					type: "Tipo",
					name: "Nome",
					projectName: "Nome da Integração",
					language: "Linguagem",
					lastUpdate: "Ultima atualização",
					actions: "Ações",
				},
				buttons: {
					add: "Adicionar Integração",
				},
				searchPlaceholder: "Pesquisar...",
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida e será removida das filas e conexões vinculadas.",
				},
			},
			files: {
				title: "Lista de arquivos",
				table: {
					name: "Nome",
					contacts: "Contatos",
					actions: "Ação",
				},
				toasts: {
					deleted: "Lista excluída com sucesso!",
					deletedAll: "Todas as listas foram excluídas com sucesso!",
				},
				buttons: {
					add: "Adicionar",
					deleteAll: "Deletar Todos",
				},
				confirmationModal: {
					deleteTitle: "Deletar",
					deleteAllTitle: "Deletar Todos",
					deleteMessage: "Tem certeza que deseja deletar esta lista?",
					deleteAllMessage: "Tem certeza que deseja deletar todas as listas?",
				},
			},
			messagesAPI: {
				title: "API",
				textMessage: {
					number: "Número",
					body: "Mensagem",
					token: "Token cadastrado",
				},
				mediaMessage: {
					number: "Número",
					body: "Nome do arquivo",
					media: "Arquivo",
					token: "Token cadastrado",
				},
			},
			notifications: {
				noTickets: "Nenhuma notificação.",
			},
			quickMessages: {
				title: "Respostas Rápidas",
				searchPlaceholder: "Pesquisar...",
				noAttachment: "Sem anexo",
				confirmationModal: {
					deleteTitle: "Exclusão",
					deleteMessage: "Esta ação é irreversível! Deseja prosseguir?",
				},
				buttons: {
					add: "Adicionar",
					attach: "Anexar Arquivo",
					cancel: "Cancelar",
					edit: "Editar",
				},
				toasts: {
					success: "Atalho adicionado com sucesso!",
					deleted: "Atalho removido com sucesso!",
				},
				dialog: {
					title: "Mensagem Rápida",
					shortcode: "Atalho",
					message: "Resposta",
					save: "Salvar",
					cancel: "Cancelar",
					geral: "Permitir editar",
					add: "Adicionar",
					edit: "Editar",
					visao: "Permitir visão",
				},
				table: {
					shortcode: "Atalho",
					message: "Mensagem",
					actions: "Ações",
					mediaName: "Nome do arquivo",
					status: "Status",
				},
			},
			messageVariablesPicker: {
				label: "Variavéis disponíveis",
				vars: {
					contactFirstName: "Primeiro Nome",
					contactName: "Nome",
					greeting: "Saudação",
					protocolNumber: "Protocolo",
					date: "Data",
					hour: "Hora",
				},
			},
			contactLists: {
				title: "Listas de Contatos",
				table: {
					name: "Nome",
					contacts: "Contatos",
					actions: "Ações",
				},
				buttons: {
					add: "Nova Lista",
				},
				dialog: {
					name: "Nome",
					company: "Empresa",
					okEdit: "Editar",
					okAdd: "Adicionar",
					add: "Adicionar",
					edit: "Editar",
					cancel: "Cancelar",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Esta ação não pode ser revertida.",
				},
				toasts: {
					deleted: "Registro excluído.",
				},
			},
			contactListItems: {
				title: "Contatos",
				searchPlaceholder: "Pesquisa",
				buttons: {
					add: "Novo",
					lists: "Listas",
					import: "Importar",
				},
				dialog: {
					name: "Nome",
					number: "Número",
					whatsapp: "Whatsapp",
					email: "E-mail",
					okEdit: "Editar",
					okAdd: "Adicionar",
					add: "Adicionar",
					edit: "Editar",
					cancel: "Cancelar",
				},
				table: {
					name: "Nome",
					number: "Número",
					whatsapp: "Whatsapp",
					email: "E-mail",
					actions: "Ações",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Esta ação não pode ser revertida.",
					importMessage: "Deseja importar os contatos desta planilha?",
					importTitle: "Importar",
				},
				toasts: {
					deleted: "Registro excluído",
				},
			},
			campaigns: {
				title: "Campanhas",
				searchPlaceholder: "Pesquisa",
				buttons: {
					add: "Nova Campanha",
					contactLists: "Listas de Contatos",
				},
				table: {
					name: "Nome",
					whatsapp: "Conexão",
					contactList: "Lista de Contatos",
					status: "Status",
					scheduledAt: "Agendamento",
					completedAt: "Concluída",
					confirmation: "Confirmação",
					actions: "Ações",
				},
				dialog: {
					new: "Nova Campanha",
					update: "Editar Campanha",
					readonly: "Apenas Visualização",
					form: {
						name: "Nome",
						message1: "Mensagem 1",
						message2: "Mensagem 2",
						message3: "Mensagem 3",
						message4: "Mensagem 4",
						message5: "Mensagem 5",
						confirmationMessage1: "Mensagem de Confirmação 1",
						confirmationMessage2: "Mensagem de Confirmação 2",
						confirmationMessage3: "Mensagem de Confirmação 3",
						confirmationMessage4: "Mensagem de Confirmação 4",
						confirmationMessage5: "Mensagem de Confirmação 5",
						messagePlaceholder: "Conteúdo da mensagem",
						whatsapp: "Conexão",
						status: "Status",
						scheduledAt: "Agendamento",
						confirmation: "Confirmação",
						contactList: "Lista de Contato",
						tagList: "Lista de Tags",
						fileList: "Lista de Arquivos"
					},
					buttons: {
						add: "Adicionar",
						edit: "Atualizar",
						okadd: "Ok",
						cancel: "Cancelar Disparos",
						restart: "Reiniciar Disparos",
						close: "Fechar",
						attach: "Anexar Arquivo",
					},
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Esta ação não pode ser revertida.",
				},
				toasts: {
					success: "Operação realizada com sucesso",
					cancel: "Campanha cancelada",
					restart: "Campanha reiniciada",
					deleted: "Registro excluído",
				},
			},
			announcements: {
				active: 'Ativo',
				inactive: 'Inativo',
				title: "Informativos",
				searchPlaceholder: "Pesquisa",
				buttons: {
					add: "Novo Informativo",
					contactLists: "Listas de Informativos",
				},
				table: {
					priority: "Prioridade",
					title: "Título",
					text: "Texto",
					mediaName: "Arquivo",
					status: "Status",
					actions: "Ações",
				},
				dialog: {
					edit: "Edição de Informativo",
					add: "Novo Informativo",
					update: "Editar Informativo",
					readonly: "Apenas Visualização",
					form: {
						priority: "Prioridade",
						title: "Título",
						text: "Texto",
						mediaPath: "Arquivo",
						status: "Status",
					},
					buttons: {
						add: "Adicionar",
						edit: "Atualizar",
						okadd: "Ok",
						cancel: "Cancelar",
						close: "Fechar",
						attach: "Anexar Arquivo",
					},
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Esta ação não pode ser revertida.",
				},
				toasts: {
					success: "Operação realizada com sucesso.",
					deleted: "Registro excluído.",
				},
			},
			campaignsConfig: {
				title: "Configurações de Campanhas",
			},
			queues: {
				title: "Filas & Chatbot",
				table: {
					id: "ID",
					name: "Nome",
					color: "Cor",
					greeting: "Mensagem de saudação",
					actions: "Ações",
					orderQueue: "Ordenação da fila (bot)",
					keyword: "Palavra-chave",
					visibility: "Visibilidade",
					automation: "Automação"
				},
				buttons: {
					add: "Adicionar fila",
				},
				messages: {
					deleted: "Fila excluída com sucesso!",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida! Os atendimentos dessa fila continuarão existindo, mas não terão mais nenhuma fila atribuída.",
				},
			},
			queueSelect: {
				inputLabel: "Filas",
			},
			users: {
				title: "Usuários",
				table: {
					id: "ID",
					name: "Nome",
					email: "Email",
					profile: "Perfil",
					actions: "Ações",
				},
				buttons: {
					add: "Adicionar usuário",
				},
				toasts: {
					deleted: "Usuário excluído com sucesso.",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Todos os dados do usuário serão perdidos. Os atendimento abertos deste usuário serão movidos para a fila.",
				},
			},
			helps: {
				title: "Central de Ajuda",
			},
			schedules: {
				title: "Expediente",
				confirmationModal: {
					deleteTitle: "Você tem certeza que quer excluir este Agendamento?",
					deleteMessage: "Esta ação não pode ser revertida.",
				},
				table: {
					contact: "Contato",
					body: "Mensagem",
					sendAt: "Data de agendamento",
					sentAt: "Data de envio",
					status: "Status",
					actions: "Ações",
				},
				buttons: {
					add: "Novo Agendamento",
				},
				toasts: {
					deleted: "Agendamento excluído com sucesso.",
				},
			},
			tags: {
				title: "Tags",
				confirmationModal: {
					deleteTitle: "Você tem certeza que quer excluir esta Tag?",
					deleteMessage: "Esta ação não pode ser revertida.",
					deleteAllMessage: "Tem certeza que deseja deletar todas as Tags?",
					deleteAllTitle: "Deletar Todos",
				},
				table: {
					name: "Nome",
					color: "Cor",
					tickets: "Contatos",
					actions: "Ações",
				},
				buttons: {
					add: "Nova Tag",
					deleteAll: "Deletar Todas",
				},
				toasts: {
					deletedAll: "Todas Tags excluídas com sucesso!",
					deleted: "Tag excluído com sucesso.",
				},
			},
			settings: {
				success: "Configurações salvas com sucesso.",
				title: "Configurações",
				tabs: {
					options: "Opções",
					schedules: "Expediente",
					companies: "Empresas",
					plans: "Planos",
					helps: "Ajuda",
					integrations: "Integrações"
				},
				settings: {
					userCreation: {
						name: "Criação de usuário",
						options: {
							enabled: "Ativado",
							disabled: "Desativado",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "Atribuído à:",
					buttons: {
						return: "Retornar",
						resolve: "Resolver",
						reopen: "Reabrir",
						accept: "Aceitar",
					},
				},
			},
			messagesInput: {
				placeholderOpen: "Digite uma mensagem",
				placeholderClosed: "Reabra ou aceite esse ticket para enviar uma mensagem.",
				signMessage: "Assinar",
			},
			contactDrawer: {
				header: "Dados do contato",
				buttons: {
					edit: "Editar contato",
				},
				extraInfo: "Outras informações",
			},
			fileModal: {
				title: {
					add: "Adicionar lista de arquivos",
					edit: "Editar lista de arquivos",
				},
				buttons: {
					okAdd: "Salvar",
					okEdit: "Editar",
					cancel: "Cancelar",
					fileOptions: "Adicionar arquivo",
				},
				form: {
					name: "Nome da lista de arquivos",
					message: "Detalhes da lista",
					fileOptions: "Lista de arquivos",
					extraName: "Mensagem para enviar com arquivo",
					extraValue: "Valor da opção",
				},
				success: "Lista de arquivos salva com sucesso!",
			},
			ticketOptionsMenu: {
				schedule: "Agendamento",
				delete: "Deletar",
				transfer: "Transferir",
				registerAppointment: "Observações do Contato",
				appointmentsModal: {
					title: "Observações do Contato",
					textarea: "Observação",
					placeholder: "Insira aqui a informação que deseja registrar.",
				},
				confirmationModal: {
					title: "Deletar o ticket #",
					titleFrom: "do contato ",
					message: "Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
				},
				buttons: {
					delete: "Excluir",
					cancel: "Cancelar",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancelar",
				},
			},
			messageOptionsMenu: {
				edit: "Editar",
				delete: "Excluir",
				copy: "Copiar",
				forward: "Encaminhar",
				reply: "Responder",
				download: "Download",
				copied: "Mensagem copiada!",
				edited: "Mensagem editada!",
				confirmationModal: {
					title: "Excluir mensagem",
					message: "Tem certeza que deseja excluir esta mensagem?"
				},
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
				ERR_NO_DEF_WAPP_FOUND: "Não foi encontrado um WhatsApp conectado. Por favor, verifique se o chip está conectado e configure uma conexão padrão na página de conexões.",
				ERR_WAPP_NOT_INITIALIZED: "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
				ERR_WAPP_CHECK_CONTACT: "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões.",
				ERR_CHECK_NUMBER: "Não foi possível verificar o número do WhatsApp. Verifique se o número está correto e tente novamente.",
				ERR_WAPP_INVALID_CONTACT: "O número de WhatsApp deve seguir o padrão: 5535988598904 (DDD + número sem espaços ou caracteres especiais)",
				ERR_WAPP_DOWNLOAD_MEDIA: "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
				ERR_INVALID_CREDENTIALS: "Erro de autenticação. Por favor, tente novamente.",
				ERR_SENDING_WAPP_MSG: "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
				ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
				ERR_OTHER_OPEN_TICKET: "Já existe um ticket aberto para este contato.",
				ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
				ERR_USER_CREATION_DISABLED: "A criação do usuário foi desabilitada pelo administrador.",
				ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
				ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
				ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
				ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
				ERR_NO_TICKET_FOUND: "Nenhum ticket encontrado com este ID.",
				ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
				ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
				ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
				ERR_CREATING_TICKET: "Erro ao criar ticket no banco de dados.",
				ERR_FETCH_WAPP_MSG: "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "Esta cor já está em uso, escolha outra.",
				ERR_WAPP_GREETING_REQUIRED: "A mensagem de saudação é obrigatório quando há mais de uma fila.",
				ERR_QUEUE_REQUIRED_WHEN_AUTOMATION_DISABLED: "A fila é obrigatória quando a automação está desabilitada",
				ERR_INVALID_NUMBER_FORMAT: "Formato de número inválido. Apenas números são permitidos.",
				ERR_INVALID_CPF: "CPF inválido",
				ERR_INVALID_CNPJ: "CNPJ inválido",
				ERR_CONTACT_DELETED: "Contato excluído com sucesso"
			},
			forward: {
				title: "Encaminhar Mensagem",
				selectChat: "Selecione o chat para encaminhar",
				searchPlaceholder: "Pesquisar chat...",
				buttons: {
					submit: "Encaminhar",
					cancel: "Cancelar"
				},
				toasts: {
					success: "Mensagem encaminhada com sucesso!",
					error: "Erro ao encaminhar mensagem. Tente novamente.",
					invalidChat: "Chat inválido ou fechado",
					noPermission: "Você não tem permissão para encaminhar para este chat",
					deletedMessage: "Não é possível encaminhar uma mensagem deletada",
					alreadyForwarded: "Não é possível encaminhar uma mensagem que já foi encaminhada"
				},
				validation: {
					selectChat: "Selecione pelo menos um chat para encaminhar",
					invalidParams: "Parâmetros inválidos para encaminhamento"
				},
			},
			schedulesForm: {
				title: "Expediente",
				to: "até",
				monday: "Segunda-feira",
				tuesday: "Terça-feira",
				wednesday: "Quarta-feira",
				thursday: "Quinta-feira",
				friday: "Sexta-feira",
				saturday: "Sábado",
				sunday: "Domingo",
				featureDisabled: "Este recurso não está disponível no seu plano atual",
				validation: {
					invalidTime: "Formato de hora inválido",
					endTimeBeforeStart: "A hora de finalização deve ser posterior à hora de início",
					required: "Este campo é obrigatório"
				},
				errors: {
					saveError: "Erro ao salvar horário",
					loadError: "Erro ao carregar horário"
				},
				weekday: "Dia da Semana",
				startTime: "Horário de Início",
				endTime: "Horário de Término",
				save: "Salvar"
			},
			validation: {
				required: "Este campo é obrigatório",
				minLength: "Mínimo de {{min}} caracteres",
				maxLength: "Máximo de {{max}} caracteres",
				invalidEmail: "E-mail inválido",
				invalidNumber: "Formato de número inválido",
				tooShort: "Muito curto",
				tooLong: "Muito longo"
			},
			fileUploadModal: {
				title: "Enviar arquivos",
				dragAndDrop: "Arraste e solte arquivos aqui",
				selectFiles: "ou clique para selecionar",
				cancel: "Cancelar",
				send: "Enviar",
				clearAll: "Limpar tudo",
				totalSize: "Tamanho total",
				success: "Arquivos enviados com sucesso!",
				descriptionPlaceholder: "Adicione uma descrição para este arquivo",
				editImage: "Clique para editar a imagem",
				errors: {
					sizeExceeded: "O arquivo excede o tamanho máximo permitido de 16MB",
					invalidType: "Tipo de arquivo não permitido",
					maxFilesExceeded: "Máximo de {{max}} arquivos permitidos",
					invalidFileName: "Nome do arquivo contém caracteres inválidos",
					uploadFailed: "Falha ao enviar arquivos. Tente novamente."
				}
			},
		},
	},
};

export { messages };
