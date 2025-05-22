import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const sequelize = new Sequelize(
  process.env.DB_NAME || "ijwi_ryabaturage",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
)

export default sequelize
