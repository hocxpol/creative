import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "cpf", {
      type: DataTypes.STRING(14),
      allowNull: true
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "cnpj", {
        type: DataTypes.STRING(18),
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "birthDate", {
        type: DataTypes.DATEONLY,
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "gender", {
        type: DataTypes.STRING(1),
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "automation", {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "queueId", {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    })
    .then(() => {
      return queryInterface.addColumn("Contacts", "internalCode", {
        type: DataTypes.STRING,
        allowNull: true
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "cpf")
    .then(() => {
      return queryInterface.removeColumn("Contacts", "cnpj");
    })
    .then(() => {
      return queryInterface.removeColumn("Contacts", "birthDate");
    })
    .then(() => {
      return queryInterface.removeColumn("Contacts", "gender");
    })
    .then(() => {
      return queryInterface.removeColumn("Contacts", "automation");
    })
    .then(() => {
      return queryInterface.removeColumn("Contacts", "queueId");
    })
    .then(() => {
      return queryInterface.removeColumn("Contacts", "internalCode");
    });
  }
}; 