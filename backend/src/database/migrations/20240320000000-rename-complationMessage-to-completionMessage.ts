import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("Whatsapps", "complationMessage", "completionMessage");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.renameColumn("Whatsapps", "completionMessage", "complationMessage");
  }
}; 