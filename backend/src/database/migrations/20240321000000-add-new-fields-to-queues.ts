import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "isInvisible", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.addColumn("Queues", "keyword", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "noAutomation", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "isInvisible"),
      queryInterface.removeColumn("Queues", "keyword"),
      queryInterface.removeColumn("Queues", "noAutomation")
    ]);
  }
}; 