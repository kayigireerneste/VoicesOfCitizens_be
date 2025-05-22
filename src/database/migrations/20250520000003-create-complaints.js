module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create enum types
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_complaints_status" AS ENUM (
        'pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'closed'
      );
    `)

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_complaints_priority" AS ENUM (
        'low', 'medium', 'high', 'urgent'
      );
    `)

    await queryInterface.createTable("complaints", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      subcategoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "subcategories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: {
        type: "enum_complaints_status",
        allowNull: false,
        defaultValue: "pending",
      },
      priority: {
        type: "enum_complaints_priority",
        allowNull: false,
        defaultValue: "medium",
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      assignedTo: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      trackingId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
    await queryInterface.dropTable("complaints")
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_complaints_status";`)
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_complaints_priority";`)
  },
}
