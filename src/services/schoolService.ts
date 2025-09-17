import { School } from '../database/models/School';
import { User } from '../database/models/User';
import { ISchoolRegister,IUpdateSchoolProfile,ICreateSchoolGallery,ICreateSchoolSpot,IUpdateSchoolSpot ,SearchFilters} from '../types/School';
import { sequelize } from '../database';
import { SchoolAttributes } from '../database/models/School';
import { emailEmitter } from '../events/emailEvent';
import { SchoolProfile } from '../database/models/SchoolProfile';
import { SchoolGallery } from '../database/models/SchoolGallery';
import { SchoolSpot } from '../database/models/SchoolSpot';
import { Op } from 'sequelize';


export const registerSchool = async (userId: string, data: ISchoolRegister) => {
  return School.create({
    ...data,
    userId, 
    status: 'pending',
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
  status?: 'pending' | 'not_registered'|'approved' | 'rejected'
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

export const updateSchoolProfile = async (schoolId: string, data: IUpdateSchoolProfile,userId:string) => {
  let profile = await SchoolProfile.findOne({ where: { schoolId } });

  if (!profile) {
    
    profile = await SchoolProfile.create({ ...data, schoolId });
  } else {
    await profile.update(data);
  }

  return profile;
};
export const getSchoolProfile = async (schoolId: string ,limit:number,offset:number,page:number) => {
  const {rows,count} = await SchoolProfile.findAndCountAll({ where: { schoolId }, limit, offset,order: [['createdAt', 'DESC']] });

  return {
    profiles: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  
};

export const createSchoolSpot = async (
  schoolId: string,
  data: ICreateSchoolSpot,
  userId: string
) => {
  const occupiedSpots = data.occupiedSpots ?? 0;
  const registrationOpen = data.registrationOpen ?? true;

  // Calculate available spots
  const availableSpots = data.totalSpots - occupiedSpots;

  // If A-level with combinations, create separate spots for each combination
  if (data.level === 'A-level' && data.combination?.length) {
    const createdSpots = await Promise.all(
      data.combination.map(async (combo) => {
        const spotData = {
          ...data,
          schoolId,
          occupiedSpots,
          registrationOpen,
          availableSpots,
          combination: [combo], 
        };
        return SchoolSpot.create(spotData);
      })
    );
    return createdSpots;
  }

  
  const schoolSpot = await SchoolSpot.create({
    ...data,
    schoolId,
    occupiedSpots,
    registrationOpen,
    availableSpots,
  });

  return schoolSpot;
};
export const updateSchoolSpot = async (schoolId: string, spotId: string, data: IUpdateSchoolSpot,userId:string) => {
  const spot = await SchoolSpot.findOne({ where: { id: spotId, schoolId } });
  if (!spot) throw new Error('School spot not found');
  return spot.update(data);
};

export const listSchoolSpots = async (schoolId: string,limit:number,offset:number,page:number) => {
  const {rows,count} = await SchoolSpot.findAndCountAll({ where: { schoolId }, limit, offset,order: [['createdAt', 'DESC']] });
    return {
    spots: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  
};

export const deleteSchoolSpot = async (schoolId: string, spotId: string,userId:string) => {
  const spot = await SchoolSpot.findOne({ where: { id: spotId, schoolId } });
  if (!spot) throw new Error('School spot not found');
  await spot.destroy();
  return true;
};



export const addGalleryImage = async (schoolId: string, data: ICreateSchoolGallery,userId:string) => {
  return SchoolGallery.create({ ...data, schoolId });
};


export const listGalleryImages = async (schoolId: string,limit:number,offset:number,page:number,category?:string) => {

  const where: any = { schoolId };

  if (category) {
    where.category = category; 
  }

  const { rows, count } = await SchoolGallery.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ['order', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  return {
    images: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};


export const updateGalleryImage = async (schoolId: string, imageId: string, data: Partial<ICreateSchoolGallery>,userId:string) => {
  const image = await SchoolGallery.findOne({ where: { id: imageId, schoolId } });
  if (!image) throw new Error('Gallery image not found');
  return image.update(data);
};
 
export const deleteGalleryImage = async (schoolId: string, imageId: string,userId:string) => {
  const image = await SchoolGallery.findOne({ where: { id: imageId, schoolId } });
  if (!image) throw new Error('Gallery image not found');
  await image.destroy();
  return true;
};


export const updateSchoolInfo = async (schoolId: string, data: SchoolAttributes,userId:string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  const allowedFields: (keyof SchoolAttributes)[] = [
    'province', 'district', 'sector', 'cell', 'village',
    'schoolType', 'schoolCategory', 'schoolLevel', 'licenseDocument','telephone','email','schoolName'
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      (school as any)[field] = data[field];
    }
  });

  await school.save();
  return school;
  
};

export const deleteSchool = async (schoolId: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found'); 
  await school.destroy();
  return true;
};

export const searchSchools = async (
  limit: number,
  offset: number,
  page: number,
  filters: SearchFilters
) => {
  const { district, schoolType, schoolLevel, schoolCategory, yearOfStudy, combination, academicYear, minAvailableSpots } = filters;

  const schoolWhere: any = { status: 'approved' };
  if (district) schoolWhere.district = district;
  if (schoolType) schoolWhere.schoolType = schoolType;
  if (schoolLevel) schoolWhere.schoolLevel = schoolLevel;
  if (schoolCategory) schoolWhere.schoolCategory = schoolCategory;

  const spotWhere: any = {};
  if (yearOfStudy) spotWhere.yearOfStudy = yearOfStudy;
  if (academicYear) spotWhere.academicYear = academicYear;
  if (combination) spotWhere.combination = { [Op.contains]: [combination] };

  const { rows, count } = await School.findAndCountAll({
    where: schoolWhere,
    include: [
      {
        model: SchoolSpot,
        as: 'spots',
        where: spotWhere,
        required: Object.keys(spotWhere).length > 0,
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [['createdAt', 'DESC']],
  });

  
  const filteredSchools = rows
  .map((school) => {
    
    const spots = (school as any).spots.filter((spot: any) => {
      const availableSpots = spot.totalSpots - spot.occupiedSpots;
      return minAvailableSpots ? availableSpots >= minAvailableSpots : true;
    });

    return {
      ...school.get({ plain: true }),
      spots,
    };
  })
  .filter((school) => school.spots.length > 0);


  return {
    schools: filteredSchools,
    total: filteredSchools.length,
    page,
    limit,
    totalPages: Math.ceil(filteredSchools.length / limit),
  };
};
