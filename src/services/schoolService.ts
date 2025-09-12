
import { School } from '../database/models/School';
import { User } from '../database/models/User';
import { ISchoolRegister } from '../types/School';
import { sequelize } from '../database';
import { emailEmitter } from '../events/emailEvent';

export const registerSchool = async (userId: string, data: ISchoolRegister) => {
  return School.create({
    ...data,
    userId, 
    status: 'in_progress',
  });
  
};

export const approveSchool = async (schoolId: string, adminId: string) => {
  return sequelize.transaction(async (t) => {
    const school = await School.findByPk(schoolId, { transaction: t });
    if (!school) throw new Error('School not found');

    school.status = 'approved';
    school.approvedBy = adminId;
    school.approvedAt = new Date();
    await school.save({ transaction: t });

    
    const manager = await User.findByPk(school.userId, { transaction: t });
    if (!manager) throw new Error('Manager not found');

    manager.schoolId = school.id;
    await manager.save({ transaction: t });
     emailEmitter.emit("schoolApproved",manager,school);
    return school;
  });
};

/**
 * Reject a school (done by Admin)
 */
export const rejectSchool = async (schoolId: string, adminId: string, reason: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  school.status = 'rejected';
  school.approvedBy = adminId;
  school.rejectedReason = reason;
  school.approvedAt = new Date();
  await school.save();

 const manager = await User.findByPk(school.userId);
  if (!manager) throw new Error('Manager not found');

  emailEmitter.emit("schoolRejected", manager, school, reason);
  return school;
};

/**
 * Get school details by ID (with manager info)
 */
export const getSchoolById = async (id: string) => {
  return School.findByPk(id, {
    include: [
      {
        model: User,
        as: 'SchoolManager', 
        attributes: ['id', 'firstName', 'lastName', 'email', 'district', 'profileImage'],
      },
    ],
  });
};

/**
 * Get all schools (with optional status filter + pagination)
 */
export const getSchools = async (
  limit: number,
  offset: number,
  page: number,
  status?: 'pending' | 'in_progress'|'approved' | 'rejected'
) => {
  const whereClause = status ? { status } : {};

  const { rows, count } = await School.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'schoolName', 'district', 'status', 'licenseDocument', 'approvedAt'],
    include: [
      {
        model: User,
        as: 'SchoolManager',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
      {
        model: User,
        as: 'ApprovedByAdmin',
        attributes: ['id', 'firstName', 'lastName', 'email'],
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};


/**
 * Get only pending schools
 */
export const getPendingSchools = async (limit:number,offset:number) => {
  return School.findAndCountAll(
    {
      where:{status:'pending'},
      limit,
      offset,
       order: [['createdAt', 'DESC']],
    }
  );
};

/**
 * Get only approved schools
 */
export const getApprovedSchools = async (limit:number,offset:number,page:number) => {
  const {rows,count}=await School.findAndCountAll({
    where:{status:'approved'},
    limit,
    offset,
    order: [['createdAt', 'DESC']],

  });
   return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  
};

/**
 * Get only rejected schools
 */
export const getRejectedSchools = async (limit:number,offset:number,page:number) => {
  const {rows,count}=await School.findAndCountAll({
    where:{status:'rejected'},
    limit,
    offset,
  });
    return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };

};

export const resubmitSchool = async (
  schoolId: string,
  userId: string,
  updatedData: Partial<ISchoolRegister>
) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  if (school.userId !== userId) throw new Error('Unauthorized: Only the school manager can resubmit');

  if (school.status !== 'rejected') throw new Error('Only rejected schools can be resubmitted');

  Object.assign(school, updatedData);
  school.status = 'pending';
  school.approvedBy = null;
  school.approvedAt = null;
  school.rejectedReason = null;

  await school.save();
  return school;
};
