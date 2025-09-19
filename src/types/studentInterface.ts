export interface IStudent {
    nationality: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    id?: string;
    schoolId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    DOB: string;
    studentType: 'newcomer' | 'ongoing'
    indexNumber?: string;
    resultSlip?: string;
    previousReport?: string;
    previousLetter?: string;
    passportPhoto?: string;
    fathersNames: string;
    mothersNames: string;
    representerEmail: string;
    representerPhone: string;
    status?: "pending" | "approved" | "rejected";
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}export interface IStudent {
    nationality: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    id?: string;
    schoolId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    DOB: string;
    studentType: 'newcomer' | 'ongoing'
    indexNumber?: string;
    resultSlip?: string;
    previousReport?: string;
    previousLetter?: string;
    passportPhoto?: string;
    fathersNames: string;
    mothersNames: string;
    representerEmail: string;
    representerPhone: string;
    status?: "pending" | "approved" | "rejected";
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

