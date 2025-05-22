import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"
import User from "./User"
import Complaint from "./Complaint"

interface CommentAttributes {
  id: string
  complaintId: string
  userId: string
  content: string
  isInternal: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface CommentCreationAttributes extends Omit<CommentAttributes, "id"> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: string
  public complaintId!: string
  public userId!: string
  public content!: string
  public isInternal!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    complaintId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "complaints",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
  },
)

// Define associations
Comment.belongsTo(Complaint, { foreignKey: "complaintId", as: "complaint" })
Complaint.hasMany(Comment, { foreignKey: "complaintId", as: "comments" })

Comment.belongsTo(User, { foreignKey: "userId", as: "user" })
User.hasMany(Comment, { foreignKey: "userId", as: "comments" })

export default Comment
