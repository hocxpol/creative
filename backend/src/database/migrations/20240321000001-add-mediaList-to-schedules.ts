import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "mediaList", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "mediaList");
  }
}; 