export class PersonRequest {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
    birthDate: Date;
    profilePicture: Uint8Array | null;
    

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.documentType = '';
        this.documentNumber = '';
        this.gender = '';
        this.maritalStatus = '';
        this.nationality = '';
        this.birthDate = new Date();
        this.profilePicture = null;
    }
}