import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"
import Complaint from "./Complaint"
import User from "./User"

interface StatusHistoryAttributes {
  id: string
  complaintId: string
  previousStatus?: string
  newStatus: string
  comment?: string
  changedBy?: string
  createdAt?: Date
  updatedAt?: Date
}

interface StatusHistoryCreationAttributes extends Omit<StatusHistoryAttributes, "id"> {}

class StatusHistory
  extends Model<StatusHistoryAttributes, StatusHistoryCreationAttributes>
  implements StatusHistoryAttributes
{
  public id!: string
  public complaintId!: string
  public previousStatus?: string
  public newStatus!: string
  public comment?: string
  public changedBy?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  user: any
}

StatusHistory.init(
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
    previousStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "StatusHistory",
    tableName: "status_histories",
  },
)

// Define associations
StatusHistory.belongsTo(Complaint, { foreignKey: "complaintId", as: "complaint" })
Complaint.hasMany(StatusHistory, { foreignKey: "complaintId", as: "statusHistory" })

StatusHistory.belongsTo(User, { foreignKey: "changedBy", as: "user" })

export default StatusHistory
