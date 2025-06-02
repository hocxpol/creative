import { QueryInterface } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      const passwordHash = await hash("$G70r1um.Ch4t*2024$", 8);
      return Promise.all([
        queryInterface.bulkInsert(
          "Users",
          [
            {
              name: "Glorium.Chat",
              email: "desenvolvimento@glorium.dev",
              profile: "admin",
              passwordHash,
              companyId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              super: true
            }
          ],
          { transaction: t }
        )
      ]);
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {});
  }
};
