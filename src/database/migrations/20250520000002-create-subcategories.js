module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("subcategories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    // Add a unique constraint for name and categoryId
    await queryInterface.addIndex("subcategories", ["name", "categoryId"], {
      unique: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("subcategories")
  },
}
