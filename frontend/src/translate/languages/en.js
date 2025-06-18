const messages = {
	en: {
		common: {
			yes: "Yes",
			no: "No"
		},
		errors: {
			generic: "Sorry, an unexpected error occurred. Please try again."
		},
		translations: {
			signup: {
				title: "Sign up",
				toasts: {
					success: "User created successfully! Please login!",
					fail: "Error creating user. Check the reported data.",
				},
				form: {
					name: "Name",
					email: "Email",
					password: "Password",
				},
				buttons: {
					submit: "Register",
					login: "Already have an account? Log in!",
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Password",
				},
				buttons: {
					submit: "Enter",
					register: "Don't have an account? Register!",
				},
			},
			auth: {
				toasts: {
					success: "Login successfully!",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets today: ",
					},
				},
			},
			connections: {
				title: "Connections",
				toasts: {
					deleted: "WhatsApp connection deleted sucessfully!",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage: "Are you sure? It cannot be reverted.",
					disconnectTitle: "Disconnect",
					disconnectMessage: "Are you sure? You'll need to read QR Code again.",
				},
				buttons: {
					add: "Add WhatsApp",
					disconnect: "Disconnect",
					tryAgain: "Try Again",
					qrcode: "QR CODE",
					newQr: "New QR CODE",
					connecting: "Connectiing",
				},
				toolTips: {
					disconnected: {
						title: "Failed to start WhatsApp session",
						content:
							"Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
					},
					qrcode: {
						title: "Waiting for QR Code read",
						content:
							"Click on 'QR CODE' button and read the QR Code with your cell phone to start session",
					},
					connected: {
						title: "Connection established",
					},
					timeout: {
						title: "Connection with cell phone has been lost",
						content:
							"Make sure your cell phone is connected to the internet and WhatsApp is open, or click on 'Disconnect' button to get a new QRcode",
					},
				},
				table: {
					name: "Name",
					status: "Status",
					lastUpdate: "Last Update",
					default: "Default",
					actions: "Actions",
					session: "Session",
					number: "Number",
				},
			},
			whatsappModal: {
				title: {
					add: "Add WhatsApp",
					edit: "Edit WhatsApp"
				},
				tabs: {
					general: "General",
					queues: "Queues",
					calls: "Calls",
					rating: "Assessments",
					integration: "Integration",
					schedules: "Schedules"
				},
				form: {
					name: "Name",
					default: "Default",
					callMessage: "Call message",
					prompt: "Select Prompt",
					queue: "Queue",
					queueRedirection: "Queue Redirection",
					queueRedirectionDesc: "Select a queue to redirect contacts that don't have a queue",
					expiresTicket: "Close open chats after X minutes",
					expiresInactiveMessage: "Inactivity closure message",
					greetingMessage: "Greeting message",
					completionMessage: "Completion message",
					ratingMessage: "Rating message",
					token: "Token",
					timeUseBotQueues: "Interval in minutes between bot messages",
					maxUseBotQueues: "Send bot X times",
					useOpenAi: "Use OpenAI"
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel"
				},
				success: "WhatsApp saved successfully."
			},
			qrCode: {
				message: "Read QrCode to start the session",
			},
			contacts: {
				title: "Contacts",
				toasts: {
					deleted: "Contact deleted sucessfully!",
				},
				searchPlaceholder: "Search ...",
				confirmationModal: {
					deleteTitle: "Delete",
					importTitle: "Import contacts",
					deleteMessage:
						"Are you sure you want to delete this contact? All related tickets will be lost.",
					importMessage: "Do you want to import all contacts from the phone?",
				},
				buttons: {
					import: "Import Contacts",
					add: "Add Contact",
				},
				table: {
					name: "Name",
					whatsapp: "WhatsApp",
					email: "Email",
					actions: "Actions",
				},
			},
			contactModal: {
				title: {
					add: "Add Contact",
					edit: "Edit Contact"
				},
				form: {
					mainInfo: "Main Information",
					additionalInfo: "Additional Information",
					name: "Name",
					number: "Number",
					email: "Email",
					whatsapp: "WhatsApp",
					extraInfo: "Extra Information",
					extraName: "Name",
					extraValue: "Value",
					gender: "Gender",
					genderMale: "Male",
					genderFemale: "Female",
					genderOther: "Other",
					automation: "Automation",
					internalCode: "Internal Code",
					queue: "Queue",
					noQueue: "None"
				},
				buttons: {
					add: "Add",
					edit: "Save",
					cancel: "Cancel",
					addExtraInfo: "Add Extra Information"
				},
				success: "Contact saved successfully!"
			},
			queueModal: {
				title: {
					add: "Add department",
					edit: "Edit department",
				},
				form: {
					name: "Department Name",
					color: "Color",
					greetingMessage: "Welcome Message",
					outOfHoursMessage: "Message for Outside Business Hours",
					orderQueue: "Department Order",
					integrationId: "Select Integration",
					isInvisible: "Hide Department",
					keyword: "Department Keyword",
					automation: "Automation",
					automationStatus: {
						enabled: "Enabled",
						disabled: "Disabled"
					},
					schedules: {
						title: "Business Hours",
						weekdays: {
							monday: "Monday",
							tuesday: "Tuesday",
							wednesday: "Wednesday",
							thursday: "Thursday",
							friday: "Friday",
							saturday: "Saturday",
							sunday: "Sunday"
						}
					}
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "Department saved successfully.",
			},
			userModal: {
				title: {
					add: "Add User",
					edit: "Edit User",
				},
				tabs: {
					data: "Data",
					connection: "Connection",
					departments: "Departments"
				},
				form: {
					name: "Name",
					password: "Password",
					email: "Email",
					profile: "Profile",
					whatsapp: "Default Connection",
					queues: "Departments",
					connection: "Connection",
					allTicket: "Tickets View",
					profileOptions: {
						admin: "Administrator",
						user: "User",
					},
					nameTooShort: "Name is too short",
					nameTooLong: "Name is too long",
					nameRequired: "Name is required",
					passwordTooShort: "Password is too short",
					passwordTooLong: "Password is too long",
					emailInvalid: "Invalid email address",
					emailRequired: "Email is required"
				},
				buttons: {
					okAdd: "Add",
					okEdit: "Save",
					cancel: "Cancel",
				},
				success: "User saved successfully.",
			},
			chat: {
				noTicketMessage: "Select a ticket to start chatting.",
				tooltips: {
					sendMessage: "Send message",
					cancelRecording: "Cancel recording",
					sendRecordedAudio: "Send recorded audio",
					recordAudio: "Record audio",
					emojis: "Emojis",
					attachFile: "Attach file"
				}
			},
			ticketsManager: {
				buttons: {
					newTicket: "New",
				},
			},
			ticketsQueueSelect: {
				placeholder: "Departments",
			},
			tickets: {
				toasts: {
					deleted: "The ticket you were on has been deleted.",
				},
				notification: {
					message: "Message from",
				},
				tabs: {
					open: { title: "Inbox" },
					closed: { title: "Resolved" },
					search: { title: "Search" },
				},
				search: {
					placeholder: "Search tickets and messages.",
				},
				buttons: {
					showAll: "All",
				},
			},
			transferTicketModal: {
				title: "Transfer Ticket",
				fieldLabel: "Type to search for users",
				noOptions: "No user found with this name",
				buttons: {
					ok: "Transfer",
					cancel: "Cancel",
				},
			},
			ticketsList: {
				pendingHeader: "Department",
				assignedHeader: "Working on",
				noTicketsTitle: "Nothing here!",
				noTicketsMessage: "No tickets found with this status or search term.",
				buttons: {
					accept: "Accept",
				},
			},
			newTicketModal: {
				title: "Create Ticket",
				fieldLabel: "Type to search for a contact",
				add: "Add",
				buttons: {
					ok: "Save",
					cancel: "Cancel",
				},
			},
			mainDrawer: {
				listItems: {
					main: "Main",
					communication: "Communication",
					organization: "Organization",
					management: "Administration",
					dashboard: "Dashboard",
					connections: "Connections",
					tickets: "Tickets",
					quickMessages: "Quick Messages",
					contacts: "Contacts",
					queues: "Departments",
					tags: "Tags",
					administration: "Administration",
					users: "Users",
					settings: "Settings",
					help: "Help",
					messagesAPI: "API",
					schedules: "Schedules",
					campaigns: "Campaigns",
					annoucements: "Announcements",
					chats: "Internal Chat",
					financeiro: "Financial",
					files: "File List",
					prompts: "Open.Ai",
					queueIntegration: "Integrations",
					contactLists: "Contact Lists",
					campaignsConfig: "Settings",
				},
				appBar: {
					user: {
						profile: "Profile",
						logout: "Logout",
					},
				},
			},
			notifications: {
				noTickets: "No notifications.",
			},
			queues: {
				title: "Departments",
				table: {
					id: "ID",
					name: "Name",
					color: "Color",
					greeting: "Greeting message",
					actions: "Actions",
					orderQueue: "Order",
					keyword: "Keyword",
					visibility: "Visibility",
					automation: "Automation",
					number: "Number",
					session: "Session",
					queues: "Departments",
				},
				buttons: {
					add: "Add department",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage:
						"Are you sure? It cannot be reverted! Tickets in this department will still exist, but will not have any departments assigned.",
				},
			},
			queueSelect: {
				inputLabel: "Departments",
			},
			users: {
				title: "Users",
				table: {
					name: "Name",
					email: "Email",
					profile: "Profile",
					actions: "Actions",
				},
				buttons: {
					add: "Add user",
				},
				toasts: {
					deleted: "User deleted sucessfully.",
				},
				confirmationModal: {
					deleteTitle: "Delete",
					deleteMessage:
						"All user data will be lost. Users' open tickets will be moved to department.",
				},
			},
			settings: {
				success: "Settings saved successfully.",
				title: "Settings",
				tabs: {
					data: "Department",
					schedules: "Business Hours",
					options: "Options",
					integrations: "Integrations",
					advanced: "Advanced"
				},
				settings: {
					userCreation: {
						name: "User creation",
						options: {
							enabled: "Enabled",
							disabled: "Disabled",
						},
					},
				},
			},
			messagesList: {
				header: {
					assignedTo: "Assigned to:",
					buttons: {
						return: "Return",
						resolve: "Resolve",
						reopen: "Reopen",
						accept: "Accept",
					},
				},
			},
			messagesInput: {
				placeholderOpen: "Type a message",
				placeholderClosed: "Reopen or accept this ticket to send a message.",
				signMessage: "Sign",
			},
			ticketOptionsMenu: {
				delete: "Delete",
				transfer: "Transfer",
				confirmationModal: {
					title: "Delete ticket #",
					titleFrom: "from contact ",
					message: "Attention! All ticket's related messages will be lost.",
				},
				buttons: {
					delete: "Delete",
					cancel: "Cancel",
				},
			},
			confirmationModal: {
				buttons: {
					confirm: "Ok",
					cancel: "Cancel",
				},
			},
			messageOptionsMenu: {
				delete: "Delete",
				reply: "Reply",
				confirmationModal: {
					title: "Delete message?",
					message: "This action cannot be reverted.",
				},
			},
			backendErrors: {
				ERR_NO_OTHER_WHATSAPP:
					"There must be at lest one default WhatsApp connection.",
				ERR_NO_DEF_WAPP_FOUND:
					"No default WhatsApp found. Check connections page.",
				ERR_WAPP_NOT_INITIALIZED:
					"This WhatsApp session is not initialized. Check connections page.",
				ERR_WAPP_CHECK_CONTACT:
					"Could not check WhatsApp contact. Check connections page.",
				ERR_WAPP_INVALID_CONTACT: "This is not a valid whatsapp number.",
				ERR_WAPP_DOWNLOAD_MEDIA:
					"Could not download media from WhatsApp. Check connections page.",
				ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
				ERR_SENDING_WAPP_MSG:
					"Error sending WhatsApp message. Check connections page.",
				ERR_DELETE_WAPP_MSG: "Couldn't delete message from WhatsApp.",
				ERR_OTHER_OPEN_TICKET:
					"There's already an open ticket for this contact.",
				ERR_SESSION_EXPIRED: "Session expired. Please login.",
				ERR_USER_CREATION_DISABLED:
					"User creation was disabled by administrator.",
				ERR_NO_PERMISSION: "You don't have permission to access this resource.",
				ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
				ERR_NO_SETTING_FOUND: "No setting found with this ID.",
				ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
				ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
				ERR_NO_USER_FOUND: "No user found with this ID.",
				ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
				ERR_CREATING_MESSAGE: "Error while creating message on database.",
				ERR_CREATING_TICKET: "Error while creating ticket on database.",
				ERR_FETCH_WAPP_MSG:
					"Error fetching the message in WhtasApp, maybe it is too old.",
				ERR_QUEUE_COLOR_ALREADY_EXISTS:
					"This color is already in use, pick another one.",
				ERR_WAPP_GREETING_REQUIRED:
					"Greeting message is required if there is more than one department.",
				ERR_QUEUE_REQUIRED_WHEN_AUTOMATION_DISABLED: "Department is required when automation is disabled",
				ERR_INVALID_NUMBER_FORMAT: "Invalid number format. Only numbers are allowed.",
				ERR_INVALID_CPF: "Invalid CPF",
				ERR_INVALID_CNPJ: "Invalid CNPJ",
				ERR_CONTACT_DELETED: "Contact deleted successfully",
				ERR_NO_QUEUE_PERMISSION: "You don't have permission to access this department. To get access, please contact the system administrator and request to add this department to your user profile."
			},
			schedulesForm: {
				weekday: "Weekday",
				startTime: "Start Time",
				endTime: "End Time",
				save: "Save",
				monday: "Monday",
				tuesday: "Tuesday",
				wednesday: "Wednesday",
				thursday: "Thursday",
				friday: "Friday",
				saturday: "Saturday",
				sunday: "Sunday",
				featureDisabled: "This feature is not available in your current plan",
				validation: {
					invalidTime: "Invalid time format",
					endTimeBeforeStart: "End time must be after start time",
					required: "This field is required"
				},
				errors: {
					saveError: "Error saving schedule",
					loadError: "Error loading schedule"
				}
			},
			validation: {
				required: "This field is required",
				minLength: "Must be at least {{min}} characters",
				maxLength: "Must be at most {{max}} characters",
				invalidEmail: "Invalid email address",
				invalidNumber: "Invalid number format",
				tooShort: "Too short",
				tooLong: "Too long"
			},
			fileUploadModal: {
				title: "Send Files",
				dragAndDrop: "Drag and drop files here or",
				selectFiles: "Select Files",
				cancel: "Cancel",
				send: "Send",
				clearAll: "Clear All",
				totalSize: "Total Size",
				success: "Files uploaded successfully!",
				descriptionPlaceholder: "Add a description for this file",
				editImage: "Click to edit image",
				errors: {
					sizeExceeded: "File exceeds WhatsApp's 16MB limit",
					invalidType: "Unsupported file type",
					maxFilesExceeded: "Maximum of {{max}} files allowed",
					invalidFileName: "File name contains invalid characters",
					uploadFailed: "Failed to upload files. Please try again."
				}
			},
			whatsapp: "Default Connection",
			allTicket: "Allow viewing tickets from other departments",
			allTicketEnabled: "Enabled",
			allTicketDesabled: "Disabled",
			nameRequired: "Name is required",
			ticketsView: "Tickets",
			ticketsViewEnabled: "View all (including without department)",
			ticketsViewDisabled: "View only mine",
			table: {
				shortcode: "Shortcode",
				message: "Message",
				actions: "Actions",
				mediaName: "File name",
				status: "Status",
				visibility: "Visibility",
				attachment: "Attachment"
			},
			quickMessages: {
				title: "Quick Messages",
				searchPlaceholder: "Search...",
				noAttachment: "No attachment",
				yes: "Yes",
				no: "No",
				visibilityAll: "All",
				visibilityMe: "Only me",
				tooltip: "Quick Messages",
				confirmationModal: {
					deleteTitle: "Delete attachment",
					deleteMessage: "Are you sure you want to delete this attachment?"
				},
				buttons: {
					add: "Add",
					attach: "Attach",
					cancel: "Cancel",
					edit: "Edit",
					send: "Send"
				},
				toasts: {
					success: "Quick message saved successfully!",
					deleted: "Quick message deleted successfully!"
				},
				dialog: {
					title: "Quick Message",
					shortcode: "Code",
					message: "Message",
					select: "Select quick message",
					selectPlaceholder: "Select a quick message",
					edit: "Edit quick message",
					add: "Add quick message",
					attach: "Attach file"
				},
				loading: {
					uploading: "Uploading file...",
					saving: "Saving quick message...",
					sending: "Sending quick message...",
					downloading: "Loading file..."
				},
				table: {
					shortcode: "Code",
					message: "Message",
					actions: "Actions",
					mediaName: "File",
					status: "Status",
					visibility: "Visibility",
					attachment: "Attachment"
				}
			},
			schedules: {
				company: {
					outOfHours: {
						defaultMessage: "Hello! We are currently out of business hours. Our team will return soon to assist you. Below are our business hours:",
						noScheduleDefined: "Business hours not defined. Please contact the administrator.",
						invalidTimeFormat: "Invalid time format. Please contact the administrator."
					}
				},
				queue: {
					outOfHours: {
						defaultMessage: "This department is currently out of business hours. Our team will return soon to assist you. Below are this department's business hours:",
						noScheduleDefined: "Business hours not defined for this department. Please contact the administrator.",
						invalidTimeFormat: "Invalid time format for this department. Please contact the administrator."
					}
				}
			},
		},
	},
};

export { messages };
