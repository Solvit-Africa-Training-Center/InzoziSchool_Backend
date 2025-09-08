import { Sequelize,Model, DataTypes, Optional } from "sequelize";
import { Role } from "./Roles";


export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  province?: string;
  district: string;
  email: string;
  password: string;
  roleId: string;
  profileImage?: string | null;
  schoolId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}


export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "profileImage" |'province' |"schoolId" | "createdAt" | "updatedAt" | "deletedAt"> {}


export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public gender!: "Male" | "Female" | "Other";
  public province?: string;
  public district!: string;
  public email!: string;
  public password!: string;
  public roleId!: string;
  public profileImage?: string | null;
  public schoolId?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

   public static associate(models:{Role:typeof Role})
   {
   User.belongsTo(models.Role,{foreignKey:'roleId',as:'role'});
   }
}

export const UserModel =(sequelize:Sequelize):typeof User=>{
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
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    deletedAt:{
        type:DataTypes.DATE,
        allowNull:true
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    paranoid: true, 
    modelName:'User',
  }
);

return User;

};
