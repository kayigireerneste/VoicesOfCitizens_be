import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"
import Category from "./Category"
import Subcategory from "./Subcategory"

export enum ComplaintStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  REJECTED = "rejected",
  CLOSED = "closed",
}

export enum ComplaintPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

interface ComplaintAttributes {
  id: string
  title?: string
  description: string
  location: string
  categoryId: string
  subcategoryId: string
  userId?: string
  status: ComplaintStatus
  priority: ComplaintPriority
  isAnonymous: boolean
  fullName?: string
  phoneNumber?: string
  email?: string
  assignedTo?: string
  resolvedAt?: Date
  closedAt?: Date
  rejectionReason?: string
  trackingId: string
  createdAt?: Date
  updatedAt?: Date
}

interface ComplaintCreationAttributes extends Omit<ComplaintAttributes, "id" | "trackingId"> {}

class Complaint extends Model<ComplaintAttributes, ComplaintCreationAttributes> implements ComplaintAttributes {
  public id!: string
  public title?: string
  public description!: string
  public location!: string
  public categoryId!: string
  public subcategoryId!: string
  public userId?: string
  public status!: ComplaintStatus
  public priority!: ComplaintPriority
  public isAnonymous!: boolean
  public fullName?: string
  public phoneNumber?: string
  public email?: string
  public assignedTo?: string
  public resolvedAt?: Date
  public closedAt?: Date
  public rejectionReason?: string
  public trackingId!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Complaint.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    subcategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subcategories",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ComplaintStatus)),
      allowNull: false,
      defaultValue: ComplaintStatus.PENDING,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(ComplaintPriority)),
      allowNull: false,
      defaultValue: ComplaintPriority.MEDIUM,
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trackingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Complaint",
    tableName: "complaints",
    hooks: {
      beforeCreate: (complaint) => {
        // Generate a unique tracking ID (e.g., IJW-2025-XXXXX)
        const randomPart = Math.floor(10000 + Math.random() * 90000).toString()
        const year = new Date().getFullYear()
        complaint.trackingId = `IJW-${year}-${randomPart}`
      },
    },
  },
)

// Define associations
Complaint.belongsTo(User, { foreignKey: "userId", as: "user" })
User.hasMany(Complaint, { foreignKey: "userId", as: "complaints" })

Complaint.belongsTo(Category, { foreignKey: "categoryId", as: "category" })
Category.hasMany(Complaint, { foreignKey: "categoryId", as: "complaints" })

Complaint.belongsTo(Subcategory, { foreignKey: "subcategoryId", as: "subcategory" })
Subcategory.hasMany(Complaint, { foreignKey: "subcategoryId", as: "complaints" })

Complaint.belongsTo(User, { foreignKey: "assignedTo", as: "assignedUser" })

export default Complaint
