module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("status_histories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      complaintId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "complaints",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      previousStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      newStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      changedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("status_histories")
  },
}
