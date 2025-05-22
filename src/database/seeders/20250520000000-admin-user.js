const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("Admin@123", salt)

    return queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        firstName: "Admin",
        lastName: "User",
        email: "admin@ijwiryabaturage.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", { email: "admin@ijwiryabaturage.com" }, {})
  },
}
