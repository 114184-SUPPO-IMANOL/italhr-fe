export class RemunerationRequest {
    monthlySalary: number;
    annualSalary: number;
    comments: string;

    constructor() {
        this.monthlySalary = 0;
        this.annualSalary = 0;
        this.comments = '';
    }
}