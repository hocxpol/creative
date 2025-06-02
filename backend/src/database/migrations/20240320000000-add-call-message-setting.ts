import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
	up: (queryInterface: QueryInterface) => {
		return queryInterface.addColumn("Whatsapps", "callMessage", {
			type: DataTypes.TEXT,
			defaultValue: "*Mensagem Automática:*\n\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
		});
	},

	down: (queryInterface: QueryInterface) => {
		return queryInterface.removeColumn("Whatsapps", "callMessage");
	}
}; 