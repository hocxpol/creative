import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("QuickMessages", "visibility", {
      type: DataTypes.STRING,
      defaultValue: "me",
      allowNull: false
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("QuickMessages", "visibility");
  }
}; 