import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Messages", "forwardedFrom", {
      type: DataTypes.STRING,
      references: { model: "Messages", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    })
    .then(() => {
      return queryInterface.addColumn("Messages", "isForwarded", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      });
    })
    .then(() => {
      return queryInterface.addColumn("Messages", "forwardedTo", {
        type: DataTypes.JSON,
        defaultValue: []
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Messages", "forwardedFrom")
    .then(() => {
      return queryInterface.removeColumn("Messages", "isForwarded");
    })
    .then(() => {
      return queryInterface.removeColumn("Messages", "forwardedTo");
    });
  }
}; 