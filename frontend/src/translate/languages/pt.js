const messages = {
	pt: {
		common: {
			yes: "Sim",
			no: "Não"
		},
		errors: {
			generic: "Desculpe, ocorreu um erro inesperado. Por favor, tente novamente."
		},
		validation: {
			minLength: "Muito curto! Mínimo de {{min}} caracteres",
			maxLength: "Muito longo! Máximo de {{max}} caracteres",
			required: "Campo obrigatório",
			invalidEmail: "Email inválido"
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
					queues: "Departamentos",
				},
			},
			whatsappModal: {
				title: {
					add: "Adicionar WhatsApp",
					edit: "Editar WhatsApp"
				},
				tabs: {
					general: "Geral",
					queues: "Departamentos",
					calls: "Chamadas",
					rating: "Avaliação",
					integration: "Integração",
					schedules: "Horários",
					advanced: "Avançado"
				},
				form: {
					name: "Nome",
					default: "Padrão",
					callMessage: "Mensagem para chamadas",
					prompt: "Selecionar Prompt",
					queue: "Departamento",
					queueRedirection: "Redirecionamento de Departamento",
					queueRedirectionDesc: "Selecione um Departamento para redirecionar contatos que não têm Departamento",
					expiresTicket: "Fechar chats abertos após X minutos",
					expiresInactiveMessage: "Mensagem de fechamento por inatividade",
					greetingMessage: "Mensagem de saudação",
					completionMessage: "Mensagem de conclusão",
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
					queue: "Departamento",
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
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Prompt salvo com sucesso.",
			},
			scheduleList: {
				title: "Agendamentos",
				searchPlaceholder: "Buscar...",
				buttons: {
					add: "Novo Agendamento"
				},
				table: {
					contact: "Contato",
					whatsapp: "WhatsApp",
					body: "Mensagem",
					sendAt: "Data/Hora",
					status: "Status",
					actions: "Ações"
				},
				toasts: {
					deleted: "Agendamento excluído com sucesso!"
				},
				confirmationModal: {
					deleteTitle: "Excluir Agendamento",
					deleteMessage: "Tem certeza que deseja excluir este agendamento?"
				}
			},
			scheduleModal: {
				title: {
					add: "Adicionar Agendamento",
					edit: "Editar Agendamento"
				},
				form: {
					contact: "Contato",
					whatsapp: "WhatsApp",
					body: "Mensagem",
					sendAt: "Data/Hora de Envio"
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar"
				},
				success: "Agendamento salvo com sucesso!",
				mediaRemoved: "Arquivo removido com sucesso!",
				confirmationModal: {
					title: "Remover arquivo",
					message: "Tem certeza que deseja remover este arquivo?"
				}
			},
			prompts: {
				title: "Prompts",
				table: {
					name: "Nome",
					queue: "Departamento",
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
					queue: "Departamento",
					internalCode: "Código Interno",
					extraInfo: "Informações Adicionais",
					extraName: "Nome do Campo",
					extraValue: "Valor do Campo",
					origin: "Origem",
				},
				validation: {
					queueRequired: "O Departamento é obrigatório quando a automação está desabilitada"
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
					add: "Adicionar Departamento",
					edit: "Editar Departamento",
				},
				form: {
					name: "Nome do Departamento",
					color: "Cor",
					greetingMessage: "Mensagem de Boas-vindas",
					outOfHoursMessage: "Mensagem para Fora do Horário de Atendimento",
					orderQueue: "Ordem do Departamento",
					integrationId: "Selecionar Integração",
					isInvisible: "Departamento Invisível",
					keyword: "Palavra-chave do Departamento",
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
					data: "Departamento",
					schedules: "Horários",
					options: "Opções",
					integrations: "Integrações",
					advanced: "Avançado"
				},
				success: "Departamento salvo com sucesso.",
			},
			userModal: {
				title: {
					add: "Adicionar usuário",
					edit: "Editar usuário",
				},
				tabs: {
					data: "Dados",
					connection: "Permissões",
					departments: "Departamentos"
				},
				form: {
					name: "Nome",
					email: "Email",
					password: "Senha",
					profile: "Perfil",
					whatsapp: "Conexão Padrão",
					queues: "Departamentos",
					connection: "Conexão",
					allTicket: "Visualização de Tickets",
					profileOptions: {
						admin: "Administrador",
						user: "Usuário",
					},
					nameTooShort: "Nome muito curto",
					nameTooLong: "Nome muito longo",
					nameRequired: "Nome é obrigatório",
					passwordTooShort: "Senha muito curta",
					passwordTooLong: "Senha muito longa",
					emailInvalid: "Email inválido",
					emailRequired: "Email é obrigatório"
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Usuário salvo com sucesso.",
			},
			ticketsManager: {
				buttons: {
					newTicket: "Novo",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Departamentos",
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
				fieldQueueLabel: "Transferir para Departamento",
				fieldQueuePlaceholder: "Selecione um Departamento",
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
				title: "Novo Ticket",
				fieldLabel: "Pesquisar contato",
				buttons: {
					ok: "Criar",
					cancel: "Cancelar"
				},
				errors: {
					selectQueue: "Selecione um departamento",
					ticketAlreadyOpen: "Este contato já possui um ticket aberto com {{user}} no departamento {{queue}}",
					otherUser: "outro usuário"
				}
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
					queues: "Departamentos",
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
					notRegister: "Sem notificações",
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
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida e será removida dos Departamentos e conexões vinculadas.",
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
				yes: "Sim",
				no: "Não",
				visibilityAll: "Todos",
				visibilityMe: "Somente eu",
				tooltip: "Mensagens Rápidas",
				confirmationModal: {
					deleteTitle: "Excluir anexo",
					deleteMessage: "Tem certeza que deseja excluir este anexo?"
				},
				buttons: {
					add: "Adicionar",
					attach: "Anexar",
					cancel: "Cancelar",
					edit: "Editar",
					send: "Enviar"
				},
				toasts: {
					success: "Mensagem rápida salva com sucesso!",
					deleted: "Mensagem rápida excluída com sucesso!"
				},
				dialog: {
					title: "Mensagem Rápida",
					shortcode: "Atalho",
					message: "Mensagem",
					select: "Selecionar mensagem rápida",
					selectPlaceholder: "Selecione uma mensagem rápida",
					edit: "Editar mensagem rápida",
					add: "Adicionar mensagem rápida",
					attach: "Anexar arquivo",
					visibility: "Visibilidade",
					visibilityOptions: {
						me: "Somente eu",
						all: "Todos"
					}
				},
				loading: {
					uploading: "Enviando arquivo...",
					saving: "Salvando mensagem rápida...",
					sending: "Enviando mensagem rápida...",
					downloading: "Carregando arquivo..."
				},
				table: {
					shortcode: "Atalho",
					message: "Mensagem",
					actions: "Ações",
					mediaName: "Arquivo",
					status: "Status",
					visibility: "Visibilidade",
					attachment: "Anexo"
				}
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
				title: "Departamentos",
				table: {
					id: "ID",
					name: "Nome",
					color: "Cor",
					greeting: "Mensagem de saudação",
					actions: "Ações",
					orderQueue: "Ordem",
					keyword: "Palavra-chave",
					visibility: "Visibilidade",
					automation: "Automação"
				},
				buttons: {
					add: "Adicionar departamento",
				},
				messages: {
					deleted: "Departamento excluído com sucesso!",
				},
				confirmationModal: {
					deleteTitle: "Excluir",
					deleteMessage: "Você tem certeza? Essa ação não pode ser revertida! Os atendimentos desse departamento continuarão existindo, mas não terão mais nenhum departamento atribuído.",
				},
			},
			queueSelect: {
				inputLabel: "Departamentos",
			},
			users: {
				title: "Usuários",
				table: {
					id: "ID",
					name: "Nome",
					email: "Email",
					profile: "Perfil",
					queues: "Departamentos",
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
					deleteMessage: "Todos os dados do usuário serão perdidos. Os atendimentos abertos deste usuário serão movidos para o departamento.",
				},
			},
			helps: {
				title: "Central de Ajuda",
			},
			schedules: {
				title: "Agendamentos",
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
				company: {
					outOfHours: {
						defaultMessage: "Olá! Estamos fora do horário de atendimento no momento. Nossa equipe retornará em breve para atendê-lo. Abaixo estão nossos horários de funcionamento:",
						noScheduleDefined: "Horário de funcionamento não definido. Por favor, entre em contato com o administrador.",
						invalidTimeFormat: "Formato de horário inválido. Por favor, entre em contato com o administrador."
					}
				},
				queue: {
					outOfHours: {
						defaultMessage: "O departamento está fora do horário de atendimento no momento. Nossa equipe retornará em breve para atendê-lo. Abaixo estão os horários de funcionamento deste departamento:",
						noScheduleDefined: "Horário de funcionamento não definido para este departamento. Por favor, entre em contato com o administrador.",
						invalidTimeFormat: "Formato de horário inválido para este departamento. Por favor, entre em contato com o administrador."
					}
				}
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
					data: "Departamento",
					schedules: "Horários",
					companies: "Empresas",
					plans: "Planos",
					helps: "Ajuda",
					integrations: "Integrações",
					options: "Opções",
					advanced: "Avançado"
				},
				settings: {
					userCreation: {
						name: "Criação de usuário",
						options: {
							enabled: "Habilitado",
							disabled: "Desabilitado",
						},
					},
					queueCreation: {
						name: "Criação de departamento",
						options: {
							enabled: "Habilitado",
							disabled: "Desabilitado",
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
				noTickets: "Nenhum ticket selecionado",
				noMessages: "Nenhuma mensagem",
				noMessagesFromContact: "Nenhuma mensagem deste contato",
				typeMessage: "Digite uma mensagem",
				write: "escrevendo...",
				forwarded: "Encaminhado",
				edited: "Editado",
				messageStatus: {
					sent: "Enviado",
					received: "Recebido",
					read: "Lido",
					notRead: "Não lido",
					error: "Erro no envio"
				}
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
				ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos uma conexão WhatsApp padrão.",
				ERR_NO_DEF_WAPP_FOUND: "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
				ERR_WAPP_NOT_INITIALIZED: "Esta sessão do WhatsApp não está inicializada. Verifique a página de conexões.",
				ERR_WAPP_CHECK_CONTACT: "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões.",
				ERR_WAPP_INVALID_CONTACT: "Este não é um número de WhatsApp válido.",
				ERR_WAPP_DOWNLOAD_MEDIA: "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
				ERR_INVALID_CREDENTIALS: "Erro de autenticação. Por favor, tente novamente.",
				ERR_SENDING_WAPP_MSG: "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
				ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
				ERR_OTHER_OPEN_TICKET: "Este contato já possui um ticket aberto. Por favor, feche o ticket existente antes de criar um novo.",
				ERR_SESSION_EXPIRED: "Sessão expirada. Por favor, faça login.",
				ERR_USER_CREATION_DISABLED: "A criação de usuários foi desativada pelo administrador.",
				ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
				ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
				ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
				ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
				ERR_NO_TICKET_FOUND: "Nenhum ticket encontrado com este ID.",
				ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
				ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
				ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
				ERR_CREATING_TICKET: "Erro ao criar ticket. Por favor, tente novamente.",
				ERR_FETCH_WAPP_MSG: "Erro ao buscar a mensagem no WhatsApp, talvez ela seja muito antiga.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS: "Esta cor já está em uso, escolha outra.",
				ERR_WAPP_GREETING_REQUIRED: "A mensagem de saudação é obrigatória se houver mais de um departamento.",
				ERR_QUEUE_REQUIRED_WHEN_AUTOMATION_DISABLED: "O departamento é obrigatório quando a automação está desativada",
				ERR_NO_QUEUE_PERMISSION: "Você não tem permissão para acessar este departamento. Para obter acesso, entre em contato com o administrador do sistema e solicite a adição deste departamento ao seu perfil de usuário.",
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
				title: "Agendamentos",
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
			ticketsView: "Tickets",
			ticketsViewEnabled: "Ver todos (inclusive sem departamento)",
			ticketsViewDisabled: "Ver somente os meus",
			chat: {
				noTicketMessage: "Selecione um atendimento para começar a conversar.",
				tooltips: {
					sendMessage: "Enviar mensagem",
					cancelRecording: "Cancelar gravação",
					sendRecordedAudio: "Enviar áudio gravado",
					recordAudio: "Gravar áudio",
					emojis: "Emojis",
					attachFile: "Anexar arquivo"
				}
			},
		},
	},
};

export { messages };
