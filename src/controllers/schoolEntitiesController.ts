import { Request, Response } from 'express';
import * as SchoolService from '../services/schoolService';
import { ResponseService } from '../utils/response';
import { uploadToCloud } from '../utils/uploadHelper';
import { IRequestUser } from '../middlewares/authMiddleware';
import { getPagedResult, getPagination } from '../utils/pagination';


const getUserId = (req: IRequestUser): string => {
  if (!req.user || !req.user.id) {
    throw new Error('Unauthorized: User not found');
  }
  return req.user.id;
};

export const updateProfile = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;
    const updatedProfile = req.body; // directly take body

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const profile = await SchoolService.updateSchoolProfile(schoolId, updatedProfile,getUserId(req));

    return ResponseService({
      data: profile,
      status: 200,
      success: true,
      message: 'Profile updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update profile',
      res,
    });
  }
};


// PROFILE
export const getProfile = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const profile = await SchoolService.getSchoolProfile(schoolId);

    return ResponseService({
      data: profile,
      status: 200,
      success: true,
      message: 'Profile retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to get profile',
      res,
    });
  }
};



// SPOTS
export const createSpot = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;
    const spotData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const spot = await SchoolService.createSchoolSpot(schoolId, spotData,getUserId(req));

    return ResponseService({
      data: spot,
      status: 201,
      success: true,
      message: 'Spot created successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to create spot',
      res,
    });
  }
};

export const updateSpot = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId, id: spotId } = req.params;
    const updatedSpot = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!spotId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    const spot = await SchoolService.updateSchoolSpot(schoolId, spotId, updatedSpot,getUserId(req));

    return ResponseService({
      data: spot,
      status: 200,
      success: true,
      message: 'Spot updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update spot',
      res,
    });
  }
};

export const listSpots = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const spots = await SchoolService.listSchoolSpots(schoolId);

    return ResponseService({
      data: spots,
      status: 200,
      success: true,
      message: 'Spots retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to list spots',
      res,
    });
  }
};

// GALLERY
export const addGallery = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;
    const galleryData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!req.file) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Gallery file is required',
        res,
      });
    }

    const imageUrl = await uploadToCloud(req.file);

    const gallery = await SchoolService.addGalleryImage(schoolId, {
      ...galleryData,
      imageUrl,
    },getUserId(req));

    return ResponseService({
      data: gallery,
      status: 201,
      success: true,
      message: 'Gallery image added successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to add gallery image',
      res,
    });
  }
};

export const listGallery = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const images = await SchoolService.listGalleryImages(schoolId);

    return ResponseService({
      data: images,
      status: 200,
      success: true,
      message: 'Gallery retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to list gallery images',
      res,
    });
  }
};
export const updateGallery = async (req: IRequestUser, res: Response) => {
  try {
    const { schoolId, id: imageId } = req.params;
    let updatedData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!imageId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Image ID is required',
        res,
      });
    }

    // If a new file is uploaded, upload it and set imageUrl
    if (req.file) {
      const fileUrl = await uploadToCloud(req.file);
      updatedData = { ...updatedData, imageUrl: fileUrl };
    }

    const image = await SchoolService.updateGalleryImage(schoolId, imageId, updatedData,getUserId(req));

    return ResponseService({
      data: image,
      status: 200,
      success: true,
      message: 'Gallery image updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update gallery image',
      res,
    });
  }
};
export const updateSchoolInfo = async (req: IRequestUser, res: Response) => {
  try {
       const { schoolId} = req.params;
    let updatedData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    
    const school = await SchoolService.updateSchoolInfo(schoolId,updatedData,getUserId(req));
    return ResponseService({ data: school, status: 200, success: true, message: 'School information updated', res });
  } catch (error: any) {
    return ResponseService({ data: error.message, status: 500, success: false, message: 'Failed to update school information', res });
  }
};
