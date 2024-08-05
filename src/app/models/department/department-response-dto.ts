export interface DepartmentResponseDTO {
    id: number;
    name: string;
    parentDepartmentId: number;
    chiefId: number;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}