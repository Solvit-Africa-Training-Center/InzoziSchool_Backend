import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any; // Replace 'any' with your actual user type if available
}