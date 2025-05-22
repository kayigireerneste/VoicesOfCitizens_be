import { Model, DataTypes } from "sequelize"
import sequelize from "../config/database"
import bcrypt from "bcrypt"

export enum UserRole {
  CITIZEN = "citizen",
  ADMIN = "admin",
}

interface UserAttributes {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  phoneNumber?: string
  isVerified: boolean
  verificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public firstName!: string
  public lastName!: string
  public email!: string
  public password!: string
  public role!: UserRole
  public phoneNumber?: string
  public isVerified!: boolean
  public verificationToken?: string
  public resetPasswordToken?: string
  public resetPasswordExpires?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Method to check if password matches
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CITIZEN,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  },
)

export default User
