import { WAMessage } from "@whiskeysockets/baileys";
import { isNil, head } from "lodash";
import moment from "moment";
import { Op, Sequelize } from "sequelize";
import { Session } from "../../services/WbotServices/wbotMessageListener";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import QueueOption from "../../models/QueueOption";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import formatBody from "../../helpers/Mustache";
import { getBodyMessage, getTypeMessage } from "../message";
import { verifyMessage } from "../message/handlers";
import { debounce } from "../../helpers/Debounce";
import ShowWhatsAppService from "../../services/WhatsappService/ShowWhatsAppService";
import ShowQueueIntegrationService from "../../services/QueueIntegrationServices/ShowQueueIntegrationService";
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../../services/TicketServices/FindOrCreateATicketTrakingService";
import { handleMessageIntegration } from "../integration";
import { handleOpenAi } from "../../utils/openai";

// Importar a função verifyQueue do arquivo original
import { verifyQueue } from "../../utils/queue";

// Handle chatbot interactions and menu navigation
export const handleChartbot = async (ticket: Ticket, msg: WAMessage, wbot: Session, dontReadTheFirstQuestion: boolean = false) => {
	const queue = await Queue.findByPk(ticket.queueId, {
		include: [
			{
				model: QueueOption,
				as: "options",
				where: { parentId: null },
				order: [
					[Sequelize.cast(Sequelize.col('option'), 'INTEGER'), 'ASC'],
					["createdAt", "ASC"],
				],
			},
		],
	});

	const messageBody = getBodyMessage(msg);

  // Menu inicial
	if (messageBody == "#") {
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
		await verifyQueue(wbot, msg, ticket, ticket.contact);
		return;
	}

  // Menu anterior
	if (messageBody == "0") {
    // Se não tem opções, volta ao menu principal
    if (!queue?.options || queue.options.length === 0) {
      await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
      await verifyQueue(wbot, msg, ticket, ticket.contact);
      return;
    }
    
    // Se tem opções, volta ao menu anterior
    if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
      const option = await QueueOption.findByPk(ticket.queueOptionId);
      await ticket.update({ queueOptionId: option?.parentId });
    }
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "0") {
		const option = await QueueOption.findByPk(ticket.queueOptionId);
    await ticket.update({ queueOptionId: option?.parentId });
		
    // escolheu uma opção
	} else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
		const count = await QueueOption.count({
			where: { parentId: ticket.queueOptionId },
		});

		let option: any = {};
		if (count == 1) {
			option = await QueueOption.findOne({
				where: { parentId: ticket.queueOptionId },
			});
		} else {
			option = await QueueOption.findOne({
				where: {
					option: messageBody || "",
					parentId: ticket.queueOptionId,
				},
			});
		}

		if (option) {
			await ticket.update({ queueOptionId: option?.id });
		}
		// Skip first question if specified
	} else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion) {
		const option = queue?.options.find((o) => o.option == messageBody);
		if (option) {
			await ticket.update({ queueOptionId: option?.id });
		}
	}
	await ticket.reload();

	// Display available options in the main menu
	if (!isNil(queue) && isNil(ticket.queueOptionId)) {
		const queueOptions = await QueueOption.findAll({
			where: { queueId: ticket.queueId, parentId: null },
			order: [
				[Sequelize.cast(Sequelize.col('option'), 'INTEGER'), 'ASC'],
				["createdAt", "ASC"],
			],
		});

		const companyId = ticket.companyId;
		const buttonActive = await Setting.findOne({
			where: {
				key: "chatBotType",
				companyId
			}
		});

    // const botList = async () => {
    // const sectionsRows = [];

    // queues.forEach((queue, index) => {
    //   sectionsRows.push({
    //     title: queue.name,
    //     rowId: `${index + 1}`
    //   });
    // });

    // const sections = [
    //   {
    //     rows: sectionsRows
    //   }
    // ];

    //   const listMessage = {
    //     text: formatBody(`\u200e${queue.greetingMessage}`, ticket.contact),
    //     buttonText: "Escolha uma opção",
    //     sections
    //   };

    //   const sendMsg = await wbot.sendMessage(
    //     `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    //     listMessage
    //   );

    //   await verifyMessage(sendMsg, ticket, ticket.contact);
    // }

		const botButton = async () => {
			const buttons = [];
			queueOptions.forEach((option, i) => {
				buttons.push({
					buttonId: `${option.option}`,
					buttonText: { displayText: option.title },
					type: 4
				});
			});
			buttons.push({
				buttonId: `#`,
				buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
				type: 4
			});

			const buttonMessage = {
				text: formatBody(`\u200e${queue.greetingMessage}`, ticket.contact),
				buttons,
				headerType: 4
			};

			const sendMsg = await wbot.sendMessage(
				`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
				buttonMessage
			);

			await verifyMessage(sendMsg, ticket, ticket.contact);
		}

		// Function to display options as text
		const botText = async () => {
			let options = "";
			queueOptions.forEach((option, i) => {
				options += `*[ ${option.option} ]* - ${option.title}\n`;
			});
			options += `\n*[ 0 ]* - Menu anterior`;
			options += `\n*[ # ]* - Menu inicial`;

			const textMessage = {
				text: formatBody(`\u200e*${queue.name}*\n\n${queue.greetingMessage}\n\n${options}`, ticket.contact),
			};

			const sendMsg = await wbot.sendMessage(
				`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
				textMessage
			);

			await verifyMessage(sendMsg, ticket, ticket.contact);
		};

    // if (buttonActive.value === "list") {
    //   return botList();
    // };
		if (buttonActive.value === "button" && queueOptions.length <= 4) {
			return botButton();
		}

		if (buttonActive.value === "text") {
			return botText();
		}

		if (buttonActive.value === "button" && queueOptions.length > 4) {
			return botText();
		}
	} else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
		const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
		const queueOptions = await QueueOption.findAll({
			where: { parentId: ticket.queueOptionId },
			order: [
				[Sequelize.cast(Sequelize.col('option'), 'INTEGER'), 'ASC'],
				["createdAt", "ASC"],
			],
		});

		if (queueOptions.length > -1) {
			const companyId = ticket.companyId;
			const buttonActive = await Setting.findOne({
				where: {
					key: "chatBotType",
					companyId
				}
			});

			// Function to display options as a list
			const botList = async () => {
				const sectionsRows = [];

				queueOptions.forEach((option, i) => {
					sectionsRows.push({
						title: option.title,
						rowId: `${option.option}`
					});
				});
				sectionsRows.push({
					title: "Menu inicial *[ 0 ]* Menu anterior",
					rowId: `#`
				});
				const sections = [
					{
						rows: sectionsRows
					}
				];

				const listMessage = {
					text: formatBody(`\u200e*${queue.name}*\n\n${currentOption.message}`, ticket.contact),
					buttonText: "Escolha uma opção",
					sections
				};

				const sendMsg = await wbot.sendMessage(
					`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
					listMessage
				);

				await verifyMessage(sendMsg, ticket, ticket.contact);
			}

			// Function to display options as buttons (max 4 buttons)
			const botButton = async () => {
				const buttons = [];
				queueOptions.forEach((option, i) => {
					buttons.push({
						buttonId: `${option.option}`,
						buttonText: { displayText: option.title },
						type: 4
					});
				});
				buttons.push({
					buttonId: `#`,
					buttonText: { displayText: "Menu inicial *[ 0 ]* Menu anterior" },
					type: 4
				});

				const buttonMessage = {
					text: formatBody(`\u200e*${queue.name}*\n\n${currentOption.message}`, ticket.contact),
					buttons,
					headerType: 4
				};

				const sendMsg = await wbot.sendMessage(
					`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
					buttonMessage
				);

				await verifyMessage(sendMsg, ticket, ticket.contact);
			}

			// Function to display options as text
			const botText = async () => {
				let options = "";

				queueOptions.forEach((option, i) => {
					options += `*[ ${option.option} ]* - ${option.title}\n`;
				});
				options += `\n*[ 0 ]* - Menu anterior`;
				options += `\n*[ # ]* - Menu inicial`;

				const textMessage = {
					text: formatBody(`\u200e*${queue.name}*\n\n${currentOption.message}\n\n${options}`, ticket.contact),
				};

				const sendMsg = await wbot.sendMessage(
					`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
					textMessage
				);

				await verifyMessage(sendMsg, ticket, ticket.contact);
			};

			// Display format logic based on settings and number of options
			if (buttonActive.value === "list") {
				return botList();
			};

			if (buttonActive.value === "button" && queueOptions.length <= 4) {
				return botButton();
			}

			if (buttonActive.value === "text") {
				return botText();
			}

			if (buttonActive.value === "button" && queueOptions.length > 4) {
				return botText();
			}
		}
	}
};