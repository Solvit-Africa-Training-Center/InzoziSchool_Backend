import { Role } from '../database/index';

export const getRoleId = async (roleName: string) => {
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) throw new Error(`Role "${roleName}" not found`);
  return role.id;
};
