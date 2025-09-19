// src/database/models/Student.ts
import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import { School } from './School';

export interface StudentAttributes {
  id: string;
  schoolId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  DOB: string;
  indexNumber?: string;
  studentType: 'newcomer' | 'ongoing';
  resultSlip?: string;         // allow undefined
  previousReport?: string;     // allow undefined
  mitationLetter?: string;     // allow undefined
  passportPhoto: string;
  fathersNames: string;
  mothersNames: string;
  representerEmail: string;
  representerPhone: string;
  nationality: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  babyeyiDocument?: string;
  babyeyiIssuedAt?: Date;
}

type StudentCreationAttributes = Optional<
  StudentAttributes,
  | 'id'
  | 'middleName'
  | 'indexNumber'
  | 'resultSlip'
  | 'previousReport'
  | 'mitationLetter'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'babyeyiDocument'
  | 'babyeyiIssuedAt'
>;

export class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  createApplication(arg0: { status: string; }) {
    throw new Error('Method not implemented.');
  }
  public id!: string;
  public schoolId!: string;
  public firstName!: string;
  public middleName?: string;
  public lastName!: string;
  public gender!: 'MALE' | 'FEMALE' | 'OTHER';
  public DOB!: string;
  public indexNumber?: string;
  public studentType!: 'newcomer' | 'ongoing';
  public resultSlip?: string;
  public previousReport?: string;
  public mitationLetter?: string;
  public passportPhoto!: string;
  public fathersNames!: string;
  public mothersNames!: string;
  public representerEmail!: string;
  public representerPhone!: string;
  public nationality!: string;
  public province!: string;
  public district!: string;
  public sector!: string;
  public cell!: string;
  public village!: string;
  public status?: 'pending' | 'approved' | 'rejected';
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt?: Date | null;
  public babyeyiDocument?: string;
  public babyeyiIssuedAt?: Date;

  static associate(models: any) {
    if (models.School) {
      Student.belongsTo(models.School, {
        foreignKey: 'schoolId',
        as: 'school',
      });
    }
  }
}
// Export a function to initialize the model
export const StudentModel = (sequelize: Sequelize) => {
  Student.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: { type: DataTypes.STRING, allowNull: false },
      middleName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: false },
      gender: { type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: false },
      DOB: { type: DataTypes.DATEONLY, allowNull: false },
      indexNumber: { type: DataTypes.STRING, allowNull: true, unique: true },
      studentType: { type: DataTypes.ENUM('newcomer', 'ongoing'), allowNull: false },
      resultSlip: { type: DataTypes.STRING, allowNull: true },        // allowNull: true
      previousReport: { type: DataTypes.STRING, allowNull: true },    // allowNull: true
      mitationLetter: { type: DataTypes.STRING, allowNull: true },    // allowNull: true
      passportPhoto: { type: DataTypes.STRING, allowNull: false },
      fathersNames: { type: DataTypes.STRING, allowNull: false },
      mothersNames: { type: DataTypes.STRING, allowNull: false },
      representerEmail: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
      representerPhone: { type: DataTypes.STRING, allowNull: false, validate: { len: [10, 15] } },
      nationality: { type: DataTypes.STRING, allowNull: false },
      province: { type: DataTypes.STRING, allowNull: false },
      district: { type: DataTypes.STRING, allowNull: false },
      sector: { type: DataTypes.STRING, allowNull: false },
      cell: { type: DataTypes.STRING, allowNull: false },
      village: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      babyeyiDocument: { type: DataTypes.STRING, allowNull: true },
      babyeyiIssuedAt: { type: DataTypes.DATE, allowNull: true },
      schoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Schools', key: 'id' }
      }
    },
    {
      sequelize,
      modelName: 'Student',
      tableName: 'students',
      timestamps: true,
      paranoid: true,
    }
  );

  // Hook to create Application record after Student is created
  Student.addHook('afterCreate', async (student) => {
    const s = student as Student;
    const { Application } = (student.sequelize as any).models;
    if (Application) await Application.create({ studentId: s.id, status: 'pending' });
  });

  return Student;
};

export default StudentModel;
