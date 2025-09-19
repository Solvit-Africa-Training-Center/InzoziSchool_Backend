import { Sequelize, Model, DataTypes, Optional } from 'sequelize';

export interface ApplicationAttributes {
  id: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

type ApplicationCreationAttributes = Optional<
  ApplicationAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Application
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes
{
  public id!: string;
  public studentId!: string;
  public status!: 'pending' | 'approved' | 'rejected';

  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  static associate(models: any) {
    const { Student } = models;

    if (Student) {
      // Each application belongs to one student
      Application.belongsTo(Student, {
        foreignKey: 'studentId',
        as: 'student',
      });

      // ⚠️ Define this association only ONCE to avoid alias conflicts
      if (!Student.associations.application) {
        Student.hasOne(Application, {
          foreignKey: 'studentId',
          as: 'application',
        });
      }
    }
  }
}

export default (sequelize: Sequelize) => {
  Application.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Application',
      tableName: 'applications',
      timestamps: true,
    }
  );

  return Application;
};
