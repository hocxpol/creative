import { FindOptions } from "sequelize/types";
import Queue from "../../models/Queue";
import Whatsapp from "../../models/Whatsapp";
import { getWbot } from "../../libs/wbot";
import { jidNormalizedUser, WASocket } from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";

interface Request {
  companyId: number;
  session?: number | string;
}

const ListWhatsAppsService = async ({
  session,
  companyId
}: Request): Promise<Whatsapp[]> => {
  const options: FindOptions = {
    where: {
      companyId
    },
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ]
  };

  if (session !== undefined && session == 0) {
    options.attributes = { exclude: ["session"] };
  }

  const whatsapps = await Whatsapp.findAll(options);
	logger.info(`Found ${whatsapps.length} WhatsApps for company ${companyId}`);

	// Atualiza o número do WhatsApp para cada instância conectada
	const whatsappsWithNumber = await Promise.all(
		whatsapps.map(async (whatsapp) => {
			try {
				if (whatsapp.status === "CONNECTED") {
					logger.info(`Getting number for WhatsApp ${whatsapp.id}`);
					const wbot = getWbot(whatsapp.id);
					const fullNumber = jidNormalizedUser((wbot as WASocket).user?.id);
					logger.info(`WhatsApp ${whatsapp.id} full number: ${fullNumber}`);
					// Extrai apenas os números do ID
					const number = fullNumber?.replace(/\D/g, "");
					logger.info(`WhatsApp ${whatsapp.id} extracted number: ${number}`);
					if (number) {
						whatsapp.number = number;
						await whatsapp.save();
						logger.info(`Saved number ${number} for WhatsApp ${whatsapp.id}`);
					}
				}
			} catch (err) {
				logger.error(`Error getting WhatsApp number for ${whatsapp.id}:`, err);
			}
			return whatsapp;
		})
	);

	return whatsappsWithNumber;
};

export default ListWhatsAppsService;
