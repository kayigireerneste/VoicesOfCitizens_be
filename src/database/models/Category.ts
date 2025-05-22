import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"

interface CategoryAttributes {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, "id"> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string
  public name!: string
  public description?: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
  },
)

export default Category
