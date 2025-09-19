export interface IApplication {
  id?: string;
  studentId: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
