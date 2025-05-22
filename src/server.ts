import dotenv from "dotenv"
import app from "./app"
import { sequelize } from "./database/config/database"

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    // Sync database models (in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      console.log("Database models synchronized.")
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

startServer()

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  // Close server & exit process
  process.exit(1)
})
