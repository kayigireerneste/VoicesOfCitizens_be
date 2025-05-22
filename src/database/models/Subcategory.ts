import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"
import Category from "./Category"

interface SubcategoryAttributes {
  id: string
  name: string
  description?: string
  categoryId: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface SubcategoryCreationAttributes extends Omit<SubcategoryAttributes, "id"> {}

class Subcategory extends Model<SubcategoryAttributes, SubcategoryCreationAttributes> implements SubcategoryAttributes {
  public id!: string
  public name!: string
  public description?: string
  public categoryId!: string
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Subcategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Subcategory",
    tableName: "subcategories",
    indexes: [
      {
        unique: true,
        fields: ["name", "categoryId"],
      },
    ],
  },
)

// Define association
Subcategory.belongsTo(Category, { foreignKey: "categoryId", as: "category" })
Category.hasMany(Subcategory, { foreignKey: "categoryId", as: "subcategories" })

export default Subcategory
