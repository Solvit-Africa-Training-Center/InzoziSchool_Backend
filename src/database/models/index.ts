import { Sequelize } from 'sequelize';
import { UserModel, User } from './Users';
import { RoleModel, Role } from './Roles';
import { SchoolModel, School } from './Schools';

// Define types for models
type ModelsType = {
  User: typeof User;
  Role: typeof Role;
  School: typeof School;
};

// Define interface for models with associate method
interface ModelWithAssociations {
  associate?: (models: ModelsType) => void;
}

const sequelize = new Sequelize(process.env.DB_URL as string, {
  dialect: 'postgres',
  logging: false,
});

const models = {
  User: UserModel(sequelize),
  Role: RoleModel(sequelize),
  School: SchoolModel(sequelize),
};

// Run associations
Object.values(models).forEach((model: ModelWithAssociations) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models;
