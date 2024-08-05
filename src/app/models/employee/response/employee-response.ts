export interface EmployeeResponseDTO {
    id: number;
    firstName: string;
    lastName: string;
    documentNumber: string;
    workstationId: number;
    startDate: Date;
    reasonForIncorporation: string;
    workload: number;
    workdayType: string;
    contractType: string;
    contractFrom: Date;
    contractTo: Date;
    chiefRemarksId: number;
    remunerationId: number;
    otherRemarksId: number;
    authorizationId: number;
    referentId: number;
    isReferent: boolean;
    isActive: boolean;
}