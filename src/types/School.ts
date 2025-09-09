// interfaces/ISchool.ts
export interface ISchoolRegister {
  schoolName: string;
  schoolCode: string;
  email: string;
  district: string;
  licenseDocument: string; 
  province?: string;
  sector?: string;
  cell?: string;
  village?: string;
  schoolCategory?: 'REB' | 'RTB';
  schoolLevel?: 'Nursery' | 'Primary' | 'O-Level' | 'A-Level';
  schoolType?: 'Girls' | 'Boys' | 'Mixed';
}

export interface IRejectSchool {
  reason: string;
}
