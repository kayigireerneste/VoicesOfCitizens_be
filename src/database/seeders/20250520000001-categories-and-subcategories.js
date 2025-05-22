const { v4: uuidv4 } = require("uuid")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert categories
    const categories = [
      {
        id: uuidv4(),
        name: "Infrastructure",
        description: "Issues related to public infrastructure",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Education",
        description: "Issues related to education services",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Healthcare",
        description: "Issues related to healthcare services",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Public Safety",
        description: "Issues related to public safety and security",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Utilities",
        description: "Issues related to public utilities",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await queryInterface.bulkInsert("categories", categories)

    // Get inserted categories to reference their IDs
    const insertedCategories = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories WHERE name IN ('Infrastructure', 'Education', 'Healthcare', 'Public Safety', 'Utilities')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    )

    // Create a map of category names to IDs
    const categoryMap = {}
    insertedCategories.forEach((category) => {
      categoryMap[category.name] = category.id
    })

    // Insert subcategories
    const subcategories = [
      // Infrastructure subcategories
      {
        id: uuidv4(),
        name: "Roads",
        description: "Issues with roads, highways, and streets",
        categoryId: categoryMap["Infrastructure"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Bridges",
        description: "Issues with bridges and overpasses",
        categoryId: categoryMap["Infrastructure"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Public Buildings",
        description: "Issues with government buildings and facilities",
        categoryId: categoryMap["Infrastructure"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Public Transport",
        description: "Issues with public transportation systems",
        categoryId: categoryMap["Infrastructure"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Education subcategories
      {
        id: uuidv4(),
        name: "Primary Schools",
        description: "Issues related to primary education",
        categoryId: categoryMap["Education"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Secondary Schools",
        description: "Issues related to secondary education",
        categoryId: categoryMap["Education"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Higher Education",
        description: "Issues related to universities and colleges",
        categoryId: categoryMap["Education"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Educational Programs",
        description: "Issues with educational programs and curriculum",
        categoryId: categoryMap["Education"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Healthcare subcategories
      {
        id: uuidv4(),
        name: "Hospitals",
        description: "Issues with hospitals and medical centers",
        categoryId: categoryMap["Healthcare"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Health Centers",
        description: "Issues with local health centers and clinics",
        categoryId: categoryMap["Healthcare"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Medication",
        description: "Issues with medication availability and distribution",
        categoryId: categoryMap["Healthcare"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Health Insurance",
        description: "Issues with health insurance and coverage",
        categoryId: categoryMap["Healthcare"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Public Safety subcategories
      {
        id: uuidv4(),
        name: "Police Services",
        description: "Issues with police services and law enforcement",
        categoryId: categoryMap["Public Safety"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Fire Services",
        description: "Issues with fire services and emergency response",
        categoryId: categoryMap["Public Safety"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Emergency Services",
        description: "Issues with emergency medical services",
        categoryId: categoryMap["Public Safety"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Public Security",
        description: "Issues with public security and safety measures",
        categoryId: categoryMap["Public Safety"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Utilities subcategories
      {
        id: uuidv4(),
        name: "Water Supply",
        description: "Issues with water supply and distribution",
        categoryId: categoryMap["Utilities"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Electricity",
        description: "Issues with electricity supply and distribution",
        categoryId: categoryMap["Utilities"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Waste Management",
        description: "Issues with waste collection and disposal",
        categoryId: categoryMap["Utilities"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: "Internet & Telecommunications",
        description: "Issues with internet and telecommunications services",
        categoryId: categoryMap["Utilities"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    return queryInterface.bulkInsert("subcategories", subcategories)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("subcategories", null, {})
    await queryInterface.bulkDelete("categories", null, {})
  },
}
