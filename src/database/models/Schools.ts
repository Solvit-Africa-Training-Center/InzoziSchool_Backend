import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { User } from './Users';

export interface SchoolAttributes {
  id: string;
  schoolName: string;
  schoolCode: string;
  schoolCategory: 'REB' | 'RTB';
  schoolLevel: 'Nursary' | 'Primary' | 'O-level' | 'A-level';
  schoolCombination: string[];
  schoolType: 'Girls' | 'Boys' | 'Mixed';
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  userId: string;
  email: string;
  telephone: string;
  images?: string;
  profile?: string;
  description?: string;
  status: 'pending' | 'approved';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type SchoolCreationAttributes = Optional<
  SchoolAttributes,
  'id' | 'images' | 'profile' | 'description' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export class School extends Model<SchoolAttributes, SchoolCreationAttributes> implements SchoolAttributes {
  public id!: string;
  public schoolName!: string;
  public schoolCode!: string;
  public schoolCategory!: 'REB' | 'RTB';
  public schoolLevel!: 'Nursary' | 'Primary' | 'O-level' | 'A-level';
  public schoolCombination!: string[];
  public schoolType!: 'Girls' | 'Boys' | 'Mixed';
  public province!: string;
  public district!: string;
  public sector!: string;
  public cell!: string;
  public village!: string;
  public userId!: string;
  public email!: string;
  public telephone!: string;
  public images?: string;
  public profile?: string;
  public description?: string;
  public status!: 'pending' | 'approved';
  public createdAt?: Date;
  public updatedAt?: Date;
  public deletedAt?: Date | null;

  static associate(models: { User: typeof User }) {
    School.hasMany(models.User, { foreignKey: 'schoolId', as: 'users' }); // unique alias
  }
}

export const SchoolModel = (sequelize: Sequelize): typeof School => {
  School.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      schoolName: { type: DataTypes.STRING, allowNull: false },
      schoolCode: { type: DataTypes.STRING, allowNull: false, unique: true },
      schoolCategory: { type: DataTypes.ENUM('REB', 'RTB'), allowNull: false, defaultValue: 'REB' },
      schoolLevel: { type: DataTypes.ENUM('Nursary', 'Primary', 'O-level', 'A-level'), allowNull: false },
      schoolCombination: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: false },
      schoolType: { type: DataTypes.ENUM('Girls', 'Boys', 'Mixed'), allowNull: false, defaultValue: 'Mixed' },
      province: { type: DataTypes.STRING, allowNull: false },
      district: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      cell: { type: DataTypes.STRING, allowNull: false },
      village: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      telephone: { type: DataTypes.STRING, allowNull: false },
      images: { type: DataTypes.STRING, allowNull: true },
      profile: { type: DataTypes.STRING, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('pending', 'approved'), allowNull: false, defaultValue: 'pending' },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'School',
      tableName: 'schools',
      timestamps: true,
      paranoid: true,
    }
  );

  return School;
};
