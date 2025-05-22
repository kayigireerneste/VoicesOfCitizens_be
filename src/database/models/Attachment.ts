import { Model, DataTypes } from "sequelize"
import { sequelize } from "../config/database"
import Complaint from "./Complaint"

interface AttachmentAttributes {
  id: string
  complaintId: string
  fileName: string
  fileType: string
  fileSize: number
  filePath: string
  publicUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

interface AttachmentCreationAttributes extends Omit<AttachmentAttributes, "id"> {}

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: string
  public complaintId!: string
  public fileName!: string
  public fileType!: string
  public fileSize!: number
  public filePath!: string
  public publicUrl?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Attachment.init(
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
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    publicUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachments",
  },
)

// Define association
Attachment.belongsTo(Complaint, { foreignKey: "complaintId", as: "complaint" })
Complaint.hasMany(Attachment, { foreignKey: "complaintId", as: "attachments" })

export default Attachment
